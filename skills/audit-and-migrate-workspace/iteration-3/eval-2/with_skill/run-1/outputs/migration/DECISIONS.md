# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Use a fake clock stub instead of time.sleep/time.time
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `test_retry_worker_waits_between_attempts` uses `time.sleep()` and wall-clock assertions (`elapsed >= 0.6`), making it timing-dependent and flaky in CI. `RetryWorker` already accepts a `clock` parameter, so injection is straightforward.
- **Decision:** Replace `time` with a lightweight `FakeClock` stub that records `sleep()` calls without blocking. Assert on call count and arguments instead of elapsed wall-clock time.
- **Alternatives considered:**
  - `unittest.mock.patch("time.sleep")` — viable but a stub object is simpler and matches the existing injection interface
  - `freezegun` — external dependency overkill for a single `sleep()` call
- **Consequences:** Tests become deterministic and fast. No dependency on wall-clock timing. The `FakeClock` is defined inline in the test file (no shared helper needed).
- **Supersedes:** none

## Decision 2: Delete scenario_factory.py entirely
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `tests/helpers/scenario_factory.py` provides `Scenario` and `make_retry_scenario`. After rewriting the timing test to use a fake clock, `make_retry_scenario` is no longer called. `Scenario` is only used in `test_inline_scenario_shape` which is itself a shape-test of the helper, not a behavioral test of the worker.
- **Decision:** Delete `scenario_factory.py`, the `tests/helpers/` directory (if empty), and `test_inline_scenario_shape`. The behavioral contract (correct attempt count) is covered by the rewritten deterministic test.
- **Alternatives considered:**
  - Keep `Scenario` for future use — violates YAGNI and leaves dead code
- **Consequences:** `tests/helpers/` directory is removed. Import of `scenario_factory` is removed from the test file.
- **Supersedes:** none

## Decision 3: Delete run-flaky-tests.sh and rewrite docs/testing.md
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `scripts/run-flaky-tests.sh` exists solely to retry flaky tests until they pass. `docs/testing.md` documents this retry-until-green workflow. Both become vestigial once tests are deterministic.
- **Decision:** Delete `scripts/run-flaky-tests.sh`, remove the `scripts/` directory (if empty), and rewrite `docs/testing.md` to describe the new deterministic testing approach.
- **Alternatives considered:**
  - Keep the script as a convenience wrapper — misleading since tests no longer flake
- **Consequences:** No retry-based test workflow remains. Docs accurately describe the current testing approach.
- **Supersedes:** none
