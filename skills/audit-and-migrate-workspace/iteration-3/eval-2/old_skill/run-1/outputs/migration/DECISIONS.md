# Migration Decisions

## Decision 1: Use a fake clock stub instead of mocking
**Date:** 2026-03-11
**Status:** Accepted
**Context:** `RetryWorker.__init__` already accepts `clock=time` via dependency injection. We can pass a stub object with a no-op `sleep` method instead of using `unittest.mock` or real `time`.
**Decision:** Create a minimal `FakeClock` class inline in the test file (or as a simple fixture) that records sleep calls without actually sleeping. This makes tests deterministic and fast.
**Rationale:** The dependency injection is already in place — no production code changes needed. A stub is simpler and more explicit than mock patching.

## Decision 2: Delete `make_retry_scenario` and `Scenario` class
**Date:** 2026-03-11
**Status:** Accepted
**Context:** `Scenario` is only used in two places: `test_retry_worker_waits_between_attempts` (which uses `make_retry_scenario()`) and `test_inline_scenario_shape` (which tests the `Scenario` class itself). After making tests deterministic, the factory adds indirection without value — test parameters can be inline constants.
**Decision:** Delete `tests/helpers/scenario_factory.py` entirely. Inline the test parameters. Remove `test_inline_scenario_shape` as it only tested the deleted helper.
**Rationale:** The helper exists to support the flaky pattern. Without it, tests are simpler and more readable.

## Decision 3: Delete `scripts/run-flaky-tests.sh`
**Date:** 2026-03-11
**Status:** Accepted
**Context:** The script's sole purpose is `pytest ... || pytest ...` — retry until pass. With deterministic tests, retrying is unnecessary.
**Decision:** Delete the script entirely and add a denylist pattern for it.
**Rationale:** Retry-until-pass scripts mask test quality problems. Once tests are deterministic, this script is dead code.

## Decision 4: Rewrite `docs/testing.md` to reflect deterministic approach
**Date:** 2026-03-11
**Status:** Accepted
**Context:** The doc says "tests use `time.sleep()` and wall-clock assertions" and advises rerunning until pass. This is actively misleading after migration.
**Decision:** Rewrite to describe the fake clock approach. Remove all references to flaky tests and retry scripts.
**Rationale:** Stale docs describing removed architecture mislead future developers and agents.
