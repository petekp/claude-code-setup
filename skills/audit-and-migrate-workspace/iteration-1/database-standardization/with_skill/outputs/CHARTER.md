# Migration Charter

## Mission

Standardize all database access in the Django application onto the Django ORM, eliminating raw SQL queries and SQLAlchemy usage, to reduce cognitive overhead, improve maintainability, and enable consistent use of Django's migration system, query optimization, and security features.

## Scope

- **All views** containing raw SQL (`cursor.execute`, `connection.cursor()`, `RawSQL`, `.raw()`, `.extra()`)
- **3 Flask-ported endpoints** using SQLAlchemy sessions, models, and query builders
- **All model layer code** already using the Django ORM (verify correctness, use as migration target pattern)
- **Test files** covering any of the above — must be updated to test ORM-based implementations
- **SQLAlchemy dependency** in `requirements.txt` / `pyproject.toml` — removal target once migration is complete

Specific directories expected to be in scope:
- `views/` — primary location of raw SQL
- `api/` or `endpoints/` — Flask-ported SQLAlchemy endpoints
- `models/` — existing ORM models (reference, may need additions)
- `tests/` — test coverage for migrated code
- `utils/db.py` or similar — any shared database helper modules
- `settings.py` / `settings/` — database configuration (SQLAlchemy engine config removal)

## Invariants

- All existing tests continue to pass at every slice boundary
- No user-facing behavior changes — query results, response shapes, and error behavior remain identical
- No data loss or corruption — migrated queries must return the same result sets
- Database performance does not regress by more than 10% on any migrated query (measure with `EXPLAIN ANALYZE` before/after)
- The application remains deployable and fully functional after every slice merge

## Non-Goals

- **Schema changes** — we are not altering database tables, adding indexes, or changing column types (unless required to express a query in the ORM)
- **API redesign** — endpoint signatures, URL routes, and response formats stay the same
- **Database engine migration** — we are not switching from PostgreSQL/MySQL/etc. to a different database
- **Performance optimization** — we are matching existing behavior, not improving it (optimization is a follow-up effort)
- **Upgrading Django version** — the migration targets the current Django version's ORM capabilities
- **Removing database views or stored procedures** — if raw SQL calls stored procs or views, the ORM will call them via the same mechanism (we document these as exceptions)

## Guardrails

- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Every migrated query must have a test that asserts result-set equivalence (compare ORM output against a known-good fixture or the old query's output)
- Raw SQL that cannot be expressed in the ORM must be documented in DECISIONS.md with justification for using `.raw()` or `RawSQL` — these are acceptable Django ORM constructs, but each instance requires an explicit decision
- SQLAlchemy cannot be imported from any new file. Imports can only decrease.
