## Handoff — 2026-03-11

### Changed
- Resumed in-flight migration (Decision 2) rather than restarting
- Hardened the control plane: created RATCHETS.yaml (4 ratchets), SHIP_CHECKLIST.md, AUDIT.md
- Expanded CHARTER.md with Critical Workflows, External Surfaces, and detailed Ship Gate
- Added Decision 2 (resume vs restart), Decision 3 (trackSignup function), Decision 4 (env bridge removal timing)
- Added slice-003 (env cleanup + docs) and slice-004 (convergence) to SLICES.yaml
- Backfilled missing fields on slice-001 and slice-002 (type, external_surfaces, residue_queries, verification_commands, denylist_patterns, manual_checks)
- Expanded MAP.csv to cover all files including env.ts, docs, and package.json

### Now True
- All control plane artifacts exist and are populated: CHARTER, DECISIONS, SLICES, MAP, RATCHETS, SHIP_CHECKLIST, AUDIT
- External surfaces are explicitly tracked: dashboards, ETL consumers, deploy pipelines, env contracts
- Every remaining task has an owning slice with defined verification commands
- Convergence slice (slice-004) is reserved for final residue sweep

### Remains
- slice-002 (in progress): add `trackSignup` to analytics-client.ts, migrate call sites, delete legacy-analytics.ts
- slice-003 (proposed): remove LEGACY_ANALYTICS_WRITE_KEY and ENABLE_LEGACY_ANALYTICS_BRIDGE from env.ts, rewrite docs
- slice-004 (proposed): execute full residue sweep and SHIP_CHECKLIST.md

### Shipping Blockers
- slice-002 not complete — legacy signup event still fires
- Dashboard parity unverified — downstream consumers may still expect legacy event names
- Deploy pipeline env vars not yet cleaned up
- Docs still describe the in-flight state

### Next Steps
1. Start slice-002 implementation: add `trackSignup(email: string, source: string)` to `analytics-client.ts`
2. Migrate all signup call sites from `trackLegacySignup` to `trackSignup`
3. Delete `packages/web/src/lib/legacy-analytics.ts`
4. Verify: `grep -r "trackLegacy" packages/` returns zero, legacy file is gone
5. Mark slice-002 done, start slice-003
