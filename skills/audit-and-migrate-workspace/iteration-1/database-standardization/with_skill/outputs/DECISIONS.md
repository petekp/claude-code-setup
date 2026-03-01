# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Django ORM as the Single Database Access Layer
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The codebase has three database access patterns — raw SQL (in views), Django ORM (in models), and SQLAlchemy (in 3 Flask-ported endpoints). This creates cognitive overhead: developers need to understand three different query paradigms, three different parameter binding conventions, and three different ways of handling transactions. It also blocks consistent use of Django's migration system and makes security auditing harder (raw SQL is the #1 vector for SQL injection in Django apps).
- **Decision:** Standardize on the Django ORM for all database access. Raw SQL via `cursor.execute()` and `.extra()` will be converted to ORM queries. SQLAlchemy models and sessions will be replaced with Django model equivalents. Where the ORM cannot express a query, we will use `QuerySet.raw()` or `RawSQL()` — these are Django ORM constructs and are acceptable, but each instance requires an explicit decision entry.
- **Alternatives considered:**
  - **Keep SQLAlchemy alongside Django ORM**: Rejected. Maintaining two ORMs means two sets of models, two connection pools, two transaction managers. The 3 endpoints don't justify that overhead.
  - **Standardize on SQLAlchemy**: Rejected. 95%+ of the codebase already uses Django ORM. Migrating the majority to SQLAlchemy would be far more work and would fight Django's conventions.
  - **Standardize on raw SQL**: Rejected. Loses all ORM benefits — migrations, query composition, security, admin integration.
- **Consequences:** We accept that some complex queries may be slightly more verbose in the ORM. We also accept that a small number of queries (estimated 5-10) will require `.raw()` or `RawSQL` and won't be "pure" ORM — this is an acceptable pragmatic tradeoff.
- **Supersedes:** (none)

---

## Decision 2: Handling ORM-Inexpressible Queries
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** Some raw SQL queries likely perform operations that are difficult or impossible to express with the Django ORM's queryset API. Common examples: recursive CTEs, complex window functions with custom frames, multi-table UPDATE...FROM statements, INSERT...ON CONFLICT with complex conflict resolution, or queries using database-specific features (lateral joins, array aggregation with custom ordering). We need a clear policy for these.
- **Decision:** Use a tiered approach:
  1. **First attempt**: Express the query using the Django ORM's queryset API (including `Subquery`, `Window`, `F()`, `Q()`, `Func`, `Value`, `Case/When`, `annotate`, `aggregate`).
  2. **Second attempt**: Use Django ORM escape hatches — `QuerySet.raw()` for full raw queries that return model instances, or `RawSQL()` / `Func` with `template` for embedding raw SQL fragments within otherwise ORM-driven queries.
  3. **Last resort**: Use `connection.cursor()` with parameterized queries, but wrap it in a well-named manager method on the relevant model so the raw SQL is encapsulated, not scattered in views.
  Each tier-2 or tier-3 usage requires a new DECISIONS.md entry documenting why the ORM queryset API was insufficient.
- **Alternatives considered:**
  - **Create custom ORM expressions for everything**: Rejected. Custom Func/Expression subclasses for one-off queries adds complexity without proportional benefit.
  - **Allow raw SQL in views for complex cases**: Rejected. Even when raw SQL is necessary, it should be on the model/manager layer where it's testable and reusable, not in view logic.
- **Consequences:** We'll end up with a small set of documented raw SQL usages, all encapsulated in model managers. This is a meaningful improvement over raw SQL scattered across views.
- **Supersedes:** (none)

---

## Decision 3: SQLAlchemy Model-to-Django Model Migration Strategy
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The 3 Flask-ported endpoints use SQLAlchemy models that likely map to the same database tables as existing Django models. We need to decide how to handle this overlap.
- **Decision:** Do NOT create new Django models for tables that already have Django models. Instead, extend existing Django models if needed (add missing fields, methods, or manager methods). For any SQLAlchemy model that maps to a table with NO existing Django model, create a new Django model and generate a migration with `--fake` if the table already exists. Verify column types and constraints match exactly.
- **Alternatives considered:**
  - **Create parallel Django models in a separate app**: Rejected. Leads to model duplication and confusion about which model is canonical.
  - **Use Django `inspectdb` to auto-generate models**: Partially adopted — useful as a verification step to compare against existing models, but auto-generated models shouldn't replace hand-maintained ones.
- **Consequences:** We need to carefully audit which tables the SQLAlchemy models reference and cross-check against existing Django models. Mismatches in field types or constraints could cause subtle bugs.
- **Supersedes:** (none)

---

## Decision 4: Migration Ordering — Raw SQL First, SQLAlchemy Second
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** We have two distinct migration fronts: raw SQL (~147 queries across ~32 files) and SQLAlchemy (~3 queries across ~3 files). We need to decide the order.
- **Decision:** Migrate raw SQL first, then SQLAlchemy. Rationale: Raw SQL is the larger surface area and the higher risk. The patterns we establish for raw-to-ORM conversion will be well-practiced by the time we tackle SQLAlchemy. Additionally, SQLAlchemy migration requires model unification (Decision 3), which benefits from having a stable, fully-ORM codebase to integrate into.
- **Alternatives considered:**
  - **SQLAlchemy first (smaller, faster win)**: Considered but rejected. The SQLAlchemy endpoints may depend on tables/models that raw SQL also touches. Migrating raw SQL first stabilizes the model layer.
  - **Interleave both**: Rejected. Increases cognitive overhead and risk of conflicting changes.
- **Consequences:** The SQLAlchemy dependency stays in `requirements.txt` until the final slices. This is acceptable.
- **Supersedes:** (none)
