# Migration Charter

## Mission
Replace timing-based flaky tests with deterministic tests by injecting a fake clock, and clean up dead helpers, scripts, and docs that exist only to paper over flakiness.

## Scope
- `src/retry_worker.py` — production code (already supports clock injection)
- `tests/integration/test_retry_worker.py` — timing-dependent test assertions
- `tests/helpers/scenario_factory.py` — test helper (evaluate for retention)
- `scripts/run-flaky-tests.sh` — retry-on-failure band-aid script
- `docs/testing.md` — stale testing documentation that endorses flaky retries

## Critical Workflows
- `RetryWorker.run()` executes the correct number of attempts and returns the count
- Sleep is called between each attempt (behavioral contract, not wall-clock timing)

## Invariants
- All existing tests continue to pass
- `RetryWorker` production behavior is unchanged — same API, same semantics
- Clock injection via `clock` parameter remains the supported test seam
- No user-facing behavior changes

## Non-Goals
- Refactoring `RetryWorker` internals beyond what's needed for deterministic testing
- Adding new retry features (backoff, jitter, etc.)
- Changing the production `time.sleep` behavior
- Adding CI pipeline configuration

## Guardrails
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Every slice defines exact automated verification commands before implementation
- Reserve a final convergence slice for residue sweep and ship verification

## Ship Gate
### Automated Checks
- `./guard.sh` passes with zero violations
- `pytest tests/ -q` passes with all tests green
- All ratchet budgets at 0

### Manual Checks
- Review test output to confirm no wall-clock timing appears in test assertions

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain unless explicitly waived
- `scripts/run-flaky-tests.sh` is deleted
- `docs/testing.md` is updated to describe deterministic testing approach
