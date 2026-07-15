---
name: exhaustive-systems-analysis
description: |
  Perform evidence-driven, multi-subsystem audits of real codebases to find correctness bugs, race conditions, security gaps, stale documentation, dead code, and production-readiness risks. Use when asked to audit a system end-to-end, verify agent-written code before shipping, analyze a subsystem for correctness across multiple modules, or produce a structured risk report for a real implementation. Prefer other skills for a single isolated bug, a proposal or document review, or a dedicated dead-code cleanup.
---

# Exhaustive Systems Analysis

Use this skill for full-system correctness work. The job is to map the system, identify the highest-risk behaviors, prove or refute concrete failure hypotheses, and leave behind a report another engineer can act on without re-reading the whole codebase.

## Failure Modes To Prevent

1. Surface-level audits that scan files without following behavior end-to-end
2. False certainty: reporting suspicions as bugs without enough evidence
3. Context drift across large audits with many subsystems
4. Cosmetic reviews that miss the real correctness and ship-readiness risks

## Operating Mode

- Default to `chat-first` output. Return findings inline unless the user asks for docs or the audit clearly needs multi-session artifacts.
- Switch to `artifact mode` for large or resumable audits. Use `docs/audit/` or `.claude/docs/audit/`, matching the repo's existing conventions.
- Do not start fixing code while auditing unless the user explicitly asks for fixes. This skill is for diagnosis, proof, and prioritization.

## Workflow

### 0. Calibrate The Audit

Before reading deeply, write a one-screen scope brief using the template in `references/templates.md`.

Capture:
- system or area under review
- user-visible workflows or contracts that matter most
- likely high-risk surfaces: state, side effects, concurrency, auth, persistence, external integrations
- out-of-scope areas
- output mode: `chat-first` or `artifact mode`

If the request is broad, narrow it to the modules that can actually change user outcomes or ship readiness.

### 1. Load Intent Before Code

Read only the materials that establish intended behavior:
- `README`, `CLAUDE.md`, architecture docs, ADRs
- tests that describe user-visible or contract behavior
- recent commits touching the target area
- `TODO`, `FIXME`, `HACK`, and "known issues"
- incident notes, bug reports, or issue tracker items if available

Extract:
- critical workflows
- external surfaces
- hotspots and recent churn
- manual-only surfaces that cannot be fully verified from code alone

### 2. Build The Coverage Ledger

Map the system into subsystems before deep analysis. Use the coverage ledger template in `references/templates.md`.

For each subsystem record:
- name
- entrypoints
- files or directories in scope
- invariants or promised behaviors
- side effects
- risk level
- status: `planned | in_progress | done | follow_up`

Prioritize by user impact first, then by side effects, concurrency, privilege, and recent churn. Folder structure alone is not a priority system.

### 3. Generate Hypotheses Before The Deep Pass

For each high- or medium-risk subsystem, write 2-3 concrete hypotheses before diving in. Good hypotheses are falsifiable and tied to a behavior boundary.

Examples:
- "A failure between write A and write B can leave persisted state inconsistent."
- "The retry path duplicates a side effect because idempotence is not enforced."
- "The docs promise behavior X, but the implementation falls through to Y on invalid input."

Update or discard hypotheses as evidence comes in. This step prevents aimless scanning.

### 4. Audit One Subsystem At A Time

Read the subsystem end-to-end:
- start at entrypoints and trace the happy path
- trace error paths, cleanup paths, cancellation or shutdown, and retries
- compare implementation to tests, docs, types, and public contracts
- run targeted searches, commands, or tests when they strengthen the evidence
- record exact commands, searches, and scopes when they support a finding

Select only the relevant checklist sections from `references/checklists.md`. Do not load every checklist if the subsystem only needs one or two.

When subagents are available, assign one bounded subsystem per subagent with disjoint files and ask for:
- hypotheses checked
- findings with exact citations
- coverage gaps
- suggested next verification step

### 5. Classify Findings With Evidence, Status, And Confidence

Every finding must separate observation from inference.

Required fields:
- `Severity`: `Critical | High | Medium | Low`
- `Status`: `Confirmed | Likely | Needs follow-up`
- `Confidence`: `High | Medium | Low`
- `Type`: `Bug | Race condition | Security | Stale docs | Dead code | Design flaw | Reliability`
- `Location`: exact file path and line or function
- `Impacted behavior`: the user-visible workflow, invariant, or contract at risk
- `Observed evidence`: code citation, command output, test result, log, or search result
- `Inference`: why that evidence implies the reported problem
- `What I checked`: searches, tests, docs, commits, or alternate explanations ruled out
- `Recommendation`: the smallest credible next action
- `Next verification step`: required when status is `Needs follow-up`

Use `Confirmed` only when the bug is directly demonstrated by code, a failing test, a repro path, or a hard contradiction. Use `Likely` when the reasoning is strong but not directly reproduced. Use `Needs follow-up` when something is suspicious but the evidence is incomplete.

### 6. Run A Convergence Pass

After subsystem reviews:
- deduplicate cross-cutting findings
- re-rank by severity and user impact
- run a final residue sweep for stale docs, deprecated names, orphaned helpers, temp flags, TODO or FIXME clusters, and risky APIs
- record exact residue queries and counts if they matter to the conclusion
- list coverage gaps explicitly instead of pretending the audit was complete where it was not

## Evidence Standard

Prefer stronger evidence over more words. From strongest to weakest:

1. failing or targeted test
2. reproducible path with exact steps
3. direct code contradiction with exact citations
4. logs, telemetry, or command output
5. scoped search results with counts
6. static reasoning

Static reasoning alone can still be valuable, but it should usually produce `Likely`, not `Confirmed`.

For dead code or stale docs, always show what you searched and why you believe the code or documentation is obsolete. A dead-code claim without a consumer search is incomplete.

## Reporting Rules

- Lead with findings, not the methodology recap.
- Prefer user-impacting correctness issues over stylistic cleanup.
- Keep related findings separate unless they share the same root cause.
- If nothing serious is wrong, say so directly and still report residual risk and unverified surfaces.
- Do not write "looks wrong" or "might be an issue" without saying what you checked and what would prove or disprove it.

Use the templates in `references/templates.md` for:
- scope brief
- coverage ledger
- finding format
- chat-first summary
- artifact-mode audit directory

## Session Management

Use single-session mode for small audits. For large audits or when context is tight, create a lightweight control plane:
- `00-plan.md` for the scope brief and coverage ledger
- one file per subsystem only if the audit is large enough to justify it
- `SUMMARY.md` for consolidated findings and fix order
- `HANDOFF.md` if work will continue later

A good handoff includes:
- what was covered
- what is now believed to be true
- what remains unverified
- current blockers
- exact next steps

## Anti-Patterns

- scanning directories without identifying entrypoints or invariants
- reporting every code smell as a finding
- calling something dead code without a consumer search
- calling something a bug without showing the broken behavior or violated contract
- collapsing multiple subsystems into one giant writeup
- hiding uncertainty instead of marking `Needs follow-up`

## Completion Criteria

The audit is complete when:
1. high-risk subsystems have a ledger entry and a final status
2. every reported finding has evidence, confidence, and a concrete location
3. the final report includes fix order plus unverified surfaces
4. cross-cutting and residue findings have been consolidated
5. the report is honest about what was not proven
