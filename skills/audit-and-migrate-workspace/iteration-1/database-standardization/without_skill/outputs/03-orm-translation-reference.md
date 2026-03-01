# ORM Translation Reference

A practical lookup table for converting raw SQL and SQLAlchemy patterns to Django ORM equivalents. Organized by operation type.

---

## Basic Reads

### Simple SELECT

```sql
-- Raw SQL
SELECT * FROM products WHERE category_id = 5 AND is_active = true;
```

```python
# SQLAlchemy
session.query(Product).filter(
    Product.category_id == 5,
    Product.is_active == True
).all()

# Django ORM
Product.objects.filter(category_id=5, is_active=True)
```

### SELECT with specific columns

```sql
SELECT name, price FROM products WHERE category_id = 5;
```

```python
# SQLAlchemy
session.query(Product.name, Product.price).filter(
    Product.category_id == 5
).all()

# Django ORM -- values() returns dicts, values_list() returns tuples
Product.objects.filter(category_id=5).values("name", "price")
Product.objects.filter(category_id=5).values_list("name", "price")
```

### SELECT DISTINCT

```sql
SELECT DISTINCT category_id FROM products;
```

```python
# Django ORM
Product.objects.values_list("category_id", flat=True).distinct()
```

### Existence check

```sql
SELECT EXISTS (SELECT 1 FROM products WHERE sku = 'ABC123');
```

```python
# Django ORM
Product.objects.filter(sku="ABC123").exists()
```

---

## Filtering

### IN clause

```sql
SELECT * FROM products WHERE id IN (1, 2, 3);
```

```python
# Django ORM
Product.objects.filter(id__in=[1, 2, 3])
```

### BETWEEN

```sql
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
```

```python
# Django ORM
from datetime import date
Order.objects.filter(created_at__range=(date(2024, 1, 1), date(2024, 12, 31)))
```

### LIKE / ILIKE

```sql
SELECT * FROM products WHERE name ILIKE '%widget%';
```

```python
# Django ORM
Product.objects.filter(name__icontains="widget")
```

### IS NULL / IS NOT NULL

```sql
SELECT * FROM products WHERE deleted_at IS NULL;
SELECT * FROM products WHERE deleted_at IS NOT NULL;
```

```python
# Django ORM
Product.objects.filter(deleted_at__isnull=True)
Product.objects.filter(deleted_at__isnull=False)
```

### OR conditions

```sql
SELECT * FROM products WHERE price < 10 OR is_featured = true;
```

```python
# Django ORM
from django.db.models import Q
Product.objects.filter(Q(price__lt=10) | Q(is_featured=True))
```

### NOT conditions

```sql
SELECT * FROM products WHERE NOT (status = 'archived');
```

```python
# Django ORM
Product.objects.exclude(status="archived")
# or
Product.objects.filter(~Q(status="archived"))
```

---

## Aggregation

### Simple aggregates

```sql
SELECT COUNT(*), AVG(price), MAX(price), MIN(price), SUM(price)
FROM products
WHERE is_active = true;
```

```python
# Django ORM
from django.db.models import Count, Avg, Max, Min, Sum

Product.objects.filter(is_active=True).aggregate(
    count=Count("id"),
    avg_price=Avg("price"),
    max_price=Max("price"),
    min_price=Min("price"),
    total_price=Sum("price"),
)
# Returns: {"count": 42, "avg_price": 29.99, ...}
```

### GROUP BY

```sql
SELECT category_id, COUNT(*), AVG(price)
FROM products
GROUP BY category_id;
```

```python
# Django ORM
Product.objects.values("category_id").annotate(
    count=Count("id"),
    avg_price=Avg("price"),
)
```

### GROUP BY with HAVING

```sql
SELECT category_id, COUNT(*) as cnt
FROM products
GROUP BY category_id
HAVING COUNT(*) > 10;
```

```python
# Django ORM
Product.objects.values("category_id").annotate(
    cnt=Count("id"),
).filter(cnt__gt=10)
```

### Conditional aggregation (FILTER / CASE WHEN)

```sql
SELECT
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM orders;
```

```python
# Django ORM
from django.db.models import Count, Q

Order.objects.aggregate(
    active_count=Count("id", filter=Q(status="active")),
    pending_count=Count("id", filter=Q(status="pending")),
)
```

---

## Joins

### INNER JOIN (following FK)

```sql
SELECT o.*, u.email
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.is_active = true;
```

```python
# Django ORM -- spanning relationships with double underscore
Order.objects.filter(user__is_active=True).select_related("user")
```

### LEFT JOIN

```sql
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
```

```python
# Django ORM -- annotations automatically use LEFT JOIN for nullable FKs
User.objects.annotate(order_count=Count("orders"))
```

### Join on non-FK column

```sql
SELECT p.*, t.rate
FROM products p
JOIN tax_rates t ON p.tax_code = t.code AND t.region = 'US';
```

```python
# Django ORM -- if no FK relationship exists, use Subquery
from django.db.models import OuterRef, Subquery

us_rate = TaxRate.objects.filter(
    code=OuterRef("tax_code"),
    region="US",
).values("rate")[:1]

Product.objects.annotate(rate=Subquery(us_rate))
```

---

## Subqueries

### Scalar subquery

```sql
SELECT *,
    (SELECT MAX(created_at) FROM orders WHERE orders.user_id = users.id) as last_order
FROM users;
```

```python
# Django ORM
from django.db.models import OuterRef, Subquery

last_order = Order.objects.filter(
    user_id=OuterRef("id")
).order_by("-created_at").values("created_at")[:1]

User.objects.annotate(last_order=Subquery(last_order))
```

### EXISTS subquery

```sql
SELECT * FROM users
WHERE EXISTS (
    SELECT 1 FROM orders WHERE orders.user_id = users.id AND orders.total > 100
);
```

```python
# Django ORM
from django.db.models import Exists, OuterRef

has_big_order = Order.objects.filter(
    user_id=OuterRef("id"),
    total__gt=100,
)
User.objects.filter(Exists(has_big_order))
```

### IN with subquery

```sql
SELECT * FROM products
WHERE category_id IN (SELECT id FROM categories WHERE is_featured = true);
```

```python
# Django ORM
featured_cats = Category.objects.filter(is_featured=True).values("id")
Product.objects.filter(category_id__in=featured_cats)
```

---

## Window Functions

### ROW_NUMBER

```sql
SELECT *, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as rank
FROM products;
```

```python
# Django ORM
from django.db.models import Window, RowNumber, F

Product.objects.annotate(
    rank=Window(
        expression=RowNumber(),
        partition_by=F("category_id"),
        order_by=F("price").desc(),
    )
)
```

### Running total

```sql
SELECT id, amount,
    SUM(amount) OVER (ORDER BY created_at ROWS UNBOUNDED PRECEDING) as running_total
FROM transactions;
```

```python
# Django ORM
from django.db.models import Window, Sum, F

Transaction.objects.annotate(
    running_total=Window(
        expression=Sum("amount"),
        order_by=F("created_at").asc(),
        frame=RowRange(start=None, end=0),  # UNBOUNDED PRECEDING to CURRENT ROW
    )
)
```

### LAG / LEAD

```sql
SELECT month, revenue,
    revenue - LAG(revenue) OVER (ORDER BY month) as month_over_month
FROM monthly_metrics;
```

```python
# Django ORM
from django.db.models import Window, F
from django.db.models.functions import Lag

MonthlyMetric.objects.annotate(
    prev_revenue=Window(
        expression=Lag("revenue"),
        order_by=F("month").asc(),
    )
).annotate(
    month_over_month=F("revenue") - F("prev_revenue"),
)
```

---

## Write Operations

### INSERT

```sql
INSERT INTO products (name, price, category_id) VALUES ('Widget', 9.99, 5);
```

```python
# Django ORM
Product.objects.create(name="Widget", price=9.99, category_id=5)
```

### Bulk INSERT

```sql
INSERT INTO products (name, price) VALUES ('A', 1), ('B', 2), ('C', 3);
```

```python
# Django ORM
Product.objects.bulk_create([
    Product(name="A", price=1),
    Product(name="B", price=2),
    Product(name="C", price=3),
])
```

### UPDATE

```sql
UPDATE products SET price = price * 1.1 WHERE category_id = 5;
```

```python
# Django ORM
from django.db.models import F
Product.objects.filter(category_id=5).update(price=F("price") * 1.1)
```

### Bulk UPDATE

```sql
-- Multiple rows with different values
UPDATE products SET price = CASE
    WHEN id = 1 THEN 9.99
    WHEN id = 2 THEN 19.99
    WHEN id = 3 THEN 29.99
END
WHERE id IN (1, 2, 3);
```

```python
# Django ORM (Django 4.1+)
Product.objects.bulk_update(
    [
        Product(id=1, price=9.99),
        Product(id=2, price=19.99),
        Product(id=3, price=29.99),
    ],
    fields=["price"],
)
```

### UPSERT (INSERT ... ON CONFLICT)

```sql
INSERT INTO daily_stats (date, views, clicks)
VALUES ('2024-01-15', 100, 5)
ON CONFLICT (date)
DO UPDATE SET views = EXCLUDED.views, clicks = EXCLUDED.clicks;
```

```python
# Django ORM (Django 4.1+)
DailyStat.objects.bulk_create(
    [DailyStat(date=date(2024, 1, 15), views=100, clicks=5)],
    update_conflicts=True,
    unique_fields=["date"],
    update_fields=["views", "clicks"],
)
```

### DELETE

```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

```python
# Django ORM
from django.utils import timezone
Session.objects.filter(expires_at__lt=timezone.now()).delete()
```

---

## UNION / INTERSECT / EXCEPT

### UNION

```sql
SELECT name, 'product' as source FROM products WHERE is_featured = true
UNION ALL
SELECT name, 'category' as source FROM categories WHERE is_featured = true;
```

```python
# Django ORM
from django.db.models import Value, CharField

products = Product.objects.filter(is_featured=True).values_list("name").annotate(
    source=Value("product", output_field=CharField())
)
categories = Category.objects.filter(is_featured=True).values_list("name").annotate(
    source=Value("category", output_field=CharField())
)
combined = products.union(categories, all=True)
```

---

## Date/Time Operations

### Date truncation

```sql
SELECT DATE_TRUNC('month', created_at) as month, COUNT(*)
FROM orders
GROUP BY 1;
```

```python
# Django ORM
from django.db.models.functions import TruncMonth

Order.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(
    count=Count("id")
)
```

### Date arithmetic

```sql
SELECT * FROM subscriptions
WHERE end_date < CURRENT_DATE + INTERVAL '30 days';
```

```python
# Django ORM
from datetime import timedelta
from django.utils import timezone

thirty_days = timezone.now().date() + timedelta(days=30)
Subscription.objects.filter(end_date__lt=thirty_days)
```

---

## SQLAlchemy-Specific Patterns

### Session query with eager loading

```python
# SQLAlchemy
from sqlalchemy.orm import joinedload

users = session.query(User).options(
    joinedload(User.orders)
).filter(User.is_active == True).all()

# Django ORM
users = User.objects.filter(is_active=True).prefetch_related("orders")
# or for single FK:
users = User.objects.filter(is_active=True).select_related("profile")
```

### SQLAlchemy hybrid property

```python
# SQLAlchemy
class Product(Base):
    @hybrid_property
    def discounted_price(self):
        return self.price * (1 - self.discount)

# Django ORM -- use annotation or model property
# As queryset annotation (for filtering/ordering):
Product.objects.annotate(
    discounted_price=F("price") * (1 - F("discount"))
)

# As model property (for display only):
class Product(models.Model):
    @property
    def discounted_price(self):
        return self.price * (1 - self.discount)
```

### SQLAlchemy relationship lazy loading

```python
# SQLAlchemy -- accessing relationship triggers lazy load
user = session.query(User).get(1)
orders = user.orders  # lazy SQL query

# Django ORM -- same behavior, but be aware of N+1
user = User.objects.get(id=1)
orders = user.orders.all()  # lazy SQL query

# To avoid N+1 in loops, prefetch:
users = User.objects.prefetch_related("orders")
for user in users:
    print(user.orders.all())  # no additional queries
```

---

## Patterns That Must Stay as Raw SQL

### Recursive CTEs

```python
# No Django ORM equivalent -- use .raw()
Category.objects.raw("""
    WITH RECURSIVE tree AS (
        SELECT id, name, parent_id, 1 as depth
        FROM categories
        WHERE parent_id IS NULL
        UNION ALL
        SELECT c.id, c.name, c.parent_id, t.depth + 1
        FROM categories c
        JOIN tree t ON c.parent_id = t.id
    )
    SELECT * FROM tree ORDER BY depth, name
""")
```

### Complex EXPLAIN / diagnostic queries

```python
# Administrative queries that inspect database internals -- keep as raw
with connection.cursor() as cursor:
    cursor.execute("EXPLAIN ANALYZE SELECT ...")  # nosql-lint
```

### Database DDL in data migrations

```python
# Schema operations in migrations -- keep as raw
def forwards(apps, schema_editor):
    schema_editor.execute(  # nosql-lint
        "CREATE INDEX CONCURRENTLY idx_orders_user_created "
        "ON orders (user_id, created_at)"
    )
```
