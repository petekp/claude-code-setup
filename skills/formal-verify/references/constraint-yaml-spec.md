# Structural Constraint YAML Schema

## Top-level categories
- `ownership`: rules about who may reference literals, call patterns, or import modules.
- `boundaries`: cross-layer or FFI enforcement (import gating, UniFFI entry points).
- `patterns`: protocol conformance, naming/pattern expectations.
- `migration`: legacy prohibitions (deprecated APIs or string literals).

Each rule entry includes:
```
- rule: "short_identifier"
- description: "Human-friendly explanation"
- constraint:
    <selector>: <value>
    <assertion>: <pattern>
    except: [optional exclusions]
```

## Structure keywords vs fact patterns
- **Selectors:**
  - `only`: single module or list (exact match).
  - `modules_in`: language (e.g., `rust`, `swift`), directory, or tagged set.
  - `modules_matching`: glob (supports `*`, `?`, character ranges).
  - `all_modules`: literal `true` to scope the entire corpus.
- **Assertions:**
  - `may`: the targeted module(s) are allowed the fact.
  - `must`: all selected modules must have the fact.
  - `must_not`: none of the selected modules may have the fact.
  - `except`: list of module names to skip even if they match the selector.

- **Fact pattern operators:**
  - `import`: direct import by module string (supports exact match or prefix).
  - `import_from`: import path beginning (e.g., `core/`).
  - `call_pattern`: glob-style pattern matching function names (`activate_*|resolve_*`).
  - `reference`: literal or symbol (supports `|` to list multiple tokens).
  - `implement`: interface or protocol names.
  - Custom patterns: defined by `references/constraint-yaml-spec.md` (extend parser by adding new tuple types in `extract-facts.py` and referencing from YAML).

## Composition rules
- `only` + `may`: “Only X may do Y.”
- `modules_in`/`modules_matching` + `must_not`: prohibits behavior for a set.
- `all_modules` + `must_not`: global forbiddance.
- `modules_matching` + `must`: ensures pattern adoption.
- `except` is allowed with all selectors except `all_modules`; it removes listed modules from the target set.

## Examples
- Ownership:
  ```yaml
  ownership:
    - rule: "exclusive_tmux_access"
      description: "Only TmuxRouter may reference tmux literals"
      constraint:
        only: "TmuxRouter"
        may: "reference_tmux_literal"
  ```
- Boundary:
  ```yaml
  boundaries:
    - rule: "uniffi_single_entry"
      constraint:
        only: "RuntimeClient"
        may: "import:CapacitorCore"
  ```
- Pattern:
  ```yaml
  patterns:
    - rule: "driver-protocol"
      constraint:
        modules_matching: "*TerminalDriver"
        must: "implement:TerminalDriver"
  ```
- Migration:
  ```yaml
  migration:
    - rule: "no-legacy-activation"
      constraint:
        all_modules: true
        must_not: "reference:parallel_activation|target_value"
  ```

## Custom fact patterns
To add a new fact:
1. Extend `extract-facts.py` to emit tuples (e.g., `resource_usage(module, metric)`).
2. Document the string syntax: `resource_usage:transactional`.
3. Reference it in YAML (`must_not: "resource_usage:tokio_block"`).

## Matching behavior
- `call_pattern` uses glob splitting by `|`. `*` matches any sequence; `?` matches a single character.
- For `modules_matching`, the glob is evaluated against the module name string. `*Core*` matches `CoreRouter` and `CoreClient`.
- `except` supports literal names or globs; applies after selector filtering.
