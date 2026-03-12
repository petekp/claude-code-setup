# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets, denylists, deletion checks, and residue queries pass
- [ ] `rg 'trackLegacy' packages/` — zero matches
- [ ] `rg 'LEGACY_ANALYTICS' packages/ docs/` — zero matches
- [ ] `rg 'ENABLE_LEGACY_ANALYTICS_BRIDGE' packages/ docs/` — zero matches
- [ ] `rg 'legacy-analytics' packages/ docs/` — zero matches
- [ ] `test ! -f packages/web/src/lib/legacy-analytics.ts` — file deleted
- [ ] `rg 'trackPageView' packages/web/src/lib/analytics-client.ts` — present
- [ ] `rg 'trackSignup' packages/web/src/lib/analytics-client.ts` — present

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] No migration-only TODO/FIXME/HACK markers remain

## Dependencies and Tooling
- [ ] No orphaned analytics dependencies in package.json
- [ ] Lockfiles reconciled if deps changed
- [ ] No legacy env vars in .env examples or CI config

## Docs and Operational Surfaces
- [ ] `docs/analytics-migration.md` describes the new architecture only (no legacy references)
- [ ] Any README references to `LEGACY_ANALYTICS_WRITE_KEY` removed
- [ ] DECISIONS.md reflects all decisions made during migration

## Manual-Only Checks
- [ ] Downstream analytics dashboards notified of event name changes (if any)
- [ ] Signup conversion funnel verified in analytics dashboard after deploy

## Ship Decision
- Ready to ship: `no` (pending slice-002 through slice-004 completion)
- Remaining blockers:
  - slice-002: signup migration + legacy file deletion
  - slice-003: env bridge removal + docs cleanup
  - slice-004: convergence sweep
- Evidence summary:
  - guard.sh output, residue query results, and manual dashboard check
