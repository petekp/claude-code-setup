# Migration Charter

## Mission
Migrate the web app from legacy analytics events (`legacy-analytics.ts`) to the shared analytics client (`analytics-client.ts`), then delete all legacy code, env bridges, and stale docs so the repo ships clean.

## Scope
- `packages/web/src/lib/` (analytics client and legacy analytics)
- `packages/shared/src/` (env config with legacy keys and bridge flag)
- `docs/` (analytics migration docs)
- Root config and env references to legacy analytics keys

## Critical Workflows
- **Page view tracking** — every page load must emit an analytics event via the new client
- **Signup conversion tracking** — signup form submission must emit the conversion event via the new client

## External Surfaces
- **Dashboards** — downstream analytics dashboards reference legacy event names (`legacy page view`, `legacy signup`). Dashboard owners must confirm parity with new event names (`page view`) or remap before legacy events stop.
- **Env vars consumed at deploy** — `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` are set in deployment config. They must be removed from deploy pipelines after the bridge is torn down.
- **Env var retained** — `ANALYTICS_WRITE_KEY` is the new key and must remain.
- **Analytics event consumers** — any downstream ETL, warehouse, or partner integration that keys on the string `"legacy signup"` or `"legacy page view"` will lose data when legacy events stop firing. Confirm consumer readiness before deleting legacy code.

## Invariants
- All existing tests continue to pass
- No user-facing behavior changes unless explicitly noted in a slice
- Page view and signup events continue to fire throughout the migration (dual-write is acceptable as a transitional state but must not persist past closeout)

## Non-Goals
- No redesign of analytics taxonomy or event schema
- No new analytics events beyond what already exists
- No changes to the analytics-client internal implementation beyond adding `trackSignup`

## Guardrails
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Every slice defines exact automated verification commands before implementation
- Reserve a final convergence slice for residue sweep and ship verification

## Ship Gate
### Automated Checks
- `./guard.sh` passes (all ratchets at zero, no denylist violations, no residue)
- `grep -r "trackLegacy" packages/` returns zero matches
- `grep -r "LEGACY_ANALYTICS_WRITE_KEY" packages/ docs/` returns zero matches
- `grep -r "ENABLE_LEGACY_ANALYTICS_BRIDGE" packages/ docs/` returns zero matches
- `grep -r "legacy-analytics" packages/ docs/` returns zero matches

### Manual Checks
- Verify downstream dashboards are receiving events under new names (requires dashboard access)
- Confirm deploy pipelines no longer set `LEGACY_ANALYTICS_WRITE_KEY` or `ENABLE_LEGACY_ANALYTICS_BRIDGE`

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain unless explicitly waived
- Empty directories created by the migration are removed unless intentionally retained
