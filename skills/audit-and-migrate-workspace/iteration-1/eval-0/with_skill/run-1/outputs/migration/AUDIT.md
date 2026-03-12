# Audit: Legacy Auth to Token Auth Migration Control Plane

## Executive Summary

This fixture is small, but it already exhibits the exact failure mode the `audit-and-migrate` skill is designed to prevent: a new auth path exists, yet the repo still operationally centers the legacy one. The code, test suite, docs, local script, and env example are all still biased toward cookie auth, while the token path is present but under-specified.

Hard conclusions:
- The runtime still prefers legacy cookies over bearer tokens. The only existing test protects that behavior, so the current suite codifies what the migration intends to delete.
- Legacy authorization semantics are hidden inside `admin=true` cookie parsing. The token path does not yet make that behavior explicit.
- Docs, env, and scripts are stale enough that deleting the code path alone would leave the repo misleading and not ready to ship.
- The repo does not currently have a runnable release gate. `npm test` and `npm run lint` fail because the tools are unavailable, and `npm run build` fails because `tsconfig.json` is missing.

## Method

Inspected every fixture file directly:
- `package.json`
- `.env.example`
- `src/auth/legacy-auth.ts`
- `src/auth/token-auth.ts`
- `src/routes/users.ts`
- `tests/users-auth.test.ts`
- `docs/auth.md`
- `scripts/seed-legacy-auth.sh`

Enumerated the filesystem with:
- `find legacy-auth-service -maxdepth 3 -print | sort`
- `rg --files legacy-auth-service`

Measured legacy-auth residue with explicit scopes so hidden files were not skipped:
- `legacy_session` across `src`, `tests`, `docs`, `.env.example`
- `readLegacySession` across `src`, `tests`
- `admin=true` across `src`, `tests`
- `LEGACY_(AUTH_SECRET|COOKIE_NAME)` in `.env.example`
- `seed-legacy-auth\.sh` in `docs`
- `mobile clients do not send bearer tokens yet` in `docs`

Verified the declared release-gate commands from the repo root:
- `npm test`
- `npm run lint`
- `npm run build`

## Observed Baseline

### Runtime behavior
- `src/routes/users.ts` checks `readLegacySession(headers.cookie)` first and returns `{ source: "legacy", id: legacyUser.id }` when both cookie and bearer token are present.
- The token path is only used as a fallback after the legacy branch.
- The route throws `unauthorized` only if both auth mechanisms fail.

### Test behavior
- `tests/users-auth.test.ts` contains a single test: it asserts that the legacy cookie is preferred over the bearer token.
- There is no test for token-only success.
- There is no test for unauthorized failure.
- There is no test for preserving admin-capable behavior.

### Operational behavior
- `docs/auth.md` instructs developers to send the `legacy_session` cookie and run `scripts/seed-legacy-auth.sh`.
- `.env.example` still declares `LEGACY_AUTH_SECRET` and `LEGACY_COOKIE_NAME`.
- `scripts/seed-legacy-auth.sh` exists solely to bootstrap the legacy path.

### Verification behavior
- `npm test` fails with `sh: vitest: command not found`
- `npm run lint` fails with `sh: eslint: command not found`
- `npm run build` fails with `TS5058: The specified path does not exist: 'tsconfig.json'`
- There is no root ESLint config file.
- There is no lockfile.
- There is no `guard.sh` yet, so there is no mechanical ratchet on legacy-auth residue.

## Root-Cause Hypotheses for the Failing Release Gate

Before prescribing fixes, these are the concrete hypotheses supported by the baseline:

1. Missing repo-local devDependencies are causing `vitest` and `eslint` to be unavailable at runtime.
2. Missing root config files, especially `tsconfig.json`, make the declared scripts impossible to execute successfully.
3. Even after installing tooling, lint will likely still fail until the repo adds an explicit ESLint config because none exists at the project root.

These are not speculative cleanup ideas. They are release blockers because the declared verification commands already fail today.

## Inventory and Leverage Assessment

| Path | Kind | Leverage | Why it matters | Migration action |
| --- | --- | --- | --- | --- |
| `src/auth/token-auth.ts` | code | High | This is the canonical target architecture already present in the repo. | Keep and expand only as needed to preserve current auth semantics. |
| `src/routes/users.ts` | code | Medium | This is the critical workflow entrypoint, but it encodes the legacy-first precedence we need to remove. | Refactor to token-only behavior and make failure modes explicit. |
| `tests/users-auth.test.ts` | test | Medium | It provides a foothold for TDD, but currently asserts the exact behavior slated for deletion. | Rewrite and expand into behavior-first token coverage. |
| `package.json` | tooling | Medium | It is the source of truth for release-gate commands, but those commands are currently unrunnable. | Keep, repair, and align with repo-local tooling. |
| `src/auth/legacy-auth.ts` | code | Low | Pure legacy parser; keeping it after migration would be vestigial. | Delete in the same slice that removes its last consumer. |
| `docs/auth.md` | doc | Low | It teaches the old architecture and explicitly says mobile clients do not send bearer tokens yet. | Rewrite to token-only guidance and surface rollout requirements. |
| `.env.example` | config | Low | It preserves legacy cookie env variables that should disappear with the old path. | Remove legacy env keys and keep token-only config. |
| `scripts/seed-legacy-auth.sh` | script | Low | It exists only to support legacy cookie testing. | Delete when local QA is converted to token auth. |
| `tsconfig.json` | tooling gap | High | Build cannot pass without it. | Add in the tooling-baseline slice. |
| `eslint.config.js` | tooling gap | High | Lint cannot be trusted without explicit config. | Add in the tooling-baseline slice. |
| `guard.sh` | tooling gap | High | Ratchets and denylist enforcement need a mechanical home. | Add in the tooling-baseline slice. |
| `package-lock.json` | tooling gap | Medium | Reproducible verification matters once dependencies are introduced. | Add or update in the tooling-baseline slice. |

## Critical Workflows

These must not regress:
- Current-user request with a valid bearer token resolves the user from token claims.
- Current-user request without a valid bearer token fails closed with `unauthorized`.
- Admin-capable behavior currently implied by `admin=true` is preserved explicitly through token claims or scopes.
- Local development and QA can exercise auth without cookie seeding.
- External clients mentioned in docs can still authenticate after the cookie fallback is removed.

## Hotspots and Fragile Edges

- **Legacy wins when both are present.** `src/routes/users.ts` prefers the cookie path over the bearer token path, which can hide token bugs during testing and rollout.
- **Authorization semantics are implicit.** `src/auth/legacy-auth.ts` derives role from `admin=true`, but `src/auth/token-auth.ts` only returns `sub` and `scopes`, and the route drops role information entirely.
- **The only test protects the wrong behavior.** The current suite is not neutral coverage; it actively anchors the code to legacy precedence.
- **Docs contradict the migration target.** `docs/auth.md` says mobile clients do not send bearer tokens yet. That is a concrete rollout dependency, not a harmless stale sentence.
- **Hidden files can distort residue counts.** `.env.example` is hidden, and a naive `rg` pass will miss it unless the scope is explicit. This is exactly the kind of audit drift that creates false cleanup confidence.

## Anti-Pattern Metrics and Proposed Ratchets

These counts should seed the initial guard script budgets. Budgets start at the current count and can only move down.

| Pattern | Scope | Count | Why it is a problem | Initial budget | First slice to reduce it |
| --- | --- | ---: | --- | ---: | --- |
| `legacy_session` | `src tests docs .env.example` | 4 | Cookie auth still appears in runtime code, tests, docs, and config. | 4 | `slice-002` then `slice-003` |
| `readLegacySession` | `src tests` | 3 | Direct dependency on the legacy parser keeps the old path alive. | 3 | `slice-002` |
| `admin=true` | `src tests` | 2 | Admin semantics are tied to cookie parsing instead of explicit claims. | 2 | `slice-002` |
| `LEGACY_(AUTH_SECRET|COOKIE_NAME)` | `.env.example` | 2 | Legacy env surface will mislead operators and future agents after migration. | 2 | `slice-003` |
| `seed-legacy-auth\.sh` | `docs` | 1 | Docs still instruct users to bootstrap the deleted auth path. | 1 | `slice-003` |
| `mobile clients do not send bearer tokens yet` | `docs` | 1 | This is a rollout blocker for token-only ship readiness. | 1 | `slice-003` |

File-path residue that should also be denylisted:
- `src/auth/legacy-auth.ts`
- `scripts/seed-legacy-auth.sh`

Recommended `guard.sh` coverage:
- Count budgets for the six patterns above.
- Hard-fail denylist for the removed file paths once `slice-003` closes.
- `--status` mode that prints current counts without failing, so each session can re-baseline quickly.

## Translation Guide

Use this table during implementation so each slice translates the old concept into the new one consistently.

| Legacy pattern | Token-auth target | Notes |
| --- | --- | --- |
| `cookie: "legacy_session=..."` | `authorization: "Bearer <token>"` | The transport changes at ship time; do not preserve both long term. |
| `readLegacySession(headers.cookie)` | `verifyAccessToken(headers.authorization)` | Delete the legacy call site rather than wrapping both in an adapter. |
| `LegacyUser.id` | `TokenClaims.sub` | Identity survives, but the source should no longer be `"legacy"`. |
| `LegacyUser.role === "admin"` via `admin=true` | Explicit token claim or scope | Decision required before deleting cookie parsing. |
| `LEGACY_AUTH_SECRET` / `LEGACY_COOKIE_NAME` | Token-only env contract | Keep `TOKEN_AUDIENCE`; add only the missing token-validation config the implementation actually needs. |
| `scripts/seed-legacy-auth.sh` | Token fixture, test helper, or documented bearer-token setup | Do not keep a bootstrap script for an auth path that no longer ships. |

## Edge Cases and Gotchas

- If both cookie and bearer token are present today, the cookie wins. Removing legacy auth changes that observable behavior, so the suite must make the new expectation explicit before refactoring.
- The route currently discards admin information entirely, even though the legacy parser computes it. That means downstream authorization semantics could already be under-tested.
- The docs expose a cross-client dependency: if mobile truly does not send bearer tokens yet, token-only ship readiness depends on rollout coordination outside this repo.
- Hidden config like `.env.example` is easy to miss in grep-based sweeps unless the scope is explicit. Use explicit file scopes or `--hidden` in residue queries.

## Code Pattern Example

Before:

```ts
const legacyUser = readLegacySession(headers.cookie)
if (legacyUser) {
  return { source: "legacy", id: legacyUser.id }
}

const claims = verifyAccessToken(headers.authorization)
if (claims) {
  return { source: "token", id: claims.sub }
}
```

After the migration target:

```ts
const claims = verifyAccessToken(headers.authorization)
if (!claims) {
  throw new Error("unauthorized")
}

return {
  source: "token",
  id: claims.sub,
  // include explicit admin-capable claim mapping if needed
}
```

## Proposed Slice Plan

1. `slice-001` restores a runnable release baseline by adding the repo-local toolchain, missing config, lockfile, and `guard.sh`.
2. `slice-002` rewrites the current-user workflow and its tests so bearer-token auth is the only runtime path.
3. `slice-003` deletes the legacy parser plus stale docs, env, and local bootstrap script in the same cleanup-complete slice.
4. `slice-004` is the convergence slice: repo-wide residue sweep, dependency pruning, docs/config reconciliation, and execution of the full ship checklist.

## Ship Criteria and Manual-Only Surfaces

Automated evidence required:
- `./guard.sh --status`
- `./guard.sh`
- `npm run lint`
- `npm run build`
- `npm test`
- Zero-match residue queries for legacy auth strings and migration markers

Manual-only evidence required:
- Confirm mobile and other external clients now send bearer tokens.
- Confirm admin-capable behavior is preserved through the chosen token claim or scope model.

## Final Assessment

The repo is a good fit for a tight, high-confidence migration because the surface area is small and the replacement path already exists. The main danger is not complexity; it is false finish. If the migration only updates `src/routes/users.ts` and deletes `src/auth/legacy-auth.ts`, the repo will still contain stale tests, docs, scripts, config, and a broken release gate. The attached control plane is designed to prevent exactly that outcome.
