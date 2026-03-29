# Layer 2 — Behavioral Verification

## Engines & scope
- **TLA+/Apalache** handles temporal/state properties (liveness, interleavings, invariants spanning sequences of states). It runs on slice checkpoints and pre-commit for state machines such as activation flows or driver concurrency.
- **Z3Py specs** cover data contracts, cross-boundary protocols, and arithmetic invariants that involve relationships between facts (e.g., snapshot immutability). Each spec lives in `.verifier/specs/` alongside supporting data.

## When to pick which tool
| Situation | Engine |
|-----------|--------|
| Property over sequences of states, eventual behavior, concurrent interleavings | TLA+/Apalache |
| Data contracts, type compatibility, arithmetic or deterministic contract | Z3Py |
| Invariant on both Rust and Swift code (snapshot equality, reducer validity) | Z3Py |
| Safety of activation coordinator, driver mutual exclusion | TLA+/Apalache |

## Writing a Z3Py spec
- Each file defines `verify(facts)` and returns `list[Violation]`. The `facts` dict comes directly from `extract-facts.py`.
- Specs create Z3 `Solver()` instances, add assertions, call `.check()`, and build counterexamples via `model()`.
- Use the supplied `Violation(rule, counterexample, diagnosis, fix)` helpers to keep output uniform.
- The spec author references fact keys such as `calls`, `type_crosses_ffi`, and literal matches to assert cross-boundary contracts.

## TLA+ spec structure
- Specs begin with `---- MODULE Name ----` and declare `VARIABLES`, `CONSTANTS`, `Init`, `Next`, and invariants (`Inv`).
- `apalache-mc check` translates the module into SMT queries that use Z3 under the hood.
- Config files (`*.cfg`) declare bounds (constants, `CONSTANTS`, `INIT`, `NEXT`). When missing, the runner supplies sane defaults.
- Counterexample traces include the sequence of states leading to violation, readable via `apalache-mc replay`.

## Cross-boundary coordination
- Z3Py specs mirror data relationships (e.g., `rust_wrote`, `swift_read`, `swift_mutates`) and load `type_crosses_ffi` facts to focus the assertion scope.
- TLA+ specs model high-level controllers (activation coordinator, terminal drivers) so temporal invariants wrap around the same architectural patterns described in `CLAUDE.md`.

## Integration details
- `verify-behavioral.py` loads all `*.py` specs via `importlib`, isolates them per module, invokes `verify(facts)`, and aggregates violations.
- `run-apalache.sh` enumerates `*.tla` files, runs `apalache-mc check`, parses output, and formats trace-based counterexamples.
- Both scripts share the same output schema as structural checks so the unified runner can serialize them consistently.
