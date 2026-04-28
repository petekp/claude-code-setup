---
name: overnight-autonomy
description: Codify the user's standard overnight-autonomy contract so it doesn't have to be retyped every session. Triggers on phrases that signal "I'm leaving Claude running while I sleep": "i'm going to sleep", "i'm headed to bed", "i have to go back to sleep", "drive this forward overnight", "go full autonomy", "keep going until morning", "autonomously follow through", or any combination including "claude" + "sleep/bed/morning". Establishes the overnight contract, writes an autonomy manifest to the project, creates a TaskList upfront, enforces root-cause-not-symptom on every error, writes a per-phase morning log, and refuses to escalate beyond configured Codex budget. Pairs with the overnight-guard SessionStart hook so resumed overnight sessions re-apply the contract.
---

# Overnight Autonomy

## When this fires

User's prompt signals they are handing the session off to Claude while they sleep. Accepted forms (not exhaustive — match intent):

- "I'm going to sleep"
- "I'm headed to bed"
- "I have to go back to sleep"
- "Drive this forward overnight"
- "Go full autonomy [overnight|until morning|while I sleep]"
- "Keep going until morning"
- "Autonomously follow through [to the end]"
- Any prompt mentioning both "claude" AND ("sleep" | "bed" | "morning" | "overnight")

Do NOT fire on the word "autonomous" alone — that appears in non-sleep contexts (e.g., "run this autonomously" for a 20-min task).

## The contract

When this skill fires, before doing any of the user's requested work, you adopt the following contract for the rest of the session. Announce it to the user in one paragraph (not a list) so they can scroll up and confirm. Then start work.

### 1. Task list upfront
Create a full TaskList before touching any file. Every distinct unit of work the user mentioned, plus any sub-tasks you can foresee, gets a task. TaskCreate before TaskUpdate before Edit. The TaskList is the plan; the plan survives the session.

### 2. Root-cause discipline on every error
On any error — build break, test failure, type error, lint violation, runtime crash — do not patch the symptom. Enumerate 2+ hypotheses for root cause (the CLAUDE.md doctrine), pick the most likely, verify, then fix. Log the hypothesis chain to the morning log so the user can review.

### 3. Amend-commit loop is allowed
If a commit fails post-hoc (tests go red, lint fails, etc.), amending the commit to fix is allowed and expected — but only for the work that was just introduced in that commit. Never amend past work that was already green.

### 4. No Codex escalation beyond budget
Unless the user set an explicit Codex budget, you may dispatch at most 3 Codex calls across the overnight session (adversarial review counts as 1 call; re-dispatches for fold-ins count separately). Log every Codex dispatch to the morning log with input prompt and verdict.

### 5. Morning log is mandatory
Write a running log to `<project-root>/.claude/overnight-logs/<YYYY-MM-DD>-session.md`. One section per phase. Each section: goal, actions taken (bullet list with commit SHAs), errors encountered + root-cause analysis, decisions made + rationale, open questions for the user. Update it at every phase boundary and at session end. This is the artifact the user reviews in the morning.

### 6. Stop conditions
Stop the session if:
- Two consecutive phases fail their self-check twice each (genuine blocker).
- A decision is needed that the morning log cannot encode (e.g., choosing between two architecturally divergent paths with no tiebreaker evidence).
- Running budget exhausted (Codex calls, token budget if set, wall-clock if set).

Do NOT stop for: merge conflicts, flaky tests (retry 3x), transient network errors, or any ambiguity resolvable by reading more code.

### 7. Never ask the user anything overnight
The user is asleep. Asking them a question is equivalent to stopping. If you find yourself wanting to ask, instead: log the question to the morning log under "Open questions", pick the most defensible option, annotate the choice with "chose X because Y; revisit if Z", and continue.

## Resume behavior

If overnight-guard hook detects a resumed overnight run (on SessionStart:resume), the contract is re-applied automatically — no user action needed. The morning log is appended to; a new section is opened.

## Anti-patterns

- Starting work before the TaskList is committed. Never.
- Treating root-cause as optional. Every error gets the hypothesis chain, even small ones.
- Dumping a 2000-word morning log with no structure. The morning log is for the user at 7am on 50% caffeine — keep each section under 200 words, use bullets for actions.
- Proactively running Codex "just to be safe". Codex calls cost real latency and money; only dispatch when adversarial review would change a decision.
- Dispatching to Codex to "ask it what to do". Codex is for review and hard tasks, not decisions — you make the decisions overnight.

## Example announcement paragraph

"Overnight contract in effect: full TaskList before any edit, root-cause hypotheses before any fix, amend-commit loop for in-flight work only, max 3 Codex calls, morning log at `.claude/overnight-logs/2026-04-23-session.md` updated at every phase boundary. If I hit a genuine blocker I'll stop and log it; otherwise I'll keep going until the TaskList is clean or dawn, whichever first. Starting now."
