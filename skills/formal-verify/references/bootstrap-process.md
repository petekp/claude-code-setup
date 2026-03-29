# Bootstrap Process

## Phase 1 — Install
- Run `scripts/install-deps.sh` to ensure Python 3.10+, `z3-solver`, `tree-sitter` (Rust & Swift grammars), `radon`, `lizard`, `swiftlint`, and Java 17+ (for Apalache).
- The script installs Apalache (`apalache-mc`) into `~/.local/bin`, configures `.verifier/` structure (`structural.yaml`, `elegance.yaml`, `specs/`, `facts/`, `reports/`), and starts the Apalache daemon (`apalache-mc server`) for faster Layer 2 runs.
- Troubleshooting: rerun the script if a dependency fails, ensure `swiftlint` is on `PATH`, and verify Java via `java -version`.

## Phase 2 — Discover
- The agent scans `CLAUDE.md`, `ARCHITECTURE.md`, `docs/`, and recent commits to map modules, unsafe patterns, and state machines.
- It computes import graphs, callable hierarchies, and identifies repeated textual cues (e.g., `tmux`, `CapacitorCore`).
- From this context it drafts candidate structural constraints (`.verifier/structural.yaml`) and behavioral specs (`.verifier/specs/*.tla` + `.py`).

## Phase 3 — Interview
- The agent walks the user through proposed rules in plain English, asking targeted questions like:
  1. “Should only `RuntimeClient` import `CapacitorCore`?”
  2. “When a stale activation request arrives, must we drop it?”
  3. “How should Rust snapshots behave on the Swift side?”
- The user responds with intents, not raw TLA+; the agent translates each intent to YAML, Z3Py, or TLA+ accordingly.
- After each round the agent summarizes the formal rule and asks for confirmation before committing it to the spec.

## Phase 4 — Validate
- A full `verify.sh` run exercises Layers 1–3, producing counterexamples, diagnostics, and an elegance grade.
- Results are stored in `.verifier/reports/last-run.json` for trending and caching.
- The agent shares the baseline violations and grade with the user, along with recommendations for the first fix.
- Re-running bootstrap is idempotent: it updates dependencies, preserves existing specs, and re-validates without overwriting custom rules.

## Post-bootstrap state
- `.verifier/structural.yaml`: project-specific ownership/boundary/pattern rules.
- `.verifier/specs/`: Z3Py and TLA+ files describing behavioral invariants.
- `.verifier/elegance.yaml`: metric thresholds, overrides, minimum grade.
- `.verifier/facts/` and `reports/`: gitignored caches and outputs for diagnostics.
