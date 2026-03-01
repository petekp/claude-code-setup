# Test Migration Guide: Snapshots to Behavioral Tests

## Why This Migration Matters

Snapshot tests answer the question: "Did the output change?" Behavioral tests answer: "Does the system do what it's supposed to?" The first question creates noise on every refactor. The second question catches actual bugs. When you consolidate auth middleware, snapshot tests will break because the error response shapes might change slightly -- but that's not a bug, that's the whole point of the migration. Behavioral tests will tell you whether the *behavior* is correct.

## Concepts

### What Makes a Test "Behavioral"

A behavioral test verifies **what the system does**, not **what the system outputs byte-for-byte**. The key differences:

| Snapshot Test | Behavioral Test |
|--------------|----------------|
| `expect(response).toMatchSnapshot()` | `expect(response.status).toBe(401)` |
| Breaks when error message wording changes | Only breaks when actual behavior changes |
| Tests implementation details | Tests user-visible behavior |
| Encourages `--update` muscle memory | Encourages investigation when tests fail |

### The Testing Pyramid for API Routes

```
         /  E2E  \          Few: Full HTTP requests against running server
        /----------\
       / Integration \      Most: Handler + middleware tested with mocked HTTP
      /----------------\
     /    Unit Tests     \  Some: Middleware logic, auth helpers in isolation
    /______________________\
```

For this migration, we're focusing on the **integration** layer: testing the API handler (including its auth middleware) by calling it directly with mocked request/response objects.

## Setup

### Install Dependencies

```bash
npm install --save-dev node-mocks-http jsonwebtoken
# or if using jose:
# npm install --save-dev node-mocks-http jose
```

`node-mocks-http` creates mock `NextApiRequest` and `NextApiResponse` objects without needing an HTTP server.

### Create Test Helpers

Create `__tests__/helpers/auth.ts`:

```typescript
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret-do-not-use-in-production";

type TokenOverrides = {
  sub?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

/**
 * Creates a valid JWT for testing.
 * Default: non-expired token for a regular user.
 */
export function createValidToken(overrides: TokenOverrides = {}): string {
  const payload = {
    sub: "user-123",
    email: "test@example.com",
    roles: ["user"],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    ...overrides,
  };

  return jwt.sign(payload, TEST_SECRET, { algorithm: "HS256" });
}

/**
 * Creates an expired JWT for testing.
 */
export function createExpiredToken(overrides: TokenOverrides = {}): string {
  return createValidToken({
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    ...overrides,
  });
}

/**
 * Creates a JWT signed with the wrong secret.
 */
export function createTokenWithBadSignature(overrides: TokenOverrides = {}): string {
  const payload = {
    sub: "user-123",
    email: "test@example.com",
    roles: ["user"],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };

  return jwt.sign(payload, "wrong-secret", { algorithm: "HS256" });
}

/**
 * Creates a valid JWT for an admin user.
 */
export function createAdminToken(overrides: TokenOverrides = {}): string {
  return createValidToken({
    sub: "admin-456",
    email: "admin@example.com",
    roles: ["admin", "user"],
    ...overrides,
  });
}

/**
 * Returns the test secret. Use this to configure the middleware in tests.
 */
export function getTestSecret(): string {
  return TEST_SECRET;
}
```

Create `__tests__/helpers/request.ts`:

```typescript
import { createMocks, RequestMethod } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

type MockRequestOptions = {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
};

/**
 * Creates mock Next.js request/response objects for testing API handlers.
 */
export function createMockRequest(options: MockRequestOptions = {}) {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: options.method ?? "GET",
    headers: options.headers ?? {},
    body: options.body,
    query: options.query,
  });

  return { req, res };
}

/**
 * Creates a mock request with a Bearer token in the Authorization header.
 */
export function createAuthenticatedRequest(
  token: string,
  options: Omit<MockRequestOptions, "headers"> & { headers?: Record<string, string> } = {}
) {
  return createMockRequest({
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Extracts the JSON response body from a mock response.
 */
export function getResponseBody<T = unknown>(res: ReturnType<typeof createMocks>["res"]): T {
  return JSON.parse(res._getData()) as T;
}
```

## Writing Behavioral Tests: The Pattern

### Standard Auth Boundary Tests

Every route that requires auth should have these tests. Here's a template:

```typescript
// __tests__/api/users.auth.test.ts

import { createMockRequest, createAuthenticatedRequest, getResponseBody } from "../helpers/request";
import { createValidToken, createExpiredToken, createTokenWithBadSignature, createAdminToken } from "../helpers/auth";
import handler from "../../src/api/users"; // Adjust import path

// Set the test JWT secret before importing the handler
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
});

describe("GET /api/users - auth boundary", () => {
  it("returns 401 when no token is provided", async () => {
    const { req, res } = createMockRequest({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const body = getResponseBody(res);
    expect(body).toHaveProperty("error");
  });

  it("returns 401 when token is expired", async () => {
    const token = createExpiredToken();
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 401 when token has invalid signature", async () => {
    const token = createTokenWithBadSignature();
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("succeeds with a valid token", async () => {
    const token = createValidToken();
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    // Should NOT be 401 or 403
    expect(res._getStatusCode()).not.toBe(401);
    expect(res._getStatusCode()).not.toBe(403);
  });

  it("makes user data available to the handler", async () => {
    const token = createValidToken({ sub: "user-789", email: "specific@example.com" });
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    // Verify the handler received user data by checking the response
    // (the exact assertion depends on what the handler does with req.user)
    const body = getResponseBody(res);
    // Example: if the handler returns the current user's profile
    expect(body).toHaveProperty("id", "user-789");
  });
});

// Only include this block if the route has role-based access control
describe("GET /api/users - role-based access", () => {
  it("returns 403 when user lacks required role", async () => {
    const token = createValidToken({ roles: ["user"] }); // Missing "admin" role
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
  });

  it("succeeds when user has required role", async () => {
    const token = createAdminToken();
    const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).not.toBe(403);
  });
});
```

### Converting an Existing Snapshot Test

**Before (snapshot test):**

```typescript
it("returns user list", async () => {
  const response = await handler(req, res);
  expect(response).toMatchSnapshot();
});
```

**After (behavioral test):**

```typescript
it("returns a list of users with expected shape", async () => {
  const token = createValidToken();
  const { req, res } = createAuthenticatedRequest(token, { method: "GET" });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  const body = getResponseBody<{ users: Array<{ id: string; email: string }> }>(res);
  expect(body.users).toBeInstanceOf(Array);
  expect(body.users[0]).toHaveProperty("id");
  expect(body.users[0]).toHaveProperty("email");
});
```

The key difference: the behavioral test checks **structure and status**, not exact byte-for-byte output. Adding a new field to the user object won't break this test.

## What to Test vs. What Not to Test

### Test at the auth boundary

- Token present/absent/expired/invalid
- Role checks pass/fail
- Correct status codes
- Error response has an `error` field (but don't test exact message wording)
- User data is correctly passed through

### Test at the business logic boundary

- Handler returns correct data for valid requests
- Handler handles edge cases (empty results, not found, etc.)
- Handler validates request body/params
- Response has expected shape (but use structural assertions, not snapshots)

### Do NOT test

- Exact error message strings (they're not a contract)
- Response header casing
- JSON key ordering
- Timestamp values (use `expect.any(String)` or date range checks)
- Implementation details (which function was called internally)

## Migration Checklist Per Route

For each route file in `src/api/`:

- [ ] Read the existing snapshot tests to understand what's being tested
- [ ] Identify which tests are testing auth behavior vs. business logic
- [ ] Write auth boundary tests using the template above
- [ ] Write business logic tests using structural assertions
- [ ] Run new tests against current code -- all must pass
- [ ] Confirm the new tests cover all scenarios the snapshots covered
- [ ] Mark old snapshot tests for deletion (but don't delete yet until Phase 4)

## Common Pitfalls

### 1. Testing the JWT library instead of your middleware

```typescript
// BAD: This tests jsonwebtoken, not your code
it("rejects tokens with alg:none", async () => { ... });
```

Only test scenarios that exercise *your* code's decisions. The JWT library handles cryptographic validation.

### 2. Over-specifying response bodies

```typescript
// BAD: Breaks when you add a "createdAt" field
expect(body).toEqual({ id: "123", email: "test@example.com" });

// GOOD: Checks structure without being brittle
expect(body).toMatchObject({ id: "123", email: "test@example.com" });
// or
expect(body).toHaveProperty("id", "123");
```

### 3. Forgetting async handling

```typescript
// BAD: Test passes even if handler throws
handler(req, res);
expect(res._getStatusCode()).toBe(200);

// GOOD: Awaits the handler
await handler(req, res);
expect(res._getStatusCode()).toBe(200);
```

### 4. Not resetting environment between tests

```typescript
// Use beforeEach/afterEach to reset env vars
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, JWT_SECRET: "test-secret-do-not-use-in-production" };
});

afterEach(() => {
  process.env = originalEnv;
});
```
