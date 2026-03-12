# Audit Transcript

## What Was Inspected

Performed a complete inventory of the `legacy-auth-service` fixture repository at `/Users/petepetrash/Code/claude-code-setup/skills/audit-and-migrate/evals/fixtures/legacy-auth-service`.

### Files Read (all 8 files in repo)
- `package.json` — project config with test/lint/build scripts
- `.env.example` — 3 env vars (2 legacy, 1 token)
- `src/auth/legacy-auth.ts` — legacy cookie-based auth: `readLegacySession()` function and `LegacyUser` type
- `src/auth/token-auth.ts` — token-based auth: `verifyAccessToken()` function and `TokenClaims` type
- `src/routes/users.ts` — route handler `getCurrentUser()` with dual-auth fallback (legacy preferred over token)
- `tests/users-auth.test.ts` — single vitest test asserting legacy auth preference
- `docs/auth.md` — developer docs describing legacy cookie flow
- `scripts/seed-legacy-auth.sh` — stub shell script for local legacy auth seeding

### Anti-Patterns Counted
7 distinct patterns totaling 15 instances across code, tests, docs, config, and scripts. All patterns have exact grep queries and scoped search roots recorded in RATCHETS.yaml.

### Critical Workflows Identified
1. Authenticated API request via Bearer token
2. Unauthenticated request rejection
3. CI pipeline (test, lint, build)

### External Surfaces Identified
- Cookie contract (legacy_session — being intentionally removed)
- Bearer token contract (Authorization header — retained)
- Environment variable contract (.env.example)
- Developer documentation (docs/auth.md)
- Local dev tooling (scripts/seed-legacy-auth.sh)
- npm scripts (test, lint, build)

## What Was Produced

### Control Plane Artifacts (in migration/)
1. **CHARTER.md** — mission, scope, critical workflows, external surfaces, invariants, non-goals, guardrails, ship gate
2. **DECISIONS.md** — 4 architecture decisions covering: remove legacy entirely, rewrite tests before deletion, remove seed script without replacement, clean env vars
3. **SLICES.yaml** — 3 slices (2 implementation + 1 convergence) with full metadata: touched paths, external surfaces, contracts, denylist patterns, deletion targets, residue queries, verification commands, smoke scenarios, risks
4. **MAP.csv** — 14 entries mapping every file to its owning slice, target state, and verification method
5. **RATCHETS.yaml** — 7 ratchets with exact patterns, scopes, budgets, and rationale
6. **SHIP_CHECKLIST.md** — automated gates, residue sweep commands, dependency checks, docs verification, manual checks
7. **AUDIT.md** — full audit document with method, inventory, leverage assessment, metrics, hotspots, conclusions, translation guide, and edge cases

### Session Artifacts
8. **HANDOFF.md** — session handoff with status, blockers, and exact next steps
9. **transcript.md** — this file
10. **user_notes.md** — uncertainties and open questions
