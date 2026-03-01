# Implementation Checklist

Track progress through the migration using this checklist. Each item should be checked off when complete and verified.

---

## Phase 1: Audit

- [ ] Audit `src/api/` route file 1: _______________
- [ ] Audit `src/api/` route file 2: _______________
- [ ] Audit `src/api/` route file 3: _______________
- [ ] Audit `src/api/` route file 4: _______________
- [ ] Audit `src/api/` route file 5: _______________
- [ ] Audit `src/api/` route file 6: _______________
- [ ] Audit `src/api/` route file 7: _______________
- [ ] Audit `src/api/` route file 8: _______________
- [ ] Complete comparison matrix
- [ ] Classify all differences (Bug / Intentional / Unnecessary)
- [ ] Define canonical auth behavior
- [ ] Write middleware spec (or review `auth-middleware-spec.md`)
- [ ] Get team sign-off on spec

## Phase 2: Behavioral Tests

### Infrastructure
- [ ] Install `node-mocks-http` (or equivalent)
- [ ] Create `__tests__/helpers/auth.ts` (JWT test helpers)
- [ ] Create `__tests__/helpers/request.ts` (mock request helpers)
- [ ] Verify test helpers work with a smoke test

### Route Tests (repeat for each route)

**Route 1: _______________**
- [ ] Write auth boundary tests (401/403 scenarios)
- [ ] Write business logic tests (happy path, edge cases)
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 2: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 3: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 4: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 5: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 6: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 7: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

**Route 8: _______________**
- [ ] Write auth boundary tests
- [ ] Write business logic tests
- [ ] All tests pass against current implementation
- [ ] Test coverage reviewed

### Verification
- [ ] Full test suite passes (behavioral + existing snapshots)
- [ ] No test relies on snapshot matching for auth behavior

## Phase 3: Consolidate Auth Middleware

### Middleware Implementation
- [ ] Create `src/api/middleware/withAuth.ts`
- [ ] Create `src/api/middleware/index.ts` (barrel export)
- [ ] Write unit tests: `__tests__/middleware/withAuth.test.ts`
- [ ] All middleware unit tests pass
- [ ] Middleware handles: no token -> 401
- [ ] Middleware handles: expired token -> 401
- [ ] Middleware handles: invalid signature -> 401
- [ ] Middleware handles: valid token -> sets req.user, calls handler
- [ ] Middleware handles: optional auth + no token -> req.user = null, calls handler
- [ ] Middleware handles: role check failure -> 403
- [ ] Middleware handles: role check success -> calls handler

### Route Migration (one at a time, in order of complexity)

**Route ___ (simplest):**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Snapshot tests pass (if still running)
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___:**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

**Route ___ (most complex):**
- [ ] Replace inline auth with `withAuth`
- [ ] Behavioral tests pass
- [ ] Commit

### Verification
- [ ] All 8 routes migrated
- [ ] Full test suite passes
- [ ] No route contains inline JWT validation code
- [ ] Code review complete

## Phase 4: Cleanup

- [ ] Delete snapshot files (`__tests__/**/*.snap`) for auth-related tests
- [ ] Delete snapshot test files that are fully replaced
- [ ] Remove unused auth utility functions
- [ ] Remove unused imports in route files
- [ ] Verify no dead code remains (run linter/unused import check)
- [ ] Update CI config if needed
- [ ] Final full test suite run -- all green
- [ ] Migration complete

---

## Notes / Issues Encountered

Use this section to track any issues, decisions, or deviations from the plan:

| Date | Issue | Resolution |
|------|-------|-----------|
| | | |
