---
name: method:router
description: >
  Routes `/method:router` requests to the best-fit method skill among the 7
  methods. Not a method itself. Use for `/method:router` or
  `/method:router <args>` when choosing which method to start.
---

# Method Router

Routing only. This skill is not a method.

## Workflow

1. Treat `/method:router <text>` as the strongest signal.
2. If args are empty, read the current thread and any referenced handoff, spec, PRD, bug report, or method directory.
3. If still ambiguous, ask exactly one disambiguating question.

Route only when positive signals match and exclusions do not.

- `method:research-to-implementation`
  Match: multi-file or cross-domain feature delivery, unclear approach, or research needed before build.
  Exclude: bug fixes, config changes, or already-clear tasks.
- `method:decision-pressure-loop`
  Match: architecture or protocol choices with real downside, serious options, or reopen conditions needed before build.
  Exclude: code delivery, bug fixes, or settled decisions.
- `method:spec-hardening`
  Match: an existing RFC, spec, PRD, or method schema that is promising but not yet safe to build from.
  Exclude: unformed ideas, bug fixes, or specs already implementation-ready.
- `method:flow-audit-and-repair`
  Match: a broken, flaky, or unsafe existing flow, especially across boundaries, where repair must start from forensics and end in a verified fix.
  Exclude: feature ideation, greenfield implementation, or cases with no real broken flow to reproduce.
- `method:create`
  Match: authoring a new method from a natural-language workflow and fitting it to the live method corpus.
  Exclude: editing an existing method, building a runtime engine, or wrapping a tiny one-off prompt in method structure.
- `method:autonomous-ratchet`
  Match: overnight autonomous quality improvement, polish, ratcheting, or unattended codebase refinement with an evidence-backed closeout.
  Exclude: interactive work, greenfield features, architecture decisions, cleanup-only scope, or repos without build/test commands.
- `method:dry-run`
  Match: dry-running, validating, tracing, or mechanically checking a method skill, especially after authoring or editing it.
  Exclude: architecture critique, feature design, or product judgment.

## Route Order

Use a sequence only when an earlier phase must happen before a later one.

- Broken existing flow: `method:flow-audit-and-repair` before any rebuild or expansion work.
- Unsettled architecture or protocol choice: `method:decision-pressure-loop` before `method:spec-hardening` or `method:research-to-implementation`.
- Draft exists but is not build-ready: `method:spec-hardening` before `method:research-to-implementation`.
- New method authoring: `method:create` before `method:dry-run`.
- If both `method:decision-pressure-loop` and `method:spec-hardening` match, start with `method:decision-pressure-loop`.
- If none match, say so and do not force a route. This includes single-file changes, config edits, quick wiring, or trivial bug fixes.

## Recommend

Recommend the best method or sequence in order.
For each recommended step, give 1-2 sentences tied to the matched signals and exclusion checks.
Briefly say why the closest alternatives do not fit.
If nothing fits, say that directly and stop.

## Invoke On Confirmation

If the user confirms, invoke only the first recommended method.
Recompute once if new information changes the route.
