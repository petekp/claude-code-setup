# Migration Charter

## Mission
Migrate from legacy cookie-based auth (`readLegacySession`) to token-based auth (`verifyAccessToken`) so the codebase has a single, clean auth path and is ready to ship without legacy residue.

## Scope
- `src/auth/` — auth modules (legacy-auth.ts to be deleted, token-auth.ts to be retained)
- `src/routes/users.ts` — route handler that resolves current user
- `tests/` — test suite covering auth behavior
- `docs/auth.md` — auth documentation
- `scripts/seed-legacy-auth.sh` — legacy seed script
- `.env.example` — environment variable template
- `package.json` — project metadata (name references "legacy")

## Critical Workflows
1. **User authentication** — `getCurrentUser` must resolve an authenticated user from request headers via bearer token. Unauthenticated requests must throw `"unauthorized"`.
2. **Admin identification** — if scopes-based admin detection is needed, it must be expressed through token claims, not cookie parsing. (Out of scope for initial migration — see Non-Goals.)

## Invariants
- All existing tests continue to pass (tests will be updated to reflect token-only behavior before legacy code is removed)
- No user-facing behavior changes: authenticated requests still resolve a user; unauthenticated requests still throw
- Guard script passes at every slice boundary

## Non-Goals
- Implementing real JWT verification (the stub in `token-auth.ts` is sufficient for this migration)
- Adding admin/role support to token claims (separate follow-up)
- Renaming the package from `legacy-auth-service` (separate follow-up, tracked in DECISIONS.md)

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
- `npx vitest run` — all tests pass
- `npx eslint src tests` — no lint errors
- `npx tsc -p tsconfig.json` — no type errors

### Manual Checks
- Review final diff for accidental churn, backup files, or commented-out code

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain unless explicitly waived
- `legacy` does not appear in `src/` or `tests/` directories
- `seed-legacy-auth.sh` is deleted
- `docs/auth.md` describes token auth, not cookie auth
- `.env.example` contains only token-relevant variables
