# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at 0, no denylist violations, no deletion targets remaining
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit` (typecheck)
- [ ] `npm run test`
- [ ] `npm run build`

## Residue Sweep
- [ ] Every completed slice's `denylist_patterns` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] `grep -r 'legacy' src/ tests/ docs/ scripts/ .env.example` returns zero matches
- [ ] `grep -r 'readLegacySession\|LegacyUser\|legacy-auth\|seed-legacy-auth\|LEGACY_AUTH_SECRET\|LEGACY_COOKIE_NAME\|legacy_session' .` returns zero matches (excluding migration control plane files)
- [ ] No migration-only TODO/FIXME/HACK markers remain

## Dependencies and Tooling
- [ ] Unused dependencies removed from package.json (none expected)
- [ ] No legacy-only scripts remain in `scripts/`
- [ ] `.env.example` contains only token-auth env vars

## Docs and Operational Surfaces
- [ ] `docs/auth.md` describes token-based auth exclusively
- [ ] `.env.example` references correct variable names for token auth
- [ ] No documentation references `legacy_session`, cookie-based auth, or `seed-legacy-auth.sh`

## Manual-Only Checks
- [ ] Confirm no external services or deployment configs reference legacy cookie auth

## Ship Decision
- Ready to ship: `no` (pending migration execution)
- Remaining blockers:
  - All three slices must reach `done` status
- Evidence summary:
  - guard.sh output, test results, grep sweep results
