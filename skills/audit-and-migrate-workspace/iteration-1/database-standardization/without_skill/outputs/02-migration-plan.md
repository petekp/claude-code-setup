# Database Access Standardization: Migration Plan

## Executive Summary

Migrate ~150 database queries across 35 files from a mix of raw SQL, SQLAlchemy, and Django ORM to standardized Django ORM usage. The migration is structured in 5 phases over an estimated 4-6 weeks, with SQLAlchemy removal as the first priority.

## Guiding Principles

1. **Test before you touch.** No query is rewritten without a test proving the original behavior. If no test exists, write one first.
2. **Same results, not same SQL.** The ORM will generate different SQL than the hand-written version. That's fine. What matters is identical results for identical inputs.
3. **Raw is not the enemy -- inconsistency is.** Some queries will stay as raw SQL via Django's `.raw()` or `RawSQL()`. The goal is not "zero raw SQL" but "zero non-Django database access."
4. **Ship incrementally.** Each migrated query is a standalone PR that can be reviewed, tested, and deployed independently.
5. **Performance is a constraint, not an afterthought.** Any query that was originally raw SQL for performance reasons gets benchmarked after migration.

---

## Phase 0: Preparation (3-5 days)

### 0.1 Complete the Query Audit

Follow the audit framework (see `01-audit-framework.md`) to produce a complete inventory of all ~150 queries. Every query gets an ID, classification, and priority.

**Deliverable:** Completed query inventory spreadsheet.

### 0.2 Set Up Testing Infrastructure

Create a test utility that makes it easy to verify query equivalence:

```python
# tests/query_utils.py

from django.test import TestCase
from django.db import connection


class QueryEquivalenceTestCase(TestCase):
    """Base class for tests that verify a migrated query produces identical results."""

    def assert_queries_equivalent(self, raw_sql, raw_params, orm_queryset):
        """
        Execute raw SQL and an ORM queryset, assert they return the same rows.

        Args:
            raw_sql: The original SQL string
            raw_params: Parameters for the SQL string
            orm_queryset: The new Django ORM queryset
        """
        with connection.cursor() as cursor:
            cursor.execute(raw_sql, raw_params)
            raw_results = cursor.fetchall()
            raw_columns = [col[0] for col in cursor.description]

        orm_results = list(orm_queryset.values_list(*raw_columns))

        self.assertEqual(
            len(raw_results),
            len(orm_results),
            f"Row count mismatch: raw={len(raw_results)}, orm={len(orm_results)}"
        )

        for i, (raw_row, orm_row) in enumerate(zip(
            sorted(raw_results), sorted(orm_results)
        )):
            self.assertEqual(
                raw_row, orm_row,
                f"Row {i} mismatch:\n  raw: {raw_row}\n  orm: {orm_row}"
            )
```

**Deliverable:** `tests/query_utils.py` with equivalence test helpers.

### 0.3 Build Custom Database Functions

Analyze the audit results to identify raw SQL patterns that need custom `Func()` subclasses. Build them upfront so they're available during migration.

Common ones you'll likely need:

```python
# core/db_functions.py

from django.db.models import Func, FloatField, JSONField


class ArrayAgg(Func):
    function = "ARRAY_AGG"
    template = "%(function)s(%(distinct)s%(expressions)s %(ordering)s)"

    def __init__(self, expression, distinct=False, ordering=None, **extra):
        super().__init__(
            expression,
            distinct="DISTINCT " if distinct else "",
            ordering=f"ORDER BY {ordering}" if ordering else "",
            **extra,
        )


class JsonBuildObject(Func):
    function = "JSON_BUILD_OBJECT"
    output_field = JSONField()


class Percentile(Func):
    function = "PERCENTILE_CONT"
    template = "%(function)s(%(percentile)s) WITHIN GROUP (ORDER BY %(expressions)s)"

    def __init__(self, expression, percentile=0.5, **extra):
        super().__init__(expression, percentile=percentile, **extra)
        self.extra["percentile"] = percentile
```

**Deliverable:** `core/db_functions.py` with reusable custom functions.

### 0.4 Identify Django Model Gaps

Compare SQLAlchemy model definitions against Django models. Look for:

- Fields defined in SQLAlchemy but missing from Django models
- Relationships defined differently
- Custom column types
- Default values or constraints that differ

Fix any gaps in Django models BEFORE starting the query migration.

**Deliverable:** Updated Django models (with migrations) that are feature-complete relative to SQLAlchemy models.

---

## Phase 1: SQLAlchemy Removal (3-5 days)

### Why first

- Only 3 endpoints -- smallest scope
- Removes an entire dependency (`sqlalchemy` from requirements)
- Eliminates the dual-connection-pool problem
- Highest signal-to-noise ratio for the team (visible dependency removal)

### 1.1 Map SQLAlchemy Sessions to Django Connections

Identify where SQLAlchemy session/engine are configured:

```python
# BEFORE (Flask-style SQLAlchemy)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def get_user_preferences(user_id):
    session = Session()
    try:
        prefs = session.query(UserPreference).filter_by(user_id=user_id).all()
        return [{"key": p.key, "value": p.value} for p in prefs]
    finally:
        session.close()
```

```python
# AFTER (Django ORM)
from myapp.models import UserPreference

def get_user_preferences(user_id):
    return list(
        UserPreference.objects.filter(user_id=user_id).values("key", "value")
    )
```

### 1.2 Migration Checklist for Each SQLAlchemy Endpoint

For each of the 3 endpoints:

- [ ] Write integration test for current behavior (request in, response out)
- [ ] Identify all SQLAlchemy queries in the endpoint
- [ ] Map each query to its Django ORM equivalent
- [ ] Replace the implementation
- [ ] Run integration test -- must pass with no changes to test assertions
- [ ] Run query equivalence test if applicable
- [ ] Remove SQLAlchemy imports from the file
- [ ] PR review and merge

### 1.3 Remove SQLAlchemy Infrastructure

After all 3 endpoints are migrated:

- [ ] Remove SQLAlchemy engine/session configuration
- [ ] Remove `sqlalchemy` from `requirements.txt` / `pyproject.toml`
- [ ] Remove any SQLAlchemy model definitions
- [ ] Run full test suite
- [ ] Deploy and monitor

**Deliverable:** SQLAlchemy fully removed from the codebase.

---

## Phase 2: Trivial Raw SQL Migration (5-7 days)

### Scope

All queries classified as `trivial` in the audit (estimated 60-70% of raw SQL queries, so roughly 30-50 queries depending on how many were raw SQL vs ORM already).

### Approach

These are mechanical translations. The pattern is always:

1. Read the raw SQL
2. Write the equivalent ORM queryset
3. Write or update a test
4. Replace the implementation
5. Verify

### Common Translations

| Raw SQL Pattern | Django ORM Equivalent |
|---|---|
| `SELECT * FROM t WHERE col = %s` | `T.objects.filter(col=value)` |
| `SELECT col1, col2 FROM t` | `T.objects.values("col1", "col2")` or `values_list` |
| `SELECT COUNT(*) FROM t WHERE ...` | `T.objects.filter(...).count()` |
| `SELECT DISTINCT col FROM t` | `T.objects.values_list("col", flat=True).distinct()` |
| `INSERT INTO t (col) VALUES (%s)` | `T.objects.create(col=value)` |
| `UPDATE t SET col = %s WHERE id = %s` | `T.objects.filter(id=pk).update(col=value)` |
| `DELETE FROM t WHERE ...` | `T.objects.filter(...).delete()` |
| `SELECT ... ORDER BY col LIMIT n` | `T.objects.order_by("col")[:n]` |
| `SELECT ... INNER JOIN t2 ON ...` | `T.objects.select_related("fk_field")` |
| `SELECT ... WHERE col IN (SELECT ...)` | `T.objects.filter(col__in=Subquery(...))` |

### Batch Strategy

Group trivial migrations by file. Migrate all trivial queries in a single file in one PR, rather than one PR per query. This keeps PRs at a reviewable size (a few queries per file) while avoiding the overhead of 50 individual PRs.

**Deliverable:** All trivial raw SQL queries converted to ORM.

---

## Phase 3: Moderate Raw SQL Migration (5-7 days)

### Scope

Queries classified as `moderate` (estimated 20-25% of raw SQL queries).

### 3.1 Window Functions

```python
# BEFORE
cursor.execute("""
    SELECT id, amount,
           SUM(amount) OVER (ORDER BY created_at) as running_total
    FROM orders
    WHERE user_id = %s
""", [user_id])

# AFTER
from django.db.models import Window, Sum, F

Order.objects.filter(user_id=user_id).annotate(
    running_total=Window(
        expression=Sum("amount"),
        order_by=F("created_at").asc(),
    )
).values("id", "amount", "running_total")
```

### 3.2 Conditional Aggregation

```python
# BEFORE
cursor.execute("""
    SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count
    FROM users
""")

# AFTER
from django.db.models import Count, Q

User.objects.aggregate(
    active_count=Count("id", filter=Q(status="active")),
    inactive_count=Count("id", filter=Q(status="inactive")),
)
```

### 3.3 Subqueries

```python
# BEFORE
cursor.execute("""
    SELECT u.*, latest_order.total
    FROM users u
    LEFT JOIN LATERAL (
        SELECT total FROM orders
        WHERE orders.user_id = u.id
        ORDER BY created_at DESC
        LIMIT 1
    ) latest_order ON true
""")

# AFTER
from django.db.models import OuterRef, Subquery

latest_order_total = Order.objects.filter(
    user_id=OuterRef("id")
).order_by("-created_at").values("total")[:1]

User.objects.annotate(
    latest_order_total=Subquery(latest_order_total)
)
```

### 3.4 Bulk Upserts

```python
# BEFORE
cursor.execute("""
    INSERT INTO metrics (key, value, date)
    VALUES (%s, %s, %s)
    ON CONFLICT (key, date)
    DO UPDATE SET value = EXCLUDED.value
""", [key, value, date])

# AFTER (Django 4.1+)
Metric.objects.bulk_create(
    [Metric(key=key, value=value, date=date)],
    update_conflicts=True,
    unique_fields=["key", "date"],
    update_fields=["value"],
)
```

**Deliverable:** All moderate-complexity raw SQL queries converted to ORM.

---

## Phase 4: Complex Raw SQL Migration (3-5 days)

### Scope

Queries classified as `complex` (estimated 5-10% of raw SQL queries). These require the most judgment.

### 4.1 CTEs (Common Table Expressions)

**Option A: django-cte package**

```python
# BEFORE
cursor.execute("""
    WITH monthly_totals AS (
        SELECT DATE_TRUNC('month', created_at) as month,
               SUM(amount) as total
        FROM orders
        GROUP BY 1
    )
    SELECT month, total,
           total - LAG(total) OVER (ORDER BY month) as change
    FROM monthly_totals
""")

# AFTER (with django-cte)
from django_cte import With

monthly_totals = With(
    Order.objects.values(
        month=TruncMonth("created_at")
    ).annotate(total=Sum("amount"))
)

monthly_totals.queryset().annotate(
    change=F("total") - Window(
        expression=Lag("total"),
        order_by=F("month").asc(),
    )
).values("month", "total", "change")
```

**Option B: Restructure as subquery (no additional dependency)**

Sometimes a CTE can be expressed as a subquery or broken into multiple ORM queries. Evaluate case-by-case.

**Option C: Use .raw() if the query is genuinely better as SQL**

```python
# If the ORM version is unreasonably complex, use .raw()
Order.objects.raw("""
    WITH RECURSIVE category_tree AS (
        SELECT id, name, parent_id, 0 as depth
        FROM categories WHERE parent_id IS NULL
        UNION ALL
        SELECT c.id, c.name, c.parent_id, ct.depth + 1
        FROM categories c
        JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree ORDER BY depth, name
""")
```

This is acceptable because `.raw()` still uses Django's connection management.

### 4.2 Decision Framework: ORM vs .raw()

For each complex query, ask:

1. **Can the ORM express it at all?** If not -> `.raw()` or `RawSQL()`
2. **Is the ORM version readable?** If the ORM version is 3x longer and harder to understand -> consider `.raw()`
3. **Does the ORM version perform the same?** Run `EXPLAIN ANALYZE` on both -> if ORM is >2x slower and optimization doesn't help -> `.raw()`
4. **Is this query likely to change?** If it's stable SQL that rarely changes -> `.raw()` is fine. If it changes often -> ORM is better for composability.

### 4.3 Performance-Sensitive Queries

For queries that were raw SQL specifically for performance:

1. Write the ORM version
2. Run both through `EXPLAIN ANALYZE` with production-like data
3. Compare execution plans
4. If ORM is slower, try: adding `select_related`/`prefetch_related`, adding database indexes, restructuring the query
5. If still slower after optimization, document the performance difference and decide: accept the regression, or keep as `.raw()`

**Deliverable:** All complex queries either converted to ORM or explicitly kept as `.raw()` with documented rationale.

---

## Phase 5: Validation and Cleanup (2-3 days)

### 5.1 Full Regression Suite

- Run the entire test suite
- Run any integration/E2E tests
- Manually test critical user flows

### 5.2 Query Count Verification

Use Django's test client query counting to verify no N+1 regressions were introduced:

```python
from django.test.utils import override_settings

class PerformanceTest(TestCase):
    def test_endpoint_query_count(self):
        with self.assertNumQueries(5):  # adjust to expected count
            self.client.get("/api/endpoint/")
```

### 5.3 Remove Dead Code

- Delete any SQLAlchemy model files
- Delete SQLAlchemy configuration/connection setup
- Remove `sqlalchemy` and related packages from dependencies
- Remove any raw SQL helper utilities that are no longer used
- Remove `.extra()` calls if any were missed

### 5.4 Update Documentation

- Update any developer documentation that references SQLAlchemy
- Document the custom `Func` subclasses in `core/db_functions.py`
- Add a section to the project's contributing guide: "All database access must use the Django ORM"

### 5.5 Add Lint Rules

Prevent regression by adding linting rules that catch non-ORM database access:

```python
# .flake8 or ruff configuration -- custom rule or pre-commit hook

# pre-commit hook: ban-raw-sql.py
import re
import sys

BANNED_PATTERNS = [
    r"from sqlalchemy",
    r"import sqlalchemy",
    r"cursor\.execute\(",
    r"connection\.cursor\(\)",
]

def check_file(filepath):
    with open(filepath) as f:
        for i, line in enumerate(f, 1):
            for pattern in BANNED_PATTERNS:
                if re.search(pattern, line):
                    # Allow if there's an explicit override comment
                    if "# nosql-lint" not in line:
                        print(f"{filepath}:{i}: Banned pattern: {pattern}")
                        return False
    return True
```

**Deliverable:** Clean codebase, no SQLAlchemy dependency, lint rules preventing regression.

---

## Timeline Estimate

| Phase | Duration | Queries | Dependencies |
|-------|----------|---------|--------------|
| Phase 0: Preparation | 3-5 days | 0 (audit only) | None |
| Phase 1: SQLAlchemy | 3-5 days | ~10-15 queries across 3 endpoints | Phase 0 |
| Phase 2: Trivial Raw SQL | 5-7 days | ~30-50 queries | Phase 0 |
| Phase 3: Moderate Raw SQL | 5-7 days | ~15-25 queries | Phase 0, Phase 0.3 (custom Func) |
| Phase 4: Complex Raw SQL | 3-5 days | ~5-10 queries | Phase 0 |
| Phase 5: Validation | 2-3 days | 0 (cleanup) | All above |

**Total: 4-6 weeks** (phases 2-4 can partially overlap if multiple developers are working on it)

**Note:** Phases 1-4 are independent of each other after Phase 0 is complete. They can be parallelized across team members if desired, though Phase 1 (SQLAlchemy) should still go first for the dependency-removal win.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ORM generates inefficient SQL | Benchmark against original; keep .raw() if necessary |
| Missing test coverage on migrated queries | Phase 0 identifies coverage gaps; write tests before migrating |
| Django model doesn't have all needed fields | Phase 0.4 identifies and fixes model gaps before migration |
| Regression in production | Deploy each phase separately; monitor query performance after each deployment |
| Scope creep (temptation to refactor views during migration) | Discipline: only change the data access layer. Refactoring is a separate effort. |
| Team unfamiliarity with advanced ORM features | Phase 0.3 builds the custom functions; include code review as learning opportunity |
