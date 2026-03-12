# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — ratchets, denylists, deletion targets all pass
- [ ] `npm run lint` (if configured)
- [ ] `npm run typecheck` (if configured)
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Replay: web home page load emits `page_view` via new client
- [ ] Replay: signup flow emits `signup` via new client

## Residue Sweep
- [ ] `grep -r "trackLegacyPageView" packages/` returns zero matches
- [ ] `grep -r "trackLegacySignup" packages/` returns zero matches
- [ ] `grep -r "import.*legacy-analytics" packages/` returns zero matches
- [ ] `grep -r "LEGACY_ANALYTICS_WRITE_KEY" .` returns zero matches
- [ ] `grep -r "ENABLE_LEGACY_ANALYTICS_BRIDGE" .` returns zero matches
- [ ] `legacy-analytics.ts` file does not exist
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No migration-only TODO/FIXME/HACK markers remain unless explicitly waived

## Dependencies and Tooling
- [ ] No unused dependencies introduced by the migration
- [ ] Lockfiles consistent after dependency changes (if any)

## Docs and Operational Surfaces
- [ ] `docs/analytics-migration.md` updated to describe the completed state (no references to "in-flight" migration or legacy events)
- [ ] README does not reference `LEGACY_ANALYTICS_WRITE_KEY`
- [ ] Any downstream dashboards confirmed to accept new event names

## Manual-Only Checks
- [ ] Verify analytics events appear in the analytics dashboard after deploying to staging
- [ ] Confirm signup conversion funnel reports are unaffected

## Ship Decision
- Ready to ship: `no`
- Remaining blockers:
  - slice-002 (signup migration) in progress
  - slice-003 (env bridge removal) proposed
  - slice-004 (docs cleanup) proposed
- Evidence summary:
  - slice-001 done and confirmed in production (page views)
  - HANDOFF from 2026-02-28 confirms new client live for page views
