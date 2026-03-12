---
name: simplicity-audit
description: >
  First-principles simplification analysis for codebases. Methodically inventories what a codebase
  actually does, then asks whether each piece of complexity earns its keep. Use when asked to
  "simplify this codebase", "is this overengineered", "how could this be simpler", "reduce complexity",
  "first principles review", "essential complexity audit", "do we really need all this", or any
  request to rethink whether the current implementation is the simplest way to achieve its goals.
  Also useful when a codebase feels harder to work with than it should, when onboarding takes too
  long, or when changes that seem simple keep ballooning in scope.
license: MIT
metadata:
  author: petekp
  version: "0.1.0"
---

# Simplicity Audit

Strip a codebase down to what it actually does, then figure out the simplest way to do it.

Most codebases accumulate complexity over time — abstractions added speculatively, patterns adopted because they're conventional rather than necessary, indirection that solved a problem that no longer exists. This skill cuts through that by starting from the ground truth of what the software actually accomplishes, then reasoning from first principles about how to achieve the same results with less.

This is not a bug hunt or an architecture review. It's a harder question: *is the overall approach right?*

## How to think about this

The central tension in software design is between essential complexity (the irreducible difficulty of the problem) and accidental complexity (difficulty we introduced through our choices). Every codebase has both. The goal here is to find the accidental complexity and propose alternatives that preserve the essential functionality while shedding the rest.

Some important instincts to bring:

- **Convention isn't justification.** "This is how you do it in React/Rails/Go" is not a reason. The question is whether the pattern serves this specific codebase.
- **Count the concepts.** Every abstraction, type, config option, and indirection layer is a concept someone has to hold in their head. Fewer concepts = simpler, even if individual pieces are slightly larger.
- **Respect what works.** The goal is simplification, not rewrite-from-scratch fantasy. Some complexity is genuinely essential. Call it out when you see it — "this is complex because the problem is complex" is a valid finding.
- **Think about the 90% case.** Many codebases are shaped by their hardest edge case. Sometimes the right move is to handle the common path simply and deal with the edge case as a special case, rather than building a general system that handles everything uniformly but makes everything harder.

## Epistemic Discipline

This skill lives or dies on the accuracy of its judgments. A false positive — recommending removal of complexity that exists for a good reason — is far more damaging than a false negative (missing an opportunity to simplify). The cost of a bad recommendation isn't just the wasted effort of attempting it; it's the erosion of trust in the entire audit.

Before classifying any complexity as "accidental" or "legacy," you must actively try to justify its existence. Think of it as a trial where the code is innocent until proven guilty:

### The Justification Search

For every piece of complexity you're tempted to flag, systematically check:

1. **Search for non-obvious consumers.** Grep for usages across the entire codebase, not just the immediate module. Abstractions often exist because something outside the obvious call chain depends on them — test fixtures, scripts, CI pipelines, downstream packages.

2. **Read the git history.** Check `git log` for the files involved. Complexity added in response to a bug fix or incident is almost always essential — someone learned the hard way that the simpler approach didn't work. Look for commit messages mentioning bugs, incidents, edge cases, or "fixes."

3. **Check for external constraints.** Compliance requirements, API contracts with external consumers, backwards compatibility promises, performance SLAs — these create complexity that looks gratuitous from the code alone but is load-bearing. Look in README, CLAUDE.md, docs/, comments, and ADRs.

4. **Look for the test that explains the abstraction.** If there's a test that specifically exercises the flexibility of an abstraction (e.g., testing with a mock implementation), that's evidence the abstraction serves testability. If the test file is larger than the implementation, the abstraction might be paying for itself in test ergonomics.

5. **Consider runtime conditions you can't see in code.** Caching layers, retry logic, circuit breakers, and connection pools often look like over-engineering until you understand the production traffic patterns. If you see this kind of infrastructure, assume it's there for a reason unless you find evidence otherwise.

### Confidence Calibration

Your confidence level on any finding should reflect how thoroughly you've investigated, not how obvious the conclusion seems at first glance:

- **High confidence** requires that you searched for consumers, checked git history, and found no justification. You can explain not just why the complexity seems unnecessary, but why the likely counterarguments don't apply.
- **Medium confidence** means you checked the obvious things but there are plausible reasons the complexity might be intentional that you couldn't fully rule out. State what those reasons are.
- **Low confidence** means something looks off but you don't have enough context to be sure. Frame these as questions for the team, not recommendations.

When in doubt, downgrade your confidence rather than upgrading it. A report full of well-calibrated Medium findings is more useful than one full of overconfident High findings — the former builds trust, the latter destroys it.

### What to do when you're uncertain

If you can't determine whether complexity is essential or accidental, say so directly. The most valuable thing you can say is: "This abstraction exists and I can't determine why from the code alone. Here's what I checked: [list]. The team should weigh in on whether [specific question]." This is not a failure — it's intellectual honesty, and it tells the reader exactly where to focus their attention.

## Phase 1: Functionality Inventory

Before you can simplify, you need to know what the software actually does. Not what the README claims, not what the architecture diagram shows — what the code actually accomplishes from a user's perspective.

### Step 1: Identify all user-facing behaviors

Map every distinct thing the software does that a user (human or machine) can observe. Be concrete and specific:

- Not "handles authentication" but "lets users sign in with email/password, Google OAuth, and magic links; issues JWTs; refreshes tokens automatically; handles logout"
- Not "manages data" but "accepts CSV uploads up to 50MB, validates column headers against a schema, stores rows in Postgres, exposes a paginated REST API for querying"

Organize these by feature area. For each behavior, note:
- **What triggers it** (user action, API call, cron job, event)
- **What it produces** (UI change, data mutation, side effect, response)
- **Where the logic lives** (files/modules involved)

### Step 2: Map the dependency landscape

For each feature area, trace what infrastructure it actually uses:
- External services (databases, APIs, queues, caches)
- Internal shared modules it depends on
- Configuration it reads
- State it manages

### Step 3: Measure the complexity budget

For each feature area, estimate:
- **Lines of code** dedicated to it (rough is fine)
- **Number of files** involved
- **Number of abstractions** (classes, interfaces, config types, middleware) it requires
- **Number of concepts** someone new would need to understand to modify it

Present this as a table:

```
| Feature Area        | Behaviors | LOC   | Files | Abstractions | Key Concepts |
|---------------------|-----------|-------|-------|--------------|--------------|
| Authentication      | 6         | 1,200 | 14    | 8            | JWT, OAuth flow, session store, middleware chain, ... |
| CSV Import          | 3         | 800   | 6     | 4            | Schema validation, chunked upload, ... |
```

This table is the foundation. It makes the cost of each feature visible.

## Phase 2: First-Principles Assessment

Now take each feature area and ask: *knowing what this needs to do, how would I build it if I were starting today with no existing code?*

### For each feature area, work through these questions:

**1. Is the abstraction level right?**
- Are there abstractions that only have one implementation and always will? (Remove them — use the concrete thing directly.)
- Are there abstractions that exist to satisfy a framework rather than the problem? (Consider whether the framework is pulling its weight.)
- Could two or three abstractions be collapsed into one without losing important flexibility?

**2. Is the indirection necessary?**
- Trace a typical request/operation from entry to completion. How many layers does it pass through? Could any be eliminated?
- Are there "pass-through" layers that just forward calls? (These add cognitive overhead without adding value.)
- Is dependency injection being used because it helps, or because it's conventional?

**3. Is the generality earned?**
- Are there configurable behaviors that are only ever configured one way?
- Are there plugin systems, strategy patterns, or extension points with only one plugin/strategy/extension?
- Could hardcoding the current behavior and adding flexibility later (if needed) reduce complexity?

**4. Is the decomposition helping?**
- Are there modules that are always modified together? (They might want to be one module.)
- Are there files so small they add more overhead from the import/navigation than they save in organization?
- Is the folder structure revealing the system's structure, or obscuring it?

**5. Could a different approach eliminate whole categories of complexity?**
This is the big one. Step way back and ask:
- Could a simpler data model eliminate transformation code?
- Could a different storage choice eliminate caching/sync complexity?
- Could a convention or naming scheme replace explicit configuration?
- Could computed/derived values replace stored state?
- Could a library or platform feature replace hand-rolled code?
- If the tech stack is clearly fighting the problem rather than serving it, note this (but frame it as "worth considering" rather than "you must rewrite")

### Classify each finding

For every piece of complexity you examine, run the Justification Search (see Epistemic Discipline above) before classifying. The classification should reflect what you found during that search, not your initial impression.

- **Essential** — This complexity exists because the problem is genuinely hard here. Simplifying it would mean losing functionality or correctness. (Call these out explicitly — they validate that not everything is waste, and they show the reader you've done due diligence rather than reflexively flagging everything.)
- **Earned** — This complexity serves a real purpose (performance, reliability, maintainability) and the tradeoff is reasonable, even if a simpler approach exists. State what purpose it serves and what evidence you found.
- **Accidental** — This complexity doesn't serve the current requirements. You've checked for consumers, read the git history, and found no justification. State what you checked.
- **Legacy** — This complexity served past requirements that no longer apply, but it was never removed. Cite the evidence (e.g., git history shows the feature it supported was removed in commit X, but the abstraction layer remained).
- **Uncertain** — You suspect this complexity may be unnecessary, but you can't rule out valid reasons from the code alone. State what you checked and what questions the team should answer. This is a better classification than a wrong one.

## Phase 3: Simplification Proposals

For each finding classified as Accidental or Legacy, propose a specific simplification.

### Each proposal should include:

**What exists now**
Brief description of the current approach and its cost (LOC, concepts, files — reference the inventory).

**What it could be instead**
Describe the simpler alternative concretely. Not "simplify the auth layer" but "replace the AuthProvider abstraction, AuthStrategy interface, and three strategy implementations with a single `authenticate()` function that handles all three methods in a switch statement — the strategies will never be swapped at runtime and the total logic is ~60 lines."

**What you'd gain**
- Reduction in concepts, files, LOC
- Improved readability or onboarding time
- Fewer places to make mistakes when changing behavior

**What you'd lose (if anything)**
Be honest. Sometimes the simpler approach has a real tradeoff:
- Harder to test in isolation
- Less conventional (team might push back)
- Slightly more duplication

**What you verified**
List the specific checks you performed before making this recommendation:
- Consumer search: "Grepped for X across the codebase, found N usages, all in [context]"
- Git history: "Added in commit abc123 as part of [feature], no subsequent changes suggest it's load-bearing"
- External constraints: "No mentions in docs, README, or config"

This section is what separates a credible recommendation from a guess. If you can't fill it out, downgrade your confidence or reclassify as Uncertain.

**Confidence level**
- **High** — You searched for consumers, checked git history, found no justification, and can explain why likely counterarguments don't apply.
- **Medium** — You checked the obvious things but there are plausible reasons the complexity might be intentional that you couldn't fully rule out. State what those reasons are.
- **Low** — Something looks off but you don't have enough context to be sure. Frame as a question for the team, not a recommendation.

## Phase 4: The Simplification Report

Produce a structured report. Adapt the depth to match the scope — a focused audit of one module doesn't need the same ceremony as a full-codebase review.

```markdown
# Simplicity Audit: [Project/Area Name]

## Executive Summary
[2-3 sentences: what the codebase does, how complex it is relative to what it does, and the overall opportunity for simplification]

## Functionality Inventory
[The table from Phase 1, plus brief descriptions of each feature area]

## Findings

### [Feature Area 1]

#### What it does
[Concrete user-facing behaviors]

#### Current complexity
[LOC, files, abstractions, key concepts]

#### Assessment
[First-principles analysis — what's essential, what's accidental]

#### Proposals
[Specific simplifications with before/after, gains/losses, confidence]

### [Feature Area 2]
...

## Summary of Proposals

| # | Proposal | Area | Complexity Reduction | Confidence | Effort |
|---|----------|------|---------------------|------------|--------|
| 1 | Collapse auth strategies into single function | Auth | -3 files, -2 abstractions | High | Low |
| 2 | Replace event bus with direct calls | Core | -1 concept, ~200 LOC | Medium | Medium |

## Open Questions
[Findings classified as Uncertain, with specific questions for the team. These are not failures of analysis — they're places where the code alone doesn't tell the full story.]

## Recommendations
[Prioritized list of what to tackle first, considering impact vs. effort. Lead with high-confidence findings. Call out which proposals need team input before acting on.]
```

## Scope Guidance

- **Full codebase**: Work through all feature areas systematically. Use subagents for parallel exploration if the codebase is large.
- **Specific area**: The user may point you at a module, feature, or directory. Apply the same methodology but scoped to that area. Still trace its dependencies and understand what it does from the user's perspective.
- **Quick gut check**: If the user just wants a high-level sense, do a lighter version — skim the structure, identify the 2-3 most obvious sources of accidental complexity, and present them conversationally without the full report format.
