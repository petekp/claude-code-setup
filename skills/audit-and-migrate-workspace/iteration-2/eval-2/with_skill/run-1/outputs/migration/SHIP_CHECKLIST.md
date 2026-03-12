# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at 0, no denylist violations, no residue
- [ ] `pytest tests/ -q` — all tests pass
- [ ] `./guard.sh --status` — confirms clean baseline with zero counts

## Ratchet Verification
- [ ] `rg 'time\.time\(\)' tests/ --count-matches` returns zero or "no matches"
- [ ] `rg 'elapsed' tests/ --count-matches` returns zero or "no matches"
- [ ] `rg 'clock=time\b' tests/ --count-matches` returns zero or "no matches"
- [ ] `rg 'time\.sleep' tests/ --count-matches` returns zero or "no matches"

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] No migration-only TODO/FIXME/HACK markers remain unless explicitly waived

## Deletion Verification
- [ ] `test ! -f scripts/run-flaky-tests.sh && echo 'deleted'` — retry script is gone
- [ ] `rg 'run-flaky-tests' . --count-matches || echo 'clean'` — no references remain
- [ ] `ls scripts/` — directory is empty or removed

## Dependencies and Tooling
- [ ] No new dependencies added to pyproject.toml (FakeClock is a local stub)
- [ ] `guard.sh` is executable and idempotent

## Docs and Operational Surfaces
- [ ] `docs/testing.md` describes deterministic testing with FakeClock
- [ ] `docs/testing.md` does not mention flaky tests, retries, or rerunning
- [ ] No references to `run-flaky-tests.sh` exist anywhere in the repo

## Manual-Only Checks
- [ ] Review final diff to confirm no commented-out code, stray debug prints, or old/new/final artifacts
- [ ] Confirm test execution time is sub-second (no real sleeps)

## Ship Decision
- Ready to ship: `pending`
- Remaining blockers:
  - Execute slices 001-003 and verify all automated checks above
- Evidence summary:
  - Guard script output, pytest output, rg residue query results
