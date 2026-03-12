# Ship Checklist

Use this file to define what "ready to ship" means for this migration before implementation starts. Replace placeholders with project-specific commands and scenarios.

## Automated Release Gates
- [ ] `./guard.sh`
- [ ] `<lint command>`
- [ ] `<typecheck command>`
- [ ] `<test command>`
- [ ] `<build command>`
- [ ] `<deterministic replay command(s)>`
- [ ] `<smoke test command(s)>`

## Residue Sweep
- [ ] Every completed slice's `residue_queries` return zero matches
- [ ] No temporary adapters, migration-only scripts, scratch files, or debug flags remain
- [ ] No stale symbols, paths, or deprecated imports remain in code, tests, docs, or config
- [ ] No migration-only TODO/FIXME/HACK markers remain unless explicitly waived

## Dependencies and Tooling
- [ ] Unused dependencies removed
- [ ] Lockfiles, scripts, and CI workflows reconciled
- [ ] Feature flags and env fallbacks for removed architecture deleted or explicitly retained

## Docs and Operational Surfaces
- [ ] README and developer docs describe the new architecture
- [ ] ADRs / decisions / runbooks reflect the migration outcome
- [ ] Env examples, dashboards, and operational docs reference the correct paths and commands

## Manual-Only Checks
<!-- Only list checks automation cannot fully cover: visual QA, hardware behavior, third-party flows, etc. -->
- [ ] `<manual check>`

## Ship Decision
- Ready to ship: `yes` / `no`
- Remaining blockers:
  - `<blocker or None>`
- Evidence summary:
  - `<key command outputs or links to artifacts>`
