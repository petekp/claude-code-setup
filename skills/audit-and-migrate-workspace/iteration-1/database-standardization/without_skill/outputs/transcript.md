# Migration Planning Transcript

## Initial Assessment

The user describes a Django application with three distinct database access patterns:

1. **Django ORM** -- used in most models (the majority of the ~150 queries)
2. **Raw SQL** -- used in some views, likely for performance or complex queries
3. **SQLAlchemy** -- used in 3 endpoints ported from Flask

The scope is approximately 150 queries across 35 files, and the goal is to standardize entirely on the Django ORM.

## Thinking Through the Problem

### Why this matters

Mixed database access patterns create several concrete problems:

- **Connection pool fragmentation**: SQLAlchemy and Django maintain separate connection pools, meaning the app holds more database connections than necessary and can't share them across layers.
- **Transaction boundary confusion**: A Django view might start a transaction via `@transaction.atomic`, but a SQLAlchemy query inside that view operates on a completely separate connection/transaction. This means you can have partial commits, phantom reads between the two systems, and rollback logic that only covers half the queries.
- **N+1 debugging difficulty**: Django's `django-debug-toolbar` and query logging only capture ORM queries. Raw SQL and SQLAlchemy queries are invisible to these tools, making performance investigation harder.
- **Schema migration drift**: Django migrations are authoritative for the schema, but SQLAlchemy models may define their own table mappings that drift from the Django model definitions over time.
- **Onboarding cost**: Every new developer needs to understand three query patterns and know which one to use where.

### Key risk: "Things the ORM can't easily express"

This is the most important technical challenge. Before committing to a migration strategy, I need to enumerate the categories of SQL that are genuinely hard to express in the Django ORM, and map each to a solution. The solutions aren't always "rewrite as ORM" -- sometimes the right answer is `RawSQL()`, `.extra()`, or a custom database function.

Categories of hard-to-express SQL:

1. **Window functions** -- Django has `Window()` expressions since 2.0, so most of these are expressible now. Edge cases: multiple window functions with different frames in the same query.

2. **CTEs (Common Table Expressions)** -- Django doesn't natively support `WITH` clauses. Options: `django-cte` package, or restructure as subqueries. Recursive CTEs are harder.

3. **Complex JOINs** -- Joins that don't follow foreign key relationships, or self-joins with complex conditions. The ORM can handle most of these with `FilteredRelation` or subqueries, but the syntax gets verbose.

4. **UNION / INTERSECT / EXCEPT** -- Django has `.union()`, `.intersection()`, `.difference()` since 1.11. But they have restrictions (no filtering after union, must have same columns).

5. **Database-specific functions** -- `LATERAL JOIN`, `ARRAY_AGG`, `JSON_BUILD_OBJECT`, etc. Django's `Func()` expression can wrap any database function, so these are always expressible, just verbose.

6. **Bulk upserts with conflict resolution** -- `INSERT ... ON CONFLICT DO UPDATE`. Django added `bulk_create(update_conflicts=True)` in 4.1, which covers the common case.

7. **Multi-table updates/deletes** -- `UPDATE ... FROM` or `DELETE ... USING`. These typically need to be restructured as subqueries.

8. **Materialized views / temp tables** -- No ORM support. These should remain as raw SQL managed through migrations.

9. **Performance-critical queries** -- Sometimes raw SQL is used because the ORM generates suboptimal query plans. These need case-by-case analysis.

### Migration approach

I'm going to structure this as a phased migration rather than a big-bang rewrite. The phases are:

1. **Audit** -- Catalog every query, classify it, assess difficulty
2. **Prepare** -- Build the tooling and patterns we'll need (custom Func expressions, test infrastructure)
3. **Migrate SQLAlchemy endpoints** -- These are the most isolated (3 endpoints) and remove an entire dependency
4. **Migrate raw SQL** -- Work through from easiest to hardest
5. **Validate and clean up** -- Remove SQLAlchemy dependency, update documentation

### Audit methodology

For the audit, I need to find every query in the codebase. The search patterns are:

**Raw SQL indicators:**
- `cursor.execute(`
- `connection.cursor()`
- `raw(` on managers
- `.extra(` (deprecated but still used)
- `RawSQL(`

**SQLAlchemy indicators:**
- `from sqlalchemy`
- `session.query(`
- `session.execute(`
- `engine.execute(`
- Any file importing from SQLAlchemy

**Django ORM (baseline -- no migration needed):**
- Standard queryset methods (`.filter()`, `.exclude()`, `.annotate()`, etc.)
- These are already the target pattern

For each query found, I'll classify it on two dimensions:
- **Complexity**: Can it be expressed in pure ORM? ORM + Func? Needs .raw()? Must stay as raw SQL?
- **Risk**: How critical is this code path? Is it in a hot loop? Does it handle money?

### SQLAlchemy migration specifics

The 3 Flask-ported endpoints likely have:
- SQLAlchemy model definitions that duplicate Django models
- Session management that conflicts with Django's connection handling
- Possibly different transaction semantics

The migration path:
1. Map each SQLAlchemy model to its Django model equivalent (should already exist)
2. Rewrite each query using the Django ORM
3. Ensure the Django model has all the fields/relationships the SQLAlchemy model uses
4. Update any serialization logic (Flask endpoints likely return dicts differently than Django views)

### Testing strategy

This is a data-access migration, so the testing strategy is critical:

1. **Snapshot testing**: For each query being migrated, capture the SQL output of the original and the new version. They don't need to be identical, but they need to return the same results for the same inputs.
2. **Integration tests**: For each endpoint/view being modified, ensure the existing integration tests pass. If there are no integration tests, write them BEFORE migrating.
3. **Performance benchmarks**: For queries that were raw SQL for performance reasons, benchmark the ORM version against the original.

### Ordering the work

I'll prioritize based on:
1. **SQLAlchemy first** -- removes an entire dependency, only 3 endpoints, highest value-to-effort ratio
2. **Simple raw SQL** -- queries that are trivially expressible in the ORM (basic SELECTs, simple JOINs)
3. **Medium raw SQL** -- queries needing Func(), Subquery(), or Window()
4. **Complex raw SQL** -- CTEs, multi-table operations, performance-critical queries
5. **Queries that should stay raw** -- some queries genuinely should use `.raw()` or `RawSQL()`, and that's fine because they're still Django-managed

## Decisions Made

1. Phased migration, not big-bang
2. SQLAlchemy removal is Phase 1 (highest ROI)
3. Every query gets classified before any migration begins
4. Test-first for every migration -- no query gets rewritten without a test proving equivalence
5. Some queries will remain as Django `.raw()` or `RawSQL()` -- that's acceptable because they still use Django's connection management
6. Custom `Func` expressions will be created as reusable utilities for common raw SQL patterns
