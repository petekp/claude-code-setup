# Ship Checklist

## Automated Release Gates
- [ ] `./guard.sh` — all ratchets at 0, no denylist violations, no unmapped files
- [ ] `npm run lint` — no lint errors
- [ ] `npm run build` — compiles without errors
- [ ] `npm test` — all tests pass

## Residue Sweep
- [ ] `rg "readLegacySession" src/ tests/` returns 0 matches
- [ ] `rg "LegacyUser" src/` returns 0 matches
- [ ] `rg "legacy_session" src/ tests/ docs/ scripts/` returns 0 matches
- [ ] `rg "import.*legacy-auth" src/ tests/` returns 0 matches
- [ ] `rg "LEGACY_" .` returns 0 matches
- [ ] `rg "seed-legacy-auth" docs/` returns 0 matches
- [ ] `rg 'source.*legacy' src/ tests/` returns 0 matches
- [ ] `rg "TODO|FIXME|HACK" src/ tests/ docs/` returns 0 matches (or only pre-existing non-migration markers)
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] `src/auth/legacy-auth.ts` does not exist
- [ ] `scripts/seed-legacy-auth.sh` does not exist
- [ ] `scripts/` directory does not exist (empty after seed script removal)

## Dependencies and Tooling
- [ ] No unused dependencies in package.json
- [ ] npm scripts (`test`, `lint`, `build`) all function correctly

## Docs and Operational Surfaces
- [ ] `docs/auth.md` describes token-based auth only — no references to cookies, legacy sessions, or seed scripts
- [ ] `.env.example` contains only `TOKEN_AUDIENCE` — no `LEGACY_AUTH_SECRET` or `LEGACY_COOKIE_NAME`
- [ ] No other docs or config reference the legacy auth architecture

## Manual-Only Checks
- [ ] Review `docs/auth.md` for accuracy and completeness describing token auth
- [ ] Confirm no commented-out code blocks remain in any source file
- [ ] Confirm no empty directories exist after file deletions

## Ship Decision
- Ready to ship: `pending`
- Remaining blockers:
  - All slices must reach `done` status
- Evidence summary:
  - guard.sh output, npm test output, npm run lint output, npm run build output, rg sweep results
