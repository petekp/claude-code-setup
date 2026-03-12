# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Token auth becomes the sole authentication path
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The codebase has two auth paths — legacy cookie-based (`readLegacySession`) and token-based (`verifyAccessToken`). The routes layer (`getCurrentUser`) prefers legacy over token, meaning token auth is second-class. Legacy auth uses simple cookie string matching with no cryptographic verification, making it a security liability.
- **Decision:** Remove all legacy auth code and make `verifyAccessToken` the only authentication mechanism. Routes will call `verifyAccessToken` directly without a fallback.
- **Alternatives considered:** (1) Keep dual-path with token preferred — rejected because it leaves dead code and stale config that misleads future developers. (2) Build an auth middleware abstraction — rejected as over-engineering for a single route file.
- **Consequences:** Legacy session cookies will no longer authenticate. Any client still sending only cookies will receive unauthorized errors. All legacy-specific env vars, scripts, and docs become deletable.
- **Supersedes:** none

---

## Decision 2: Delete legacy artifacts in the same slice that migrates their consumers
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** Anti-vestigial discipline requires that replaced code is deleted atomically with the migration, not deferred.
- **Decision:** When `getCurrentUser` is migrated to token-only, `legacy-auth.ts` is deleted in the same slice. Stale docs, scripts, and env vars are cleaned in a dedicated convergence slice immediately after.
- **Alternatives considered:** Phased deletion across multiple PRs — rejected because deferred cleanup is routinely forgotten.
- **Consequences:** Each slice is self-contained. No orphaned legacy code survives between slices.
- **Supersedes:** none

---

## Decision 3: Rewrite test to assert token-only behavior
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The existing test (`prefers the legacy session cookie`) encodes the legacy behavior as correct. After migration this behavior is incorrect by design.
- **Decision:** Replace the test with one that asserts: (a) token auth succeeds, (b) cookie-only requests are rejected, (c) no `source: "legacy"` appears.
- **Alternatives considered:** Keep old test and add new ones — rejected because the old test would fail and its assertion is no longer valid.
- **Consequences:** Test file is rewritten in the core migration slice.
- **Supersedes:** none
