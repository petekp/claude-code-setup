# User Notes — Uncertainties

1. **ratchet-002 initial budget**: `time.sleep(` has 0 matches in `tests/` because the test passes real `time` as the clock object (so `clock.sleep(0.2)` in production code is the actual sleep call, but the grep for `time.sleep(` in `tests/` finds nothing). The flakiness comes from `time.time()` wall-clock assertions, not from `time.sleep()` appearing literally in test code. Budget set to 0 as a permanent guard.

2. **ratchet-004 count**: `make_retry_scenario` appears in `tests/helpers/scenario_factory.py` (definition) and `tests/integration/test_retry_worker.py` (import + call = 2 lines). The file `scenario_factory.py` itself is deleted wholesale in slice-001, so the budget of 2 refers to the references in the test file that must be removed.

3. **Empty directory cleanup**: The skill assumes `tests/helpers/` and `scripts/` will be empty after their sole files are deleted. If the fixture repo has hidden files (e.g., `__init__.py` in `tests/helpers/`), additional deletion targets may be needed. No `__init__.py` was observed during inspection.
