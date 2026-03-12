# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Use the shared analytics client
- **Date:** 2026-02-27
- **Status:** Active
- **Context:** The web app had its own legacy tracking wrapper.
- **Decision:** Migrate to `packages/web/src/lib/analytics-client.ts`.
- **Alternatives considered:** Keep the legacy client indefinitely.
- **Consequences:** Call sites need to be migrated incrementally.
- **Supersedes:** none

---

## Decision 2: Resume the in-flight migration rather than restart
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** Session 1 completed slice-001 (page views) and started slice-002 (signup tracking) but left signup incomplete, env cleanup deferred, and docs stale. The direction is sound — the new analytics client is the right target — but the control plane was missing ratchets, a ship checklist, external surface tracking, and a convergence slice.
- **Decision:** Resume from the existing state. Harden the control plane (add RATCHETS.yaml, SHIP_CHECKLIST.md, external surfaces to charter, convergence slice) and finish the remaining slices rather than starting over.
- **Alternatives considered:** Full restart — rejected because slice-001 is correctly done, the analytics-client.ts is the right target, and restarting would duplicate completed work.
- **Consequences:** Must backfill missing control plane artifacts and audit the "done" slice-001 for completeness gaps (missing denylist patterns, missing residue queries, missing type field).
- **Supersedes:** none

---

## Decision 3: Add trackSignup to the new analytics client
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** The new `analytics-client.ts` only exports `trackPageView`. Signup tracking needs a new function.
- **Decision:** Add `trackSignup(email: string, source: string)` to `analytics-client.ts` as the replacement for `trackLegacySignup`.
- **Alternatives considered:** Generic `track(event, props)` function — rejected as over-engineering for two known events.
- **Consequences:** Slice-002 adds the function and migrates signup call sites in a single change.
- **Supersedes:** none

---

## Decision 4: Remove env bridge and legacy key in the same slice as legacy file deletion
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `ENABLE_LEGACY_ANALYTICS_BRIDGE` and `LEGACY_ANALYTICS_WRITE_KEY` exist solely to support the legacy analytics path. Once `legacy-analytics.ts` is deleted, these become dead config.
- **Decision:** Delete the bridge flag and legacy key from `packages/shared/src/env.ts` in slice-003 (env and docs cleanup), immediately after slice-002 deletes the legacy file.
- **Alternatives considered:** Keep env vars for rollback — rejected because the migration has been in flight for two weeks and page views are already fully migrated. Rollback would require restoring code, not just flipping a flag.
- **Consequences:** Deploy pipelines must stop setting these vars. This is a manual coordination step documented in the ship checklist.
- **Supersedes:** none
