# Migration Charter

## Mission
Migrate the web package from `legacy-analytics.ts` to the shared `analytics-client.ts`, then remove all legacy analytics code, env bridges, and stale documentation so the codebase ships clean.

## Scope
- `packages/web/src/lib/legacy-analytics.ts` (delete)
- `packages/web/src/lib/analytics-client.ts` (canonical client)
- `packages/shared/src/env.ts` (remove legacy keys and bridge flag)
- `docs/analytics-migration.md` (update or remove)
- Any README references to `LEGACY_ANALYTICS_WRITE_KEY`

## Invariants
- Page-view tracking continues to function via the new analytics client
- Signup conversion tracking continues to function after migration
- All existing tests continue to pass
- No user-facing behavior changes unless explicitly noted in a slice

## Non-Goals
- Redesigning the analytics event taxonomy
- Adding new analytics events beyond what already exists
- Migrating non-web packages

## Guardrails
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
