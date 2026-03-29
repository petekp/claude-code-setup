# Layer 1 — Structural Verification

## Overview
Layer 1 translates tree-sitter AST facts from Rust and Swift into a relational database, then encodes declarative architectural constraints as Z3 formulas. It runs on every edit (PostToolUse) and targets ownership, boundary, and pattern violations that can be decided in ~200 ms.

## Fact extraction
- **Sources:** `.rs` and `.swift` files inside the project.
- **AST walking:** The extractor loads the tree-sitter Rust and Swift grammars and walks every changed file, emitting flat tuples.
- **Fact types:** `module(name, lang, path)`, `defines_fn(module, fn, visibility)`, `calls(caller, callee)`, `imports(module, imported)`, `has_pub_fn`, `contains_literal(file, literal)`, `type_def(module, type, visibility)`, plus Swift-specific `implements(module, protocol)` and cross-language `type_crosses_ffi(type_name)` facts.
- **Metadata:** Each run stores `{ commit, timestamp, files_parsed }` for cache invalidation.
- **Incremental mode:** With `--files` the extractor re-parses only those files. With `--incremental` it diffs `git diff --name-only` against the cached commit hash; if git is unavailable it falls back to filesystem mtimes.

## Constraint encoding
- Constraints live in `.verifier/structural.yaml` and are authored with selectors (`only`, `modules_in`, `modules_matching`, `all_modules`), assertions (`may`, `must`, `must_not`), and optional `except` lists.
- Each fact type becomes a Z3 `Function` or predicate (`calls: Module × Module → Bool`, `contains_literal: File × Literal → Bool`, etc.).
- Rules become quantified formulas. For example, `only: "TmuxRouter" may: "reference_tmux_literal"` asserts that for any module that references a tmux literal, that module must equal `TmuxRouter`.
- Patterns such as `call_pattern` compile to regular expressions and are matched against fact strings before being asserted.

## Bounded reachability
- To avoid fixed-point complexity, every call-graph query uses bounded unrolling (default depth 10). The extractor precomputes `calls` facts and the verifier conjures `path_1`, `path_2`, … predicates that assert reachability within the bound. Violation occurs when a path exists from a module to a forbidden fact.

## Counterexamples & reports
- SAT means a violation: the model includes the violating module, call path, and literal/line information pulled from facts.
- Unsat means the constraint holds.
- Reports include rule name, violation description, file/line of the fact, diagnosis, and (for agent output) a fix suggestion.
- Results persist under `.verifier/reports/last-run.json` for diagnostics and caching.

## Performance
- Fact extraction caches AST walk results across edits; only modified files are reparsed.
- Z3 formulas are guarded by reusable queries and run with `timeout` to keep the latency under ~200 ms.
