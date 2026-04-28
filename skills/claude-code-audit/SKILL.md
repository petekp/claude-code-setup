---
name: claude-code-audit
description: Forensic audit of the user's recent Claude Code sessions to surface step-change workflow improvements — not marginal ones. Use when the user asks to "audit my Claude Code sessions", "analyze how I use Claude Code", "find patterns in my usage", "improve my Claude Code workflow", "review my sessions", "find leverage in my setup", or wants to understand where their Claude Code setup is leaking time. Samples dozens of real transcripts, extracts quantitative signal via scripts, uses parallel subagents for deep reads, then synthesizes into a short prioritized report with drafted implementations (new skills, CLAUDE.md rules, hooks, settings diffs) that the user can install directly. Trigger even when the user doesn't say the word "audit" — if they're asking about improving or reviewing their Claude Code habits at scale, use this skill.
---

# Claude Code Audit

## What this is

A disciplined framework for auditing a large sample of the user's Claude Code sessions to find **step-change** improvements — the 2–3 changes that would transform their workflow, not the 20 that would polish it.

The default behavior when asked "how can I improve my workflow" is to produce a long list of marginal suggestions. That output is worse than useless: it buries real leverage under pleasant-sounding noise, and the user does nothing with it. This skill exists to prevent that outcome.

## The guarantee

By the end of this audit you will have produced:

1. **A short prioritized report** — the few findings that would actually move the needle, with quantified evidence.
2. **Drafted implementations** — ready-to-install skills, CLAUDE.md rules, hook scripts, or settings diffs for the top recommendations. *Not suggestions. Actual drafts.*
3. **A paper trail** — the extracted data, sampled session list, and subagent findings, so the user can verify the synthesis and revisit it later.

If you end the audit having produced only observations, you have failed.

## Step-change vs marginal — hold this distinction the whole way

| Marginal | Step change |
|----------|-------------|
| "You should use skill X more often" | "Skill X never triggers on prompts like these — its description excludes the phrasing you actually use. Here's a new description." |
| "You correct Claude a lot about testing style" | "You've given the same correction 14 times in 30 days. The root pattern is Claude defaults to unit tests when you want integration tests. Here's a CLAUDE.md paragraph that eliminates the correction loop." |
| "Consider adding tests earlier" | "19 of your 60 sessions have a 'test afterward' → 'fix regression' → 'fix another regression' loop that averages 35 min and 80k tokens. A pre-commit hook that runs your existing test script would short-circuit it." |

The left column is observation. The right column is diagnosis plus prescription plus evidence. You produce the right column.

## Where session data lives

- Root: `~/.claude/projects/<encoded-project-path>/<session-id>.jsonl`
- Each line is one event: `user`, `assistant`, `attachment` (hook result), `system`, `file-history-snapshot`, `last-prompt`.
- The user is at `~/.claude/` with global CLAUDE.md, skills, settings, and hooks. You'll cross-reference against these during synthesis.
- See `references/session_format.md` for the JSONL schema and which fields matter.

## Setup — working directory

Before starting, set `SKILL_DIR` and `AUDIT_DIR`:

- `SKILL_DIR=~/.claude/skills/claude-code-audit` (where the scripts live — never modify this)
- `AUDIT_DIR=~/claude-audit/<date>` (where the audit outputs go — create a fresh subdir per run, or use a path the user provided)

All `python $SKILL_DIR/scripts/...` invocations below assume these are set. Run from any `cwd`; the scripts take absolute paths. Create `AUDIT_DIR` before stage 1.

## The five stages

Create a TaskList for these so the user can see progress. This is a long-running analysis — 20 to 60 minutes depending on sample size.

### Stage 1 — Inventory

```bash
python $SKILL_DIR/scripts/inventory.py --out $AUDIT_DIR/inventory.json
```

Catalogs every session: path, project, timestamp, size, rough message/turn/tool counts, token totals, version, git branch. Cheap, deterministic. Read the summary it prints.

### Stage 2 — Sample

```bash
python $SKILL_DIR/scripts/sample.py --inventory $AUDIT_DIR/inventory.json --count 60 --days 60 --out $AUDIT_DIR/sample.json
```

Stratified sample weighted toward recency but diverse across projects and session sizes. Print the distribution. Tell the user the shape of the sample in one sentence ("60 sessions: 40 from last 2 weeks, 20 older; spanning X projects") and proceed unless they push back.

### Stage 3 — Extract

```bash
python $SKILL_DIR/scripts/extract.py --sample $AUDIT_DIR/sample.json --out $AUDIT_DIR/extracted/
```

For each sampled session, writes a JSON with: user prompts (real ones, not command wrappers), assistant tool-use sequence, error counts, skill/command invocations, token usage, approximate wall-clock duration, first-prompt intent, "correction" markers (user messages that follow a failed tool or that use corrective language), and session outcome hints.

Then aggregate:

```bash
python $SKILL_DIR/scripts/extract.py --aggregate $AUDIT_DIR/extracted/ --out $AUDIT_DIR/aggregate.json
```

You now have the quantitative layer. Skim it. Flag any surprises — surprises are leads.

### Stage 4 — Deep read via parallel subagents

Scripts miss the qualitative signal: frustration, confusion, circularity, breakthrough moments, mental-model mismatches. Subagents handle this.

Split the sample into batches of 8–10 sessions. Launch all batches **in a single message** (parallel, not sequential). For each batch, spawn an `Explore` subagent with the briefing from `references/subagent_brief.md` plus:

- The list of session file paths in its batch.
- The path to `$AUDIT_DIR/aggregate.json` so it has global context.
- The path to `$SKILL_DIR/references/step_change_patterns.md` as its lens.
- The user's current skills dir (`~/.claude/skills`), CLAUDE.md (`~/.claude/CLAUDE.md`), and settings.json (`~/.claude/settings.json`), for cross-reference.
- Tell it to use `python $SKILL_DIR/scripts/render.py <session-path>` to get readable transcripts. Using render.py is critical — raw JSONL will blow its context.

Each subagent returns a structured JSON of findings. Save to `$AUDIT_DIR/batch-<N>-findings.json`.

### Stage 5 — Synthesize

This is where the skill earns its name.

1. Read every batch-findings file and the aggregate.
2. Cluster findings across batches. A pattern that appears in one session is noise; a pattern in eight is signal.
3. Rank clusters by **frequency × severity × fix leverage**. Leverage = how many future sessions the fix would affect. A fix that helps one niche workflow is not leverage; a fix that removes friction from every coding session is.
4. Apply `references/step_change_patterns.md` as a filter — is each top cluster a marginal tweak or a step change? If it's marginal, either promote it to something bigger (find the underlying doctrine) or drop it.
5. Write the report using `references/report_template.md`.
6. **Draft the fixes.** Every top-tier recommendation gets a real draft, not a description of a draft. New skill? Write the SKILL.md. New rule? Write the paragraph, word for word. New hook? Write the script. Settings change? Show the diff.

## Non-negotiables

**You draft the fix.** If you find yourself writing "the user could consider adding a skill for X", stop and write the skill. If you write "a CLAUDE.md rule about Y would help", stop and write the exact paragraph. This is the single most important thing this skill does. Skip it and the audit is worthless.

**Short over complete.** A 3-item report the user acts on beats a 30-item report they skim and forget. Cut everything that isn't leverage.

**Numbers, not adjectives.** "Frequently", "often", "sometimes" are lies. Say "17 of 60 sessions" or "23 corrections across the sample". The scripts give you exact counts — use them.

**Cite the sessions.** Every claim in the report names specific session IDs as evidence. The user must be able to open a session and verify the pattern.

**Audit Claude, not the user.** If the user keeps correcting the same thing, Claude's defaults are wrong for them — not the other way around. Don't scold the user for their prompting. Find the pattern in Claude's behavior that forces the correction, and write the fix to Claude's configuration.

## Common failure modes

- **Observation dump.** Listing 40 patterns with no priority. Fix: be brutal in cutting.
- **Self-congratulation.** Only describing things Claude did well. Fix: deliberately hunt for failures, frustrations, and circling.
- **Vague prescriptions.** "Consider improving X." Fix: you draft the improvement or you don't include it.
- **Project tunnel vision.** Reporting only on the most-active project. Fix: sample forces diversity; honor it in the write-up.
- **Ignoring the meta-level.** Focusing only on in-session behavior and missing cross-session patterns (sessions ending prematurely, same context being rebuilt every time, etc.). Fix: `references/step_change_patterns.md` explicitly calls these out; reread before synthesis.

## Output layout

```
$AUDIT_DIR/
  inventory.json            # stage 1
  sample.json               # stage 2
  extracted/<session>.json  # stage 3
  aggregate.json            # stage 3
  batch-<N>-findings.json   # stage 4
  report.md                 # stage 5 — the deliverable
  drafts/                   # stage 5 — the implementations
    skills/<skill-name>/SKILL.md
    claude-md-additions.md
    hooks/<hook-name>.sh
    settings-diff.json
```

Default `$AUDIT_DIR` to `~/claude-audit/<YYYY-MM-DD>/` unless the user specifies otherwise. Everything stays on disk so the user can rerun, verify, or share.

## Reference files

- `references/session_format.md` — JSONL schema and field meanings
- `references/step_change_patterns.md` — taxonomy of leverage points; the lens for synthesis
- `references/report_template.md` — required output structure
- `references/subagent_brief.md` — prompt you pass to stage-4 subagents
