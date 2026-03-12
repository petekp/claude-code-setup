# Migration Charter

## Mission
Migrate from legacy cookie-based authentication to token-based (Bearer) authentication, removing all legacy auth code, configuration, documentation, and scripts so the codebase ships clean with only the token auth path.

## Scope
The entire `legacy-auth-service` repository:
- `src/auth/` — auth modules (legacy-auth.ts to be removed, token-auth.ts to be retained and expanded)
- `src/routes/` — route handlers consuming auth
- `tests/` — test coverage for auth behavior
- `docs/` — developer documentation describing auth
- `scripts/` — local dev tooling for auth seeding
- `.env.example` — environment variable contracts
- `package.json` — project scripts and dependencies

## Critical Workflows
1. **Authenticated API request** — a request with a valid Bearer token returns the correct user identity (`sub` from claims).
2. **Unauthenticated rejection** — a request with no valid auth credentials throws an unauthorized error.
3. **Build and test pipeline** — `npm test`, `npm run lint`, and `npm run build` all pass.

## External Surfaces
- **Environment variables** — `.env.example` defines `LEGACY_AUTH_SECRET`, `LEGACY_COOKIE_NAME`, and `TOKEN_AUDIENCE`. Legacy vars must be removed; `TOKEN_AUDIENCE` retained.
- **Cookie contract** — any external client sending `legacy_session` cookies will stop being authenticated. This is the intended migration outcome.
- **Bearer token contract** — clients sending `Authorization: Bearer <token>` headers will be the sole auth path.
- **npm scripts** — `test`, `lint`, `build` are the CI surface.
- **Local dev script** — `scripts/seed-legacy-auth.sh` is used for local testing bootstrapping; must be removed or replaced with a token-compatible equivalent.
- **Developer docs** — `docs/auth.md` describes the legacy cookie flow to developers and must be rewritten for token auth.

## Invariants
- All existing tests continue to pass (tests will be updated to reflect new behavior before legacy code is removed)
- No user-facing behavior changes beyond the intentional auth switch (legacy cookie path is deliberately removed)
- Token auth path behavior is identical to its current implementation
- Build, lint, and test scripts remain functional

## Non-Goals
- Implementing real JWT signature verification (the fixture uses stub verification; that's out of scope)
- Adding new auth features (scopes enforcement, refresh tokens, etc.)
- Changing the route handler API surface beyond auth source changes
- Adding new dependencies or frameworks

## Guardrails
- Delete replaced code in the same slice — no deferred cleanup
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Every slice defines exact automated verification commands before implementation
- Reserve a final convergence slice for residue sweep and ship verification

## Ship Gate

### Automated Checks
- `./guard.sh` passes with zero violations
- `npm test` passes
- `npm run lint` passes
- `npm run build` passes

### Manual Checks
- Verify no commented-out code remains
- Verify no empty directories exist after deletions

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain
- Empty directories created by the migration are removed
- `scripts/` directory removed if empty after seed script deletion
