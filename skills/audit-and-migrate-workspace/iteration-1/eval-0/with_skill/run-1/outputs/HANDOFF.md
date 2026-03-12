## Handoff - 2026-03-11

### Changed
- Audited the entire fixture repo at `/Users/petepetrash/Code/claude-code-setup/skills/audit-and-migrate/evals/fixtures/legacy-auth-service` without modifying it.
- Produced the migration control plane artifacts under `outputs/migration/`: `CHARTER.md`, `DECISIONS.md`, `SLICES.yaml`, `MAP.csv`, `SHIP_CHECKLIST.md`, and `AUDIT.md`.
- Documented release-gate failures, anti-pattern budgets, cleanup ownership, and a final convergence slice.

### Now True
- The migration mission, invariants, non-goals, ship gate, and critical workflows are explicit.
- The repo's auth residue is quantified: `legacy_session=4`, `readLegacySession=3`, `admin=true=2`, `LEGACY_ENV=2`, `seed-legacy-auth=1`, and the mobile bearer-token rollout blocker is documented.
- The plan now treats docs, env, scripts, and tooling as first-class migration scope rather than follow-up cleanup.

### Remains
- No production code has been migrated yet.
- The release baseline still needs to be made runnable before later slices can prove correctness.
- Admin claim mapping and external client bearer-token readiness still need concrete implementation decisions.

### Shipping Blockers
- Legacy cookie auth is still active in code, tests, docs, env, and scripts.
- `npm test` and `npm run lint` fail because `vitest` and `eslint` are unavailable from the repo root.
- `npm run build` fails because `tsconfig.json` is missing.
- Docs state that mobile clients do not send bearer tokens yet.

### Next Steps
1. In the fixture repo, start `slice-001` by adding repo-local verification tooling: `guard.sh`, `tsconfig.json`, `eslint.config.js`, required devDependencies, and a lockfile.
2. Run `npm run lint`, `npm run build`, `npm test`, and `./guard.sh --status` until the baseline is green.
3. Start `slice-002` by rewriting `tests/users-auth.test.ts` to fail on token-only success, unauthorized failure, and the chosen admin-claim contract.
4. Implement token-only auth in `src/routes/users.ts` and `src/auth/token-auth.ts`, then close `slice-003` by deleting the legacy parser, legacy env keys, stale docs, and `scripts/seed-legacy-auth.sh`.
