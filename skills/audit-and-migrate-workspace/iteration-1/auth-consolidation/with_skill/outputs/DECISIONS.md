# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Single middleware function over per-route auth wrappers

- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The 8 route files each implement their own JWT validation inline. The variations are subtle — some check `exp` differently, some extract claims into different shapes, one silently ignores invalid tokens instead of rejecting. We need a single source of truth for "what does it mean to be authenticated?"
- **Decision:** Create a single `withAuth` middleware in `src/middleware/auth.ts` that handles token extraction from the `Authorization` header, JWT verification, claims parsing, and error responses. Route handlers receive a typed `AuthenticatedRequest` with parsed user context.
- **Alternatives considered:**
  - **Shared utility function (not middleware):** Each route would still call `validateToken()` manually. This leaves the door open for routes to forget, skip, or customize the call. Middleware enforces the contract at the routing layer.
  - **Next.js middleware.ts (edge middleware):** Runs on every request before routing. Too broad — not all routes require auth. Would need path-matching logic that duplicates the route structure.
  - **Auth decorator pattern:** Cleaner in theory but adds a layer of abstraction that makes debugging harder and doesn't align with Next.js API route conventions.
- **Consequences:** Route handlers become simpler — they assume auth is already validated and can read `req.user` directly. All auth error handling (401, 403) lives in one place. Testing auth logic requires testing the middleware once, not 8 times.
- **Supersedes:** None

---

## Decision 2: Behavioral tests via supertest over snapshot tests

- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The current snapshot tests capture entire response objects or component trees. They break on any prop change, field reorder, or whitespace difference — even when behavior is correct. This creates false failures that erode trust in the test suite and slow down development.
- **Decision:** Replace snapshot tests with behavioral integration tests using supertest (or the equivalent for the project's test framework). Tests make real HTTP requests to the API route handlers, assert on status codes, response body structure, and specific field values that represent business logic. Tests do NOT assert on internal function calls, middleware internals, or full response serialization.
- **Alternatives considered:**
  - **Inline snapshots with liberal update policy:** Reduces the "stale snapshot" problem but still tests shape instead of behavior. Doesn't solve the fundamental issue.
  - **Contract tests (JSON Schema validation):** Good for API consumers but doesn't verify business logic — a route could return valid JSON with completely wrong data.
  - **Keep snapshots alongside behavioral tests:** Adds maintenance burden without proportional value. The behavioral tests will cover the same ground more durably.
- **Consequences:** Tests become more resilient to refactoring — changing internal implementation doesn't break tests if behavior is preserved. Tests are slightly more verbose (explicit assertions instead of `toMatchSnapshot()`), but far more readable and debuggable. When a test fails, the failure message tells you exactly what behavior broke.
- **Supersedes:** None

---

## Decision 3: Migrate auth before tests

- **Date:** 2026-03-01
- **Status:** Active
- **Context:** We have two parallel workstreams: auth consolidation and test migration. They touch overlapping files. We need to sequence them to avoid conflicts.
- **Decision:** Build the shared auth middleware first (Slice 1), then migrate route files to use it one at a time (Slices 2-4). For each route migration, write the new behavioral test first (TDD), then swap the auth implementation, then delete the old snapshot test. This interleaves the two concerns at the slice level rather than doing all auth first, then all tests.
- **Alternatives considered:**
  - **All tests first, then auth:** Would mean writing behavioral tests against the current copy-pasted auth, then rewriting them again after the middleware swap. Double work.
  - **All auth first, then tests:** Would mean changing auth with only snapshot tests as a safety net — the very tests we don't trust. Risky.
- **Consequences:** Each slice produces a route that has both the new middleware and new behavioral tests. Progress is incremental and verifiable. The interleaved approach means we always have good tests covering the code we're changing.
- **Supersedes:** None
