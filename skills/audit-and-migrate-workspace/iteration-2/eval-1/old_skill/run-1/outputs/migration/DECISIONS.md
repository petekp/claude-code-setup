# Decisions

## Decision 1 — Use shared analytics client (2026-02-27)
**Status:** Active

**Context:** The web app had its own legacy tracking wrapper (`legacy-analytics.ts`) with bespoke event calls. The shared package provides a unified analytics client.

**Decision:** Migrate all call sites to `packages/web/src/lib/analytics-client.ts`.

**Alternatives considered:** Keep the legacy client indefinitely.

**Consequences:** Call sites need incremental migration; legacy file is deleted once all call sites are moved.

## Decision 2 — Preserve env bridge temporarily during migration (2026-02-27)
**Status:** Active (superseded by Decision 3 upon slice-003 completion)

**Context:** `ENABLE_LEGACY_ANALYTICS_BRIDGE` and `LEGACY_ANALYTICS_WRITE_KEY` were kept in `env.ts` for rollback safety while page-view migration was validated.

**Decision:** Keep the bridge flag until signup migration completes.

**Consequences:** Creates a cleanup obligation tracked as slice-003.

## Decision 3 — Remove env bridge and legacy env vars after signup migration (2026-03-11)
**Status:** Active

**Context:** Page views are confirmed working on the new client. Once signup migration (slice-002) completes, there is no remaining consumer of the legacy env vars or bridge flag.

**Decision:** Delete `LEGACY_ANALYTICS_WRITE_KEY`, `ENABLE_LEGACY_ANALYTICS_BRIDGE` from `env.ts` in slice-003. This supersedes the temporary retention from Decision 2.

**Consequences:** Rollback to legacy analytics will no longer be possible via env toggle; this is acceptable because both event types will be verified on the new client.

## Decision 4 — Update docs in dedicated cleanup slice (2026-03-11)
**Status:** Active

**Context:** `docs/analytics-migration.md` describes the in-flight migration and references legacy event names. README references `LEGACY_ANALYTICS_WRITE_KEY`.

**Decision:** Consolidate doc cleanup into slice-004 so it ships atomically with the env cleanup.

**Consequences:** Docs remain slightly stale until slice-004 is completed, but this is acceptable for a short window.
