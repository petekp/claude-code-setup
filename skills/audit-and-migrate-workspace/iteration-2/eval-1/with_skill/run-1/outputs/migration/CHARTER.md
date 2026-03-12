# Migration Charter

## Mission
Migrate the web app from `legacy-analytics.ts` to the shared `analytics-client.ts`, then remove all legacy analytics code, env wiring, and docs so the repo ships clean.

## Scope
- `packages/web/src/lib/legacy-analytics.ts` (delete)
- `packages/web/src/lib/analytics-client.ts` (extend)
- `packages/shared/src/env.ts` (prune legacy vars)
- `docs/analytics-migration.md` (update or delete)
- `package.json` / lockfiles (verify no orphaned deps)

## Critical Workflows
- **Page view tracking** — every page load emits a `page view` event via the new client
- **Signup conversion tracking** — signup flow emits a `signup` event via the new client

## Invariants
- All existing tests continue to pass
- No user-facing behavior changes — event semantics are preserved
- No legacy analytics code survives past the final convergence slice
- CI ratchet budgets can only decrease

## Non-Goals
- No redesign of analytics taxonomy or event naming
- No new analytics events beyond parity with legacy
- No dashboard migration (external system, out of scope)

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
- `./guard.sh` passes with zero violations
- `rg 'trackLegacy' packages/` returns zero matches
- `rg 'LEGACY_ANALYTICS' packages/ docs/` returns zero matches
- `rg 'ENABLE_LEGACY_ANALYTICS_BRIDGE' packages/ docs/` returns zero matches

### Manual Checks
- Verify downstream dashboards have been notified of event name changes (if any)

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain
- `legacy-analytics.ts` is physically deleted
- `docs/analytics-migration.md` either deleted or rewritten to describe the new architecture only
