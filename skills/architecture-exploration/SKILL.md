---
name: architecture-exploration
description: >
  Explore and compare architectural options before committing to a large technical direction. Use
  when the user wants to evaluate different architectures, compare approaches, choose between
  competing designs, rethink a subsystem, or understand tradeoffs before a major refactor or
  migration. Also use for prompts like "explore the architecture", "what are our options",
  "compare approaches", "what design should we choose", "audit and recommend an improved
  architecture", or "help me think through a large architectural change" even if the user does not
  mention a formal architecture review.
---

# Architecture Exploration

Reason deeply about a system, generate real architectural options, and help the user choose the best direction before any migration begins.

This skill is intentionally **pre-commit**. Its job is to help pick the right architecture, not to execute the migration. Once a direction is chosen, hand the work off to `audit-and-migrate`.

## Why This Exists

Large engineering efforts fail long before code is written:

1. **Premature commitment** — a promising idea becomes the default architecture before alternatives are seriously examined.
2. **Local reasoning** — the agent optimizes one subsystem without understanding system-wide constraints, ownership, and failure modes.
3. **Strawman comparison** — one favored option is compared against weak alternatives, creating false confidence.
4. **Migration contamination** — the discussion quietly shifts from "what should we build?" to "how should we implement it?" before the target architecture is actually chosen.

This skill exists to force disciplined exploration before implementation.

## Hard Boundary

This skill does **not**:

- create migration slices
- create ratchet budgets for execution
- start refactoring
- write scaffolding or implementation code
- turn the leading option into the assumed winner before comparison is complete

This skill **does**:

- map the current system
- define the decision frame
- generate multiple serious options
- compare them against the same constraints
- stress-test them
- recommend a direction
- produce a handoff package for `audit-and-migrate`

Perform all of this work directly. Do not rely on other skills to do the shaping, stress-testing, or architecture comparison for you.

If the user has already chosen a direction and wants to land it safely, stop using this skill and use `audit-and-migrate`.

## Core Principle

**First excavate reality, then compare options, then recommend.**

Do not start with architecture taste. Start with the actual system, the actual constraints, and the actual problem.

## Evidence Discipline

Before you recommend an architecture, you must earn the recommendation.

For the relevant system, actively inspect:

- current code paths
- ownership boundaries
- state and data flow
- external contracts and integrations
- docs and operational surfaces
- obvious history signals when needed (recent churn, known incidents, partial prior refactors)

Do not recommend major boundary changes based only on the user's summary if the local codebase can answer the question.

When a claim is uncertain, mark it as uncertain. A high-integrity architectural recommendation is one that is well-calibrated, not one that sounds maximally confident.

## Workflow

### Phase 1: Define the Decision Frame

Before exploring options, pin down the decision you are actually making.

Capture:

- **Goal** — what outcome the user wants
- **Problem** — what pain or failure mode motivates the change
- **Invariants** — what must remain true
- **Non-goals** — what should stay out of scope
- **Constraints** — team, tooling, performance, compliance, time, compatibility, ops, or organizational limits
- **External surfaces** — APIs, env vars, queues, dashboards, CLI entrypoints, jobs, data contracts, webhooks, partner integrations
- **Decision horizon** — are we optimizing for the next 3 months, 1 year, or 3 years?

If the user already has a candidate solution in mind, treat it as **Option A**, not as the conclusion.

### Phase 2: Map the Current System

Understand the current system before proposing alternatives.

For the affected system or systems, map:

- **Primary workflows**
- **Current module boundaries**
- **Data flow**
- **Ownership of logic and state**
- **External dependencies**
- **Operational surfaces**
- **Known pain points**
- **Hotspots** — fragile areas, high-churn files, flaky tests, unclear ownership, duplicated logic, stale docs

Produce a concise current-state map:

```markdown
## Current System
| Area | Current Owner | Inputs | Outputs | Dependencies | Pain |
|------|---------------|--------|---------|--------------|------|
| ...  | ...           | ...    | ...     | ...          | ...  |
```

Do not skip this because the user "already knows the system." A rigorous option comparison depends on a shared map of reality.

### Phase 3: Generate the Option Set

Generate **2-4 serious architectural options**.

Do not generate fake alternatives. Every option must be plausible enough that a strong team could reasonably choose it.

When feasible, include:

- **Option 1: Evolutionary path** — improves the current system with lower disruption
- **Option 2: Simplifying path** — removes concepts and indirection aggressively
- **Option 3: Structural path** — introduces stronger boundaries or a new architecture shape
- **Option 4: Do less** — if the problem may be solvable with narrower change than expected

Each option must describe:

- architecture shape
- boundary changes
- ownership model
- data flow
- operational model
- what stays
- what changes
- what gets simpler
- what gets harder

### Phase 4: Analyze Each Option

For every option, run the same analysis.

#### A. Fit

How well does the option satisfy:

- the goal
- invariants
- constraints
- external surface obligations

#### B. Assumptions

List the must-be-true assumptions:

```markdown
## Must-Be-True Assumptions
| Assumption | Why It Matters | How to Verify | Fastest Disproof |
|------------|----------------|---------------|------------------|
| ...        | ...            | ...           | ...              |
```

#### C. Failure Modes

Imagine the option failed one year later. Work backward.

```markdown
## Pre-Mortem
| Failure Mode | Warning Signal | Prevention |
|--------------|----------------|------------|
| ...          | ...            | ...        |
```

#### D. Tradeoffs

Evaluate each option on:

- **Concept count** — how many new ideas someone must carry
- **Boundary clarity** — is ownership sharper or blurrier?
- **Migration difficulty** — how hard this will be to land later
- **Cleanup burden** — how likely it is to leave vestigial code, docs, configs, or adapters
- **Rollback story** — how hard it is to back out
- **Operability** — monitoring, debugging, failure handling, support burden
- **Testability** — can the system be verified deterministically?
- **Extensibility** — what future changes become easier?
- **Lock-in** — what new constraints does this create?

Use relative ratings with justification. Avoid fake precision.

```markdown
## Tradeoff Matrix
| Dimension | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Simplicity | Medium — ... | High — ... | Low — ... |
| Migration Difficulty | ... | ... | ... |
| Cleanup Burden | ... | ... | ... |
| Operability | ... | ... | ... |
| Testability | ... | ... | ... |
| Long-Term Flexibility | ... | ... | ... |
```

#### E. Disqualifiers

For each option, state what would make it the wrong choice.

Examples:

- requires compatibility the project does not need
- increases operational burden beyond the team's capacity
- creates too much cleanup debt during migration
- depends on an external contract the team does not control
- adds concepts without enough payoff

#### F. Unknowns

What remains uncertain? Distinguish:

- **architectural unknowns** — boundary or ownership uncertainty
- **runtime unknowns** — load, latency, concurrency, failure behavior
- **organizational unknowns** — team readiness, external consumers, ops constraints

### Phase 5: Recommend

Do not stop at listing options. Make a recommendation.

The recommendation must include:

- **Recommended option**
- **Why it wins**
- **Why the runner-up loses**
- **Why the other options were rejected**
- **What could change the recommendation**
- **What must be validated before committing**

If the recommendation is genuinely unclear, say so and explain exactly which uncertainty blocks a good decision.

### Phase 6: Define Validation Spikes

Before committing, propose the cheapest high-value spikes to kill uncertainty.

Good spikes are:

- narrow
- fast
- evidence-producing
- architecture-relevant

Examples:

- compile-time module skeleton
- thin path through one critical workflow
- event/queue boundary proof
- fake adapter proving data contract shape
- load experiment for one suspected bottleneck

For each spike:

```markdown
## Validation Spikes
| Spike | Question Answered | Cost | Success Signal | Failure Signal |
|-------|-------------------|------|----------------|----------------|
| ...   | ...               | ...  | ...            | ...            |
```

### Phase 7: Prepare the Handoff to `audit-and-migrate`

Once the user chooses a direction, hand off the decision package cleanly.

The handoff section must include:

- **Chosen architecture**
- **Decision rationale**
- **Invariants**
- **Non-goals**
- **Critical workflows**
- **External surfaces**
- **Known hotspots**
- **Leading migration risks**
- **Expected deletion zones** — code, docs, scripts, config, env, adapters likely to become vestigial
- **Validation spikes already run**
- **What still needs proof**

This section should make it easy to start `audit-and-migrate` without reopening the architecture debate.

## Output Contract

For non-trivial explorations, produce a decision-grade artifact at `.claude/architecture/ARCHITECTURE_OPTIONS.md` or the project’s equivalent docs location.

Use this structure:

```markdown
# Architecture Exploration: [System Name]

## Goal

## Problem

## Invariants

## Non-Goals

## Constraints

## External Surfaces

## Current System
| Area | Current Owner | Inputs | Outputs | Dependencies | Pain |

## Option 1: [Name]
### Architecture Shape
### Why It Might Work
### Tradeoffs
### Failure Modes
### Disqualifiers
### Cleanup / Migration Implications
### Unknowns

## Option 2: [Name]
...

## Tradeoff Matrix
| Dimension | Option 1 | Option 2 | Option 3 |

## Assumptions
| Assumption | Why It Matters | How to Verify | Fastest Disproof |

## Risk Register
| Risk | Option(s) Affected | Likelihood | Impact | Mitigation |

## Validation Spikes
| Spike | Question Answered | Cost | Success Signal | Failure Signal |

## Recommendation

## Runner-Up

## Why The Other Options Lose

## Decision Needed

## Handoff to audit-and-migrate
```

For smaller requests, present the same structure inline in the conversation.

## Reasoning Standards

### Avoid False Precision

Do not invent numerical scoring that implies rigor you do not actually have. Relative ratings with explanations are better than fake weighted totals.

### Prefer Evidence to Taste

Architecture preferences are not evidence. Ground recommendations in:

- codebase structure
- observed constraints
- operational surfaces
- migration burden
- cleanup burden
- failure modes

### Always Include a Simpler Option

If every option increases conceptual complexity, you probably missed a better path.

### Do Not Default to Rewrite

A full rewrite or major structural reset must earn its place. It is rarely the default winner.

### Make the Tradeoffs Symmetrical

Every option gets the same scrutiny. Do not stress-test the user's preferred option less just because it sounds elegant.

## When to Stop

Exploration is complete when:

- the current system is mapped clearly enough to compare alternatives
- the option set includes at least two serious choices
- each option has explicit tradeoffs and failure modes
- the recommendation is grounded in evidence
- the next step is clear: either run a validation spike or start `audit-and-migrate`

If you reach that point, stop exploring and recommend the decision.

## Relationship to `audit-and-migrate`

Use this skill to answer:

- "What architecture should we choose?"
- "What are our options?"
- "What is the best design tradeoff here?"

Use `audit-and-migrate` after the answer becomes:

- "We are committing to Option B"
- "Now plan the migration"
- "Now land this safely"
