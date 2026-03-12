# Audit: Flaky Tests Worker — Timing-Based Test Migration

## Method
Exhaustive read of all files in the fixture repo. Classified each file by leverage (high/medium/low) and cataloged all timing-related anti-patterns via pattern matching.

## Inventory

| File | Kind | Leverage | Assessment |
|------|------|----------|------------|
| `src/retry_worker.py` | Production code | **High** | Well-designed. Already accepts `clock` parameter for injection. No changes needed. |
| `tests/integration/test_retry_worker.py` | Test | **Low** | Uses wall-clock `time.time()` and `assert elapsed >= 0.6`. Root cause of flakiness. Must be rewritten. |
| `tests/helpers/scenario_factory.py` | Test helper | **Medium** | Clean data holder. Retain as-is. |
| `scripts/run-flaky-tests.sh` | Script | **Low** | Band-aid retry wrapper (`pytest ... || pytest ...`). Delete after tests are deterministic. |
| `docs/testing.md` | Documentation | **Low** | Endorses flaky retries ("rerun until they pass"). Must be rewritten. |
| `pyproject.toml` | Config | **High** | Minimal, correct. No changes needed. |

## Anti-Pattern Measurements

| Pattern | Grep Command | Scope | Count | Problem |
|---------|-------------|-------|-------|---------|
| Wall-clock timing | `rg 'time\.time\(\)' tests/` | `tests/` | 2 | Non-deterministic elapsed-time measurement |
| Elapsed assertions | `rg 'elapsed\s*>=' tests/` | `tests/` | 1 | Timing-dependent pass/fail |
| Real clock in tests | `rg 'clock=time\b' tests/` | `tests/` | 1 | Injects real clock instead of fake |
| `time.sleep` in tests | `rg 'time\.sleep' tests/` | `tests/` | 0 (via worker) | Sleep happens in production code via injected clock |
| Retry script | `rg 'run-flaky-tests' .` | `.` | 1 | Band-aid for flaky tests |
| Flaky language in docs | `rg 'flaky\|rerun' docs/` | `docs/` | 2 | Documents workaround instead of fix |

## Ratchet Budgets (Initial)

| Ratchet | Pattern | Scope | Budget |
|---------|---------|-------|--------|
| Wall-clock timing in tests | `time\.time\(\)` | `tests/` | 2 |
| Elapsed assertions in tests | `elapsed\s*>=` | `tests/` | 1 |
| Real clock injection in tests | `clock=time\b` | `tests/` | 1 |
| Retry script references | `run-flaky-tests` | `.` | 1 |
| Flaky/rerun language in docs | `flaky\|rerun` | `docs/` | 2 |

## Critical Workflows and Hotspots

**Critical workflow:** `RetryWorker.run(max_attempts=N)` sleeps between each attempt and returns the final attempt count. Tests must verify this contract without depending on wall-clock timing.

**Hotspot:** `test_retry_worker_waits_between_attempts` — the single test function responsible for all timing flakiness. It measures elapsed wall-clock time across 3 sleep calls and asserts `>= 0.6s`.

**Key insight:** `RetryWorker.__init__` already accepts a `clock` parameter defaulting to the `time` module. The production code is well-designed for testability — only the tests fail to use this seam.

## Hard Conclusions

1. **The tests are the problem, not the production code.** `RetryWorker` already supports clock injection. The test ignores this and uses real `time`.
2. **A FakeClock stub is the correct fix.** It records `sleep()` calls without sleeping. Tests assert on call count/args instead of elapsed time.
3. **`scripts/run-flaky-tests.sh` is pure vestige.** It exists only to mask flakiness. Must be deleted, not retained "just in case."
4. **`docs/testing.md` actively misleads.** It tells developers to rerun until tests pass. After the migration, it should describe the deterministic approach.

## Guardrails Added
- Guard script with ratchet budgets for all measured anti-patterns
- Denylist patterns for removed artifacts (`run-flaky-tests`, `time.time()` in tests)
- Residue queries for each slice

## Ship Criteria
- All ratchet budgets at 0
- `pytest tests/ -q` passes
- `guard.sh` passes
- No references to deleted script
- Docs describe deterministic testing

## Manual-Only Verification
- Confirm test execution completes in sub-second (no real sleeps occurring)
- Review final diff for commented-out code or stray artifacts

## Proposed Slices
1. **slice-001:** Replace timing-based test with FakeClock deterministic test
2. **slice-002:** Delete flaky-test retry script and update testing docs
3. **slice-003:** (convergence) Final residue sweep, guard verification, and ship gate

## Translation Guide

### Before (flaky):
```python
worker = RetryWorker(clock=time)
started = time.time()
result = worker.run(max_attempts=3)
elapsed = time.time() - started
assert elapsed >= 0.6
```

### After (deterministic):
```python
fake_clock = FakeClock()
worker = RetryWorker(clock=fake_clock)
result = worker.run(max_attempts=3)
assert result == 3
assert fake_clock.sleep_calls == [0.2, 0.2, 0.2]
```

### FakeClock implementation:
```python
class FakeClock:
    def __init__(self):
        self.sleep_calls = []

    def sleep(self, seconds):
        self.sleep_calls.append(seconds)
```
