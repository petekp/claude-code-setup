# Auth Implementation Audit Template

Use this template for each of the 8 route files in `src/api/`. Copy this template, fill it in, and save it. The completed audits form the basis for the comparison matrix and the consolidated middleware spec.

---

## Route: `src/api/[filename].ts`

### Basic Info

| Field | Value |
|-------|-------|
| File path | `src/api/???` |
| HTTP methods handled | GET / POST / PUT / DELETE / PATCH |
| Auth required? | Yes / No / Optional |
| Roles/permissions required | (e.g., `admin`, `user`, none) |

### JWT Extraction

How is the JWT token obtained from the request?

```
// Paste the exact code that extracts the token
```

| Question | Answer |
|----------|--------|
| Extracted from `Authorization` header? | Yes / No |
| Expects `Bearer ` prefix? | Yes / No |
| Falls back to cookie? | Yes / No -- cookie name: ___ |
| Falls back to query parameter? | Yes / No -- param name: ___ |
| Case-sensitive header check? | Yes / No |

### JWT Validation

How is the JWT validated after extraction?

```
// Paste the exact validation code
```

| Question | Answer |
|----------|--------|
| Library used | `jsonwebtoken` / `jose` / other: ___ |
| Secret/key source | env var name: ___ |
| Algorithm enforced? | Yes (which: ___) / No |
| `exp` claim checked? | Yes / No |
| `iss` claim checked? | Yes / No -- expected: ___ |
| `aud` claim checked? | Yes / No -- expected: ___ |
| Custom claims validated? | Yes / No -- which: ___ |

### Auth Failure Handling

What happens when auth fails?

```
// Paste the exact error handling code
```

| Scenario | Status Code | Response Body Shape | Headers Set |
|----------|-------------|-------------------|-------------|
| No token provided | ___ | ___ | ___ |
| Token expired | ___ | ___ | ___ |
| Invalid signature | ___ | ___ | ___ |
| Missing required claims | ___ | ___ | ___ |
| Insufficient role/permission | ___ | ___ | ___ |

### Auth Success Handling

What happens when auth succeeds?

```
// Paste the exact code that makes user data available to the handler
```

| Question | Answer |
|----------|--------|
| User data attached to `req`? | Yes / No -- property name: ___ |
| What claims are passed through? | ___ |
| Any data transformation? | Yes / No -- describe: ___ |

### Unique Behaviors

Does this route's auth do anything the others don't?

- [ ] Rate limiting tied to user identity
- [ ] Token refresh logic
- [ ] Logging/audit trail
- [ ] IP allowlisting
- [ ] API key fallback (non-JWT)
- [ ] Other: ___

### Notes

Any additional observations about this route's auth implementation:

---

## Comparison Matrix (fill after all routes are audited)

After completing the audit for all 8 routes, summarize differences here:

| Aspect | Route 1 | Route 2 | Route 3 | Route 4 | Route 5 | Route 6 | Route 7 | Route 8 | Canonical |
|--------|---------|---------|---------|---------|---------|---------|---------|---------|-----------|
| Token source | | | | | | | | | |
| JWT library | | | | | | | | | |
| Algorithm | | | | | | | | | |
| Claims validated | | | | | | | | | |
| 401 response shape | | | | | | | | | |
| 403 response shape | | | | | | | | | |
| User data property | | | | | | | | | |
| Role checks | | | | | | | | | |

### Difference Classification

For each difference found, classify it:

| Difference | Routes Affected | Classification | Action |
|-----------|----------------|---------------|--------|
| _describe_ | _which routes_ | Bug / Intentional / Unnecessary | _what to do_ |
