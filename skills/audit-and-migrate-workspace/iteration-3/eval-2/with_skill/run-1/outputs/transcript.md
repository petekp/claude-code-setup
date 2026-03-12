# Transcript

## What I Inspected
Read all 6 files in the `flaky-tests-worker` fixture repo:
- `src/retry_worker.py` — production RetryWorker with clock injection support
- `tests/integration/test_retry_worker.py` — 2 tests: one timing-based (flaky), one shape-test of helper
- `tests/helpers/scenario_factory.py` — Scenario class and make_retry_scenario factory
- `docs/testing.md` — stale docs advising retry-until-green workflow
- `scripts/run-flaky-tests.sh` — bash script that retries pytest on failure
- `pyproject.toml` — project config with pytest pythonpath setting

Read all 6 skill templates (CHARTER, DECISIONS, SLICES, MAP, RATCHETS, SHIP_CHECKLIST) to ensure deliverables match expected format.

## Key Findings
- `RetryWorker` already accepts a `clock` parameter — deterministic testing requires zero production changes
- The flaky test passes real `time` as the clock and asserts wall-clock elapsed time ≥ 0.6s
- `scenario_factory.py` and `test_inline_scenario_shape` become dead code after the test rewrite
- `run-flaky-tests.sh` and `docs/testing.md` exist solely to support a retry-until-green workflow that becomes vestigial

## What I Produced
10 deliverable files:
1. `migration/CHARTER.md` — mission, scope, invariants, ship gate
2. `migration/DECISIONS.md` — 3 architecture decisions (fake clock, delete helper, delete script/docs)
3. `migration/SLICES.yaml` — 3 slices (test rewrite, script/docs cleanup, convergence)
4. `migration/MAP.csv` — 8 entries covering all files with verification commands
5. `migration/RATCHETS.yaml` — 7 ratchets with explicit patterns and scopes
6. `migration/SHIP_CHECKLIST.md` — exact verification commands, no placeholders, no manual-only checks
7. `migration/AUDIT.md` — full audit with inventory, anti-pattern measurements, translation guide
8. `HANDOFF.md` — session handoff with status, blockers, and next steps
9. `transcript.md` — this file
10. `user_notes.md` — uncertainties
