# Analytics Migration Audit

## Method
Inspected all files in the `resume-analytics-monorepo` fixture repo. Read existing migration artifacts in `.claude/migration/` and `HANDOFF.md` from the prior session. Cataloged every file, grepped for anti-patterns, and assessed the state of the in-flight migration.

## Current State (resuming, not restarting)
The migration was started on 2026-02-27. One slice is complete (page views), one is in progress (signup tracking). The direction is sound — `analytics-client.ts` is the correct target. However, the control plane was incomplete: no ratchets, no ship checklist, no external surface tracking, no convergence slice, and several SLICES.yaml fields were missing.

## Inventory

### High Leverage (keep and expand)
| File | Role |
|---|---|
| `packages/web/src/lib/analytics-client.ts` | New analytics client. Currently only has `trackPageView`. Needs `trackSignup`. |

### Medium Leverage (keep but modify)
| File | Role |
|---|---|
| `packages/shared/src/env.ts` | Env config. Contains both new and legacy keys. Legacy keys must be removed. |
| `docs/analytics-migration.md` | Migration docs. Currently describes the in-flight state. Must be rewritten to describe the completed state. |
| `package.json` | Monorepo root. No changes expected. |

### Low Leverage (replace/delete)
| File | Role |
|---|---|
| `packages/web/src/lib/legacy-analytics.ts` | Legacy analytics wrapper. Both exports (`trackLegacyPageView`, `trackLegacySignup`) must be deleted. |

## Anti-Pattern Metrics

| Pattern | Scope | Count | Problem |
|---|---|---|---|
| `trackLegacy` | `packages/` | 2 | Legacy tracking functions still exported |
| `legacy-analytics` | `packages/ docs/` | 2 | References to the legacy module (file itself + docs) |
| `LEGACY_ANALYTICS_WRITE_KEY` | `packages/ docs/` | 1 | Dead env var for removed analytics provider |
| `ENABLE_LEGACY_ANALYTICS_BRIDGE` | `packages/ docs/` | 1 | Rollback bridge flag no longer needed |

## Critical Workflows
1. **Page view tracking** — migrated (slice-001 done). New client emits `page view` events.
2. **Signup conversion tracking** — not yet migrated (slice-002 in progress). Legacy code still emits `legacy signup`.

## Known Hotspots
- `legacy-analytics.ts` — the primary debt target. Both functions are dead or soon-to-be-dead code.
- `env.ts` — contains three env var references, two of which are legacy. The bridge flag is a rollback mechanism that is no longer justified given page views have been on the new client since 2026-02-28.
- `docs/analytics-migration.md` — documents the in-flight state with known rough edges. Will become stale/misleading once migration completes.

## External Surfaces
- **Dashboards** — downstream analytics dashboards may key on legacy event names. Dashboard parity must be verified manually before legacy events stop firing.
- **ETL / warehouse consumers** — any pipeline consuming `"legacy signup"` or `"legacy page view"` events will break.
- **Deploy pipelines** — `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` are presumably set in deployment config. Must be removed.
- **`ANALYTICS_WRITE_KEY`** — the new key. Must remain.

## Hard Conclusions
1. The migration direction is correct. No reason to restart.
2. The control plane was missing critical artifacts (ratchets, ship checklist, convergence slice). These have been created in this session.
3. slice-001 was marked done but left legacy code alive (both `trackLegacyPageView` and `trackLegacySignup` still exist). This is acceptable because deletion was correctly assigned to slice-002.
4. slice-002's handoff noted "dashboard parity not verified" as a risk — this is a real blocker for shipping. The dashboard check is now in the ship checklist.
5. The env bridge and legacy key cleanup were "deferred" per the handoff. They now have an explicit owning slice (slice-003).
6. A convergence slice (slice-004) has been reserved to prevent the common failure of declaring victory before the residue sweep.

## Guardrails Added
- `RATCHETS.yaml` created with 4 ratchets covering all legacy patterns
- `SHIP_CHECKLIST.md` created with exact commands and manual verification steps
- Guard script pattern established for CI enforcement
- Convergence slice reserved

## Proposed Slices
1. **slice-001** (done) — page view migration
2. **slice-002** (in progress) — signup tracking migration + legacy file deletion
3. **slice-003** (proposed) — env cleanup + docs reconciliation
4. **slice-004** (proposed, convergence) — residue sweep + ship gate execution
