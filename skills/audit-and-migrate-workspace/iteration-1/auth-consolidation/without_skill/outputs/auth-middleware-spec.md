# Consolidated Auth Middleware Specification

## Overview

A single `withAuth` higher-order function that wraps Next.js API route handlers to provide consistent JWT authentication and authorization. This replaces the 8 separate inline auth implementations.

## Architecture Decision: HOF vs. Edge Middleware

We're using a **higher-order function (HOF)** pattern rather than Next.js edge middleware because:

- **Explicitness**: Each route's auth requirements are visible at the handler level
- **Configurability**: Different routes can have different auth configs (roles, optional auth, etc.)
- **Testability**: The middleware can be unit tested in isolation with standard Node.js test tools
- **Runtime compatibility**: No edge runtime limitations (full Node.js API access)

## API Design

### Type Definitions

```typescript
type AuthConfig = {
  // If true, requests without a token proceed with req.user = null
  // If false (default), requests without a token get 401
  optional?: boolean;

  // If specified, the user must have one of these roles
  // If the user is authenticated but lacks the required role, they get 403
  roles?: string[];
};

type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
  [key: string]: unknown; // Additional claims from JWT
};

// Extends the Next.js request type
type AuthenticatedRequest = NextApiRequest & {
  user: AuthenticatedUser | null;
};

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;
```

### Usage

```typescript
// Basic: require authentication, no role check
export default withAuth(handler);

// With role requirement
export default withAuth(handler, { roles: ["admin"] });

// Optional auth (public route that behaves differently when authenticated)
export default withAuth(handler, { optional: true });
```

### Function Signature

```typescript
function withAuth(
  handler: AuthenticatedHandler,
  config?: AuthConfig
): NextApiHandler;
```

## Behavior Specification

### Token Extraction

The middleware extracts the JWT token using the following priority:

1. `Authorization` header with `Bearer ` prefix (case-insensitive scheme check)
2. No fallback to cookies or query params (simplify -- if this is needed, add it later)

If the `Authorization` header is present but doesn't match the `Bearer <token>` pattern, treat it as "no token" (not as an invalid token).

### Token Validation

| Step | Detail |
|------|--------|
| Library | `jsonwebtoken` (or whatever the project currently uses -- match existing) |
| Secret | `process.env.JWT_SECRET` (or match existing env var name from audit) |
| Algorithm | `HS256` (enforce via `algorithms` option to prevent algorithm confusion attacks) |
| Expiration | Validated automatically by the JWT library (`exp` claim) |
| Issuer | Validated if `process.env.JWT_ISSUER` is set |
| Audience | Validated if `process.env.JWT_AUDIENCE` is set |

### User Object Construction

On successful validation, construct `AuthenticatedUser` from the JWT payload:

```typescript
const user: AuthenticatedUser = {
  id: payload.sub,
  email: payload.email,
  roles: payload.roles ?? [],
  ...payload, // Spread remaining claims
};
```

Attach to request: `req.user = user`.

### Error Responses

All error responses use a consistent shape:

```typescript
type AuthErrorResponse = {
  error: string;     // Machine-readable error code
  message: string;   // Human-readable description
};
```

| Scenario | Status | `error` | `message` |
|----------|--------|---------|-----------|
| No token, auth required | 401 | `"UNAUTHORIZED"` | `"Authentication required"` |
| Token expired | 401 | `"TOKEN_EXPIRED"` | `"Token has expired"` |
| Invalid signature | 401 | `"INVALID_TOKEN"` | `"Invalid authentication token"` |
| Malformed token | 401 | `"INVALID_TOKEN"` | `"Invalid authentication token"` |
| Missing required claims | 401 | `"INVALID_TOKEN"` | `"Invalid authentication token"` |
| Valid token, wrong role | 403 | `"FORBIDDEN"` | `"Insufficient permissions"` |

All 401 responses include the header: `WWW-Authenticate: Bearer`.

**Security note**: Error messages for invalid tokens are intentionally vague (all say "Invalid authentication token") to avoid leaking information about *why* the token is invalid.

### Flow Diagram

```
Request arrives
  |
  v
Extract token from Authorization header
  |
  +-- No token found
  |     |
  |     +-- config.optional? --> req.user = null, call handler
  |     |
  |     +-- else --> 401 UNAUTHORIZED
  |
  +-- Token found
        |
        v
    Validate JWT
        |
        +-- Invalid (expired, bad signature, malformed)
        |     |
        |     +-- config.optional? --> req.user = null, call handler
        |     |
        |     +-- else --> 401 (appropriate error code)
        |
        +-- Valid
              |
              v
          Construct AuthenticatedUser
              |
              v
          Check roles (if config.roles specified)
              |
              +-- User lacks required role --> 403 FORBIDDEN
              |
              +-- Role check passes (or no roles required)
                    |
                    v
                req.user = user
                call handler
```

**Design decision on optional + invalid token**: When `optional` is true and the token is present but invalid, we still proceed with `req.user = null` rather than returning 401. Rationale: if the route is public, a stale/bad token in the client shouldn't block access to public content. The handler can check `req.user` and adjust behavior accordingly.

## File Structure

```
src/api/
  middleware/
    withAuth.ts          # The middleware implementation
    withAuth.test.ts     # Unit tests (or in __tests__/middleware/)
    index.ts             # Barrel export
```

## Implementation Notes

### Algorithm Confusion Prevention

Always specify the `algorithms` option when verifying JWTs:

```typescript
jwt.verify(token, secret, { algorithms: ["HS256"] });
```

This prevents an attacker from crafting a token with `alg: "none"` or switching to an asymmetric algorithm.

### Error Handling

Wrap the handler call in a try/catch to prevent unhandled rejections from crashing the process:

```typescript
try {
  await handler(req as AuthenticatedRequest, res);
} catch (error) {
  console.error("Unhandled error in route handler:", error);
  if (!res.headersSent) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
}
```

### Testing the Middleware

The middleware should be testable without spinning up a server. Create a mock `NextApiRequest` and `NextApiResponse`:

```typescript
import { createMocks } from "node-mocks-http";

const { req, res } = createMocks({
  method: "GET",
  headers: { authorization: `Bearer ${validToken}` },
});

const wrappedHandler = withAuth(mockHandler);
await wrappedHandler(req, res);

expect(res._getStatusCode()).toBe(200);
expect(mockHandler).toHaveBeenCalledWith(
  expect.objectContaining({ user: expect.objectContaining({ id: "user-123" }) }),
  res
);
```
