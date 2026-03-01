# Transcript: Auth Consolidation Migration Planning

## Approach

### 1. Skill Ingestion

Read the audit-and-migrate skill at `/Users/petepetrash/.claude/skills/audit-and-migrate/SKILL.md` and all supporting reference materials:

- `references/templates/CHARTER.md` — charter template
- `references/templates/DECISIONS.md` — decisions log template
- `references/templates/SLICES.yaml` — slice ledger template
- `references/templates/MAP.csv` — file map template
- `references/guard-script-pattern.md` — guard script implementation guide

The methodology has two phases: **Audit** (understand and freeze the problem) then **Migrate** (pay it down slice by slice with proof). Since I don't have access to the actual codebase, I'm executing Phase 1 (Audit) to produce planning artifacts, with realistic estimates that can be calibrated against the real code.

### 2. Problem Decomposition

The user described two intertwined problems:

1. **Auth duplication:** 8 route files in `src/api/` each have their own JWT validation. The variations are "slightly different" — meaning there's no canonical correct version, just 8 divergent copies. This is both a maintenance burden and a security risk (inconsistent validation = inconsistent protection).

2. **Brittle tests:** Snapshot tests in `__tests__/` break on every prop change. Snapshots test code shape rather than behavior. They provide negative value because they train developers to blindly update snapshots, which means they catch nothing.

These problems are connected: you can't safely refactor auth if the tests that cover the routes are unreliable. And you can't migrate the tests in isolation because the auth code is what the tests exercise. The interleaving strategy (Decision 3) addresses this.

### 3. Charter Construction

The charter defines the mission, scope, invariants, non-goals, and guardrails. Key decisions in the charter:

- **Invariants are behavioral, not structural.** The invariant is "authenticated requests that succeed today continue to succeed" not "the code looks the same." This gives us freedom to refactor while ensuring correctness.
- **Non-goals are explicit.** Not migrating from JWT, not adding RBAC, not changing the auth provider. These are all things that might be tempting to tackle while we're "in there" but would expand scope dangerously.
- **Guardrails include test methodology rules.** Behavioral tests must assert on HTTP status codes and response bodies — not internal function calls.

### 4. Architecture Decisions

Three decisions, each following the template format:

1. **Single middleware over per-route wrappers.** The `withAuth()` pattern is standard in Express/Next.js and enforces auth at the routing layer rather than relying on each handler to remember to call a utility.

2. **Behavioral tests via supertest over snapshots.** Tests make real HTTP requests and assert on the things users care about: status codes and response shapes. This is more resilient to refactoring.

3. **Interleave auth and test migration.** Don't do all auth first (risky without good tests) or all tests first (wasted effort if tests need rewriting after auth changes). Do both together per route batch.

### 5. Slice Design

Five slices, designed to be vertical and outcome-based:

- **Slice 1 (Foundation):** Build the middleware in isolation. No existing code changes. This is zero-risk and establishes the contract all other slices depend on.
- **Slices 2-4 (Route migrations):** Grouped by domain (user routes, data routes, admin routes). Each slice migrates both the auth implementation AND the tests for a group of routes. Slices 2-4 are independent of each other (can run in parallel) but all depend on Slice 1.
- **Slice 5 (Cleanup):** Delete all remaining snapshot infrastructure and lock ratchets to zero. Depends on all route migrations being complete.

The grouping matters: user-facing routes first (lowest risk, highest traffic), data routes second (medium risk, uploads route needs attention), admin routes last (highest risk due to role-based auth and webhook signature unknowns).

### 6. Guard Script Design

The guard script checks five categories of anti-patterns:

- `jwt.verify()` calls in route files (should only be in middleware)
- `toMatchSnapshot()` assertions (should be zero by end)
- `toMatchInlineSnapshot()` assertions (same)
- Direct `jsonwebtoken` imports in routes (should only be in middleware)
- Manual `Authorization` header access in routes (should be in middleware)

Denylist patterns and deletion targets are commented out and activated per-slice. This is deliberate — activating them before the slice is complete would cause false failures.

### 7. Risk Identification

Three specific risks called out:

1. **Admin route role checks.** The admin route likely checks more than "is this a valid JWT" — it probably checks "is this user an admin." The middleware may need a variant (`withAdminAuth()`) or a configuration option.

2. **Webhooks route auth mechanism.** Webhooks commonly use HMAC signatures rather than JWT. If this route uses webhook signatures, it's partially or entirely out of scope for the auth middleware consolidation.

3. **Uploads route multipart interaction.** Multipart form data requests handle the request body differently. If the auth middleware reads the body stream (unlikely but possible), it could interfere with file upload parsing.

### 8. What I Would Do Differently With Codebase Access

If I had access to the actual codebase, I would:

1. **Run real grep counts** to calibrate all ratchet budgets in the guard script
2. **Diff the 8 JWT validation implementations** to catalog every variation (claim extraction, error handling, expiration logic, token format expectations)
3. **Count exact snapshot assertions** to set precise budgets
4. **Check if webhooks uses JWT or webhook signatures** to scope slice-004 correctly
5. **Check if admin routes check roles/permissions** beyond basic JWT validity
6. **Verify the test runner and available tooling** (Jest + supertest? Vitest? Something else?)
7. **Run the existing test suite** to establish a green baseline before any changes
8. **Run the guard script** to get a clean baseline

## Artifacts Produced

| File | Purpose |
|---|---|
| `CHARTER.md` | Mission, invariants, non-goals, guardrails |
| `DECISIONS.md` | Three architecture decisions with context and alternatives |
| `SLICES.yaml` | Five slices with full lifecycle metadata |
| `MAP.csv` | 28 file entries across all slices |
| `guard.sh` | CI-enforced guard script with ratchets, denylists, and deletion checks |
| `AUDIT.md` | Comprehensive audit document with metrics, leverage assessment, and conclusions |

## Next Steps (For the First Session With Codebase Access)

1. Copy the control plane artifacts to `.claude/migration/` in the target repo
2. Run the grep patterns from the audit against the actual codebase
3. Update all ratchet budgets in `guard.sh` to match real counts
4. Run `chmod +x scripts/guard.sh && ./scripts/guard.sh` to establish a clean baseline
5. Wire `guard.sh` into CI (or at minimum, pre-commit hooks)
6. Begin slice-001: build the `withAuth()` middleware with TDD
