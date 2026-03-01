# Migration Planning Transcript

## Task

Consolidate copy-pasted auth middleware across 8 Next.js API route files into a single middleware, and migrate snapshot tests to behavioral testing.

## Thinking and Approach

### Initial Assessment

The user describes two intertwined problems:

1. **Auth middleware duplication**: 8 route files in `src/api/` each have their own slightly different JWT validation. This is a classic "shotgun surgery" code smell -- any change to auth logic requires touching all 8 files, and the "slightly different" implementations are almost certainly a source of bugs (inconsistent error codes, missing edge cases in some routes, etc.).

2. **Brittle snapshot tests**: Tests in `__tests__/` are snapshot-based, meaning they break on every prop change regardless of whether behavior actually changed. This creates test fatigue and trains developers to blindly update snapshots, which defeats the purpose of testing.

These two problems are related: migrating the auth middleware will break all existing snapshots, so the test migration should happen in concert with the auth consolidation.

### Strategy Formulation

I considered several approaches:

**Approach A: Big bang** -- Consolidate auth and rewrite tests in one pass. Rejected because it creates a massive, unreviewable PR and high risk of regression.

**Approach B: Auth first, then tests** -- Consolidate auth middleware first, update snapshots temporarily, then migrate tests to behavioral. This is safer but still risky because the snapshot updates during auth consolidation provide no confidence that behavior is preserved.

**Approach C: Tests first, then auth** -- Write behavioral tests for current auth behavior in each route first, then consolidate middleware using those tests as a safety net. This is the safest approach and follows the "Strangler Fig" pattern.

**Chosen approach: C (Tests first, then auth)** with a phased rollout. The behavioral tests serve as the specification for what the consolidated middleware must do. Any behavioral differences between the 8 implementations will surface during the test-writing phase, which is exactly when we want to discover them.

### Phase Design

I broke the work into 4 phases:

1. **Audit** -- Catalog all auth implementations, document their differences, identify the "canonical" behavior
2. **Behavioral tests** -- Write integration tests that capture the intended auth behavior for each route
3. **Consolidate middleware** -- Extract a single middleware, wire it up, verify all behavioral tests still pass
4. **Cleanup** -- Remove old snapshot tests, delete dead code, document the new pattern

### Key Design Decisions

**Middleware architecture**: Next.js supports middleware at the framework level (`middleware.ts` at the project root) and also supports wrapper patterns for API routes. I'm recommending a composable `withAuth` higher-order function rather than Next.js edge middleware because:
- It's more explicit (you can see which routes are protected)
- It supports route-specific auth config (different roles, optional auth, etc.)
- It's easier to test in isolation
- Edge middleware has limitations (no Node.js APIs, different runtime)

**Test architecture**: I'm recommending `supertest`-style integration tests that hit the actual API handlers with mocked JWT tokens. This tests the full request/response cycle including middleware, validation, and error handling. For the auth middleware specifically, I'm also recommending a focused unit test suite.

**Handling the "slightly different" implementations**: The audit phase must catalog every difference. Some differences are bugs (should be fixed), some are intentional (route-specific requirements like different role checks). The migration plan includes a decision matrix for each difference.

### Risk Mitigation

- Feature flags are overkill for this migration since it's internal infrastructure, not user-facing behavior
- Instead, I'm recommending a route-by-route migration where each route gets its own PR
- The behavioral tests written in Phase 2 serve as the acceptance criteria for each route's migration
- A rollback plan is documented for each phase

### Artifacts Produced

1. **migration-plan.md** -- The master plan with phases, tasks, and timelines
2. **audit-template.md** -- A template for auditing each route file's auth implementation
3. **auth-middleware-spec.md** -- Specification for the consolidated middleware
4. **test-migration-guide.md** -- Guide for converting snapshot tests to behavioral tests
5. **implementation-checklist.md** -- A checklist to track progress through the migration
