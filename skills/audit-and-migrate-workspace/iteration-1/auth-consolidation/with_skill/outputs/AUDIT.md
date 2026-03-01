# Audit Document: Auth Consolidation & Test Migration

## Method

This audit was conducted based on the described state of the codebase. In a live audit, each measurement below would be verified with actual grep counts. The patterns and budgets listed here are realistic estimates that must be calibrated against the real codebase before the guard script is activated.

**Inventory approach:** Catalog all files in `src/api/` and `__tests__/` that participate in authentication or test the API routes. Classify each by leverage (keep/refactor/replace).

## Current Metrics (Estimated Anti-Pattern Counts)

| Pattern | Grep Pattern | Count | Problem |
|---|---|---|---|
| Inline JWT verification | `jwt\.verify\(` in `src/api/` | 8 | Same logic copy-pasted 8 times with subtle variations |
| Direct jsonwebtoken imports in routes | `from ['"]jsonwebtoken['"]` in `src/api/` | 8 | Each route imports the JWT library directly instead of using shared middleware |
| Manual header parsing | `req\.headers.*authorization` in `src/api/` | ~16 | Each route extracts the Authorization header manually (some use bracket notation, some dot notation) |
| Snapshot assertions | `toMatchSnapshot\(\)` in `__tests__/` | ~24 | Approximately 3 snapshots per route test file; break on any prop/field change |
| Inline snapshot assertions | `toMatchInlineSnapshot\(` in `__tests__/` | ~6 | Same problem as snapshots but inline |
| Inconsistent error responses | Various 401/403 patterns in `src/api/` | ~5 | Some routes return `{error: "Unauthorized"}`, others `{message: "Invalid token"}`, etc. |
| Silent auth failures | Routes that catch JWT errors and proceed | ~1 | At least one route silently swallows invalid tokens — a security concern |

## Leverage Assessment

### High Leverage (keep and expand)
- **Route handler business logic** — the non-auth parts of each route file are presumably sound and just need the auth preamble removed
- **Test scenarios** — the existing test files test meaningful scenarios (valid user, missing fields, etc.) even if the assertion style is wrong. The scenarios can be reused with behavioral assertions.
- **JWT configuration** — presumably there's a shared secret/key config that all routes reference. This stays.

### Medium Leverage (keep but refactor)
- **Route files (src/api/*.ts)** — structurally fine, just need the inline auth replaced with middleware. ~15 lines per file change.
- **Test files (__tests__/api/*.test.ts)** — test structure and setup are reusable. The assertions need to change from `toMatchSnapshot()` to explicit behavioral checks.

### Low Leverage (replace)
- **Inline JWT validation code** — 8 copies of roughly the same 10-20 lines, each slightly different. All replaced by one middleware.
- **Snapshot files (__tests__/__snapshots__/*.snap)** — auto-generated, provide no behavioral insight, break constantly. Delete entirely.
- **Inconsistent error response formats** — each route's hand-rolled 401/403 response. Standardized in the middleware.

## Hard Conclusions

1. **The copy-pasted auth is a security liability.** One route silently ignores invalid tokens. Others have subtly different expiration checks. A single middleware eliminates these inconsistencies. This is not just a cleanliness concern — it's a correctness concern.

2. **The snapshot tests provide negative value.** They break on every change, which means developers either update them blindly (defeating their purpose) or skip running tests (defeating all testing). Behavioral tests that assert on HTTP status codes and specific response fields are strictly better.

3. **The migration is safe to do incrementally.** Each route can be migrated independently. The shared middleware can be built and tested before any route uses it. There's no "big bang" switchover required.

4. **The admin route and webhooks route need investigation.** Admin likely has role-based checks beyond basic JWT. Webhooks may use a completely different auth mechanism (webhook signatures). These are saved for the last slice to allow investigation time.

## Guardrails Added

1. **Guard script** (`scripts/guard.sh`) — checks ratchet budgets, denylist patterns, and deletion targets
2. **Ratchet budgets** — set to current counts for all measured anti-patterns
3. **Denylist patterns** — activated per-slice as routes are migrated (prevents reintroduction)
4. **Deletion targets** — snapshot files explicitly listed for removal per-slice

## Proposed Slices

| Slice | Name | Dependencies | Key Outcome |
|---|---|---|---|
| slice-001 | Create shared auth middleware and test harness | none | Canonical `withAuth()` middleware exists and is fully tested |
| slice-002 | Migrate user-facing routes (users, profile, settings) | slice-001 | 3 routes use middleware, 3 test files are behavioral |
| slice-003 | Migrate data routes (posts, comments, uploads) | slice-001 | 3 routes use middleware, 3 test files are behavioral |
| slice-004 | Migrate admin routes (admin, webhooks) | slice-001 | 2 routes use middleware, 2 test files are behavioral |
| slice-005 | Delete snapshot infrastructure and lock ratchets | slice-002, slice-003, slice-004 | Zero snapshot tests, all ratchets at 0, permanent guards active |

Slices 002, 003, and 004 can run in parallel since they touch non-overlapping file sets. Slice 005 is the final cleanup that depends on all route migrations being complete.

## First Steps

1. **Calibrate the guard script.** Run the grep patterns against the actual codebase and update the budgets in `guard.sh` to match real counts.
2. **Catalog the 8 JWT variations.** Before building the middleware, diff the auth code across all 8 routes to understand every variation (claim shapes, error handling, expiration logic). This informs the middleware design.
3. **Start slice-001.** Build the middleware, test it in isolation, then begin migrating routes.
