# Handoff — 2026-03-11

## Changed
- Completed Phase 1 (Audit) for legacy-auth-service fixture repo
- Created all control plane artifacts: CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, SHIP_CHECKLIST.md, AUDIT.md
- Recorded 3 architecture decisions (token-only auth, defer package rename, stub verification acceptable)
- Defined 3 slices: 2 implementation + 1 convergence

## Now True
- Complete inventory of all 8 files with leverage assessments
- Anti-pattern metrics baselined: 13 legacy references across 7 files
- Ratchet budgets defined for 4 anti-pattern categories
- Ship gate defined with exact commands and residue queries
- Convergence slice reserved (slice-003) for final residue sweep

## Remains
- slice-001 (token-only auth migration) — proposed, ready to start
- slice-002 (docs/scripts/config cleanup) — proposed, depends on slice-001
- slice-003 (convergence) — proposed, depends on slice-001 and slice-002
- Guard script not yet written (would be first action in Phase 2)

## Shipping Blockers
- Migration not yet executed — control plane only

## Next Steps
1. Write `guard.sh` with ratchet budgets from the audit
2. Run `./guard.sh --status` to confirm baseline counts match audit
3. Mark slice-001 as `in_progress` in SLICES.yaml
4. Write failing token-only tests in `tests/users-auth.test.ts`
5. Refactor `src/routes/users.ts` to token-only, delete `src/auth/legacy-auth.ts`
6. Run `npx vitest run` and `./guard.sh` to verify slice-001
