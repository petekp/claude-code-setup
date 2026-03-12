# Migration Charter

## Mission
Migrate from legacy cookie-based authentication (`readLegacySession`) to token-based authentication (`verifyAccessToken`) as the sole auth path, eliminating all legacy auth code, config, docs, and scripts so the codebase ships clean.

## Scope
- `src/auth/legacy-auth.ts` — legacy session reader (delete)
- `src/auth/token-auth.ts` — token verifier (keep, canonical)
- `src/routes/users.ts` — dual-path auth consumer (migrate to token-only)
- `tests/users-auth.test.ts` — test asserting legacy preference (rewrite)
- `docs/auth.md` — stale documentation describing legacy flow (rewrite)
- `scripts/seed-legacy-auth.sh` — legacy seeding script (delete)
- `.env.example` — contains legacy env vars (clean up)
- `package.json` — no expected changes unless deps are legacy-only

## Invariants
- All existing tests continue to pass (after intentional test updates in their owning slice)
- No user-facing behavior changes except: token auth becomes the only auth path
- `verifyAccessToken` behavior is unchanged
- Build and lint remain green throughout

## Non-Goals
- Adding new auth features (refresh tokens, OAuth flows, MFA)
- Changing the token format or claims structure
- Introducing an auth middleware abstraction layer
- Migrating to a different test framework

## Guardrails
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
