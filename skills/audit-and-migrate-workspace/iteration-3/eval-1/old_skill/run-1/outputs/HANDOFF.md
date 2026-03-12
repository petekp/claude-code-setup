## Handoff — 2026-03-11

### Changed
- Resumed migration from HANDOFF dated 2026-02-28
- Hardened control plane: added SHIP_CHECKLIST.md, expanded SLICES.yaml with slices 003–004, added denylist patterns and deletion targets
- Wrote AUDIT.md with anti-pattern counts and ratchet budgets
- Added Decisions 2–4 to DECISIONS.md (env bridge retention, env bridge removal plan, docs cleanup plan)
- Updated MAP.csv with all four slices

### Now True
- slice-001 (page views) confirmed done and in production
- slice-002 (signup) is in_progress with clear completion criteria: add trackSignup to analytics-client.ts, migrate call sites, delete legacy-analytics.ts
- slice-003 (env bridge removal) and slice-004 (docs cleanup) are proposed with explicit denylist patterns
- SHIP_CHECKLIST.md defines all residue sweep queries and manual checks needed before shipping
- Ratchet budgets established for all legacy patterns

### Remains
- slice-002: Finish signup migration (add trackSignup, migrate call sites, delete legacy-analytics.ts)
- slice-003: Remove LEGACY_ANALYTICS_WRITE_KEY and ENABLE_LEGACY_ANALYTICS_BRIDGE from env.ts
- slice-004: Update docs/analytics-migration.md, remove README legacy references, final residue sweep
- Dashboard parity for signup events not yet verified

### Next Steps
1. Complete slice-002: add `trackSignup(email)` to `analytics-client.ts`, migrate all call sites away from `trackLegacySignup`, delete `legacy-analytics.ts`
2. Mark slice-002 done, start slice-003: remove legacy env vars from `env.ts`
3. Mark slice-003 done, start slice-004: update docs, run full residue sweep
4. Run SHIP_CHECKLIST.md to confirm ready-to-ship
