# Ship Checklist

Define ready-to-ship for the token-auth migration before implementation starts. The current baseline is not ship-ready; this checklist is the closeout gate.

## Automated Release Gates
- [ ] `./guard.sh --status`
- [ ] `./guard.sh`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] `rg -n "legacy_session|readLegacySession|LEGACY_AUTH_SECRET|LEGACY_COOKIE_NAME|seed-legacy-auth|source: \"legacy\"" .` returns zero matches
- [ ] `rg -n "TODO\(migration\)|FIXME\(migration\)|HACK\(migration\)|temporary auth|dual-auth|auth fallback" .` returns zero matches

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches.
- [ ] `src/auth/legacy-auth.ts` is deleted.
- [ ] `scripts/seed-legacy-auth.sh` is deleted.
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain.
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config.
- [ ] No migration-only TODO, FIXME, or HACK markers remain unless explicitly waived in `DECISIONS.md`.

## Dependencies and Tooling
- [ ] Repo-local tooling exists for `vitest`, `eslint`, and `typescript`.
- [ ] `tsconfig.json` exists and `npm run build` passes from the repo root.
- [ ] ESLint config exists and `npm run lint` passes from the repo root.
- [ ] Lockfile, scripts, and `guard.sh` are reconciled with the final token-only architecture.
- [ ] Feature flags and env fallbacks for legacy cookie auth are deleted or explicitly retained with an owner and exit condition.

## Docs and Operational Surfaces
- [ ] `docs/auth.md` describes bearer-token auth only.
- [ ] `.env.example` contains token-auth configuration only.
- [ ] Local QA instructions no longer mention cookie seeding.
- [ ] Any rollout notes for mobile or external clients reflect the token-only cutover.

## Manual-Only Checks
- [ ] Confirm mobile and other external clients now send bearer tokens before removing the cookie fallback.
- [ ] Confirm admin-capable user flows are represented through explicit token claims or scopes and still behave correctly.

## Ship Decision
- Ready to ship: `no`
- Remaining blockers:
  - Legacy cookie auth is still active in code, tests, docs, env, and scripts.
  - Release-gate tooling is not currently runnable from the repo root.
  - Mobile or external-client bearer-token readiness is unknown.
  - Admin claim mapping is not yet defined in the token contract.
- Evidence summary:
  - `npm test` currently fails with `sh: vitest: command not found`
  - `npm run lint` currently fails with `sh: eslint: command not found`
  - `npm run build` currently fails with `TS5058: The specified path does not exist: 'tsconfig.json'`
