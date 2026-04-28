# Claude Code Audit — 2026-04-23

Sampled **25 sessions** across **4 projects** (circuit-next, capacitor, ever/arc-design-studio, circuit), covering **2026-03-29 → 2026-04-23**. Totals: **175 user prompts, 3,631 tool uses, 92 tool errors, 52 correction markers, 14 friction markers, 188 hours of session wall-clock**. Quantitative claims are cross-checked against all 776 sessions in the last 30 days where noted.

## TL;DR

1. **Your continuity system works for machines and fails for humans.** 14/25 sessions (56%) start with "resume". In 2 of them you literally type "I've totally forgotten what we're even doing" / "I forget what we've been focused on in this session." Fix: a mandatory human-facing orientation card as the first visible message on any resume.
2. **Your Stop-hook auto-continuity guard is stuck in a nag loop in overnight autonomous sessions.** 44 guard injections in 30 days, concentrated in 3 sessions where the same nag fires 4+ times in succession. Fix: debounce + autonomous-mode bypass in `auto-handoff-on-compact.sh`'s Stop sibling.
3. **Your autonomous overnight mode has no governor.** Sessions starting with "headed to bed, go into full autonomy" produce the largest tool counts in the sample (348 Bash calls, 9 errors) with no circuit-breaker. Fix: a drafted `autonomous-governor` skill that commits per-slice, halts on error-rate threshold, and wakes you via notification.

Each recommendation has a drafted implementation under `audit/drafts/`.

---

## The top recommendations

### 1. Add a human-orientation card to every resume

**Category:** session_lifecycle
**Evidence:** 14/25 sampled sessions (56%) start with "resume", "resume handoff", or equivalent. Globally: 108/776 (14%) of all last-30-day sessions are resumes. In 2 of them the user explicitly states disorientation.
**Cost:** Every resumed session costs ~2-5 minutes of re-orientation the user absorbs silently, plus full-session abandonment in 2/25 cases (8% of sessions).
**Fix:** A rule in `~/.claude/CLAUDE.md` that any session starting with "resume" or any invocation of `/circuit:handoff resume` must begin the first visible assistant response with a 4-line orientation card (Goal / Last commit / Next action / Blocker). Plus a new `resume-orientation` skill that enforces the format.
**Draft:** `audit/drafts/claude-md-additions.md` (resume-orientation paragraph) and `audit/drafts/skills/resume-orientation/SKILL.md`

Session 68295abb (arc-design-studio, 2026-04-17) is the textbook case: after ~19 turns of chained `/circuit:run`, `/codex`, and `/circuit:handoff` invocations the user writes: *"oh, perhaps, i actually forget what we've been focused on in this session. i think things might have gotten tangled a bit."* Session 81151565 (capacitor, 2026-04-16) shows the same at the meta-session level: *"Help me understand why this effort has taken SO long. I've totally forgotten what we're even doing."* The continuity system is storing every fact perfectly in the continuity JSON — but Claude's first visible reply on resume is almost always a tool call, not a briefing. The machine resumes; the human doesn't.

The leverage is that the fix is nearly free: the continuity record already contains `record.narrative.goal`, `resume_contract`, and recent git state. A CLAUDE.md rule plus a small skill that renders those into a 4-line card before any other tool use would pay for itself on turn 1 of every resumed session. This is the single highest-leverage change in the audit because it affects 14% of all sessions and the fix is a 3-paragraph rule.

### 2. Debounce the auto-continuity Stop hook and add an autonomous-mode bypass

**Category:** tool_failure (hook misconfiguration)
**Evidence:** 44 `Auto-continuity guard` nags injected across 776 last-30-day sessions. In sessions 91fce543, 57173ff0, and 7bba5176 the same nag fires 3–5 times in succession. Each nag is ~1KB injected as a USER turn.
**Cost:** ~44KB of injected nag text in 30 days; more importantly, in multi-nag sessions Claude repeatedly obeys the nag, saves a record, the record is immediately stale per the next nag's threshold, and the loop continues. Claude wastes entire turns saving records that fail to silence the next nag.
**Fix:** Patch the Stop hook handler to (a) not re-fire within 600s of its last fire in the same session, and (b) no-op when the session is in overnight/autonomous mode (detectable by first-prompt language or an env var set by the user's kickoff prompt).
**Draft:** `audit/drafts/hooks/auto-continuity-guard-debounced.sh`

Session 91fce543 (circuit-next, 2026-04-23): the guard fires at `HEAD advanced past base_commit`, Claude saves a record, the guard fires again 1420s later with `latest continuity record is 1420s old (stale)`, Claude saves again, the guard fires again with `438s old (stale)`. The staleness floor is 0 — any gap is "stale". Five saves in a row on the final stretch of an overnight session. This isn't the guard being wrong in principle; it's wrong in tuning.

The anti-evidence is that in most sessions (contextually: 773/776) the guard fires at most once or twice and does useful work. The fix is specifically the debouncer, not removing the guard.

### 3. Add an autonomous-overnight governor skill + first-prompt detector

**Category:** capability_mismatch (big bets with no guardrails)
**Evidence:** 4/25 sessions open with "going to bed / full autonomy / continue as you were". These sessions show: 32905b6f — 348 Bash, 131 Edits, 9 errors. 2b691fa5 — 150 Bash, 101 Edits, 7 errors. Both had the user explicitly acknowledge "errors are happening, keep going."
**Cost:** Per-session: hours of compute and the risk of compounding broken commits. Meta: these are the sessions where bad code gets committed overnight and tech debt is paid down later across multiple wake-up sessions.
**Fix:** A drafted `autonomous-governor` skill that fires on a first-prompt heuristic ("going to bed", "full autonomy", "overnight") and installs session-local rules: commit-per-slice, halt-on-3-consecutive-errors, max-wall-time cap, and a final notification on halt or completion. Plus a global CLAUDE.md paragraph that activates these rules when the skill fires.
**Draft:** `audit/drafts/skills/autonomous-governor/SKILL.md`

Session 2b691fa5 is the canonical case: user wakes up, says "amend commits to fix errors, just keep going" — Claude obeys and spends 7 hours accumulating 7 errors. Nothing in the config tells Claude to escalate when the error rate exceeds a threshold. The user's existing CLAUDE.md rule *"Root Cause Diagnosis: enumerate 2-3 hypotheses before acting"* is a good intention that gets overwhelmed under autonomous pressure; a hook-enforced rule would hold better.

---

## Quantitative snapshot

| metric                    | value |
|---------------------------|-------|
| Sessions analyzed         | 25 |
| Projects represented      | 4 |
| User prompts              | 175 |
| Tool uses                 | 3,631 |
| Tool errors               | 92 (2.5%) |
| Interruptions             | 3 |
| Avg session duration      | 7.5 hours (inflated by idle/overnight sessions) |
| Median tool uses/session  | 145 |
| Top tool                  | Bash (1,666 = 46%) |
| Top slash command         | /circuit:handoff (91) |
| Sessions likely abandoned | 4/25 |

**Top tools:** Bash 1666, Edit 512, Read 501, TaskUpdate 329, Write 174, TaskCreate 173, Grep 132, Skill 41, ToolSearch 32, Agent 24
**Top tool bigrams:** Bash→Bash 877 (24%), Read→Read 168, Edit→Edit 165, TaskCreate→TaskCreate 141, TaskUpdate→TaskUpdate 141
**Top slash commands:** /circuit:handoff 91, /circuit:run 34, /codex 11
**Hook events:** SessionStart:clear 66, UserPromptSubmit 26, Stop 13, SessionStart:resume 11
**Sessions starting with "resume" (30d global):** 108/776 (14%). **In sample:** 14/25 (56% — skewed because sample favored large/deep sessions, which resumes tend to be.)

---

## Secondary findings (tier 2)

- **Context tax from re-injected skill bodies.** 277 full-body re-injections of the `/codex` skill in 30 days (~7KB each = ~2MB of repeated text); `/circuit:run` contract block re-injects on every invocation (34 in sample). Half the "correction markers" flagged by the extractor are actually the harness re-injecting skill text, not real user corrections. The codex skill is ~400 lines — trimming it to ~80 lines of core rules + a `references/` subdir would materially reduce per-turn context. Sessions: 68295abb, 91fce543, 7bba5176, f81f89e2.
- **Bash→Bash chains on circuit-engine CLI retries.** Session 91fce543 shows 4 retries of `.circuit/bin/circuit-engine continuity save` to get the `--debt-markdown` format right (error: *"entries must be typed bullets beginning with RULED OUT:, DECIDED:, BLOCKED:, or CONSTRAINT:"*). That's a circuit-engine UX bug, not a Claude Code config bug, but it's visible across the circuit sessions — flagging for your circuit-next work.
- **TaskCreate→TaskCreate bigram = 141.** Your global CLAUDE.md says "Create tasks upfront" but consecutive TaskCreates are 82% of total TaskCreates in the sample. The rule is being violated at scale. A stronger CLAUDE.md rule is drafted.
- **Low-leverage skills in the long tail.** Of your 100+ skills, only ~10 fire in any given 30-day window. Skills like `ubiquitous-language`, `grill-me`, `literate-guide`, `clean-architecture`, `swift-apps` did not trigger once in the sample. Each skill description is context tax on every prompt. Recommend running `skill-manager` to prune zero-use skills.

---

## Negative space — what the audit looked for and didn't find

- **Testing correction loops.** The aggregate shows only 14 "friction markers" and most aren't about testing style. The TDD doctrine in your CLAUDE.md appears to be respected; no finding for "Claude keeps writing unit tests when you want integration tests."
- **Permission-prompt friction.** Your `settings.json` allowlist is already extensive (1,500+ lines). No session in the sample stalls on permission asks. Not a finding.
- **Code-style corrections.** No recurring "don't add comments" / "use cn() instead of classNames" / "prefer type over interface" corrections. Your per-project CLAUDE.md files are working.
- **MCP tooling gap.** You have Claude-in-Chrome, Gmail, Calendar, Notion, Slack MCPs already. No sessions in the sample show "can you put this in Notion" friction that a new MCP would solve.
- **Dead hook firing on every session.** SessionStart hooks (`sync-codex-skills.sh`, `fix-skill-symlinks.sh`, `hud-state-tracker.sh`) all appear to complete in <1s with sensible output. Not wasted.

---

## Drafts

All drafted implementations live under `audit/drafts/`.

- `drafts/claude-md-additions.md` — paragraphs to paste into `~/.claude/CLAUDE.md`. Covers resume-orientation rule and TaskCreate-upfront strengthening.
- `drafts/skills/resume-orientation/SKILL.md` — ready-to-install skill that fires on resume and enforces the 4-line orientation card.
- `drafts/skills/autonomous-governor/SKILL.md` — ready-to-install skill that activates on overnight/autonomous first prompts.
- `drafts/hooks/auto-continuity-guard-debounced.sh` — replacement Stop-hook handler with debounce + autonomous-mode bypass.

---

## What to do next

In priority order:

1. **Paste `drafts/claude-md-additions.md` into `~/.claude/CLAUDE.md`** (2 minutes). This is the cheapest, highest-leverage change.
2. **Install `drafts/skills/resume-orientation/` into `~/.claude/skills/`** (1 minute). Test by starting a session with `resume` as the first prompt and confirming Claude emits the orientation card first.
3. **Install `drafts/skills/autonomous-governor/` into `~/.claude/skills/`** (1 minute). Test by starting a session with "going to bed" and confirming Claude acknowledges the governor rules.
4. **Review `drafts/hooks/auto-continuity-guard-debounced.sh`** and replace your existing Stop-hook circuit-engine nag in `settings.json` if you agree with the debounce threshold (600s default).
5. **Run `/skill-manager`** to prune zero-use skills — particularly `ubiquitous-language`, `grill-me`, `literate-guide`, `clean-architecture`, `swift-apps`, `swiftui-expert-skill` if you don't actively need them.
6. **Re-run this audit in 30 days** to measure whether resume abandonment, Stop-hook nag loops, and overnight error counts dropped.
