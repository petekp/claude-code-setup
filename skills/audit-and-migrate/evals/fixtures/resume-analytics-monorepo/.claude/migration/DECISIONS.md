# Architecture Decisions

## Decision 1: Use the shared analytics client
- **Date:** 2026-02-27
- **Status:** Active
- **Context:** The web app had its own legacy tracking wrapper.
- **Decision:** Migrate to `packages/web/src/lib/analytics-client.ts`.
- **Alternatives considered:** Keep the legacy client indefinitely.
- **Consequences:** Call sites need to be migrated incrementally.
- **Supersedes:** none
