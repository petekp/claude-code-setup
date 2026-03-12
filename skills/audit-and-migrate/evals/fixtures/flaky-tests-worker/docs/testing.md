# Testing notes

The integration tests use `time.sleep()` and wall-clock assertions because the worker talks to real clocks.
If they get flaky in CI, rerun `scripts/run-flaky-tests.sh` until they pass.
