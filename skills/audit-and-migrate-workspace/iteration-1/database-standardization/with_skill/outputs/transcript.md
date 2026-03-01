# Transcript: Database Standardization Migration Planning

**Date:** 2026-03-01
**Scenario:** Django app with mixed database access (raw SQL, Django ORM, SQLAlchemy) — standardize on Django ORM
**Methodology:** audit-and-migrate skill (slice-based, evidence-driven)

---

## Step 1: Read and internalize the methodology

Read SKILL.md and all reference templates (CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, guard-script-pattern.md). The methodology has two phases:

- **Phase 1 (Audit):** Understand the problem, measure it, freeze the metrics with CI ratchets
- **Phase 2 (Migration):** Pay down debt slice by slice, deleting old code in the same slice, proving correctness with deterministic checks

Key principles I need to follow:
1. Every anti-pattern gets a concrete count (not vibes)
2. CI ratchets enforce that counts can only decrease
3. Slices are vertical and outcome-based
4. Old code is deleted in the same slice it's replaced (anti-vestigial discipline)
5. Every file touched appears in MAP.csv
6. Architecture decisions are append-only in DECISIONS.md

## Step 2: Analyze the problem space

The user described:
- **Raw SQL in some views** — this is the bulk of the problem
- **Django ORM in most models** — this is the target pattern (already exists)
- **SQLAlchemy in 3 endpoints** (Flask-ported) — small surface, architecturally significant
- **~150 queries across 35 files** — sizeable but manageable

My first structural insight: this is really two migrations happening in parallel:
1. Raw SQL -> Django ORM (large, graduated by query complexity)
2. SQLAlchemy -> Django ORM (small, requires model unification first)

The user specifically called out that "some raw SQL does things the ORM can't easily express." This needs a clear policy (became Decision 2) — a tiered approach where pure ORM is preferred, but `.raw()` and `RawSQL` are acceptable Django ORM constructs for genuinely inexpressible queries, as long as each instance is documented.

## Step 3: Create the Charter

Defined the mission, scope, invariants, non-goals, and guardrails. Key decisions in the charter:

- **Mission** is standardization, not optimization. We match existing behavior.
- **Invariants** include a 10% performance regression limit — this prevents "the ORM query works but takes 5x longer" from being considered acceptable.
- **Non-goals** explicitly exclude schema changes, API redesign, and database engine migration. Without these boundaries, scope creep is guaranteed.
- **Guardrails** include the requirement that every `.raw()` or `RawSQL` usage needs a DECISIONS.md entry — this prevents the "just use raw SQL" escape hatch from being abused.

## Step 4: Seed architecture decisions

Four initial decisions:

1. **Django ORM as the single access layer** — the fundamental choice. Considered and rejected: keeping SQLAlchemy alongside, standardizing on SQLAlchemy, standardizing on raw SQL.

2. **Tiered handling of ORM-inexpressible queries** — the pragmatic policy for the "things the ORM can't easily express" concern. Three tiers: pure ORM queryset, ORM escape hatches (.raw(), RawSQL), and encapsulated cursor.execute() in model managers.

3. **SQLAlchemy model mapping strategy** — don't create parallel Django models; extend existing ones. For tables with no Django model, create one and `--fake` the migration.

4. **Migration ordering** — raw SQL first, SQLAlchemy second. The larger surface area gets migrated first, building confidence and stabilizing the model layer before the SQLAlchemy endpoints need to integrate.

## Step 5: Design the slice plan

This was the core design work. I needed to decompose ~150 queries across 35 files into slices that are:
- Vertical (complete capability, not horizontal sweep)
- Independently verifiable (each has tests and replay scenarios)
- Ordered by leverage (highest-volume, lowest-risk first)
- Bounded in blast radius (small enough to review and revert)

The decomposition I arrived at:

**Phase 0 (Foundation):** Three slices for tooling — audit, CI ratchets, test harness. Zero production code changes. This is essential: you can't safely migrate without measurement and verification infrastructure.

**Phase 1 (Simple CRUD):** Three slices covering ~90 queries. Broken up by operation type (SELECT, write operations, utility queries) and grouped by related view files. These are the highest-volume, lowest-risk queries — straightforward `Model.objects.filter()` replacements. Starting here rapidly drops the ratchet counts and builds team confidence.

**Phase 2 (Multi-table):** Two slices covering ~35 queries. JOINs and subqueries are medium complexity — the ORM handles them but requires understanding of `select_related()`, `prefetch_related()`, `Subquery`, and `OuterRef`. The main risk here is N+1 query regression.

**Phase 3 (Complex):** Four slices covering ~22 queries. This is where the "things the ORM can't easily express" live. Broken into: aggregations (GROUP BY — well-supported by ORM), window functions (supported since Django 2.0 but edge cases exist), recursive CTEs (no native ORM support — will use `.raw()` in managers), and upserts (Django 4.1+ has good support).

**Phase 4 (SQLAlchemy):** Four slices. First maps SA models to Django models, then three independent endpoint migrations. These are independent after the mapping slice, so they can be parallelized.

**Phase 5 (Cleanup):** Two slices. Remove the SQLAlchemy dependency and models, clean up raw SQL helper functions, finalize ratchets to zero or permanent denylists.

Total: 16 slices across 5 phases.

## Step 6: Build the MAP.csv

Listed every file that each slice touches. This is the source of truth for "what files are in scope for this migration." When S-001 runs against the actual codebase, the file paths will be updated to reflect reality — the current paths are realistic projections based on typical Django project structure.

## Step 7: Create the guard script

The guard script implements 8 ratchets covering:
- `cursor.execute()` usage (files)
- `connection.cursor()` usage (files)
- `.extra()` calls (deprecated API)
- `.raw()` calls (track but some are acceptable post-migration)
- `RawSQL` expressions
- SQLAlchemy imports
- `session.query()` calls
- `session.execute()` calls

Plus commented-out denylist and deletion target checks that get activated as slices complete.

The `--status` flag is a nice affordance — it shows current counts without failing, useful for tracking progress between slices.

## Step 8: Write the audit document

The audit document captures:
- **Method** — how the audit was conducted, with exact grep patterns for the real codebase
- **Current metrics** — estimated counts for all anti-patterns
- **Leverage assessment** — what's high/medium/low value in the current codebase
- **Hard conclusions** — seven direct statements about the migration (e.g., "60% is straightforward," ".extra() is a ticking time bomb," "the model layer is in decent shape")
- **Guardrails added** — summary of the CI infrastructure
- **Proposed slices** — summary table with estimated query counts
- **Risk register** — seven risks with likelihood, impact, and mitigation

## Design decisions I made along the way

1. **Slices grouped by complexity tier, not by file.** The alternative was one slice per file. I rejected this because: (a) a single file may contain queries of varying complexity that belong in different phases, and (b) grouping by complexity means earlier slices establish patterns that later slices reuse.

2. **Phase 1 slices are parallelizable.** S-010, S-011, and S-012 touch non-overlapping files. If the team wants to use multiple agents, these can run simultaneously. I deliberately designed the file groupings to enable this.

3. **SQLAlchemy gets its own phase rather than being interleaved.** It's a fundamentally different migration (model unification + query rewrite) compared to raw SQL (query rewrite only). Keeping it separate reduces cognitive overhead.

4. **CTEs get encapsulated, not eliminated.** Decision 2's tiered approach means recursive CTEs move from view-level raw SQL to manager-level `.raw()` calls. This is a meaningful improvement (encapsulation, testability, reusability) even though it's not "pure" ORM. Pragmatism over purity.

5. **The query equivalence test harness is its own slice.** It would be tempting to fold this into S-001 or S-010, but it's a distinct capability that all subsequent slices depend on. Making it explicit ensures it gets built properly before any migration work starts.

## What the actual S-001 audit session should produce

When this plan meets the real codebase, S-001 should:

1. Run all the grep patterns from the audit document against the actual code
2. Replace estimated counts with real counts
3. Update ratchet budgets in migration_guard.sh to match real counts
4. Update MAP.csv with actual file paths (the current paths are projections)
5. Classify each raw SQL query by complexity tier
6. Identify any queries using string formatting for SQL (f-strings, %s) — these are SQL injection risks and should be prioritized
7. Check for raw SQL in unexpected locations: management commands, migrations, template tags, middleware, signals, celery tasks
8. Verify the Django version supports all needed ORM features (Window functions require 2.0+, update_conflicts requires 4.1+)

## Artifacts produced

| Artifact | File | Purpose |
|---|---|---|
| Charter | CHARTER.md | Mission, invariants, non-goals, guardrails |
| Decisions | DECISIONS.md | 4 initial architecture decisions |
| Slices | SLICES.yaml | 16 slices across 5 phases |
| Map | MAP.csv | ~65 file entries across all slices |
| Guard Script | migration_guard.sh | 8 ratchets, denylist/deletion scaffolding |
| Audit Document | audit.md | Full audit with metrics, conclusions, risks |
| Transcript | transcript.md | This file |
