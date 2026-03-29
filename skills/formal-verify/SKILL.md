---
name: formal-verify
description: >
  Continuous formal verification of architectural constraints and code quality.
  Use when asked to verify, audit, or validate codebase integrity. Runs
  automatically via hooks on every edit (structural) and pre-commit (full).
  Catches ownership violations, boundary crossings, state machine bugs,
  and code smells that grep ratchets miss. Triggers: "verify", "formal verify",
  "check architecture", "audit code quality", "run verification",
  "/verify", "/verify --bootstrap", "/verify --grade".
license: MIT
metadata:
  author: petekp
  version: "0.1.0"
---

# formal-verify

Use this skill when architectural intent matters more than "it compiles."

This skill runs a three-layer verification loop:

1. Layer 1: structural verification over extracted AST facts and declarative rules
2. Layer 2: behavioral verification over Z3Py protocol specs and TLA+/Apalache state-machine specs
3. Layer 3: elegance auditing over complexity, consistency, and craft heuristics

The layers are intentionally tiered:

- every edit: Layer 1 only, fast enough for continuous feedback
- slice checkpoint: Layers 1 and 2
- pre-commit and manual `/verify`: all three layers

## Quick Start

Bootstrap a target project with:

```bash
/verify --bootstrap
```

Bootstrap runs four phases:

1. Install dependencies and create `.verifier/`
2. Discover architectural rules from docs and code shape
3. Interview the user in plain English about ambiguities
4. Validate the initial rules against the current codebase

## Commands

- `/verify`
  Runs all layers in verbose mode and prints a unified report.
- `/verify --bootstrap`
  Installs dependencies, creates `.verifier/`, and scaffolds the first rule set.
- `/verify --evolve`
  Checks for drift between architectural docs and existing verification specs.
- `/verify --grade`
  Runs Layer 3 only and reports the current elegance grade.

## How Verification Runs

### Layer 1: Structural

The runner extracts facts from Rust and Swift source files, then checks
`structural.yaml` rules such as:

- only module X may cross boundary Y
- modules matching pattern Z must implement interface W
- all modules must not reference legacy identifiers

Structural checks are the default PostToolUse hook because they are the fastest.

### Layer 2: Behavioral

Behavioral verification covers state transitions and protocol contracts:

- TLA+/Apalache for temporal properties, liveness, and interleavings
- Z3Py spec files for contracts, invariants, and cross-boundary data guarantees

Use this layer at slice checkpoints, before risky merges, and whenever a change
touches coordination logic or cross-language contracts.

### Layer 3: Elegance

Elegance auditing scores code for:

- complexity
- consistency
- craft

It produces a grade and line-level deductions so the agent can clean up code,
not just make it technically correct.

## Violation Handling

When a violation is found, tailor the output to the audience:

- agent output: counterexample, diagnosis, concrete fix suggestion
- human output: counterexample and diagnosis only

If the agent fails to resolve the same violation three times, stop the fix loop
and escalate with:

- the original rule
- the counterexample
- the three attempted fixes
- what still appears to block a correct repair

## Project Structure Created In The Target Repo

Bootstrap creates and maintains:

```text
.verifier/
├── structural.yaml
├── elegance.yaml
├── specs/
├── facts/
└── reports/
```

- `structural.yaml` stores declarative Layer 1 rules
- `elegance.yaml` stores thresholds and grade policy
- `specs/` stores Z3Py and TLA+ behavioral specs
- `facts/` caches extracted AST facts
- `reports/` stores the most recent verification outputs

`facts/` and `reports/` should be gitignored in the target project.

## Operating Guidance

- Run `/verify` before claiming a migration is complete.
- Run `/verify --grade` when the code is correct but still feels rough.
- Prefer updating rules and specs over weakening them when the architecture
  evolves intentionally.
- Keep `SKILL.md` focused on orchestration; pull detailed mechanics from the
  references below.

## References

- `@references/layer1-structural.md`
  Fact extraction, Z3 encoding, reachability, and incremental invalidation.
- `@references/layer2-behavioral.md`
  When to use TLA+/Apalache versus Z3Py, plus spec execution contracts.
- `@references/layer3-elegance.md`
  Metric families, grading, thresholds, and the Layer 3 sub-module layout.
- `@references/constraint-yaml-spec.md`
  Structural rule schema, selectors, assertions, and fact pattern operators.
- `@references/bootstrap-process.md`
  The install, discover, interview, validate bootstrap workflow.
- `@references/agent-feedback-loop.md`
  Hook integration, violation injection, retries, and escalation policy.
- `@references/spec-authoring-guide.md`
  Translating plain-English architectural intent into formal specs.
