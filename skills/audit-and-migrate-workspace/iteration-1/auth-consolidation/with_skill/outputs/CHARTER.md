# Migration Charter

## Mission

Consolidate 8 copy-pasted JWT auth implementations into a single reusable middleware, and migrate the brittle snapshot test suite to behavioral tests that verify auth logic through public interfaces.

## Scope

- `src/api/` — all route files containing inline JWT validation
- `__tests__/` — all snapshot tests covering the API routes
- `src/middleware/` — new home for the consolidated auth middleware (to be created)
- CI configuration — adding guard script and ratchet enforcement

## Invariants

- All existing API endpoints continue to accept the same request shapes and return the same response shapes
- All existing authenticated requests that succeed today continue to succeed
- All existing unauthenticated requests that are rejected today continue to be rejected with the same HTTP status codes
- No changes to the JWT token format, signing algorithm, or claims schema
- No changes to the public API contract (routes, methods, request/response bodies)

## Non-Goals

- Migrating from JWT to a different auth mechanism (sessions, OAuth tokens, etc.)
- Changing the auth provider or token issuer
- Adding new auth features (RBAC, scopes, multi-tenancy) — do that after consolidation
- Refactoring non-auth logic within the route handlers
- Migrating to a different test runner or framework
- Performance optimization of the auth flow

## Guardrails

- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Behavioral tests must assert on HTTP status codes and response bodies, never on internal function calls or component trees
- Each route file migration is verified by running its behavioral tests before and after the change
