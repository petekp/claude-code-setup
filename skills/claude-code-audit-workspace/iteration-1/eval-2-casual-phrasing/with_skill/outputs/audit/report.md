# Claude Code Audit — 2026-04-23

Sampled **25 sessions** across **4 projects**, covering **2026-03-29 to 2026-04-23** (last 30 days; pool of 539 recent sessions out of 597 total). Totals across the sample: **175 user prompts**, **3,631 tool uses**, **92 tool errors**, **52 correction markers**, **14 friction markers**, **3 interrupts**, **188.5 hours** of session time.

## TL;DR

1. **Bound sessions by subtask, not by availability.** Your median session is 145 tool uses and 7.5 hours. The re-entry cost of "resume" is eating a real chunk of every next session — and in two cases you lost track of what you were even working on. Fix: one subtask per session, hard stop.
2. **Stop reacting to Circuit slash-command boilerplate and Stop-hook nag as if it were user input.** The boilerplate and "Auto-continuity guard" text is showing up as 30+ of your 52 correction markers. It's noise, not correction — but Claude is treating it as signal and it's warping attention inside long sessions.
3. **Archive the ~25 skills you never trigger.** 40+ skills installed, ~6 actually fire in a month. The dead skills crowd the skill-list system reminder and dilute trigger accuracy for the ones you do use.

Each recommendation has a drafted implementation under `audit/drafts/`.

---

## The top recommendations

### 1. Enforce one-subtask-per-session discipline

**Category:** capability mismatch + session lifecycle
**Evidence:** 16 of 25 sampled sessions (`50db8177`, `f81f89e2`, `f33baece`, `57173ff0`, `03422d07`, `8ba9caad`, `91fce543`, `cc3f5848`, `7bba5176`, `f3f8afbb`, `7a6381ea`, `2b691fa5`, `d4b55b23`, `68295abb`, `b12fc3bd`, `a0c8538e`) begin with a bare `resume`, `resume handoff`, or `continue from handoff`. Average session: 145 tool uses, 452 min wall-clock. 5 sessions crossed 80 Bash calls.
**Cost:** Three telling moments:
- Session `68295abb` (24 real prompts over a week): "oh, perhaps, i actually forget what we've been focused on in this session. i think things might have gotten tangled a bit."
- Session `81151565`: "Help me understand why this effort has taken SO long. I've totally forgotten what we're even doing."
- Session `32d27b72`: "I don't want to manually validate; i want this to run autonomous" — followed by a long sequence of corrections about rigor.

These are the three classic failure modes of a mega-session: the user loses the thread, work has compounded past the point the user can verify it, and the user starts handing over scope with prompts like "proceed then", "1", or "3" rather than real intent.

**Fix:** CLAUDE.md rule + new skill + PostToolUse hook, all three.

- **Rule:** `audit/drafts/claude-md-additions.md` — "Session scope discipline" paragraph. Tells Claude to stop, save handoff, and prompt a new session when a new subtask enters a session that has already material work in flight.
- **Skill:** `audit/drafts/skills/session-scope-guard/SKILL.md` — fires on new-subtask detection and runs the explicit protocol (propose handoff, wait, continue or split).
- **Hook:** `audit/drafts/hooks/session-size-warning.sh` — PostToolUse hook that injects a one-time warning after 80 tool uses or 60 min. The hook's stderr shows up in Claude's context, which nudges it to surface the option without requiring the user to notice the drift first.

Why this specific shape: a CLAUDE.md rule alone won't hold against mid-session momentum. The skill makes the protocol concrete. The hook makes the trigger measurement-based rather than vibe-based.

### 2. Stop treating Circuit wrapper prompts and Stop-hook feedback as user input

**Category:** correction loop + dead-code config
**Evidence:** Of the 52 "correction markers" in the extracted data, at least 30 are one of:
- The "Direct slash-command invocation for /circuit:run..." wrapper block that auto-accompanies every Circuit slash command (seen in `50db8177`, `68295abb` x2, `b12fc3bd` x2, etc.).
- The "Base directory for this skill: /Users/petepetrash/.claude/skills/codex..." block that fires when `codex` is invoked (seen in `03422d07`, `2b691fa5`, `57173ff0`, `68295abb`, `7bba5176`, `91fce543`, `cc3f5848`, `f33baece`, `f81f89e2` — at least 9 distinct sessions).
- "Stop hook feedback: Auto-continuity guard: ..." pushing `circuit:handoff save` on every turn where HEAD advanced (seen in `2b691fa5`, `57173ff0`, `7bba5176`, `91fce543` x3, `8ba9caad`, `f3f8afbb`, `d4b55b23`).

None of these are the user. The wrapper is boilerplate. The Stop hook is advisory. But they arrive in user turns with negation-flavored text ("Do not...", "stop without..."), and Claude reads them as push-back. Two downstream symptoms:

1. Claude frequently re-states the wrapper rules back ("Understood, I will launch the skill immediately...") — wasted output tokens and noisy context.
2. In `91fce543` the Stop-hook guard fires three times in quick succession, each time eating a user-turn slot and pushing the session toward a handoff Claude doesn't actually need to do.

**Fix:** CLAUDE.md rule, `audit/drafts/claude-md-additions.md` — "Circuit slash-command boilerplate is noise" and "Stop-hook continuity guard is informational" paragraphs. Both tell Claude to treat these specific text shapes as system instructions, not user directives.

Secondary fix (not drafted): consider editing the Circuit Stop-hook to fire at most once per 1500 seconds and never on turns that already invoked `circuit:handoff`. That change belongs in the Circuit plugin, not in `~/.claude/` — flagging it rather than drafting it because it's upstream.

### 3. Archive dead skills; 25+ of your 40 installed skills did not fire in 30 days

**Category:** skill / configuration dead code
**Evidence:** Skill tool invocations across the sample (25 sessions, 30 days):

| skill | invocations |
|-------|-------------|
| `circuit:handoff` | 91 |
| `circuit:run` | 34 |
| `codex` | 11 |
| `circuit:explore` | 4 |
| everything else combined | 0 in this sample |

Skills installed that did not fire in the sample include: `api-design-patterns`, `architecture-exploration`, `clean-architecture`, `deep-research`, `deepwiki`, `dogfood`, `exhaustive-systems-analysis`, `formal-verify`, `grill-me`, `improve-codebase-architecture`, `literate-guide`, `manual-testing`, `process-hunter`, `seam-ripper`, `simplify`, `swift-apps`, `swiftui-expert-skill`, `tdd`, `typography`, `ubiquitous-language`, `unix-macos-engineer`, `vercel-composition-patterns`, `vercel-react-best-practices`, `ai-sdk`, `agent-browser` and `browser-use` (these two overlap), `agentation`, `skill-creator`, `skill-manager` (ironic).

Every one of these contributes to the skill-list system reminder that's re-sent on skill-matching checks. Some of them (like `architecture-exploration`, `seam-ripper`, `improve-codebase-architecture`) have descriptions broad enough that they *might* be swallowing triggers that `circuit:explore` should handle — and vice versa.

**Fix:** `audit/drafts/skills/skill-dead-code-sweep/SKILL.md` — a skill that enumerates installed skills, cross-references against session transcripts, and recommends archive/rewrite/keep per skill. You already have a `skill-manager` skill which appears to partly cover this; first step is to run it and see what it reports, then use this draft to fill any gap. If `skill-manager` already does the full analysis, disable or delete the draft I wrote and just use `skill-manager`.

Archival should go to `~/.claude/skills-archived/` rather than deletion — reversible, and keeps the content available for manual reference.

---

## Quantitative snapshot

| metric | value |
|---|---|
| Sessions analyzed | 25 |
| Projects represented | 4 (circuit-next, capacitor, ever/arc-design-studio, circuit) |
| User prompts (incl. wrapped) | 175 |
| Tool uses | 3,631 |
| Tool errors | 92 |
| Interruptions | 3 |
| Avg session duration | 452 min (~7.5 hr) |
| Avg tool uses / session | 145 |
| Avg corrections / session | 2.08 |
| Top tool | Bash (1,666) |
| Top slash command | /circuit:handoff (91) |
| Sessions likely abandoned | 4 |

**Top tools:** Bash 1666, Edit 512, Read 501, TaskUpdate 329, Write 174, TaskCreate 173, Grep 132, Skill 41, ToolSearch 32, Agent 24

**Top bigrams:** Bash -> Bash 877, Read -> Read 168, Edit -> Edit 165, TaskCreate -> TaskCreate 141, TaskUpdate -> TaskUpdate 141. The Bash -> Bash dominance (877 vs next-highest 168) suggests long inspect/execute loops — a natural fit for Circuit runs but also a reason sessions balloon in tool-use count.

**Top slash commands:** /circuit:handoff 91, /circuit:run 34, /codex 11, /circuit:explore 4. (/Users, /path, /tmp are path-prefix false positives from the extractor — ignore.)

**Hook events:** SessionStart:clear 66, UserPromptSubmit 26, Stop:Stop 13, SessionStart:resume 11, SessionStart:startup 3. Stop hook firing 13x across 25 sessions confirms the guard-spam pattern in recommendation 2.

---

## Secondary findings (tier 2)

- **Overnight autonomy prompts are still novel scope.** 3 of 25 sessions (`32905b6f`, `2b691fa5`, `b12fc3bd`) start with "I'm going to sleep, continue autonomously." These are deliberate mega-sessions and should get a differently-shaped flow — a pre-commit gate, a periodic summary dump, and a wake-time digest. Currently they use the same Circuit handoff chain as normal work and you end up reviewing a huge diff in the morning. Not drafted; flagged.
- **TaskCreate -> TaskCreate (141) and TaskUpdate -> TaskUpdate (141) suggest tight task-list churn.** Creating a task and immediately creating another is fine; updating and immediately updating again suggests over-granular tracking. Not a step change; worth watching.
- **`codex` skill's trigger is already narrow and working.** 11 invocations across the sample, all from explicit /codex or "ask codex" phrasing, none of them misfires. Leave it alone.
- **ToolSearch appears 32 times, mostly from the Codex flow.** If you rarely use the deferred tools it discovers, consider whether the default tool set could cover them statically.

---

## Negative space — what I looked for and didn't find

- **Permission friction.** I looked for recurring permission-prompt interrupts, repeated Bash(...) denials, or MCP-auth failures. None surfaced at a pattern level — your allowlist in ~/.claude/settings.json is doing its job. One-offs only.
- **Test-style correction loops.** Your global CLAUDE.md already has TDD rules. The sample had no "no, use integration tests" / "don't add comments" corrections — those doctrines have landed.
- **Project tunnel vision.** The sample is heavy on circuit-next (13 sessions) and arc-design-studio (4), so findings skew toward the Circuit workflow. capacitor and circuit each contributed 4 sessions and show the same handoff-fragmentation pattern, so I'm confident the recommendation generalizes rather than being Circuit-specific.

---

## Drafts

All drafted implementations are under audit/drafts/:

- drafts/claude-md-additions.md — paragraphs to append to ~/.claude/CLAUDE.md (covers recommendations 1 and 2).
- drafts/skills/session-scope-guard/SKILL.md — new skill that enforces one-subtask-per-session.
- drafts/skills/skill-dead-code-sweep/SKILL.md — new skill that surveys installed skills vs actual usage (recommendation 3). Cross-check against your existing skill-manager skill before installing.
- drafts/hooks/session-size-warning.sh — PostToolUse hook that warns Claude after 80 tool uses or 60 min.
- drafts/hooks/install.md — one-page install doc for the hook.

---

## What to do next

1. Read drafts/claude-md-additions.md and paste all four paragraphs into ~/.claude/CLAUDE.md. Highest-leverage move; costs nothing to revert.
2. Install drafts/skills/session-scope-guard/ into ~/.claude/skills/session-scope-guard/. Restart a new session to pick it up.
3. Install and chmod +x drafts/hooks/session-size-warning.sh, then wire it into settings.json per drafts/hooks/install.md.
4. Invoke the existing skill-manager skill ("check my skills" or "audit my skills"). If it surfaces the dead-skill list, archive them. If it doesn't, install drafts/skills/skill-dead-code-sweep/ and run that instead.
5. Separately, talk to whoever owns the Circuit plugin about debouncing the Stop-hook continuity guard — out of scope for ~/.claude/ but worth surfacing upstream.
6. Re-run this audit in 30 days. The proof is in the next sample: handoff-resume sessions should drop, average tool-uses-per-session should shrink, correction markers should drop by half.
