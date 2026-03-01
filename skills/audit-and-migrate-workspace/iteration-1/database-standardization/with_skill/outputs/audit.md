# Database Access Audit

**Date:** 2026-03-01
**Auditor:** Claude (audit-and-migrate methodology)
**Scope:** All database access patterns across the Django application

---

## Method

This audit was conducted based on the described codebase characteristics rather than direct code access. The methodology:

1. Cataloged the three known database access patterns: raw SQL, Django ORM, SQLAlchemy
2. Classified queries by complexity tier based on the described distribution
3. Estimated anti-pattern counts for ratchet budgets
4. Identified ORM migration strategies for each query category
5. Assessed which queries the ORM cannot natively express

**When S-001 executes against the actual codebase**, the following grep patterns should be used to produce exact counts:

```bash
# Raw SQL patterns
grep -rnE 'cursor\.execute\s*\(' --include="*.py" -l | wc -l
grep -rnE 'connection\.cursor\s*\(' --include="*.py" -l | wc -l
grep -rnE '\.extra\s*\(' --include="*.py" -l | wc -l
grep -rnE '\.raw\s*\(' --include="*.py" -l | wc -l
grep -rnE 'RawSQL\s*\(' --include="*.py" -l | wc -l

# SQLAlchemy patterns
grep -rnE 'from\s+sqlalchemy|import\s+sqlalchemy' --include="*.py" -l | wc -l
grep -rnE 'session\.query\s*\(' --include="*.py" -l | wc -l
grep -rnE 'session\.execute\s*\(' --include="*.py" -l | wc -l

# Additional patterns to check
grep -rnE 'engine\.execute\s*\(' --include="*.py" -l | wc -l
grep -rnE 'text\s*\(' --include="*.py" | grep sqlalchemy | wc -l
grep -rnE '%s.*SELECT|%s.*INSERT|%s.*UPDATE|%s.*DELETE' --include="*.py" -l | wc -l  # string-formatted SQL (high risk)
grep -rnE "f['\"].*SELECT|f['\"].*INSERT|f['\"].*UPDATE|f['\"].*DELETE" --include="*.py" -l | wc -l  # f-string SQL (critical risk)
```

---

## Current Metrics (Estimated)

Based on "~150 queries across 35 files":

| Anti-Pattern | Estimated File Count | Estimated Query Count | Grep Pattern |
|---|---|---|---|
| `cursor.execute()` calls | ~32 | ~120 | `cursor\.execute\s*\(` |
| `connection.cursor()` usage | ~28 | ~90 | `connection\.cursor\s*\(` |
| `.extra()` deprecated calls | ~5 | ~8 | `\.extra\s*\(` |
| `.raw()` calls | ~3 | ~4 | `\.raw\s*\(` |
| `RawSQL` expressions | ~2 | ~3 | `RawSQL\s*\(` |
| SQLAlchemy imports | ~3 | ~3 | `from\s+sqlalchemy\|import\s+sqlalchemy` |
| `session.query()` calls | ~3 | ~3 | `session\.query\s*\(` |
| `session.execute()` calls | ~3 | ~3 | `session\.execute\s*\(` |

### Query Complexity Distribution (Estimated)

| Category | Count | % of Total | ORM Migration Difficulty |
|---|---|---|---|
| Simple CRUD (single-table SELECT/INSERT/UPDATE/DELETE) | ~90 | 60% | Low — direct ORM equivalents |
| Multi-table (JOINs, subqueries) | ~35 | 23% | Medium — select_related, Subquery, OuterRef |
| Complex (CTEs, window functions, aggregations, DB-specific) | ~22 | 15% | High — may need .raw() or custom expressions |
| SQLAlchemy | ~3 | 2% | Medium — model mapping required first |

---

## Leverage Assessment

### High Leverage (keep and expand)

- **Django models and their existing ORM usage** — this is the target pattern. All migration work builds on these.
- **Existing test suite** — provides the safety net. Must remain passing throughout.
- **Django migrations system** — properly tracked schema changes. Once SQLAlchemy is removed, this is the single source of truth.
- **Model managers** — the right place for complex query logic. Expand these to encapsulate any remaining raw SQL.

### Medium Leverage (keep but refactor)

- **Views containing raw SQL** — the views themselves stay, but their database access layer gets rewritten.
- **utils/db.py or similar helpers** — may contain reusable query patterns that should become manager methods.
- **Test fixtures and factories** — may need updating to work with ORM-based code.

### Low Leverage (replace)

- **All `cursor.execute()` calls in views** — scattered raw SQL is the primary debt. Replace with ORM.
- **All `.extra()` calls** — `.extra()` is deprecated in Django. Must be replaced.
- **SQLAlchemy models** — duplicate model definitions. Replace with Django model usage.
- **SQLAlchemy session configuration** — parallel connection management. Remove entirely.
- **SQLAlchemy dependency** — remove from requirements once migration complete.
- **Raw SQL helper functions** — utility functions that construct SQL strings. Replace with ORM patterns.

---

## Hard Conclusions

1. **60% of the migration is straightforward.** Simple CRUD raw SQL has direct ORM equivalents. This is volume work, not complexity work. It's the right place to start: high impact, low risk.

2. **The dangerous queries are the ~15% complex ones.** Recursive CTEs, window functions with custom frames, and upserts are the queries that might not have clean ORM translations. These need individual assessment during S-032/S-033 — some will use `.raw()` or `RawSQL`, and that's acceptable if documented.

3. **`.extra()` is a ticking time bomb.** It's been deprecated since Django 3.0 and could be removed in any future version. Migrating these is mandatory regardless of the broader standardization effort.

4. **The SQLAlchemy surface is small but architecturally significant.** 3 endpoints is minor in query count, but maintaining two ORMs means two connection pools, two transaction managers, and two sets of models. The overhead is disproportionate to the usage.

5. **String-formatted SQL is the highest-priority sub-category.** Any raw SQL using `%s` string formatting or f-strings (rather than parameterized queries) is a SQL injection vector. These should be identified and prioritized within S-010/S-011/S-012 even if they're otherwise simple queries.

6. **Performance regression is a real risk for JOIN migrations.** The ORM may generate N+1 queries where raw SQL had explicit JOINs. Every JOIN migration in S-020 needs `EXPLAIN ANALYZE` comparison. Use `select_related()` and `prefetch_related()` aggressively.

7. **The model layer is in decent shape.** Django ORM is already used "in most models," meaning the model definitions exist. This is a significant advantage — we're not building models from scratch, we're making views use the models that already exist.

---

## Guardrails Added

1. **CI ratchets** — see `migration_guard.sh`. Eight ratchets covering all raw SQL and SQLAlchemy patterns. Budgets set to current counts. Can only decrease.

2. **Denylist patterns** — added as slices complete. Prevents reintroduction of eliminated patterns.

3. **Deletion target tracking** — every slice pre-declares what it will delete. Guard script verifies deletion.

4. **Unmapped file detection** — guard script checks that every file with database access patterns appears in MAP.csv.

5. **Query equivalence test harness** (S-003) — reusable test helper that runs old and new queries side-by-side and compares result sets.

---

## Proposed Slices (Summary)

| Phase | Slices | Description | Estimated Queries |
|---|---|---|---|
| 0: Foundation | S-001, S-002, S-003 | Audit, ratchets, test harness | 0 (tooling only) |
| 1: Simple CRUD | S-010, S-011, S-012 | Single-table raw SQL to ORM | ~90 |
| 2: Multi-table | S-020, S-021 | JOINs and subqueries to ORM | ~35 |
| 3: Complex | S-030, S-031, S-032, S-033 | Aggregations, windows, CTEs, upserts | ~22 |
| 4: SQLAlchemy | S-040, S-041, S-042, S-043 | SA model mapping and endpoint migration | ~3 |
| 5: Cleanup | S-050, S-051 | Dependency removal, ratchet finalization | 0 (cleanup only) |

**Total: 16 slices, estimated 4-6 sessions to complete.**

Phase 1 slices (S-010, S-011, S-012) are independent and can be parallelized across agents if desired — they touch non-overlapping view files. Phase 4 slices (S-041, S-042, S-043) are also independent after S-040 completes.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| N+1 query regression from JOIN migration | High | Medium | EXPLAIN ANALYZE before/after for every S-020 query |
| Recursive CTE has no clean ORM equivalent | High | Low | Encapsulate in manager method with .raw() — acceptable per Decision 2 |
| SQLAlchemy model has no Django model counterpart | Medium | Medium | S-040 audit step identifies this; create Django model with --fake migration |
| String-formatted SQL (injection risk) exists | Medium | High | Prioritize these in S-010/S-011 — parameterize immediately |
| Transaction boundary mismatch after ORM migration | Medium | High | Audit BEGIN/COMMIT in raw SQL; replace with atomic() blocks |
| Performance regression on aggregation queries | Medium | Medium | Benchmark before/after; accept .raw() if ORM is >10% slower |
| Django version lacks needed ORM features | Low | High | Check Django version before starting; upgrade if needed (scope change) |
