# Migration Charter

## Mission
<!-- One sentence: what are you migrating and why? -->


## Scope
<!-- What parts of the codebase are in scope? Be specific about directories, modules, or domains. -->


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
