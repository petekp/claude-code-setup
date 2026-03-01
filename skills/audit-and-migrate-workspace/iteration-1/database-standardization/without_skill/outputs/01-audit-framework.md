# Query Audit Framework

## Purpose

Before migrating a single line of code, every database query in the codebase must be cataloged, classified, and prioritized. This document defines how to conduct that audit.

## Step 1: Find Every Query

Run these searches across the entire codebase. Each match is a query to catalog.

### Raw SQL Patterns

```bash
# Direct cursor usage
grep -rn "connection.cursor()" --include="*.py"
grep -rn "cursor.execute(" --include="*.py"

# Django raw queries
grep -rn "\.raw(" --include="*.py"
grep -rn "RawSQL(" --include="*.py"

# Deprecated .extra()
grep -rn "\.extra(" --include="*.py"

# String-formatted SQL (dangerous -- SQL injection risk)
grep -rn "execute.*%s" --include="*.py"
grep -rn "execute.*f'" --include="*.py"
grep -rn "execute.*f\"" --include="*.py"
```

### SQLAlchemy Patterns

```bash
# Import statements (find all files using SQLAlchemy)
grep -rn "from sqlalchemy" --include="*.py"
grep -rn "import sqlalchemy" --include="*.py"

# Session usage
grep -rn "session\.query(" --include="*.py"
grep -rn "session\.execute(" --include="*.py"

# Engine usage
grep -rn "engine\.execute(" --include="*.py"
grep -rn "create_engine(" --include="*.py"
```

### Django ORM (baseline -- no migration needed, but catalog for completeness)

```bash
# Complex ORM usage that might be candidates for simplification
grep -rn "\.annotate(" --include="*.py"
grep -rn "\.aggregate(" --include="*.py"
grep -rn "Subquery(" --include="*.py"
grep -rn "Window(" --include="*.py"
```

## Step 2: Fill Out the Query Inventory

For each query found, record:

| Field | Description |
|-------|-------------|
| **ID** | Sequential identifier (Q001, Q002, ...) |
| **File** | File path |
| **Line** | Line number |
| **Type** | `raw_sql`, `sqlalchemy`, `orm` (already migrated) |
| **Description** | What the query does in plain English |
| **Tables** | Which database tables it touches |
| **Complexity** | `trivial`, `moderate`, `complex`, `keep_raw` (see classification guide below) |
| **Risk** | `low`, `medium`, `high`, `critical` |
| **Has Tests** | Yes/No -- does this code path have existing test coverage? |
| **Notes** | Any special considerations |

## Step 3: Classify Complexity

### Trivial (estimated: 60-70% of raw SQL queries)

Queries that map directly to ORM methods with no special handling:

- Simple SELECT with WHERE clause -> `.filter()`
- SELECT with ORDER BY and LIMIT -> `.order_by()[:n]`
- COUNT, SUM, AVG -> `.aggregate()` or `.annotate()`
- Simple JOINs following foreign keys -> `select_related()` / `prefetch_related()`
- INSERT -> `Model.objects.create()` or `bulk_create()`
- UPDATE with simple WHERE -> `.filter().update()`
- DELETE with simple WHERE -> `.filter().delete()`

### Moderate (estimated: 20-25% of raw SQL queries)

Queries that need ORM features beyond basic querysets:

- Window functions -> `Window()` expression
- Conditional expressions -> `Case()` / `When()`
- Subqueries -> `Subquery()`, `OuterRef()`
- UNION -> `.union()`
- Complex aggregations -> `annotate()` with custom expressions
- JSON field operations -> Django JSON field lookups
- Date/time extraction and arithmetic -> `TruncMonth()`, `ExtractYear()`, F() expressions
- Bulk upsert -> `bulk_create(update_conflicts=True)` (Django 4.1+)

### Complex (estimated: 5-10% of raw SQL queries)

Queries that require custom database functions or creative ORM usage:

- CTEs -> `django-cte` package or restructure as nested subqueries
- Self-joins with complex conditions -> `FilteredRelation()` or subqueries
- Multi-table UPDATE/DELETE -> Restructure as multiple queries in a transaction
- Database-specific functions (ARRAY_AGG, etc.) -> Custom `Func()` subclasses
- Queries with multiple levels of nesting -> May need to be broken into multiple ORM queries
- Lateral joins -> Custom SQL wrapped in `RawSQL()` expression

### Keep as Raw SQL (estimated: 2-5% of raw SQL queries)

Some queries should remain as raw SQL, but managed through Django's `.raw()` or `RawSQL()`:

- Queries using database-specific syntax with no ORM equivalent and no reasonable restructuring
- Materialized view management
- Complex reporting queries where readability of raw SQL far exceeds ORM equivalent
- Queries verified to have meaningfully better performance as raw SQL

**Important**: "Keep raw" does NOT mean "keep using `cursor.execute()`". It means use Django's `Model.objects.raw()` or `RawSQL()` expression, which still go through Django's connection management.

## Step 4: Assess Risk

### Critical

- Handles financial transactions or billing
- Modifies user authentication/authorization data
- Called >10,000 times per day
- No existing test coverage AND touches critical data

### High

- Modifies data (INSERT, UPDATE, DELETE) in important tables
- Called frequently (>1,000 times per day)
- Part of a user-facing workflow with no tolerance for errors

### Medium

- Read-only queries on important data
- Called moderately (<1,000 times per day)
- Has some test coverage

### Low

- Admin/internal tooling queries
- Infrequently called
- Read-only on non-critical data
- Well-covered by tests

## Step 5: Prioritize

Sort the inventory by this priority:

1. **SQLAlchemy queries** (any complexity, any risk) -- removing the dependency is the primary goal
2. **Critical risk + trivial complexity** -- high-value, low-effort wins
3. **High risk + trivial complexity** -- same logic
4. **Trivial complexity, any risk** -- bulk of the easy work
5. **Moderate complexity, ordered by risk** (critical first)
6. **Complex, ordered by risk** (critical first)
7. **Keep-raw queries** -- just refactor to use Django's raw query interface

## Template: Query Inventory Spreadsheet

```
ID,File,Line,Type,Description,Tables,Complexity,Risk,Has Tests,Notes
Q001,views/reports.py,45,raw_sql,"Monthly revenue aggregation",orders+line_items,moderate,high,No,"Uses window function for running total"
Q002,views/flask_compat.py,12,sqlalchemy,"Get user preferences",user_preferences,trivial,medium,Yes,"Ported from Flask user service"
Q003,views/admin.py,89,raw_sql,"Bulk deactivate expired accounts",users,trivial,critical,No,"Runs nightly via cron"
```
