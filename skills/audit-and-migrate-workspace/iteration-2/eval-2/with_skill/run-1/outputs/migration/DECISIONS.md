# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Use a FakeClock stub instead of mocking time module
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** Tests currently use `clock=time` (the real time module), then measure wall-clock elapsed time with `time.time()`. This is the root cause of flakiness — CI load can make `time.sleep(0.2)` take longer than expected, or system clock jitter can produce false failures.
- **Decision:** Create a `FakeClock` class that records sleep calls without actually sleeping. Tests assert on call count and arguments rather than elapsed wall-clock time.
- **Alternatives considered:**
  - `unittest.mock.patch('time.sleep')` — viable but less explicit; FakeClock makes the test intent clearer and the `RetryWorker` already accepts a `clock` parameter
  - Increasing timing tolerances (e.g., `assert elapsed >= 0.5`) — still non-deterministic, just less likely to fail
  - `freezegun` library — adds a dependency for a problem solvable with a 10-line stub
- **Consequences:** Tests run in microseconds instead of 600ms+. No flakiness from system load. FakeClock lives in test helpers.
- **Supersedes:** (none)

## Decision 2: Delete run-flaky-tests.sh and update docs/testing.md
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `scripts/run-flaky-tests.sh` exists solely to retry flaky tests. `docs/testing.md` documents this workaround and endorses it. Once tests are deterministic, both artifacts are vestigial and actively misleading.
- **Decision:** Delete `scripts/run-flaky-tests.sh` entirely. Rewrite `docs/testing.md` to describe the deterministic testing approach with FakeClock.
- **Alternatives considered:**
  - Keep the script "just in case" — violates anti-vestigial discipline; its existence implies tests are still flaky
  - Delete docs/testing.md entirely — some testing documentation is valuable; rewrite is better than deletion
- **Consequences:** No retry band-aid remains. Documentation accurately describes the testing approach.
- **Supersedes:** (none)

## Decision 3: Retain scenario_factory.py and Scenario class
- **Date:** 2026-03-11
- **Status:** Active
- **Context:** `tests/helpers/scenario_factory.py` provides `Scenario` and `make_retry_scenario()`. The `Scenario` class is a lightweight data holder used by both test functions. `make_retry_scenario()` provides a default scenario.
- **Decision:** Retain the helper. It's low-cost, already in use, and provides a clean separation between test data and test logic. Add `FakeClock` to the same helpers directory.
- **Alternatives considered:**
  - Inline scenario construction in each test — removes a useful abstraction for minimal gain
  - Move FakeClock into scenario_factory.py — mixing concerns; separate file is cleaner
- **Consequences:** Helper directory gains one file (`fake_clock.py`). Existing test structure is preserved.
- **Supersedes:** (none)
