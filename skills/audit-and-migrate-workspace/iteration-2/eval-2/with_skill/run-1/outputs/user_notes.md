# User Notes — Uncertainties

1. **Empty scripts/ directory after deletion:** After deleting `scripts/run-flaky-tests.sh`, the `scripts/` directory will be empty. Decision needed: delete the empty directory or leave it. Recommendation: delete it in slice-002.

2. **tests/__init__.py files:** The fixture has no `__init__.py` files in `tests/` or `tests/helpers/`. Pytest discovers tests without them via `pyproject.toml`'s `pythonpath` setting, but adding `tests/helpers/fake_clock.py` may require an `__init__.py` in `tests/helpers/` depending on how imports resolve. Verify during slice-001 implementation.

3. **Scenario factory usage post-migration:** `make_retry_scenario()` returns a Scenario with `retries=3, expected_attempts=3`. After migration, the test still uses this for `max_attempts` and result assertion, but the primary value-add of the test shifts to FakeClock assertions. The factory remains useful but its role narrows.

4. **Guard script location:** The audit assumes `guard.sh` lives at the repo root. If the project has a different convention for scripts, adjust accordingly.

5. **No CI pipeline exists:** There is no `.github/workflows/` or equivalent. The guard script will be run manually or integrated into CI when one is added. This is not a blocker but means ratchets are advisory until CI exists.
