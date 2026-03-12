# Migration Charter

## Mission
Replace timing-based flaky tests with deterministic tests using a fake clock, and clean up all dead helpers, scripts, and docs that supported the flaky approach.

## Scope
- `tests/integration/test_retry_worker.py` — the flaky test file
- `tests/helpers/scenario_factory.py` — test helper (assess for removal)
- `scripts/run-flaky-tests.sh` — retry-until-pass script
- `docs/testing.md` — stale testing documentation
- `src/retry_worker.py` — read-only reference (already supports clock injection)

## Invariants
- All existing tests continue to pass (deterministic replacements must cover the same behavior)
- `RetryWorker` production code is unchanged — it already accepts a clock dependency
- No user-facing behavior changes

## Non-Goals
- Refactoring `RetryWorker` internals or its public API
- Adding new retry strategies or features
- Changing `pyproject.toml` dependencies beyond what's needed for testing

## Guardrails
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
