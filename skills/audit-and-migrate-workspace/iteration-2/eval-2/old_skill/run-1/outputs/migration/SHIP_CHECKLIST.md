# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at 0, all denylist patterns clean, all deletion targets gone
- [ ] `pytest tests/ -v` — all tests pass deterministically (no timing flakiness)
- [ ] `pytest tests/integration/test_retry_worker.py -v --count=10` (if pytest-repeat installed) — confirm zero flakiness over 10 runs

## Residue Sweep
- [ ] `grep -rE 'time\.time\(\)' tests/` returns 0 matches (scope: tests/)
- [ ] `grep -rE 'elapsed\s*>=' tests/` returns 0 matches (scope: tests/)
- [ ] `grep -rE 'make_retry_scenario' .` returns 0 matches (scope: entire repo)
- [ ] `grep -rE 'scenario_factory' .` returns 0 matches (scope: entire repo)
- [ ] `grep -rE 'run-flaky-tests' .` returns 0 matches (scope: entire repo)
- [ ] `grep -rE 'rerun.*until.*pass' docs/` returns 0 matches (scope: docs/)
- [ ] `test ! -f tests/helpers/scenario_factory.py` — file physically deleted
- [ ] `test ! -f scripts/run-flaky-tests.sh` — file physically deleted
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No migration-only TODO/FIXME/HACK markers remain

## Dependencies and Tooling
- [ ] No new dependencies introduced (FakeClock is a simple inline stub)
- [ ] `pyproject.toml` unchanged or reconciled

## Docs and Operational Surfaces
- [ ] `docs/testing.md` describes the fake clock / dependency-injection approach
- [ ] `docs/testing.md` contains no references to wall-clock assertions or retry scripts
- [ ] DECISIONS.md reflects all migration decisions

## Manual-Only Checks
- [ ] Verify `tests/helpers/` directory is empty or removed (no orphaned `__init__.py` or other files)
- [ ] Confirm no other files in the repo imported from `scenario_factory` (grep was scoped to `.` but verify visually)

## Ship Decision
- Ready to ship: `no` (pending implementation)
- Remaining blockers:
  - All three slices must reach `done` status
- Evidence summary:
  - `./guard.sh` output showing all-green
  - `pytest tests/ -v` output showing deterministic passes
  - Residue sweep grep commands all returning 0 matches
