# User Notes — Uncertainties

1. **Ratchet counts are based on file content inspection, not live grep execution.** The fixture is read-only so counts were derived from reading file contents. Budgets should be calibrated with actual `rg` runs at the start of Phase 2. Minor discrepancies are possible if string matching behaves differently than line-level content inspection (e.g., if a pattern appears twice on one line).

2. **Missing config files.** `package.json` references `tsc -p tsconfig.json` and `eslint src tests` but neither `tsconfig.json` nor an ESLint config file exists in the fixture. The `npm run lint` and `npm run build` ship gate checks may fail due to missing config rather than code issues. Unclear if this is intentional fixture minimalism or an oversight.

3. **Stub implementations.** Both `readLegacySession` and `verifyAccessToken` return hardcoded data (no real cookie parsing or JWT verification). The migration plan treats these as-is. If real token verification is expected post-migration, that's a separate scope item not covered by this charter.

4. **No CI pipeline exists.** The guard script pattern assumes CI enforcement, but the fixture has no CI configuration. The guard script would need to be run manually or wired into a pre-commit hook.

5. **Empty scripts/ directory.** After deleting `seed-legacy-auth.sh`, the `scripts/` directory should be removed. If other tooling or CI expects this directory to exist, that could be a minor issue. No evidence of such dependency was found.
