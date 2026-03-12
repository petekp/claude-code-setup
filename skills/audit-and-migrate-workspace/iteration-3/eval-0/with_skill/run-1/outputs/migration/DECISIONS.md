# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Remove legacy auth entirely rather than running dual-path
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The codebase currently supports both legacy cookie auth and token auth, with legacy taking precedence. We need to decide whether to maintain backward compatibility or cut over.
- **Decision:** Remove the legacy cookie auth path entirely. Token auth becomes the sole authentication mechanism.
- **Alternatives considered:** (a) Keep dual-path with token preferred — rejected because it preserves dead code and the legacy path has security concerns (string-based cookie parsing, no signature verification). (b) Gradual feature-flag rollout — rejected because the fixture is small enough for a clean cut and feature flags would become residue.
- **Consequences:** Clients sending only `legacy_session` cookies will receive unauthorized errors. This is intentional. All legacy auth code, config, docs, and scripts are removed.
- **Supersedes:** None

---

## Decision 2: Update tests to assert token-only behavior before removing legacy code
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The existing test asserts that legacy auth takes precedence over token auth. Removing legacy code will break this test.
- **Decision:** Rewrite the test suite to cover token auth scenarios (valid token, missing auth, invalid auth) before removing legacy code. The test rewrite and legacy deletion happen in the same slice to keep the migration atomic.
- **Alternatives considered:** (a) Delete tests first, then rewrite — rejected because it creates a window with no coverage. (b) Add new tests alongside old, then delete old — acceptable but unnecessarily complex for a single test file.
- **Consequences:** Test coverage improves from 1 test case to 3+ covering the token-only auth path.
- **Supersedes:** None

---

## Decision 3: Remove seed-legacy-auth.sh without replacement
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `scripts/seed-legacy-auth.sh` bootstraps legacy cookies for local testing. With legacy auth removed, this script is dead.
- **Decision:** Delete the script and the `scripts/` directory. No replacement seed script is needed because token auth uses `Authorization` headers which can be set directly in HTTP clients.
- **Alternatives considered:** (a) Replace with a token-seeding script — rejected because generating test tokens is trivially done in test fixtures or HTTP client configuration, not a shell script.
- **Consequences:** `scripts/` directory is removed entirely. `docs/auth.md` no longer references the seed script.
- **Supersedes:** None

---

## Decision 4: Clean up .env.example to remove legacy variables
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `.env.example` defines `LEGACY_AUTH_SECRET` and `LEGACY_COOKIE_NAME` which are unused in code but signal to developers that legacy auth exists.
- **Decision:** Remove both legacy env vars. Retain `TOKEN_AUDIENCE` as it pertains to the token auth path.
- **Alternatives considered:** None — these variables are clearly vestigial.
- **Consequences:** Any deployment or local dev setup referencing these vars needs no changes since they were never read by code.
- **Supersedes:** None
