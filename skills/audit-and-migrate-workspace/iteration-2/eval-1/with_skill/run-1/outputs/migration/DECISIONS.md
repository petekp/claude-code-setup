# Architecture Decisions

## Decision 1: Use the shared analytics client
- **Date:** 2026-02-27
- **Status:** Active
- **Context:** The web app had its own legacy tracking wrapper.
- **Decision:** Migrate to `packages/web/src/lib/analytics-client.ts`.
- **Alternatives considered:** Keep the legacy client indefinitely.
- **Consequences:** Call sites need to be migrated incrementally.
- **Supersedes:** none

## Decision 2: Slice-001 requires rework — deletion was incomplete
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** Slice-001 was marked `done` but `trackLegacyPageView` still exists in `legacy-analytics.ts`. The methodology requires deletion in the same slice. Since slice-002 already targets deleting `legacy-analytics.ts` entirely, the rework is absorbed into slice-002 rather than reopening slice-001.
- **Decision:** Slice-002 owns deleting the entire `legacy-analytics.ts` file, covering both `trackLegacySignup` and the residual `trackLegacyPageView`.
- **Alternatives considered:** Reopen slice-001 to delete `trackLegacyPageView` separately.
- **Consequences:** Slice-002's deletion target is the whole file, not just the signup function.
- **Supersedes:** none

## Decision 3: Remove the legacy env bridge in slice-003 (env/docs cleanup)
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` remain in `packages/shared/src/env.ts`. The HANDOFF noted "docs and env cleanup were deferred." Deferring cleanup violates the methodology's anti-vestigial discipline.
- **Decision:** Create a dedicated slice-003 for env pruning and docs cleanup, then a convergence slice-004 for final sweep.
- **Alternatives considered:** Fold env/docs into slice-002.
- **Consequences:** Cleaner separation — slice-002 is code migration, slice-003 is env/docs, slice-004 is convergence.
- **Supersedes:** none
