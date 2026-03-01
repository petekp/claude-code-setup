# Auth Consolidation & Test Migration Plan

## Problem Statement

Eight API route files in `src/api/` each contain their own copy-pasted JWT validation logic with slight variations. Tests in `__tests__/` are predominantly snapshot-based, breaking on every prop change and providing no behavioral confidence. This migration consolidates auth into a single middleware and replaces snapshot tests with behavioral tests.

## Strategy: Strangler Fig (Tests First)

We write behavioral tests that capture the *intended* auth behavior for each route **before** touching any auth code. These tests become the acceptance criteria for the consolidated middleware. This is the lowest-risk approach because:

- Differences between the 8 implementations surface during test writing (the cheapest time to find them)
- The behavioral tests provide a safety net during the consolidation
- Snapshot tests can be deleted confidently once behavioral coverage is in place

---

## Phase 1: Audit (1-2 days)

### Goal
Catalog every auth implementation, document differences, and decide on canonical behavior.

### Tasks

1. **Inventory all route files** in `src/api/`
   - List each file and its auth-related code (JWT parsing, validation, error handling)
   - Use the audit template (see `audit-template.md`)

2. **Build a comparison matrix**
   - For each route, document:
     - How the JWT is extracted (header parsing, cookie, query param)
     - What claims are validated (exp, iss, aud, custom claims)
     - What happens on auth failure (status code, error shape, headers)
     - Whether the route supports optional/anonymous access
     - What role/permission checks exist

3. **Classify each difference**
   - **Bug**: One route handles an edge case differently due to copy-paste drift. Fix it.
   - **Intentional**: The route genuinely needs different behavior (e.g., admin-only vs. any authenticated user). Support it via middleware config.
   - **Unnecessary**: The route does something extra that isn't needed. Remove it.

4. **Define canonical auth behavior**
   - Write the spec for the consolidated middleware (see `auth-middleware-spec.md`)
   - Get team sign-off on the spec before proceeding

### Deliverables
- Completed audit template for each route
- Comparison matrix
- Approved middleware spec

### Rollback
Phase 1 is purely analytical -- no code changes, nothing to roll back.

---

## Phase 2: Behavioral Tests (2-3 days)

### Goal
Write integration tests that capture the intended auth behavior for every route, replacing snapshot tests as the source of truth.

### Tasks

1. **Set up test infrastructure**
   - Install/configure `supertest` or equivalent for testing API handlers directly
   - Create JWT test helpers:
     - `createValidToken(claims)` -- generates a valid JWT with given claims
     - `createExpiredToken(claims)` -- generates an expired JWT
     - `createTokenWithInvalidSignature()` -- generates a JWT signed with wrong key
     - `createTokenMissingClaims(omit)` -- generates a token missing specific claims

2. **Write behavioral tests for each route** (see `test-migration-guide.md`)
   - Test the auth boundary, not the business logic (those are separate tests)
   - Standard test cases per route:
     - Request with no token returns 401
     - Request with expired token returns 401
     - Request with invalid signature returns 401
     - Request with valid token succeeds (returns 200/expected status)
     - Request with valid token but insufficient role returns 403 (if applicable)
     - Token claims are correctly passed to the handler (e.g., `req.user`)
   - Route-specific test cases based on audit findings

3. **Verify tests pass against current implementations**
   - All behavioral tests must pass against the *existing* (duplicated) auth code
   - If a test fails, it means either the test is wrong or the current implementation has a bug -- investigate and decide

4. **Do NOT delete snapshot tests yet**
   - Keep them running in CI alongside behavioral tests during Phase 3
   - They provide a secondary safety net during the consolidation

### Deliverables
- Test helpers in `__tests__/helpers/auth.ts`
- Behavioral test files: `__tests__/api/[route].auth.test.ts` for each route
- All tests green against current code

### Rollback
Behavioral tests are additive. If the migration is abandoned, the tests still provide value alongside existing snapshots.

---

## Phase 3: Consolidate Auth Middleware (2-3 days)

### Goal
Extract a single `withAuth` middleware and wire it into all 8 routes, one route at a time.

### Tasks

1. **Implement the consolidated middleware**
   - Create `src/api/middleware/withAuth.ts`
   - Implement according to the spec in `auth-middleware-spec.md`
   - Write unit tests for the middleware in isolation: `__tests__/middleware/withAuth.test.ts`

2. **Migrate routes one at a time**
   - For each route file:
     a. Replace inline auth code with `withAuth` wrapper
     b. Run that route's behavioral tests -- they must all pass
     c. Commit the change
   - Order routes from simplest (fewest auth quirks) to most complex
   - Each route migration can be its own PR if the team prefers small PRs

3. **Verify no behavioral regression**
   - All behavioral tests from Phase 2 must pass after each route migration
   - Snapshot tests should also still pass (the response bodies shouldn't change)
   - Run the full test suite after all routes are migrated

### Deliverables
- `src/api/middleware/withAuth.ts` -- the consolidated middleware
- `src/api/middleware/index.ts` -- barrel export
- `__tests__/middleware/withAuth.test.ts` -- middleware unit tests
- All 8 route files updated to use `withAuth`
- All tests green

### Rollback
Each route is migrated independently. If a route's migration causes issues, revert that single commit. The old inline auth code is still in git history.

---

## Phase 4: Cleanup (1 day)

### Goal
Remove dead code, delete snapshot tests, and document the new pattern.

### Tasks

1. **Delete snapshot tests**
   - Remove all `__tests__/**/*.snap` files related to auth
   - Remove snapshot test files that are now fully replaced by behavioral tests
   - Keep any snapshot tests that cover non-auth behavior (if they exist and are still useful)

2. **Remove dead auth code**
   - Search for any leftover auth utility functions that were only used by the old inline auth
   - Remove unused imports

3. **Add inline documentation**
   - Add a brief JSDoc comment to `withAuth` explaining usage
   - Add a code comment in one route file showing the pattern for future developers

4. **Update CI configuration** (if needed)
   - Remove any snapshot update scripts that existed to manage the old snapshot churn
   - Ensure behavioral tests are included in the CI pipeline

### Deliverables
- Clean codebase with no dead auth code
- No orphaned snapshot files
- Updated CI config

### Rollback
Phase 4 is cleanup. If something breaks, restore the deleted files from git.

---

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| Phase 1: Audit | 1-2 days | None |
| Phase 2: Behavioral Tests | 2-3 days | Phase 1 (need the spec to know what to test) |
| Phase 3: Consolidate | 2-3 days | Phase 2 (need tests as safety net) |
| Phase 4: Cleanup | 1 day | Phase 3 |
| **Total** | **6-9 days** | |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Auth differences are more complex than expected | Medium | Medium | Phase 1 audit catches this early; middleware config handles intentional differences |
| Behavioral tests miss an edge case | Low | High | Keep snapshot tests running through Phase 3 as secondary safety net |
| Team pushes back on timeline | Medium | Low | Each phase delivers standalone value; can pause between phases |
| Route migration breaks production auth | Low | Critical | Route-by-route migration with individual rollback capability; behavioral tests catch regressions before deploy |
