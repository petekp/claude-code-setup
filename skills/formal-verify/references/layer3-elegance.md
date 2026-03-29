# Layer 3 — Elegance Auditor

## Metric categories
- **Complexity:** Cyclomatic complexity (radon/lizard), nesting depth, function length, file length, parameter count. Rust uses radon (Python-wrapped), Swift uses swiftlint plus custom tree-sitter walks for metrics that swiftlint misses (nesting, params).
- **Consistency:** Naming conventions (snake_case vs camelCase), uniform error handling styles, comment density around public APIs, and consistent pattern usage within similar modules.
- **Craft:** Duplicate logic detection (AST subtree similarity), unnecessary abstractions (wrappers that do nothing but delegate), over-engineering signals (traits with single implementor, unused configurability), and dead/unused code paths.

## Sub-module architecture
- `complexity.py` runs radon/lizard for Rust and Python helper scripts, falls back to optional tree-sitter analysis, and emits deductions when thresholds (from `elegance.yaml`) are exceeded.
- `consistency.py` uses naming heuristics, error handling pattern matching, and comment density checks to highlight drift between modules.
- `craft.py` performs AST similarity searches, identifies wrappers/delegates, and notes unused exports via tree-sitter traversal.
- `audit-elegance.py` loads these modules, merges deductions, and calculates an elegance grade.

## Scoring model
- Start at 100 points (grade A). Each violation deducts configurable weights (default: 5–15 points).
- Grades: A (90-100), B (80-89), C (70-79), D (60-69), F (<60).
- The script reports each deduction with file:line, severity, and suggestion.
- Minimum-grade threshold (default B) is enforced by the pre-commit hook; failing to meet it aborts the commit.

## Configuration (`.verifier/elegance.yaml`)
- `thresholds`: per-metric limits (cyclomatic_complexity: 10, nesting_depth: 4, function_length: 50, file_length: 500, parameter_count: 5).
- `exclude`: globs such as `*/tests/*` and `*/generated/*`.
- `weights`: override deduction severity per metric.
- `minimum_grade`: grade required for pre-commit gating.
- File-specific overrides: `overrides: { "src/state/*": { "function_length": 80 } }`.

## Grade semantics
- **A:** Clean structure; no craft-level violations.
- **B:** Small style issues or single metric exceeding threshold.
- **C:** Multiple moderate violations; hints to refactor.
- **D/F:** Repeated or serious issues (deep nesting, duplicates, unused APIs).
- Grades are always accompanied by the deduction list so humans know exactly where to act.

## Examples
- Deep nesting triggers a complexity deduction even if tests pass; we point to the line and suggest splitting the function.
- A wrapper that only forwards arguments without behavior yields a craft deduction and describes how to inline the call.
- Mixed naming conventions in the same folder produce a consistency warning with the suggested naming style.
