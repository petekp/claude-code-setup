---
name: write-goal
description: Turn the prompt supplied with this skill into a concise, auditable Codex Goal or explain why a Goal is not the right fit. Use when the user asks to draft, formulate, rewrite, tighten, or create a `/goal` from a plain-language task, especially for multi-step work that needs a durable objective, evidence-based completion, constraints, iteration policy, and a default adversarial review loop.
---

# Write Goal

## Overview

Turn the user's request into a compact Codex Goal that can guide continued work until the evidence says it is done. Draft the goal; do not activate it unless the user explicitly asks you to start or set the Goal.

## Workflow

1. Extract the actual task from the prompt that invoked this skill. Ignore the skill mention itself.
2. Decide whether a Goal is appropriate. Use a Goal for durable, multi-step work with an auditable finish line. For one-line edits, simple explanations, or vague improvement requests without a checkable end state, say that a normal prompt is a better fit and offer the closest tightened prompt instead.
3. Draft one Goal that includes:
   - outcome: what must be true when finished
   - verification surface: tests, commands, artifacts, logs, benchmarks, source evidence, or review output that proves it
   - constraints: behavior, scope, public APIs, files, style, budget, or safety limits that must remain intact
   - boundaries: allowed repos, files, tools, data, and resources
   - iteration policy: how Codex should choose the next action after each result
   - blocked stop condition: when to stop and what evidence, attempted paths, blocker, and needed input to report
4. Keep it as short as the evidence contract allows. Prefer one compact paragraph. Do not list every component if the sentence already carries it.
5. Include the default adversarial review loop unless the user explicitly opts out.
6. If required details are missing, make conservative assumptions inline. Ask only when missing information would make the Goal unsafe or impossible to verify.

## Task Fit

- Coding or refactoring: name the behavior or code state, the relevant tests or build commands, the scope boundary, and what must not regress.
- Debugging or flaky tests: include reproduction evidence, focused verification, regression checks, and the point where missing evidence becomes a blocker.
- Research or audits: require a claim inventory, evidence mapping, confidence labels, and a final report that separates confirmed, supported, blocked, and uncertain claims.
- Docs or content: name the artifact, reader outcome, source-of-truth checks, build or link checks, and terminology constraints.
- Vague requests: narrow the task with explicit assumptions if there is a plausible evidence surface. If there is not, return a tightened normal prompt instead of a Goal.
- One-off tasks: do not force a Goal. Say it is better as a normal prompt and provide that prompt.

## Review Loop

Use this default unless the user opts out:

```text
Before completion, adversarially review the result against this Goal and classify findings by severity. Block completion only on critical and high findings, and resolve all of those. Run at most two review rounds: one to surface issues, one to verify the fixes. Complete when the load-bearing conclusion survives a round unchanged, even if detail-level findings remain. Batch any medium findings into a single final pass with no re-run, and report the rest as residuals rather than looping. Do not restart the round count on a fresh medium in supporting detail.
```

Treat severity as impact on the Goal:

- Critical or high: the objective is not met, evidence is false or missing, scope is unsafe, or the result likely regresses a stated constraint.
- Medium: the result may pass superficially but leaves a meaningful gap in evidence, scope, maintainability, or user-facing quality. Resolve mediums in the single final pass; a medium does not by itself block completion or restart the review rounds.
- Low: polish, wording, or optional improvements that do not block completion.

## Goal Shape

Prefer this shape:

```text
/goal <desired end state>, verified by <specific evidence>, while preserving <constraints>. Use <allowed inputs, tools, files, and boundaries>. Between iterations, <how to inspect results and choose the next best action>. Before completion, adversarially review the result against this Goal and resolve all critical and high findings; run at most two review rounds and complete once the core conclusion survives a round unchanged, reporting remaining medium and low findings as residuals rather than looping. If blocked or no defensible path remains, stop with the attempted paths, evidence gathered, unresolved findings, blocker, and next input needed.
```

Keep the final Goal narrow enough to audit but broad enough to let Codex choose the next action. Do not prescribe every implementation step unless the user already did.

## Output

Return:

1. `Recommended Goal`: a single ready-to-use `/goal ...` block.
2. `Assumptions`: only if you filled gaps that matter.
3. `Why This Works`: only when useful or requested; one or two short bullets naming the evidence surface and review loop.

If a Goal is not appropriate, return:

1. `Better As A Prompt`: a concise normal prompt.
2. `Why Not A Goal`: one sentence explaining the missing durable objective or verification surface.

Keep the answer concise. The user came for the Goal, not a lecture about Goals.

## Examples

User prompt:

```text
Use $write-goal to turn this into a Goal: keep working on this flaky checkout test until it is fixed or we know exactly why it cannot be fixed.
```

Output:

Recommended Goal:

```text
/goal Make the flaky checkout test pass reliably on the current branch, verified by reproducing the failure when possible and then passing the focused checkout test repeatedly plus the relevant correctness suite, while preserving public checkout behavior and existing test coverage. Use the checkout code, related fixtures, test logs, and local test commands. Between iterations, inspect the latest failure evidence, make the smallest defensible change, rerun focused verification, and update the hypothesis. Before completion, adversarially review the result against this Goal and resolve all critical and high findings; run at most two review rounds and complete once the fix is stable, reporting remaining medium and low findings as residuals rather than looping. If the failure cannot be reproduced or no valid path remains, stop with attempted reproductions, evidence gathered, unresolved findings, blocker, and the next input needed.
```

User prompt:

```text
Use $write-goal: improve the docs for Goals.
```

Output:

Recommended Goal:

```text
/goal Produce a clearer Goals documentation page that explains when to use Goals, the command lifecycle, and two realistic examples, verified by the local docs build and by checking that every referenced command matches current Codex behavior, while preserving existing terminology and avoiding unrelated documentation churn. Use the existing docs, current CLI behavior, and related tests or build commands. Between iterations, compare the page against the intended reader workflow, patch the highest-impact gap, and rerun relevant verification. Before completion, adversarially review the result against this Goal and resolve all critical and high findings; run at most two review rounds and complete once the core conclusion survives a round unchanged, reporting remaining medium and low findings as residuals rather than looping. If verification cannot run or command behavior cannot be confirmed, stop with attempted checks, evidence gathered, unresolved findings, blocker, and the next input needed.
```

User prompt:

```text
Use $write-goal: explain this error message.
```

Output:

Better As A Prompt:

```text
Explain this error message in plain English, identify the likely cause, and suggest the next command or file to inspect.
```

Why Not A Goal: This is a one-off explanation request without a durable objective that needs continued work.
