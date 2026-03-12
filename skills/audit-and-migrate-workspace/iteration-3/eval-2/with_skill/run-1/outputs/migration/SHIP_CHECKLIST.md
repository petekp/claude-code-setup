# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at budget 0
- [ ] `pytest tests/ -q` — all tests pass
- [ ] `rg 'time\.time\(\)' tests/` — zero matches (ratchet-001)
- [ ] `rg 'time\.sleep\(' tests/` — zero matches (ratchet-002)
- [ ] `rg 'elapsed\s*>=' tests/` — zero matches (ratchet-003)
- [ ] `rg 'make_retry_scenario' tests/` — zero matches (ratchet-004)
- [ ] `rg 'scenario_factory' .` — zero matches (ratchet-005)
- [ ] `rg 'run-flaky-tests' .` — zero matches (ratchet-006)
- [ ] `rg 'flaky' docs/` — zero matches (ratchet-007)

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] No migration-only TODO/FIXME/HACK markers remain

## Dependencies and Tooling
- [ ] No new dependencies added (FakeClock is inline)
- [ ] `pyproject.toml` pythonpath still valid after `tests/helpers/` removal
- [ ] `scripts/` directory removed (empty after `run-flaky-tests.sh` deletion)
- [ ] `tests/helpers/` directory removed (empty after `scenario_factory.py` deletion)

## Docs and Operational Surfaces
- [ ] `docs/testing.md` describes deterministic testing approach, not retry-until-green
- [ ] No docs reference `run-flaky-tests.sh`, `scenario_factory`, or timing-based test strategy

## Manual-Only Checks
- None — all verification is automatable for this migration

## Ship Decision
- Ready to ship: `no` (pending migration execution)
- Remaining blockers:
  - All three slices must be completed
- Evidence summary:
  - `./guard.sh` output
  - `pytest tests/ -q` output
  - All ratchet queries returning zero matches
