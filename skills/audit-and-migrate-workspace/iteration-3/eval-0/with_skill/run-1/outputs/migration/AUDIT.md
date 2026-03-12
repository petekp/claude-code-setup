# Audit: Legacy Auth Service Migration

## Method
Performed a complete file-by-file inventory of the `legacy-auth-service` fixture repository (8 files). Read every source file, test, doc, script, config, and env file. Counted anti-pattern instances using exact string matching against the full file contents.

## Repository Structure
```
legacy-auth-service/
├── .env.example              (env var contract)
├── package.json              (project config, npm scripts)
├── docs/
│   └── auth.md               (developer auth documentation)
├── scripts/
│   └── seed-legacy-auth.sh   (local testing bootstrap)
├── src/
│   ├── auth/
│   │   ├── legacy-auth.ts    (legacy cookie auth — LOW leverage, delete)
│   │   └── token-auth.ts     (token auth — HIGH leverage, retain)
│   └── routes/
│       └── users.ts          (route handler — MEDIUM leverage, refactor)
└── tests/
    └── users-auth.test.ts    (auth tests — MEDIUM leverage, rewrite)
```

## Leverage Assessment

| File | Leverage | Action |
|------|----------|--------|
| `src/auth/token-auth.ts` | HIGH | Retain. This is the target auth mechanism. |
| `src/routes/users.ts` | MEDIUM | Refactor. Remove legacy fallback, keep token path. |
| `tests/users-auth.test.ts` | MEDIUM | Rewrite. Current test asserts legacy preference; needs token-only coverage. |
| `package.json` | HIGH | Retain as-is. Scripts are correct. |
| `src/auth/legacy-auth.ts` | LOW | Delete entirely. This is the debt. |
| `docs/auth.md` | LOW | Rewrite. Describes legacy cookie flow. |
| `scripts/seed-legacy-auth.sh` | LOW | Delete. Legacy-only dev tooling. |
| `.env.example` | MEDIUM | Update. Remove legacy vars, keep TOKEN_AUDIENCE. |

## Anti-Pattern Metrics

| ID | Pattern | Scope | Count | Problem |
|----|---------|-------|-------|---------|
| ratchet-001 | `readLegacySession` | src/ tests/ | 3 | Legacy session reader function and its call sites |
| ratchet-002 | `legacy_session` | src/ tests/ docs/ scripts/ | 4 | Cookie name string hardcoded across layers |
| ratchet-003 | `LegacyUser` | src/ | 2 | Legacy user type definition and usage |
| ratchet-004 | `LEGACY_` | . | 2 | Environment variables for removed auth path |
| ratchet-005 | `import.*legacy-auth` | src/ tests/ | 1 | Import of the legacy auth module |
| ratchet-006 | `source.*legacy` | src/ tests/ | 2 | Route responses returning legacy as auth source |
| ratchet-007 | `seed-legacy-auth` | docs/ scripts/ | 1 | References to stale legacy seed script |

**Total anti-pattern instances: 15**

## Critical Workflows

1. **Authenticated request** — Bearer token in `Authorization` header → `getCurrentUser()` returns user identity. This is the path that must survive.
2. **Unauthenticated rejection** — no valid credentials → `getCurrentUser()` throws `"unauthorized"`. Must work after legacy path removal.
3. **CI pipeline** — `npm test`, `npm run lint`, `npm run build` must all pass throughout.

## Known Hotspots

- **Auth priority logic** (`src/routes/users.ts`): Legacy auth takes precedence over token auth. This is the core behavior change — after migration, only token auth exists.
- **Single test coverage** (`tests/users-auth.test.ts`): Only 1 test case exists, and it specifically tests legacy preference. Zero coverage for token-only path, unauthorized path, or edge cases.
- **Env/code disconnect** (`.env.example`): Three env vars defined but none referenced in code. `LEGACY_AUTH_SECRET` and `LEGACY_COOKIE_NAME` are pure residue.

## Hard Conclusions

1. **The legacy auth module is entirely dead weight.** `readLegacySession` does manual string matching on cookies with no signature verification, no expiry checks, and hardcoded user IDs. It has zero production value.

2. **Test coverage is dangerously thin.** A single test that asserts the wrong behavior (legacy preference) means the migration has no safety net until tests are rewritten.

3. **Docs and scripts actively mislead.** `docs/auth.md` tells developers to use legacy cookies. `scripts/seed-legacy-auth.sh` bootstraps a flow that will no longer exist. These are worse than missing docs — they're wrong docs.

4. **The env example creates false expectations.** `LEGACY_AUTH_SECRET` and `LEGACY_COOKIE_NAME` suggest to operators that legacy auth is a supported configuration, when in reality neither variable is read by code.

5. **The migration is small and should be done atomically.** With only 3 source files and 1 test file, this can be completed in 2 implementation slices plus a convergence slice.

## Guardrails Added
- 7 CI ratchets defined in `RATCHETS.yaml` covering all legacy auth anti-patterns
- Guard script pattern ready for enforcement
- Denylist patterns defined per slice in `SLICES.yaml`
- Residue queries defined per slice for closure verification

## Proposed Slices

1. **slice-001: Core auth migration** — Remove legacy auth path from code and tests. Rewrite tests for token-only behavior. Delete `src/auth/legacy-auth.ts`. High leverage, no dependencies.

2. **slice-002: Docs, config, and scripts cleanup** — Rewrite `docs/auth.md` for token auth. Delete `scripts/seed-legacy-auth.sh` and `scripts/` directory. Remove `LEGACY_` env vars from `.env.example`. Depends on slice-001.

3. **slice-convergence: Final sweep and ship gate** — Whole-repo residue sweep, all ratchets at 0, execute `SHIP_CHECKLIST.md`. Depends on slice-001 and slice-002.

## Translation Guide

| Old Pattern | New Pattern |
|------------|-------------|
| `import { readLegacySession } from "../auth/legacy-auth"` | Remove import entirely |
| `const legacyUser = readLegacySession(headers.cookie)` | Remove; token path handles auth |
| `if (legacyUser) { return { source: "legacy", id: legacyUser.id } }` | Remove entire branch |
| `{ source: "legacy", ... }` | Only `{ source: "token", ... }` remains |
| `cookie: "legacy_session=abc"` (in tests) | `authorization: "Bearer token"` |
| `expect(result.source).toBe("legacy")` | `expect(result.source).toBe("token")` |
| `LEGACY_AUTH_SECRET=...` in .env | Delete line |
| `LEGACY_COOKIE_NAME=...` in .env | Delete line |
| "include the `legacy_session` cookie" in docs | "include `Authorization: Bearer <token>` header" |

## Edge Cases and Gotchas

1. **Dual-auth test case**: The existing test sends both a cookie AND a Bearer token, asserting legacy wins. After migration, the same request with both headers should authenticate via the Bearer token and ignore the cookie entirely (since cookie parsing code no longer exists).

2. **Error message unchanged**: `getCurrentUser` throws `new Error("unauthorized")` — this remains the same, but now fires for cookie-only requests too.

3. **Empty scripts directory**: After deleting `seed-legacy-auth.sh`, the `scripts/` directory will be empty and should be removed to avoid confusing directory structure.
