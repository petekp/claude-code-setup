# Report template

Write `audit/report.md` using this structure. The whole report should fit on roughly three screens when opened. Cut things that don't fit — better to be short and actionable than long and comprehensive.

---

```markdown
# Claude Code Audit — <date>

Sampled **<N> sessions** across **<M> projects**, covering **<date range>**. Total: <X> user prompts, <Y> tool uses, <Z> tool errors, <W> correction markers.

## TL;DR

1. <top recommendation, one sentence>
2. <second recommendation, one sentence>
3. <third recommendation, one sentence>

Each recommendation has a drafted implementation under `audit/drafts/`.

---

## The top recommendations

### 1. <short title — the change>
**Category:** <correction loop | repeated workflow | tool failure | context drift | capability mismatch | session lifecycle | dead code | tooling gap>
**Evidence:** <N of M sampled sessions> exhibit this pattern. Example sessions: `<id>`, `<id>`, `<id>`.
**Cost:** <approx minutes or token cost per occurrence × frequency>
**Fix:** <one-sentence summary of the change>
**Draft:** `audit/drafts/<path>`

<2-3 paragraphs of detail: the pattern, the root cause, why this specific fix is the right lever. Cite concrete quotes from sessions, with the session id in parens. Be specific about numbers.>

### 2. <…>

### 3. <…>

---

## Quantitative snapshot

| metric                    | value |
|---------------------------|-------|
| Sessions analyzed         |       |
| Projects represented      |       |
| User prompts              |       |
| Tool uses                 |       |
| Tool errors               |       |
| Interruptions             |       |
| Avg session duration      |       |
| Top tool                  |       |
| Top slash command         |       |
| Sessions likely abandoned |       |

**Top tools:** <names with counts>
**Top slash commands:** <names with counts>
**Hooks firing most:** <names with counts>

---

## Secondary findings (tier 2)

Short list of smaller but real patterns. One or two sentences each, with session ids as evidence. Only include if they're actionable; cut observations.

- <finding> — `<id>`, `<id>`
- <finding> — `<id>`
- ...

---

## Negative space — what the audit looked for and didn't find

Brief. This is where you defend the audit against the criticism "you only found what you looked for." Two or three sentences about patterns you explicitly checked for and ruled out as non-issues, so the user can trust the top list is actually top.

---

## Drafts

All drafted implementations live under `audit/drafts/`.

- `drafts/skills/<name>/SKILL.md` — <one-line description>
- `drafts/claude-md-additions.md` — paragraphs to paste into `~/.claude/CLAUDE.md`
- `drafts/hooks/<name>.sh` — ready-to-install hook
- `drafts/settings-diff.json` — proposed additions to `~/.claude/settings.json`

---

## What to do next

A short ordered list of the user's next actions, in the order they should happen. Example:

1. Paste `drafts/claude-md-additions.md` into `~/.claude/CLAUDE.md`.
2. Install `drafts/skills/<name>/` into `~/.claude/skills/`.
3. Run `drafts/hooks/install.sh` to wire up the hook.
4. Re-run the audit in 30 days to measure whether the corrections stopped appearing.
```

---

## Tone notes

- **Third person about Claude, second person about the user.** "Claude defaults to X; you want Y" — not "I did X". The audit is about the configured system, not any single conversation.
- **Numbers, not adjectives.** Every claim has a count. "Often" is banned.
- **Specific quotes.** Every correction loop gets a real quote from a real session with the session id.
- **No apologies, no hedging.** "Claude keeps doing X" is fine; "Claude sometimes tends to perhaps do X" is not.
- **No praise for Claude.** The audit is looking for friction, not celebrating wins. If something is working, mention it in one line under "negative space" and move on.

## The "would I install this?" test

For every drafted fix, imagine the user reading it and deciding whether to paste it into their config. If there's any hesitation — because the wording is vague, because the `why` is missing, because it might over-fire — revise it until the answer is unambiguously yes.
