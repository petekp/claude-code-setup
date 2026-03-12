# Audit: Legacy Auth to Token Auth Migration

## Method
Exhaustive file-by-file inspection of the fixture repo (`legacy-auth-service`). All 8 files read in full. Anti-pattern counts derived from `rg` searches across the entire repo.

## Inventory and Leverage Assessment

| File | Leverage | Rationale |
|------|----------|-----------|
| `src/auth/token-auth.ts` | **High** | Target auth module. Keep and expand. |
| `src/routes/users.ts` | **Medium** | Structurally sound but has dual-path auth logic. Refactor to token-only. |
| `package.json` | **High** | Build/test/lint scripts. Keep. Name contains "legacy" but deferred (Decision 2). |
| `src/auth/legacy-auth.ts` | **Low** | The debt. Cookie-based auth to be deleted entirely. |
| `tests/users-auth.test.ts` | **Low** | Tests legacy-preference behavior. Must be rewritten for token-only. |
| `docs/auth.md` | **Low** | Describes legacy cookie auth only. Stale — must be rewritten. |
| `scripts/seed-legacy-auth.sh` | **Low** | Legacy-only seed script. Delete. |
| `.env.example` | **Medium** | Contains 2 legacy env vars and 1 token var. Update to token-only. |

## Anti-Pattern Metrics

| Pattern | Scope | Count | Problem |
|---------|-------|-------|---------|
| `readLegacySession` | `src/ tests/` | 3 | Direct usage of legacy auth function |
| `legacy_session` | all | 4 | References to legacy cookie name |
| `LEGACY_` (env vars) | `.env.example` | 2 | Config for removed auth path |
| `source: "legacy"` | `src/` | 1 | Route returns legacy source identifier |
| `seed-legacy-auth` | all | 2 | References to legacy seed script (script + docs) |
| `import.*legacy-auth` | `src/` | 1 | Import of legacy auth module |

**Total legacy surface:** 13 discrete matches across 7 files (of 8 total).

## Critical Workflows

1. **User authentication via `getCurrentUser`** — the sole auth resolution path. Currently checks legacy cookie first, then bearer token. Must be migrated to token-only without breaking the "unauthorized" throw for unauthenticated requests.

## Known Hotspots

- **Legacy preference in route handler** — `src/routes/users.ts:5-8` checks legacy cookie before token. This is the core logic to change.
- **Test encodes wrong behavior** — `tests/users-auth.test.ts` asserts that legacy cookies take precedence. This test must be replaced, not just updated, because the behavior it tests is being removed.
- **Stale docs** — `docs/auth.md` tells developers to use `legacy_session` cookies and run `seed-legacy-auth.sh`. A developer following these docs post-migration would be confused.

## Hard Conclusions

1. **The legacy auth path is entirely replaceable.** Token auth already exists and works. The migration is structural removal, not feature development.
2. **The test suite actively enforces the wrong behavior.** The existing test must be replaced before legacy code can be deleted, or tests will fail.
3. **Docs, scripts, config, and env are all stale.** Every non-code artifact in the repo describes the legacy system. This is not incidental — it's half the migration work.
4. **The migration is small but complete.** Every file in the repo except `token-auth.ts` and `package.json` needs changes or deletion. The small size makes it ideal for a clean, slice-by-slice approach.

## Guardrails Added

CI ratchet budgets (enforced by `guard.sh`):
- `readLegacySession` in `src/ tests/`: budget 3 (current count)
- `legacy_session` in all: budget 4
- `LEGACY_` in `.env.example`: budget 2
- `seed-legacy-auth` in all: budget 2

Denylist patterns (enforced after slice completion):
- `readLegacySession`, `LegacyUser`, `import.*legacy-auth` — after slice-001
- `seed-legacy-auth`, `LEGACY_AUTH_SECRET`, `LEGACY_COOKIE_NAME` — after slice-002

## Ship Criteria

See `SHIP_CHECKLIST.md` for the full gate. Summary:
- Guard script passes with all ratchets at zero
- Test suite passes with token-only tests
- Lint and typecheck clean
- No legacy references in `src/`, `tests/`, `docs/`, `scripts/`, or `.env.example`
- `src/auth/legacy-auth.ts` and `scripts/seed-legacy-auth.sh` physically deleted
- `docs/auth.md` describes token auth
- Manual diff review confirms no residue

## Manual-Only Verification Surfaces
- Final diff review as release candidate (no automated check can replace human judgment on accidental churn)

## Proposed Slices

1. **slice-001** (implementation) — Migrate `getCurrentUser` to token-only. Delete `legacy-auth.ts`. Rewrite auth tests.
2. **slice-002** (implementation) — Clean up docs, scripts, config, env. Delete `seed-legacy-auth.sh`. Rewrite `docs/auth.md`. Update `.env.example`.
3. **slice-003** (convergence) — Final residue sweep across entire repo. Execute `SHIP_CHECKLIST.md`. Produce ship decision.
