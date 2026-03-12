# Audit: Legacy Auth Service

## Method
Exhaustive file-by-file inspection of all 8 files in the fixture repo. Classified each file by leverage (keep/refactor/replace) and measured anti-patterns via pattern matching.

## Current Metrics

| Pattern | Grep | Count | Problem |
|---|---|---|---|
| `readLegacySession` | `readLegacySession` | 2 (definition + call site) | Legacy auth entry point — no cryptographic verification |
| `LegacyUser` | `LegacyUser` | 1 (type definition) | Type only used by legacy path |
| `legacy-auth` import | `from.*legacy-auth` | 1 | Import of deprecated module |
| `source.*legacy` | `source.*legacy` | 1 | Route returns legacy source identifier |
| `legacy_session` in env/config | `legacy_session\|LEGACY_COOKIE_NAME\|LEGACY_AUTH_SECRET` | 3 | Env vars for removed auth system |
| `seed-legacy-auth` | `seed-legacy-auth` | 1 | Script for seeding legacy cookies |
| Legacy-first preference in route | `readLegacySession.*\n.*if.*legacyUser` | 1 | Token auth is second-class citizen |

**Total legacy surface: 10 instances across code, tests, docs, config, and scripts.**

## Leverage Assessment

| File | Leverage | Rationale |
|---|---|---|
| `src/auth/token-auth.ts` | **High** | Canonical auth — keep as-is |
| `src/routes/users.ts` | **Medium** | Good structure, needs legacy fallback removed |
| `tests/users-auth.test.ts` | **Medium** | Good test structure, assertions need rewriting |
| `package.json` | **High** | No changes needed |
| `src/auth/legacy-auth.ts` | **Low** | Delete entirely |
| `docs/auth.md` | **Low** | Entirely about legacy flow — rewrite |
| `scripts/seed-legacy-auth.sh` | **Low** | Legacy-only tooling — delete |
| `.env.example` | **Medium** | Remove 2 of 3 vars, keep TOKEN_AUDIENCE |

## Hard Conclusions

1. **The legacy auth has zero cryptographic security.** `readLegacySession` parses cookie strings with `includes()` — no signing, no expiry, no verification. This is a security liability.
2. **The route layer encodes legacy preference.** `getCurrentUser` checks legacy before token, making token auth a fallback. This inverts the correct priority.
3. **The test encodes the wrong behavior.** The test asserts that legacy is preferred — after migration, this assertion is invalid by design.
4. **Stale docs actively mislead.** `docs/auth.md` tells developers to use `legacy_session` cookies and references the seed script. Any new developer following these docs will use the wrong auth path.
5. **Env config carries dead weight.** `LEGACY_AUTH_SECRET` and `LEGACY_COOKIE_NAME` in `.env.example` imply legacy auth is active.

## Guardrails Added

CI ratchet budgets (for guard.sh):
- `readLegacySession`: budget 2 → target 0
- `LegacyUser`: budget 1 → target 0
- `legacy-auth` imports: budget 1 → target 0
- `legacy_session|LEGACY_COOKIE_NAME|LEGACY_AUTH_SECRET`: budget 3 → target 0
- `seed-legacy-auth`: budget 1 → target 0

## Proposed Slices

1. **slice-001: Core migration** — Rewrite `getCurrentUser` to token-only, delete `legacy-auth.ts`, rewrite tests TDD-first.
2. **slice-002: Residue sweep** — Delete seed script, rewrite docs, clean env vars.
3. **slice-003: Final convergence** — Verify all ratchets at zero, all denylist patterns clean, ship checklist green.

## Translation Guide

### Before (legacy path)
```typescript
import { readLegacySession } from "../auth/legacy-auth"
const legacyUser = readLegacySession(headers.cookie)
if (legacyUser) {
  return { source: "legacy", id: legacyUser.id }
}
```

### After (token-only)
```typescript
import { verifyAccessToken } from "../auth/token-auth"
const claims = verifyAccessToken(headers.authorization)
if (claims) {
  return { id: claims.sub }
}
throw new Error("unauthorized")
```

### Edge Cases
- The legacy path returns `{ source: "legacy", id }` with a `source` field. The token path should drop the `source` field or use `"token"` — decide based on whether any consumer relies on it. Since this is a small codebase with no other consumers, dropping `source` is safe.
- The legacy path extracts `role` from the cookie but `getCurrentUser` never uses it. No role mapping needed in token path.
- `verifyAccessToken` returns `scopes` which legacy didn't have. Consumers may want scopes in the future but this is a non-goal for the migration.
