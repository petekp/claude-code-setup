# Step-change patterns: the taxonomy

The synthesis step of the audit must look for **leverage points** — places where a single change eliminates a whole class of future friction — not polish items. Every finding must be classified into one of these buckets, or dropped.

A finding that doesn't map to a leverage class usually isn't a step change. If the "fix" is "be more thoughtful about X," it's not a leverage point, it's advice.

---

## 1. Correction loops → persistent rules

### Signal
The same correction appears across multiple sessions. Heuristic detectors: repeated occurrences of negation language ("no don't", "stop", "actually") in the turn *after* an assistant action. Recurring specific corrections ("use integration tests, not unit tests"; "don't add comments"; "stop summarizing at the end").

### Why this is leverage
A correction uttered 14 times across 60 sessions represents a permanent tax. The tax is the correction itself (a user turn that wouldn't otherwise exist) plus whatever Claude did that had to be undone. Moving the correction into global or project CLAUDE.md pays down the tax every future session.

### Fix templates
- **Global rule** → `~/.claude/CLAUDE.md`
- **Project rule** → `<repo>/CLAUDE.md`
- **Agent-specific rule** → inside the agent's frontmatter

### What a good fix looks like
> **Don't summarize code changes at the end of a turn.** The user reads diffs and finds trailing summaries noisy. Instead, end with at most one sentence describing what changed and what's next.

Note the shape: rule → why → how to apply. Not just "don't summarize" — the *why* lets Claude judge edge cases.

---

## 2. Repeated workflows → skills or commands

### Signal
Multiple sessions where the *first prompt* expresses the same intent ("audit my skills", "clean up unused code", "check if tests still pass after this change"). Or: multiple sessions where the tool sequence is substantially the same (same sequence of Bash / Read / Edit patterns).

### Why this is leverage
A workflow that the user reinvents every time costs: (a) tokens to re-describe what they want, (b) rediscovery of the right tool sequence, (c) subtly different results from one session to the next. A skill or slash command makes it one-shot and consistent.

### Fix templates
- **Skill** → `~/.claude/skills/<name>/SKILL.md` — for anything that benefits from rich guidance and multi-step reasoning.
- **Slash command** → `.claude/commands/<name>.md` — for short, parameterized prompts.

### What a good fix looks like
A ready-to-install `SKILL.md` with frontmatter (name + description tuned for the user's actual phrasing) and a body that captures the workflow the user keeps reinventing.

---

## 3. Tool failures → hooks, permissions, or MCP

### Signal
Recurring `is_error: true` tool results. Or: Claude gets the same permission prompt across many sessions. Or: Claude repeatedly runs a script that fails and then has to debug it (same script, same failure mode, multiple sessions).

### Why this is leverage
A recurring failure is a configuration gap. Letting Claude tread the same broken path repeatedly is pure waste.

### Fix templates
- **Permission rule** → `settings.json` allowlist so a specific Bash call stops needing confirmation.
- **Hook** → shell script triggered by a Claude Code event (PreToolUse, PostToolUse, SessionStart, etc.) that automates away the broken step.
- **MCP server** → if the friction is "Claude doesn't have access to X and has to work around it", install or propose an MCP.

### What a good fix looks like
- A diff to `settings.json` (with the exact allowlist entry).
- A hook script with `#!/usr/bin/env bash` and real code, not pseudocode.

---

## 4. Context drift → CLAUDE.md context blocks

### Signal
Sessions that start with the user re-explaining the same project context ("we use X for Y", "the legacy Z is still around", "don't touch the Q module"). Or: sessions that fail because Claude missed a convention it couldn't have known.

### Why this is leverage
A project fact re-typed into every session is a leak. Persisting it into CLAUDE.md means Claude arrives pre-briefed.

### Fix templates
- Project-level CLAUDE.md additions with explicit sections ("Conventions we follow", "Things to avoid", "Where things live").
- Agent memory entries — if the fact applies across projects.

---

## 5. Capability mismatches → mental model shifts

### Signal
The user treats Claude as a narrow tool when Claude could do more. Or: the user doesn't use parallelism / subagents / plans when the task warrants them. Or: Claude doesn't reach for TaskCreate when the user would benefit from progress visibility.

### Why this is leverage
This is the biggest, hardest-to-see class of step change. If the user is doing micro-interactions where a single planned macro-interaction would work better, every session is less productive than it could be.

### Fix templates
- Doctrine in CLAUDE.md ("For any task involving N+ steps, use TaskCreate up front").
- A new skill that nudges toward the better pattern.
- A hook that reminds Claude at the right moment.

### What a good fix looks like
A concrete rule plus an example: "When the user's first prompt describes a task that touches 3+ files, respond with a TaskCreate plan before editing anything. Example: prompts starting with 'add X to Y' or 'refactor Z' qualify."

---

## 6. Session lifecycle issues → hooks and handoffs

### Signal
Very short sessions (< 3 user turns) clustered around the same intents — suggests the user wasn't getting what they wanted quickly. Or: sessions ending with `[Request interrupted by user]`. Or: repeated session starts with no carry-over context.

### Why this is leverage
Session boundaries are where a lot of context dies. Starting a new session and rebuilding context is high-cost. Ending a session with work incomplete is wasted work.

### Fix templates
- SessionStart hooks that inject fresh status.
- Continuity / handoff skills.
- Automatic bookmarking of in-progress work.

---

## 7. Skill / configuration dead code

### Signal
Skills installed but never triggered in the sample. Hooks firing on every session but doing nothing useful. Settings.json entries referencing paths that don't exist.

### Why this is leverage
Untriggered skills that compete with working ones add context noise. Broken hooks clutter every session start. Cleaning these up isn't a feature improvement, but it compounds — less noise means more signal for everything else.

---

## 8. High-leverage tooling gaps

### Signal
The user manually copies data between tools. Claude does the same data munging by hand every time. The user has an external workflow (Notion, Slack, docs) that keeps coming up in prompts ("can you put this in notion", "send this to slack").

### Why this is leverage
MCP servers for the external tool turn "manual copy + paste + reformat" into "done in one turn, done right, every time". This is often 10x leverage.

### Fix templates
- Specific MCP server recommendations with install commands.
- If the MCP doesn't exist: a skill that automates the closest approximation.

---

## How to apply this taxonomy during synthesis

1. For every cluster of findings from the subagents, ask: "which of the 8 buckets does this fit?"
2. If a cluster doesn't fit any bucket, it's probably not a step change. Either reframe it into a bucket or drop it.
3. For each kept cluster, draft the fix using the template for that bucket.
4. Rank clusters by **frequency × severity × fix leverage**. Leverage is the decisive factor: a fix that helps 60 future sessions beats a fix that helps 5.
5. Aim for 3–5 top-tier recommendations. If you have more, you're not being selective enough. If you have fewer, you're missing patterns — look harder at the friction and correction samples.

## Anti-patterns to avoid

- **"Add more tests"** — not a pattern, not actionable, not a step change.
- **"Use Claude more carefully"** — blames the user; Claude's configuration is what changes.
- **"Claude did X wrong in session Y"** — one-off; skill only cares about patterns.
- **"Consider using skill Z"** — vague; tell them to add it, explain why, or prove the current version doesn't work.
- **Ranking by session count instead of leverage** — the most frequent issue isn't always the most valuable to fix.
