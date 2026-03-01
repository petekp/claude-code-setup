# Edge Cases, Gotchas, and Things That Will Bite You

This document catalogs the non-obvious problems you'll encounter during migration and how to handle them.

---

## 1. Transaction Semantics Change

### The problem

Raw SQL using `cursor.execute()` runs inside whatever transaction Django has open (usually autocommit unless you're inside `@transaction.atomic`). SQLAlchemy manages its own transactions entirely. When you migrate SQLAlchemy code to Django ORM, the transaction behavior changes.

### Example

```python
# SQLAlchemy -- explicit session management
session = Session()
try:
    session.add(Order(user_id=1, total=100))
    session.add(Payment(order_id=1, amount=100))
    session.commit()
except:
    session.rollback()
    raise
finally:
    session.close()
```

The SQLAlchemy version commits both operations atomically. The naive Django translation:

```python
# WRONG -- not atomic
Order.objects.create(user_id=1, total=100)
Payment.objects.create(order_id=1, amount=100)  # if this fails, the Order persists
```

### Fix

```python
# CORRECT -- use transaction.atomic
from django.db import transaction

with transaction.atomic():
    order = Order.objects.create(user_id=1, total=100)
    Payment.objects.create(order=order, amount=100)
```

### Rule

Every SQLAlchemy `session.commit()` that covers multiple operations must become a `transaction.atomic()` block.

---

## 2. QuerySet Evaluation Timing

### The problem

Raw SQL executes immediately when you call `cursor.execute()`. Django QuerySets are lazy -- they don't hit the database until they're evaluated (iterated, sliced, or converted to a list).

This matters when the code relies on seeing the state of the database at a specific point in time.

### Example

```python
# Raw SQL -- executes immediately
cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'pending'")
pending_count = cursor.fetchone()[0]

# ... other code that might create new orders ...

# pending_count is a snapshot from when the query ran
```

```python
# Django ORM -- lazy, might evaluate later than you expect
pending_orders = Order.objects.filter(status="pending")

# ... other code that might create new orders ...

pending_count = pending_orders.count()  # THIS evaluates now, might include new orders
```

### Fix

If you need point-in-time consistency, evaluate the queryset immediately:

```python
pending_count = Order.objects.filter(status="pending").count()  # evaluates now
```

Or if you need multiple queries to see the same database state, use a transaction with the appropriate isolation level.

---

## 3. NULL Handling Differences

### The problem

Raw SQL uses `IS NULL` and `IS NOT NULL`. The Django ORM uses `__isnull=True/False`. But there's a subtle difference with `exclude()`.

### Example

```sql
-- Raw SQL: get all products NOT in category 5
SELECT * FROM products WHERE category_id != 5;
-- This does NOT return products where category_id IS NULL
```

```python
# Django ORM -- .exclude() also filters out NULLs
Product.objects.exclude(category_id=5)
# This also does NOT return products where category_id IS NULL
# (same behavior, but easy to forget)

# If you want NULLs included:
from django.db.models import Q
Product.objects.filter(~Q(category_id=5) | Q(category_id__isnull=True))
```

### Rule

When migrating any query with `!=` or `NOT`, verify the intended behavior for NULL values and test explicitly.

---

## 4. Type Coercion

### The problem

Raw SQL returns whatever types the database driver provides (often strings for dates, Decimals for numbers, etc.). The Django ORM returns Python-native types based on the field definition.

### Example

```python
# Raw SQL
cursor.execute("SELECT price FROM products WHERE id = %s", [1])
row = cursor.fetchone()
price = row[0]  # This might be a Decimal('9.99')

# Django ORM
product = Product.objects.get(id=1)
price = product.price  # This is whatever type the field is (Decimal if DecimalField)
```

This usually isn't a problem, but watch for:
- Code that does string comparison on values that were strings from raw SQL but are now native types
- Code that serializes to JSON (Decimal is not JSON-serializable)
- Code that uses `==` comparison with floats

### Fix

Check all downstream code that consumes query results. Make sure it handles the correct types.

---

## 5. Column Name Changes

### The problem

Raw SQL returns columns with whatever names you SELECT (or the column names from the table). Django ORM uses Python attribute names (which might differ from column names via `db_column`).

### Example

```python
# Raw SQL
cursor.execute("SELECT user_id, created_at FROM orders")
# Returns tuples like: (1, datetime(2024, 1, 15))

# Django ORM
Order.objects.values_list("user_id", "created_at")
# Same result, but if the Django model uses a different name:
# class Order(models.Model):
#     author = models.ForeignKey(User, db_column="user_id")
# Then you'd use "author_id" not "user_id"
```

### Rule

When translating column names from raw SQL to ORM field names, check the model definition for `db_column` overrides and FK naming conventions (Django appends `_id` to FK field names).

---

## 6. Ordering Guarantees

### The problem

Raw SQL without `ORDER BY` returns rows in an undefined order (though in practice, it's often insertion order). Django QuerySets also have no guaranteed order unless you specify `.order_by()`, but some models define a default ordering via `Meta.ordering`.

### Example

```python
# Raw SQL -- no ORDER BY, so order is undefined
cursor.execute("SELECT * FROM products WHERE category_id = %s", [5])

# Django ORM -- might have implicit ordering from Meta.ordering
Product.objects.filter(category_id=5)
# If the model has Meta.ordering = ['-created_at'], this adds ORDER BY
```

### Gotcha

If the raw SQL relied on undefined ordering (e.g., "first row is the oldest"), the ORM version might return rows in a different order due to `Meta.ordering`. Always add explicit `.order_by()` when order matters.

---

## 7. select_related vs prefetch_related

### The problem

When migrating raw SQL JOINs, you need to choose between `select_related` and `prefetch_related`. Using the wrong one leads to either N+1 queries or unnecessarily large result sets.

### Rules

| Use `select_related` when... | Use `prefetch_related` when... |
|---|---|
| Following ForeignKey or OneToOneField | Following ManyToManyField or reverse FK |
| You need the related data in the same query (SQL JOIN) | You need related data from a separate query |
| The relationship is one-to-one or many-to-one | The relationship is one-to-many or many-to-many |

```python
# Original raw SQL does a JOIN -- use select_related
Order.objects.select_related("user", "shipping_address")

# Original raw SQL fetches related objects in a loop -- use prefetch_related
User.objects.prefetch_related("orders")
```

### Gotcha

`select_related` follows FK relationships and does a SQL JOIN. If you chain multiple `select_related` calls on many-to-many relationships, you get a cartesian product. This is a common source of performance regressions during migration.

---

## 8. .count() vs len() vs .exists()

### The problem

Raw SQL often uses `SELECT COUNT(*)` for counting. The Django ORM provides three different ways to check collection size, each with different SQL:

```python
# Generates: SELECT COUNT(*) FROM ...
count = Product.objects.filter(is_active=True).count()

# Generates: SELECT * FROM ... (fetches all rows, counts in Python)
count = len(Product.objects.filter(is_active=True))

# Generates: SELECT 1 FROM ... LIMIT 1
has_any = Product.objects.filter(is_active=True).exists()
```

### Rule

- Use `.count()` when you need the count but not the objects
- Use `len()` only if you already need to iterate over the queryset
- Use `.exists()` when you only need to know if there's at least one result

When migrating `SELECT COUNT(*) ... > 0` patterns, use `.exists()` instead of `.count() > 0`.

---

## 9. Raw SQL with Parameters vs F-Strings

### The problem (security)

Some raw SQL in the codebase might use f-strings or string formatting instead of parameterized queries. This is a SQL injection vulnerability.

```python
# DANGEROUS -- SQL injection
cursor.execute(f"SELECT * FROM products WHERE name = '{user_input}'")

# SAFE -- parameterized
cursor.execute("SELECT * FROM products WHERE name = %s", [user_input])
```

### Migration opportunity

This migration is an opportunity to fix SQL injection vulnerabilities. The Django ORM parameterizes all queries automatically, so every f-string SQL that gets converted to ORM automatically becomes safe.

### Rule

During the audit, flag any raw SQL that uses f-strings, `.format()`, or `%` string formatting with user-controlled input. These are security-critical migrations.

---

## 10. Batch Size Limits

### The problem

Raw SQL `INSERT ... VALUES` can include an arbitrary number of rows. Django's `bulk_create()` and `bulk_update()` have practical limits based on the database's maximum parameter count.

### Example

```python
# Raw SQL -- can insert 10,000 rows in one statement
cursor.execute(
    "INSERT INTO metrics (key, value) VALUES " +
    ",".join(["(%s, %s)"] * 10000),
    params
)

# Django ORM -- use batch_size to avoid hitting parameter limits
Metric.objects.bulk_create(
    [Metric(key=k, value=v) for k, v in items],
    batch_size=1000,  # Django will split into multiple INSERTs
)
```

### Rule

Always specify `batch_size` in `bulk_create()` and `bulk_update()`. A safe default is 1000. SQLite has a lower limit (999 parameters), while PostgreSQL can handle more.

---

## 11. The .update() Return Value

### The problem

Raw SQL `UPDATE` returns the number of affected rows via `cursor.rowcount`. Django's `.update()` also returns the count, but code might not be using it.

```python
# Raw SQL
cursor.execute("UPDATE products SET is_active = false WHERE stock = 0")
affected = cursor.rowcount

# Django ORM
affected = Product.objects.filter(stock=0).update(is_active=False)
```

### Rule

If the original code uses `cursor.rowcount`, make sure to capture the return value of `.update()`.

---

## 12. SAVEPOINT Behavior

### The problem

In Django, `transaction.atomic()` creates a SAVEPOINT when nested. If your raw SQL uses explicit `SAVEPOINT` / `RELEASE SAVEPOINT` / `ROLLBACK TO SAVEPOINT`, the ORM migration needs to replace these with nested `transaction.atomic()` blocks.

```python
# Raw SQL with explicit savepoints
cursor.execute("SAVEPOINT sp1")
try:
    cursor.execute("INSERT INTO orders ...")
    cursor.execute("INSERT INTO payments ...")
    cursor.execute("RELEASE SAVEPOINT sp1")
except:
    cursor.execute("ROLLBACK TO SAVEPOINT sp1")

# Django ORM
from django.db import transaction

try:
    with transaction.atomic():
        Order.objects.create(...)
        Payment.objects.create(...)
except IntegrityError:
    # The atomic block handles the savepoint rollback
    pass
```

---

## 13. Database-Specific Behavior

### PostgreSQL

- `RETURNING` clause: Django 4.2+ supports `bulk_create(..., update_conflicts=True)` with `RETURNING`, but for simpler cases, `.create()` returns the instance with `id` populated.
- Array fields: Django has `ArrayField` for PostgreSQL, but it's not portable to other databases.
- `ILIKE`: Django's `__icontains` uses `ILIKE` on PostgreSQL automatically.

### SQLite (if used in tests)

- No `DISTINCT ON` support: If your raw SQL uses PostgreSQL's `DISTINCT ON`, the ORM translation might work differently on SQLite in tests.
- Limited `ALTER TABLE`: Django handles this, but custom migrations might fail on SQLite.
- No window function support before SQLite 3.25: Check your test database SQLite version.

### MySQL

- `GROUP BY` behavior differs from PostgreSQL: MySQL allows non-aggregated columns in `GROUP BY` results (in some modes), PostgreSQL does not.
- `LIMIT` syntax: Django handles this automatically.
