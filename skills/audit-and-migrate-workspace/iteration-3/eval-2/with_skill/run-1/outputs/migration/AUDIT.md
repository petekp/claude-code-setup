# Audit: Flaky Tests → Deterministic Tests Migration

## Method
Exhaustive manual inspection of all 6 files in the `flaky-tests-worker` fixture repository. Each file was read in full and classified by leverage and role in the flaky-test problem.

## Inventory

| File | Kind | Leverage | Role |
|------|------|----------|------|
| `src/retry_worker.py` | source | High | Production code. Already supports clock injection via `__init__(clock=time)`. No changes needed. |
| `tests/integration/test_retry_worker.py` | test | Low | Two tests: one timing-based (flaky), one shape-test of a helper. Both need rewriting/removal. |
| `tests/helpers/scenario_factory.py` | test-helper | Low | `Scenario` class and `make_retry_scenario` factory. Dead after test rewrite. |
| `docs/testing.md` | docs | Low | Documents retry-until-green workflow. Stale and misleading once tests are deterministic. |
| `scripts/run-flaky-tests.sh` | script | Low | Retries pytest until it passes. Vestigial once tests don't flake. |
| `pyproject.toml` | config | High | Project config with pytest pythonpath. Must remain valid. |

## Anti-Pattern Measurements

| ID | Pattern | Scope | Count | Problem |
|----|---------|-------|-------|---------|
| ratchet-001 | `time\.time\(\)` | `tests/` | 2 | Wall-clock measurement makes assertions timing-dependent |
| ratchet-002 | `time\.sleep\(` | `tests/` | 0 | Real sleep in tests (currently 0 — sleep happens via passed `clock` object) |
| ratchet-003 | `elapsed\s*>=` | `tests/` | 1 | Timing threshold assertion — non-deterministic |
| ratchet-004 | `make_retry_scenario` | `tests/` | 2 | Helper becomes dead code after test rewrite |
| ratchet-005 | `scenario_factory` | `.` (whole repo) | 2 | Module being deleted entirely |
| ratchet-006 | `run-flaky-tests` | `.` (whole repo) | 2 | Script being deleted entirely |
| ratchet-007 | `flaky` | `docs/` | 1 | Docs should not advise retrying flaky tests |

## Critical Workflows
1. **Retry execution** — `RetryWorker.run()` must execute exactly `max_attempts` iterations, calling `clock.sleep()` each time, and return the attempt count.

## Known Hotspots
- `test_retry_worker_waits_between_attempts` is the sole flaky test. It passes `time` as the clock and asserts `elapsed >= 0.6` (3 attempts × 0.2s sleep). Under CI load, sleep can overshoot or undershoot.
- `test_inline_scenario_shape` tests the shape of `Scenario` objects, not worker behavior. It's a test of the test helper, not of production code.

## Hard Conclusions
1. **The fix is trivial because clock injection already exists.** `RetryWorker.__init__` accepts a `clock` parameter. A `FakeClock` stub that records `sleep()` calls makes the test deterministic with zero production code changes.
2. **`scenario_factory.py` is dead weight.** Its only consumer is the flaky test and a self-referential shape test.
3. **`run-flaky-tests.sh` is a symptom, not a solution.** It masks flakiness by retrying. With deterministic tests, it's worse than useless — it's misleading.
4. **`docs/testing.md` actively misleads.** It tells developers to rerun flaky tests, normalizing non-determinism.

## Proposed Slices
1. **slice-001** — Replace timing-based test with FakeClock; delete `scenario_factory.py`, `tests/helpers/`, and `test_inline_scenario_shape`
2. **slice-002** — Delete `run-flaky-tests.sh`, `scripts/`, and rewrite `docs/testing.md`
3. **slice-003** — Convergence: final residue sweep and ship-gate execution

## Translation Guide

### Before (timing-based):
```python
worker = RetryWorker(clock=time)
started = time.time()
result = worker.run(max_attempts=3)
elapsed = time.time() - started
assert elapsed >= 0.6
```

### After (deterministic):
```python
class FakeClock:
    def __init__(self):
        self.sleep_calls = []
    def sleep(self, seconds):
        self.sleep_calls.append(seconds)

clock = FakeClock()
worker = RetryWorker(clock=clock)
result = worker.run(max_attempts=3)
assert result == 3
assert len(clock.sleep_calls) == 3
assert all(s == 0.2 for s in clock.sleep_calls)
```
