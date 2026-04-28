# Claude Code Usage Audit — What to Change

**Sample:** 29 sessions across 8 active projects (capacitor, circuit, circuit-next, ever-arc-design-studio, Code, claude-code-setup, pete-2025, agent-skills), 3,012 tool-use turns, 1,184 bash calls, 102 user prompts.
**Date:** 2026-04-23. Window: last ~14 days.

---

## The Headline

You're getting maybe 40% of the leverage this setup could deliver. Three big wins are sitting on the table:

1. **Parallel tool calls aren't happening.** 1 out of 3,012 turns used parallel tool calls (0.03%). Every file read, every grep, every git command runs serially. This is the single biggest speedup available — latency compounds fast on long autonomous runs.
2. **Skill clutter is actively hurting you.** You have ~90 skills registered. Only 6 actually fired in the sample (circuit:handoff, codex, circuit:run/repair/build/sweep, code-conventions). The rest are 400+ lines of descriptions re-injected on every turn, crowding out your actual task context.
3. **Monster bash one-liners are swallowing iteration quality.** 14% of your bash calls are >300 chars; 19% heavily chain commands with `&&`/`;`. That's the assistant compressing "parallel investigation" into opaque mega-pipelines because it can't (or won't) issue parallel tool calls. Failures inside these chains are harder to debug and retry.

Fix these three and you'll notice it — not a polish improvement, a *step change*.

---

## Finding 1 — Parallelism is essentially zero. Fix this first.

**Evidence:** 3,012 tool-use turns, 1 parallel turn. Avg tools per turn: 1.00.

Claude is capable of issuing multiple independent tool calls in the same turn. You're almost never getting that. Every session reads files, greps, runs git status, runs lint, one-at-a-time when the work is trivially parallelizable.

**Why it's happening:** Nothing in your global `CLAUDE.md` (the private instructions file) or `~/Code/claude-code-setup/CLAUDE.md` explicitly instructs parallel tool use. The default behavior in Claude Code with `alwaysThinkingEnabled: true` plus `effortLevel: xhigh` appears to bias toward careful sequential reasoning, not batched execution.

**The fix:** Add a rule to your global `~/.claude/CLAUDE.md`:

```markdown
## Parallel Tool Calls

When issuing tool calls that don't depend on each other's output, ALWAYS batch them in a single response. Examples: reading multiple files, running git status + git diff + git log, checking package.json + tsconfig + next.config in one turn, grepping for two independent patterns. Serialize ONLY when a later call depends on an earlier call's output.
```

Realistic impact: 30–50% reduction in wall-clock time on exploration/investigation phases. On a 30-minute autonomous run, that's 10–15 minutes back.

---

## Finding 2 — Skill overload. Prune aggressively.

**Evidence:** In this conversation alone, the system-reminder listing all skills appeared *3 times*, each time ~100+ skills, burning thousands of tokens of context every time the skill list refreshes. In the 29-session sample, these 6 skills account for 100% of actual invocations:

| Skill | Invocations | Notes |
|---|---|---|
| circuit:handoff | 10 | Heavy daily use |
| codex | 6 | Actively used for delegation |
| circuit:run | 4 | Router for Circuit workflows |
| circuit:repair / build / sweep / docs-polish | 1 each | Occasional |
| code-conventions, motion, method-janitor | 1 each | One-offs |

**The 80+ skills that never fire** (claude-api, ai-sdk, clean-architecture, typography, deepwiki, dogfood, grill-me, literate-guide, audit-and-migrate, seam-ripper, dead-code-sweep, architecture-scaffold, exhaustive-systems-analysis, improve-codebase-architecture, ubiquitous-language, manual-testing, tdd, swift-apps, swiftui-expert-skill, vercel-* [~20 of them], plugin-dev:* [~6], plus the rest) are all loaded into context descriptions on every turn.

Note: you already *have* a `skill-manager` skill for exactly this kind of pruning. The "we just did this several times recently" comment in one session (when fighting effort level) suggests you've felt this friction.

**The fix — three options, in order of leverage:**

- **High:** Disable the Vercel plugin entirely unless you're doing Vercel work this week. That's ~25 skills gone in one keystroke. Flip `"vercel@claude-plugins-official": false` in `settings.json`.
- **High:** Disable `plugin-dev` skills outside of plugin-creation weeks (6 skills).
- **Medium:** Run your own `/skill-manager` skill to audit and mark the long-tail personal skills you haven't touched (audit-and-migrate, literate-guide, seam-ripper, ubiquitous-language, grill-me, etc.) as disabled or moved to project-only.

Keep enabled: `circuit:*`, `codex:*`, `skill-creator`, `update-config`, `skill-manager`, `process-hunter`, `claude-code-audit` (you clearly invoke these). Consider: `react-doctor`, `react-useeffect`, `vercel-react-best-practices`, `agent-browser` — useful for your design-focused Next.js work.

Realistic impact: lower token burn per turn, faster responses, less risk of the wrong skill triggering.

---

## Finding 3 — "Mega-bash" pipelines are a symptom of #1, but also fixable directly.

**Evidence:** 170/1,184 bash calls (14.4%) are >300 characters. Representative example:

```bash
ls /Users/petepetrash/Code/ever/arc-design-studio/src/app/ && echo "---middleware---" && ls /Users/petepetrash/Code/ever/arc-design-studio/src/middleware.* 2>/dev/null ; ls /Users/petepetrash/Code/ever/arc-design-studio/middleware.* 2>/dev/null ; echo "---docs dir---" ; ls [...]
```

This would ideally be 4–6 parallel `Read`/`Glob` calls, or two parallel `Bash(ls)` calls. What's happening is the assistant compresses "I want to look at five things" into one giant chained pipeline because that's the only way to get multi-result output in a single tool call when parallel calls aren't the default.

Also seen: 89 grep/rg-via-bash calls when there's a dedicated `Grep` tool; 34 find-via-bash when there's a `Glob` tool. Your global `CLAUDE.md` already tells Claude to prefer the dedicated tools — but once Claude is already inside a chained bash plan, it doesn't always remember.

**The fix:** One sentence in your global CLAUDE.md under a new "Bash Hygiene" heading:

```markdown
## Bash Hygiene

- Never chain more than 2 commands with `&&`/`;` in a single Bash call. If you need to look at 4 things, issue 4 parallel tool calls (Read, Glob, or separate Bash) in the same turn — do not collapse them into a mega-pipeline.
- Use Grep (not bash grep/rg) and Glob (not bash find) for code search. Bash grep is only for quick log scans.
```

This rule plus Finding #1 together is the real win — they reinforce each other.

---

## Finding 4 — Handoff-driven workflows are your superpower. Don't water them down.

**Evidence:** 15/29 sessions (52%) begin with "resume" or "resume from handoff". Overnight/autonomy prompts: 4 sessions explicitly delegate with "I'm stepping away", "going to sleep", or "full autonomy mode". The Circuit framework + Codex delegation + handoff continuity is clearly carrying a lot of your throughput.

**What's working:** `/circuit:handoff` save+resume is genuinely operational. Long sessions (300–900 lines) resume cleanly. Task lists are consistently created (289 TaskUpdate + 170 TaskCreate calls across the sample).

**Two small gaps worth closing:**

- **Stale handoff headers.** One assistant response explicitly noted: *"The handoff header looks stale — Slice 13 already landed. Let me verify the actual repo state before proceeding."* This is a repeating pattern in multi-session Circuit runs. Consider teaching `/circuit:handoff` to always include a `last verified at: <git-sha>` field and a `cross-check: git log vs plan` step on resume. Low effort, prevents 5–10 min of state-reconciliation every autonomous restart.
- **Effort-level confusion.** Multiple prompts in the sample are you trying to get effort level set correctly mid-session ("change your effort level to xhigh", "but we just did this several times recently"). Your `settings.json` *is* `"effortLevel": "xhigh"`, but the statusline apparently shows "low" sometimes. This smells like a caching or initialization bug in the status display, not a model behavior problem. Worth a quick check of `~/.claude/statusline-command.sh` — you have 3 backup copies, suggesting this has been fiddled with and may be reading a stale source.

---

## Finding 5 — `respectGitignore: true` + `additionalDirectories: ~/Code` is probably costing you occasional friction.

Your settings have `additionalDirectories: ["/Users/petepetrash/Dropbox/Screenshots", "~/.claude/skills", "~/Code"]`. Adding all of `~/Code` means every session can see every other project you've ever worked on. Combined with `respectGitignore: true` and the deny list you have, this is probably fine — but it's also why your project sampling showed "-Users-petepetrash-Code" as a separate project directory with 19 sessions inside. You're sometimes launching Claude Code from `~/Code` directly rather than from a specific project.

Not urgent, but: consider whether tightening the working-directory discipline (always `cd` into the specific project before launching) would reduce cross-project context bleed in handoffs. The handoff data showed one session where Claude had to stop and verify which of several worktrees it was actually in.

---

## Priority Order (what to change today)

1. **Add parallel-tool-calls rule to `~/.claude/CLAUDE.md`** (5 min). Biggest single win.
2. **Add bash-hygiene rule to `~/.claude/CLAUDE.md`** (2 min). Reinforces #1.
3. **Disable Vercel + plugin-dev plugins in `settings.json`** unless currently working on them (1 min). Major context-window reclaim.
4. **Add `cross-check against git log on resume` step to `/circuit:handoff`** (15 min). Prevents stale-plan thrash in autonomous runs.
5. **Debug statusline effort-level display** (10 min). Minor but you hit it repeatedly.

Skip unless you have spare time:
- Deep skill pruning beyond the plugin toggles (low marginal return after #3).
- Working-directory hygiene (Finding 5) — only matters if handoffs keep getting confused.

---

## What I deliberately didn't flag

- "You use a lot of tokens." Yes, you do — but you're running opus with xhigh on autonomous overnight runs. That's a deliberate tradeoff, not a bug.
- "Your prompts are short." 43% of your prompts are <30 chars. For someone using a sophisticated handoff/Circuit system, "resume", "continue", "2", "A" are *correct* — they're the human acknowledgment step in an otherwise-autonomous loop. Not a problem.
- "Consider using sub-agents more." You have 0 Task(subagent) calls in the sample. That's fine — you're using Codex delegation and parallel Claude sessions instead, which is a more powerful pattern for your use case.
