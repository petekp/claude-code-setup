# Migration Charter

## Mission
Migrate `legacy-auth-service` from cookie-based legacy session auth to bearer-token auth so the service ships with one canonical authentication path, runnable verification commands, and no legacy residue in code, tests, docs, scripts, or env/config.

## Scope
- `src/routes/users.ts`
- `src/auth/token-auth.ts`
- `src/auth/legacy-auth.ts`
- `tests/users-auth.test.ts`
- `docs/auth.md`
- `.env.example`
- `scripts/seed-legacy-auth.sh`
- Root verification/tooling needed to make `npm test`, `npm run lint`, and `npm run build` pass: `package.json`, `tsconfig.json`, `eslint.config.js`, `guard.sh`, and the lockfile if dependencies change

## Critical Workflows
- Requests with a valid bearer token resolve the current user deterministically from token claims.
- Requests without a valid bearer token fail closed with `unauthorized`.
- Existing admin-capable behavior currently inferred from `admin=true` is represented explicitly in token claims or scopes before legacy parsing is removed.
- Local development and QA instructions use token auth only; no cookie bootstrap step remains.
- Client surfaces called out in docs as not yet sending bearer tokens are either migrated or explicitly block release.

## Invariants
- All release-gate commands for the repo are runnable before the migration is marked complete.
- The only intended behavior change is removal of `legacy_session` acceptance at ship time; all remaining auth semantics must be preserved or explicitly redefined in `DECISIONS.md`.
- No route may silently prefer legacy auth over token auth once the token-only slices are complete.
- Docs, env examples, scripts, and tests must describe the same auth contract as the code.
- Every removed legacy symbol or path gets a denylist pattern or residue query.

## Non-Goals
- No long-lived dual-stack auth adapter at ship time.
- No expansion into unrelated route or business logic changes.
- No redesign of authorization beyond mapping existing legacy role semantics into explicit token claims or scopes.
- No fixture-wide cleanup outside the auth domain except the minimum tooling required to make the release gate executable.

## Guardrails
- Delete replaced code in the same slice; no deferred cleanup PRs.
- Record every auth architecture decision in `DECISIONS.md`.
- List every touched file, including docs/config/scripts, in `MAP.csv`.
- CI ratchet budgets can only decrease, never increase.
- No temporary auth adapters without an owning slice, expiry condition, and deletion target.
- Every slice defines exact automated verification commands before implementation.
- Reserve the final convergence slice for whole-repo residue sweep and ship verification.

## Ship Gate
### Automated Checks
- `./guard.sh --status`
- `./guard.sh`
- `npm run lint`
- `npm run build`
- `npm test`

### Manual Checks
- Confirm mobile and other external clients now send bearer tokens before removing cookie fallback.
- Confirm admin-capable caller behavior is preserved through explicit token claims or scopes, not hidden cookie parsing.

### Cleanliness Checks
- No `src/auth/legacy-auth.ts` file remains.
- No `scripts/seed-legacy-auth.sh` file remains.
- No `legacy_session`, `readLegacySession`, `LEGACY_AUTH_SECRET`, `LEGACY_COOKIE_NAME`, or `source: "legacy"` residue remains in code, tests, docs, or config.
- No temporary migration scripts, adapters, or flags remain in scope.
- No stale docs, config, env examples, or CI references remain for removed architecture.
- No migration-only TODO, FIXME, or HACK markers remain unless explicitly waived in `DECISIONS.md`.
