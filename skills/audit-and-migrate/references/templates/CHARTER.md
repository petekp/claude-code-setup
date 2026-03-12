# Migration Charter

## Mission
<!-- One sentence: what are you migrating and why? -->


## Scope
<!-- What parts of the codebase are in scope? Be specific about directories, modules, or domains. -->


## Critical Workflows
<!-- Which user-visible workflows absolutely cannot regress? These should map to smoke/replay checks. -->


## External Surfaces
<!-- What lives outside the immediate code paths but can still break? Think env vars, public APIs, dashboards, webhooks, CLIs, data contracts, or partner integrations. -->


## Invariants
<!-- Things that must remain true throughout the entire migration. These are non-negotiable. -->
- All existing tests continue to pass
- No user-facing behavior changes unless explicitly noted in a slice


## Non-Goals
<!-- Things you are explicitly NOT doing. List them so scope creep has to argue against a written boundary. -->


## Guardrails
<!-- Process rules that govern how work is done -->
- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Every slice defines exact automated verification commands before implementation
- Reserve a final convergence slice for residue sweep and ship verification


## Ship Gate
<!-- What evidence is required before declaring the migration complete? -->
### Automated Checks
- `./guard.sh`

### Manual Checks
<!-- Only list checks automation cannot fully cover. -->

### Cleanliness Checks
- No temporary migration scripts, adapters, or flags remain in scope
- No stale docs, config, env examples, or CI references remain for removed architecture
- No migration-only TODO/FIXME/HACK markers remain unless explicitly waived
- Empty directories created by the migration are removed unless intentionally retained
