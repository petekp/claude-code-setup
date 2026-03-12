# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Token-only auth — remove legacy cookie path entirely
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `getCurrentUser` in `src/routes/users.ts` currently checks the legacy cookie first, falling back to bearer token. This dual-path creates maintenance burden, stale documentation, and a confusing precedence rule where cookies override tokens.
- **Decision:** Remove the legacy cookie auth path entirely. `getCurrentUser` will only accept bearer tokens via the `Authorization` header.
- **Alternatives considered:** (a) Keep dual-path with token-first precedence — rejected because the goal is to eliminate legacy auth, not reorder it. (b) Deprecation period with logging — rejected because this is a controlled migration, not a gradual rollout.
- **Consequences:** The test asserting legacy cookie preference must be replaced with a token-based test. `legacy-auth.ts` becomes dead code and must be deleted. All docs, scripts, config, and env references to legacy auth must be cleaned up.
- **Supersedes:** None

---

## Decision 2: Defer package rename from "legacy-auth-service"
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The `package.json` `name` field is `legacy-auth-service`. Renaming it may affect CI, deployment configs, or downstream consumers.
- **Decision:** Do not rename the package in this migration. The name is metadata, not runtime code. Renaming is a separate concern.
- **Alternatives considered:** Rename to `auth-service` in this migration — rejected because it may have deployment side effects outside our scope.
- **Consequences:** The package name will still say "legacy" after migration. This is acceptable debt, explicitly retained.
- **Supersedes:** None

---

## Decision 3: Stub token verification is acceptable
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `verifyAccessToken` returns hardcoded claims. Real JWT verification is a separate feature.
- **Decision:** Keep the stub. This migration is about removing the legacy auth path, not implementing real token verification.
- **Alternatives considered:** Add real JWT verification — rejected as scope creep beyond the charter.
- **Consequences:** Token auth is structurally correct but not production-secure until real verification is added.
- **Supersedes:** None
