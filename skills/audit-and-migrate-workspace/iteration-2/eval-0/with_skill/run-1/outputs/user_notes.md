# User Notes — Uncertainties

1. **Package rename scope** — `package.json` name is `legacy-auth-service`. Deferred per Decision 2, but if this name is referenced by deployment tooling, CI, or downstream consumers, a rename may be needed. Clarify whether this is blocking.

2. **Admin/role migration** — Legacy auth parses `admin=true` from cookies. Token auth has `scopes: string[]` but no admin detection logic. If admin identification is needed post-migration, a follow-up slice for scopes-based role resolution would be required. Currently listed as a non-goal in the charter.

3. **Real token verification** — `verifyAccessToken` returns hardcoded stub claims. This is explicitly out of scope (Decision 3), but the migrated codebase is not production-secure until real JWT verification is implemented.

4. **Test coverage gaps** — The fixture has exactly one test. After migration, the test will cover the token-auth happy path, but there may be untested edge cases (malformed tokens, missing headers, expired tokens) that should be covered in a follow-up.

5. **`TOKEN_AUDIENCE` env var** — Retained in `.env.example` with value `api://legacy-auth-service`. The value itself contains "legacy" but it's an external audience URI, not something we control. Confirm whether this value should change.
