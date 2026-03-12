# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Bearer Token Becomes the Only Supported Runtime Auth Path
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `src/routes/users.ts` currently prefers `readLegacySession(headers.cookie)` over `verifyAccessToken(headers.authorization)`, and the only existing test codifies that precedence. The migration goal is to leave the repo on token auth rather than dual auth.
- **Decision:** Remove runtime support for `legacy_session` cookies at ship time and make bearer-token verification the only canonical auth path for the service.
- **Alternatives considered:** Keep a permanent fallback to legacy cookies; keep dual auth behind a flag during the migration. Both were rejected because they preserve the stale path, complicate verification, and make residue cleanup easy to defer indefinitely.
- **Consequences:** Tests must stop asserting legacy precedence, docs and local setup must stop teaching cookie seeding, and repo-wide residue checks must fail on reintroduction of legacy cookie handling.
- **Supersedes:** none

## Decision 2: Preserve Legacy Admin Semantics Through Explicit Token Claims
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `src/auth/legacy-auth.ts` derives `role: "admin"` from the cookie payload via `admin=true`, but `src/auth/token-auth.ts` only exposes `sub` and `scopes`, and the current route does not preserve role semantics. Deleting the legacy parser without an explicit replacement risks a silent authorization regression.
- **Decision:** Preserve any admin-capable behavior by representing it explicitly in token claims or scopes before removing the legacy parser. The migration must not rely on hidden cookie parsing to carry authorization state.
- **Alternatives considered:** Drop admin semantics entirely; keep a thin legacy parser just for admin detection. Both were rejected because one changes behavior without acknowledgment and the other leaves a vestigial auth dependency behind.
- **Consequences:** The token claims contract may need to expand, tests must cover the chosen admin representation, and the ship gate must include a manual or automated check for admin-capable callers.
- **Supersedes:** none

## Decision 3: Verification Baseline and Residue Cleanup Are In Scope for the Migration
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The declared repo commands currently do not provide a runnable release gate: `npm test` fails because `vitest` is unavailable, `npm run lint` fails because `eslint` is unavailable, and `npm run build` fails because `tsconfig.json` does not exist. There is also no guard script yet.
- **Decision:** Treat runnable verification tooling and final residue cleanup as part of the migration itself. The slice plan starts by restoring an executable release baseline and ends with a dedicated convergence slice that owns whole-repo cleanup and the ship gate.
- **Alternatives considered:** Assume global tools or external CI will make the commands pass; postpone tooling cleanup to a follow-up PR. Both were rejected because they weaken proof of correctness and create a false-finish risk.
- **Consequences:** `package.json`, root config, and `guard.sh` are in scope. The migration is not complete until lint, build, tests, and residue queries all run from the repo.
- **Supersedes:** none
