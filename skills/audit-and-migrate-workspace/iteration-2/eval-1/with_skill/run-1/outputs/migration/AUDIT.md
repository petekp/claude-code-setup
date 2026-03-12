# Analytics Migration Audit

## Method
Resumed an in-flight migration. Inspected all existing control plane artifacts (CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, HANDOFF.md) and all source files in the migration scope. Cross-referenced claimed status against actual codebase state.

## Current Metrics

| Pattern | Scope | Count | Problem |
|---|---|---|---|
| `trackLegacy` | `packages/` | 2 | Legacy analytics functions still present |
| `LEGACY_ANALYTICS_WRITE_KEY` | `packages/ docs/` | 2 | Legacy env var in env.ts and docs |
| `ENABLE_LEGACY_ANALYTICS_BRIDGE` | `packages/ docs/` | 2 | Rollback bridge flag still active |
| `legacy-analytics` | `packages/ docs/` | 2 | References to legacy module |

## Leverage Assessment

| File | Leverage | Action |
|---|---|---|
| `packages/web/src/lib/analytics-client.ts` | **High** | Extend with `trackSignup` |
| `packages/web/src/lib/legacy-analytics.ts` | **Low** | Delete entirely |
| `packages/shared/src/env.ts` | **Medium** | Prune legacy vars, keep `ANALYTICS_WRITE_KEY` |
| `docs/analytics-migration.md` | **Low** | Rewrite or delete — currently describes stale state |

## Critical Workflows
1. **Page view tracking** — new client handles this (slice-001 done, functionally correct)
2. **Signup conversion tracking** — still on legacy path (slice-002 in progress)

## Known Hotspots
- Slice-001 was marked done but `trackLegacyPageView` was not deleted (methodology violation)
- The HANDOFF explicitly deferred env/docs cleanup — this is now captured in slice-003
- `docs/analytics-migration.md` describes the migration as incomplete and references legacy env vars

## Hard Conclusions
1. **The migration direction is sound.** The new analytics client is the right target.
2. **Execution has gaps.** Slice-001's deletion was incomplete. Env/docs cleanup was deferred without a tracking slice.
3. **Three slices remain:** finish signup migration + delete legacy file (slice-002), clean env/docs (slice-003), convergence sweep (slice-004).
4. **No guard script exists.** Ratchets were never implemented. The hardened SLICES.yaml now defines verification_commands and residue_queries to compensate.

## Guardrails Added
- Hardened CHARTER.md with explicit ship gate criteria
- Added SHIP_CHECKLIST.md with exact commands
- Added verification_commands and residue_queries to all slices
- Added denylist_patterns for legacy symbols
- Reserved convergence slice (slice-004)

## Ratchet Budgets

| Pattern | Scope | Budget | Current |
|---|---|---|---|
| `trackLegacy` | `packages/` | 2 | 2 |
| `LEGACY_ANALYTICS_WRITE_KEY` | `packages/ docs/` | 2 | 2 |
| `ENABLE_LEGACY_ANALYTICS_BRIDGE` | `packages/ docs/` | 2 | 2 |
| `legacy-analytics` | `packages/ docs/` | 2 | 2 |

All budgets set to current counts. They must reach 0 by convergence.

## Proposed Slices
- **slice-002** (in_progress): Signup migration + legacy file deletion
- **slice-003** (proposed): Env bridge removal + docs cleanup
- **slice-004** (proposed): Convergence — residue sweep + ship gate execution
