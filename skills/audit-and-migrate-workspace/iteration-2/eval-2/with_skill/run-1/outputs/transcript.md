# Transcript — Flaky Tests Worker Migration Package

## What Was Inspected

1. **Skill methodology** — Read `audit-and-migrate/SKILL.md` and all reference templates (CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, SHIP_CHECKLIST.md, guard-script-pattern.md)
2. **Fixture repo structure** — Enumerated all files in `flaky-tests-worker/`: 6 files across `src/`, `tests/`, `scripts/`, `docs/`, and root config
3. **Production code** — `src/retry_worker.py`: a RetryWorker class with clock-injectable sleep, 3 attempts by default
4. **Test code** — `tests/integration/test_retry_worker.py`: 2 test functions, one using wall-clock `time.time()` to measure elapsed time and assert `>= 0.6`
5. **Test helpers** — `tests/helpers/scenario_factory.py`: Scenario data class and factory function
6. **Scripts** — `scripts/run-flaky-tests.sh`: retry-on-failure band-aid (`pytest ... || pytest ...`)
7. **Documentation** — `docs/testing.md`: endorses rerunning flaky tests as a workaround
8. **Config** — `pyproject.toml`: minimal project config with pytest pythonpath setting

## Anti-Patterns Measured

| Pattern | Scope | Count |
|---------|-------|-------|
| `time.time()` | tests/ | 2 |
| `elapsed >=` | tests/ | 1 |
| `clock=time` (real clock) | tests/ | 1 |
| `run-flaky-tests` references | . | 1 |
| `flaky\|rerun` in docs | docs/ | 2 |

## What Was Produced

All deliverables written to `outputs/migration/` and `outputs/`:

1. **migration/CHARTER.md** — Mission, scope, invariants, non-goals, ship gate
2. **migration/DECISIONS.md** — 3 architecture decisions (FakeClock, delete script, retain helper)
3. **migration/SLICES.yaml** — 3 slices with full metadata (touched_paths, denylist, residue_queries, verification_commands)
4. **migration/MAP.csv** — 8 entries covering all repo files
5. **migration/SHIP_CHECKLIST.md** — Exact commands for automated gates, ratchet verification, deletion verification, docs reconciliation, manual checks
6. **migration/AUDIT.md** — Full audit with inventory, anti-pattern measurements, ratchet budgets, critical workflows, translation guide
7. **HANDOFF.md** — Session state with next steps
8. **transcript.md** — This file
9. **user_notes.md** — Uncertainties
