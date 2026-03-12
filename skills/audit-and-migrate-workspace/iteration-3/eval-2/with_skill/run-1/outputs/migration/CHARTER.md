# Migration Charter

## Mission
Replace timing-based flaky tests with deterministic tests using a fake clock, then remove all dead helpers, scripts, and docs that exist only to support the flaky-test workflow.

## Scope
- `src/retry_worker.py` — production code (already supports clock injection, no changes needed)
- `tests/integration/test_retry_worker.py` — flaky timing-based tests to rewrite
- `tests/helpers/scenario_factory.py` — dead helper to delete
- `scripts/run-flaky-tests.sh` — dead retry script to delete
- `docs/testing.md` — stale testing docs to rewrite

## Critical Workflows
- `RetryWorker.run()` executes the correct number of retry attempts
- Each attempt invokes `clock.sleep()` exactly once
- The worker returns the final attempt count

## External Surfaces
- `pyproject.toml` pytest configuration (pythonpath setting must remain valid)
- No public APIs, env vars, dashboards, webhooks, or CLI entrypoints

## Invariants
- All existing tests continue to pass (rewritten tests cover the same behavioral contracts)
- No user-facing behavior changes
- `RetryWorker` production code is not modified

## Non-Goals
- Changing `RetryWorker` production logic or its clock injection interface
- Adding new retry strategies or features
- Introducing a test framework beyond pytest

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
- `./guard.sh` passes with all ratchets at 0
- `pytest tests/ -q` passes

### Manual Checks
- None — all checks are automatable

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain
- `scripts/` directory removed if empty after script deletion
- `tests/helpers/` directory removed if empty after helper deletion
