## Handoff — 2026-03-11

### Changed
- Created full migration control plane: CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, SHIP_CHECKLIST.md, AUDIT.md
- Defined 3 slices covering the complete migration from flaky to deterministic tests
- Established ratchet queries with explicit scopes and budgets

### Now True
- Audit phase is complete — all anti-patterns measured and documented
- Ratchet budgets defined (current counts frozen as starting budgets, target is 0 for all)
- Translation guide provides concrete before/after code for the primary migration pattern
- SHIP_CHECKLIST.md defines exact verification commands for every residue query

### Remains
- slice-001 (replace timing test with fake clock) — proposed, ready to start
- slice-002 (delete dead helpers/scripts/docs) — proposed, depends on slice-001
- slice-003 (add guard.sh) — proposed, depends on slice-001 and slice-002

### Next Steps
1. Mark slice-001 `in_progress` in SLICES.yaml
2. Create `FakeClock` stub and rewrite `test_retry_worker.py` per translation guide in AUDIT.md
3. Delete `test_retry_worker_waits_between_attempts` and `test_inline_scenario_shape`
4. Run `pytest tests/integration/test_retry_worker.py -v` to verify deterministic pass
5. Mark slice-001 `done`, proceed to slice-002
