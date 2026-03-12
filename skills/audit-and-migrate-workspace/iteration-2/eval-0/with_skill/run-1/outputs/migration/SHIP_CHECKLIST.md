# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at zero, no denylist violations, no residue
- [ ] `npx eslint src tests` — zero lint errors
- [ ] `npx tsc -p tsconfig.json` — zero type errors
- [ ] `npx vitest run` — all tests pass

## Residue Sweep
- [ ] `rg 'readLegacySession' src/ tests/` returns zero matches
- [ ] `rg 'LegacyUser' src/ tests/` returns zero matches
- [ ] `rg 'legacy_session' src/ tests/ docs/ scripts/` returns zero matches
- [ ] `rg 'import.*legacy-auth' src/ tests/` returns zero matches
- [ ] `rg 'seed-legacy-auth' .` returns zero matches
- [ ] `rg 'LEGACY_AUTH_SECRET' .` returns zero matches
- [ ] `rg 'LEGACY_COOKIE_NAME' .` returns zero matches
- [ ] `rg 'source: "legacy"' src/` returns zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No migration-only TODO/FIXME/HACK markers remain

## Deletion Verification
- [ ] `src/auth/legacy-auth.ts` does not exist
- [ ] `scripts/seed-legacy-auth.sh` does not exist

## Dependencies and Tooling
- [ ] No unused dependencies introduced
- [ ] No orphaned scripts remain

## Docs and Operational Surfaces
- [ ] `docs/auth.md` describes token-based auth (bearer tokens), not cookie auth
- [ ] `.env.example` contains only token-relevant variables (`TOKEN_AUDIENCE`)
- [ ] No docs reference `seed-legacy-auth.sh` or legacy cookie flow

## Manual-Only Checks
- [ ] Review complete migration diff as a release candidate — no accidental churn, backup files, commented-out code, or stray logs
- [ ] Confirm `package.json` name retention is intentional (Decision 2)

## Ship Decision
- Ready to ship: `pending`
- Remaining blockers:
  - Migration not yet executed (control plane only)
- Evidence summary:
  - Guard script, test suite, lint, and typecheck must all pass post-implementation
