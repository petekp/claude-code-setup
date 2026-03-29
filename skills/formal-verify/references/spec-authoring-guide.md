# Spec Authoring Guide

## Agent-assisted workflow
1. The user describes intent in natural language (e.g., “Only RuntimeClient crosses the FFI boundary”).
2. The agent proposes a formal rule (YAML, Z3Py, or TLA+), explains it in plain English, and asks for confirmation.
3. The user reviews, requests tweaks, and approves.
4. The agent adds the approved rule to `.verifier/structural.yaml`, `.verifier/specs/`, or `.verifier/elegance.yaml` as appropriate.

## Structural constraints (YAML templates)
- **Ownership template:**
  ```yaml
  ownership:
    - rule: "exclusive_tmux_access"
      description: "Only TmuxRouter may reference tmux literals"
      constraint:
        only: "TmuxRouter"
        may: "reference_tmux_literal"
  ```
- **Boundary template:**
  ```yaml
  boundaries:
    - rule: "ffi_gateway"
      constraint:
        only: "RuntimeClient"
        may: "import:CapacitorCore"
  ```
- **Pattern template:**
  ```yaml
  patterns:
    - rule: "driver_protocol"
      constraint:
        modules_matching: "*TerminalDriver"
        must: "implement:TerminalDriver"
  ```
- **Migration template:**
  ```yaml
  migration:
    - rule: "no_legacy_activation"
      constraint:
        all_modules: true
        must_not: "reference:parallel_activation"
  ```

## Z3Py spec conventions
- Each spec defines `verify(facts)` and returns `list[Violation]`.
- Use `facts["calls"]`, `facts["contains_literal"]`, and cross-language facts to model contracts.
- Encode complex helpers declaratively:
  ```python
  def snapshot_fields(snapshot):
      return [FieldSort(), …]
  ```
- Always include a diagnosis and fix suggestion when returning violations so the output matches Layer 1.

## TLA+ spec conventions
- Start with `---- MODULE Foo ----`.
- Declare `VARIABLES`, `CONSTANTS`, `Init`, `Next`, and invariants (`Inv`).
- Add `Spec == Init /\ [][Next]_vars` and invariants with `THEOREM Spec => []Inv`.
- Provide a `.cfg` file specifying bounds (e.g., session count, max timestamps) for Apalache.

## Translating intents
- **“Only X should do Y” →** Ownership YAML rule with `only` + `may`.
- **“No stale requests” →** TLA+ invariant: `NoStaleActivation == active /= NULL => ...`.
- **“Data crosses unchanged” →** Z3Py equality on `rust_wrote` vs `swift_read`.

## Spec evolution
- When architecture changes (e.g., `CLAUDE.md` updates), the agent identifies changed constraints by diffing `.verifier/structural.yaml` vs new intent.
- Drift detection warns when `CLAUDE.md` mentions a rule absent from YAML, and proposes new ones.
- To update a spec: modify the existing YAML/TLA+/Z3Py file, rerun `verify.sh`, and document why the rule changed in the spec header comments.
