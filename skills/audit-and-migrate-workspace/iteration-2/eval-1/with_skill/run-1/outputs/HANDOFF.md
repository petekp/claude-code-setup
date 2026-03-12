## Handoff — 2026-03-11

### Changed
- Hardened CHARTER.md with critical workflows, ship gate, and cleanliness checks
- Extended DECISIONS.md with Decision 2 (slice-001 deletion gap) and Decision 3 (env/docs slice)
- Rebuilt SLICES.yaml with full field coverage: verification_commands, residue_queries, denylist_patterns, deletion_targets for all slices
- Completed MAP.csv with all 6 files in scope (code, config, docs)
- Created SHIP_CHECKLIST.md with exact automated and manual release gates
- Created AUDIT.md with metrics, leverage assessment, hotspots, and ratchet budgets

### Now True
- All control plane artifacts exist and are internally consistent
- Slice-001 (page view migration) is done but has a known deletion gap (absorbed by slice-002)
- Slice-002 (signup migration) is in_progress with clear verification criteria
- Slice-003 (env/docs cleanup) and slice-004 (convergence) are proposed and ready to start in order
- Ratchet budgets are calibrated to actual counts: trackLegacy=2, LEGACY_ANALYTICS_WRITE_KEY=2, ENABLE_LEGACY_ANALYTICS_BRIDGE=2, legacy-analytics=2

### Remains
- Slice-002: add trackSignup to analytics-client.ts, migrate call sites, delete legacy-analytics.ts
- Slice-003: prune LEGACY_ANALYTICS_WRITE_KEY and ENABLE_LEGACY_ANALYTICS_BRIDGE from env.ts, rewrite docs
- Slice-004: convergence sweep, execute SHIP_CHECKLIST.md, write final ship decision

### Shipping Blockers
- legacy-analytics.ts still exists (blocks ship)
- trackSignup not yet in analytics-client.ts (blocks ship)
- Legacy env vars still in env.ts (blocks ship)
- docs/analytics-migration.md still describes legacy state (blocks ship)

### Next Steps
1. Mark slice-002 in_progress (already marked), implement trackSignup in analytics-client.ts
2. Find and migrate all call sites of trackLegacySignup
3. Delete packages/web/src/lib/legacy-analytics.ts
4. Run slice-002 verification_commands to confirm
5. Close slice-002, start slice-003
