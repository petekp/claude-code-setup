# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at zero, no denylist violations, no residue
- [ ] `grep -r "trackLegacy" packages/` returns zero matches
- [ ] `grep -r "LEGACY_ANALYTICS_WRITE_KEY" packages/ docs/` returns zero matches
- [ ] `grep -r "ENABLE_LEGACY_ANALYTICS_BRIDGE" packages/ docs/` returns zero matches
- [ ] `grep -r "legacy-analytics" packages/ docs/` returns zero matches
- [ ] `test ! -f packages/web/src/lib/legacy-analytics.ts` — legacy file is deleted

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] No migration-only TODO/FIXME/HACK markers remain unless explicitly waived

## Dependencies and Tooling
- [ ] Unused dependencies removed (no analytics packages referenced only by legacy code)
- [ ] Lockfiles, scripts, and CI workflows reconciled
- [ ] `LEGACY_ANALYTICS_WRITE_KEY` removed from all deploy pipeline configs
- [ ] `ENABLE_LEGACY_ANALYTICS_BRIDGE` removed from all deploy pipeline configs

## Docs and Operational Surfaces
- [ ] `docs/analytics-migration.md` describes the new architecture only — no references to legacy patterns
- [ ] Developer onboarding docs reference `ANALYTICS_WRITE_KEY` only (not the legacy key)
- [ ] Any README references to legacy analytics are removed or updated

## External Surface Verification
- [ ] Downstream dashboards confirmed receiving events under new event names
- [ ] ETL/warehouse consumers confirmed migrated off legacy event names
- [ ] Deploy pipelines confirmed free of legacy env vars

## Manual-Only Checks
- [ ] Trigger a test page view and confirm it appears in analytics dashboard under new event name
- [ ] Trigger a test signup and confirm it appears in analytics dashboard under new event name

## Ship Decision
- Ready to ship: `no`
- Remaining blockers:
  - slice-002 (signup migration) in progress
  - slice-003 (env/docs cleanup) not started
  - slice-004 (convergence) not started
  - Dashboard parity not verified
  - Deploy pipeline env var removal not confirmed
- Evidence summary:
  - slice-001 complete — page views flowing through new client
