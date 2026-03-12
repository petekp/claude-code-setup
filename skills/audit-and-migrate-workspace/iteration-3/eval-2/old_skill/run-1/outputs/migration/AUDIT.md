# Audit: Flaky Tests in retry_worker

## Method
Inspected all 6 files in the `flaky-tests-worker` fixture. Identified anti-patterns by reading test code, helper modules, scripts, and documentation. Counted pattern instances with scoped grep queries.

## Current Metrics

| Pattern | Grep Command | Scope | Count | Problem |
|---------|-------------|-------|-------|---------|
| `time\.time\(\)` | `grep -rE 'time\.time\(\)' tests/` | tests/ | 2 | Wall-clock measurement — non-deterministic |
| `elapsed\s*>=` | `grep -rE 'elapsed\s*>=' tests/` | tests/ | 1 | Timing threshold assertion — flaky under load |
| `make_retry_scenario` | `grep -rE 'make_retry_scenario' .` | repo | 2 | Factory only used by flaky test; dead after fix |
| `clock=time` in tests | `grep -rE 'clock=time' tests/` | tests/ | 1 | Passes real clock to worker; causes real sleeps |
| `run-flaky-tests` | `grep -rE 'run-flaky-tests' .` | repo | 1 | Retry-until-pass script reference |

## Leverage Assessment

### High Leverage (build on this)
- **`RetryWorker` clock injection** (`src/retry_worker.py:5`): The constructor already accepts `clock=time` as a parameter. This is the foundation for deterministic testing — pass a fake clock instead of the real one.
- **`pyproject.toml` test config**: Properly configured `pythonpath` for imports.

### Medium Leverage (keep but refactor)
- **`test_retry_worker.py`**: The test structure is fine; only the timing mechanism needs replacement.

### Low Leverage (replace or delete)
- **`scenario_factory.py`**: Adds indirection without value. `Scenario` wraps two ints. Inline the values.
- **`run-flaky-tests.sh`**: A `pytest || pytest` retry script. Masks the root cause.
- **`docs/testing.md`**: Documents the flaky approach and recommends rerunning. Actively harmful.
- **`test_inline_scenario_shape`**: Tests the helper class itself — circular value once helper is deleted.

## Hard Conclusions
1. The flakiness has a single root cause: `test_retry_worker_waits_between_attempts` passes `clock=time` (real clock) and then asserts `elapsed >= 0.6` using wall-clock time. Under CI load, `time.sleep(0.2)` can take longer or shorter, causing intermittent failures.
2. The fix is trivial because the production code already supports dependency injection. A 10-line `FakeClock` stub eliminates all timing dependence.
3. The `Scenario` class, `make_retry_scenario` factory, retry script, and testing docs all exist to support or cope with the flaky pattern. They are all dead weight after the fix.

## Guardrails Added
Ratchet queries (all scoped, all targeting budget 0 post-migration):

| Ratchet | Grep Command | Scope | Current Budget | Target |
|---------|-------------|-------|----------------|--------|
| Wall-clock calls | `grep -rE 'time\.time\(\)' tests/` | tests/ | 2 | 0 |
| Timing assertions | `grep -rE 'elapsed\s*>=' tests/` | tests/ | 1 | 0 |
| Dead factory | `grep -rE 'make_retry_scenario' .` | repo | 2 | 0 |
| Retry script refs | `grep -rE 'run-flaky-tests' .` | repo | 1 | 0 |

## Proposed Slices
1. **slice-001**: Replace timing-based test with deterministic fake clock test. Delete wall-clock assertions and scenario factory imports.
2. **slice-002**: Remove dead helpers (`scenario_factory.py`), dead scripts (`run-flaky-tests.sh`), and rewrite stale docs (`testing.md`).
3. **slice-003**: Add `guard.sh` with all ratchets at budget 0 as permanent regression guards.

## Translation Guide

### Before (timing-based)
```python
worker = RetryWorker(clock=time)
started = time.time()
result = worker.run(max_attempts=3)
elapsed = time.time() - started
assert elapsed >= 0.6
```

### After (deterministic)
```python
class FakeClock:
    def __init__(self):
        self.sleep_calls = []
    def sleep(self, duration):
        self.sleep_calls.append(duration)

clock = FakeClock()
worker = RetryWorker(clock=clock)
result = worker.run(max_attempts=3)
assert result == 3
assert clock.sleep_calls == [0.2, 0.2, 0.2]
```

### Edge Cases
- `FakeClock.sleep` must accept a single positional float argument to match `time.sleep` signature.
- The test should assert on the number and value of sleep calls, not elapsed wall time.
