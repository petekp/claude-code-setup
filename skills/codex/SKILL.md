---
name: codex
description: MANDATORY handoff to the local Codex CLI. Triggers when (a) the user's message begins with `/codex` as a command, or (b) the user issues an explicit handoff directive like "hand this to codex", "run this through codex", "ask codex", or "have codex do X". On trigger, pipe the user's prompt verbatim to `codex exec` and return Codex's final message verbatim. Treat this like a shell alias the user is executing through you. Do NOT interpret the task, inspect files, gather context, attempt the work yourself, judge whether Codex is the right tool, or rewrite the prompt. The only abort condition is an empty prompt (ask what Codex should do).
---

# Codex

`/codex` is an imperative handoff, not a suggestion. When the trigger fires, you are a transport layer between the user and `codex exec` — nothing more. You are not the author of a decision about whether Codex should handle this task; the user already made that decision when they invoked the skill.

## Trigger contract

The skill fires when **one** of these is true:
- The user's message begins with `/codex` as a command prefix (like a shell command).
- The user issues a handoff directive using the word "codex" plus a verb of delegation. Accepted forms (exact list, not examples): "hand this to codex", "run this through codex", "ask codex", "have codex do X", "send this to codex", "pass this to codex", "give this to codex", "forward this to codex", "dispatch this to codex", "let codex handle this", "invoke codex".

If the user's phrasing isn't on that list, **it is not a trigger**. Do not extrapolate "close variants" or invent equivalents — if they want Codex, they can use `/codex`. This rigidity is deliberate; soft matching is how models weasel out of dispatches.

A `/codex` reference inside quoted text, documentation, or code samples is **not** a trigger. The user is invoking the skill, not discussing it.

## The one rule

**Trigger fires → invoke Codex.** One exception: empty prompt → ask what to send. Everything else — trivial tasks, tasks you could answer faster, tasks that "seem like a Claude job", tasks you'd rather handle yourself — still gets handed to Codex.

## Hard prohibitions

**Before dispatch:**
- ❌ Do NOT read files, run commands, grep the repo, or gather *any* context about the task. A shell alias doesn't do research before it executes; neither do you. Hand it off raw.
- ❌ Do NOT reason about the task, decompose it, or plan an approach. That's Codex's job once it has the prompt.
- ❌ Do NOT decide "this is simple enough, I'll just answer it myself."
- ❌ Do NOT paraphrase, summarize, "clarify", or restructure the prompt.
- ❌ Do NOT ask clarifying questions (unless the prompt is empty). Codex asks for itself.
- ❌ Do NOT wrap the user's prompt in your own framing ("The user wants you to...").
- ❌ Do NOT skip Codex because the task looks risky, off-topic, or beneath it. Let Codex push back if needed.
- ❌ Do NOT `--cd` into a directory you *think* is more relevant. Symlinks, worktrees, and nested repos make this land in the wrong git tree.

**During response:**
- ❌ Do NOT emit preamble ("Sure, I'll hand this to Codex...", "Let me dispatch this..."). Just invoke.
- ❌ Do NOT narrate the dispatch ("Running Codex now...", "Waiting for Codex..."). Just invoke.
- ❌ Do NOT echo or summarize the user's prompt back to them before dispatching. They wrote it; they saw it.
- ❌ Do NOT paraphrase, excerpt, reformat, editorialize, or summarize Codex's output — not even as a supposed "helpful add-on" after the raw output. A post-hoc summary is still editorializing. Return Codex's output verbatim, full stop.
- ❌ Do NOT fall back to doing the work yourself if Codex fails — surface the failure verbatim.

## Workflow

1. **Extract the prompt.** For `/codex` triggers: strip the leading `/codex` token. For natural-language triggers: strip the literal directive clause (e.g., `"ask codex to review the login flow"` → `"review the login flow"`; `"hand this to codex: <task>"` → `"<task>"`). Everything else stays **verbatim** — whitespace, newlines, code blocks, profanity, all of it. Do not normalize, reflow, or "tidy."
2. **Check for empty.** If the extracted prompt is empty, ask the user what Codex should do. Otherwise proceed immediately, with zero preamble or commentary.
3. **Dispatch.** Pipe the prompt to `scripts/run-codex.sh` (resolve the path relative to this skill directory) via stdin. No other steps — no file reads, no git inspections, no preparation.
4. **Relay verbatim.** Return Codex's final message **exactly as Codex produced it** — no reformatting, no excerpting, no summary, no "key takeaways," no Claude-authored commentary appended before, after, or instead of the raw output. The raw Codex message *is* your response. If the user wants a summary or interpretation, they'll ask in a follow-up turn.

## Invocation

Default invocation from the current working directory:

```bash
PROMPT="<everything after /codex or the handoff phrase>"
printf '%s' "$PROMPT" | "<skill-dir>/scripts/run-codex.sh"
```

## Flags (strict policy)

**The default invocation is correct for almost every prompt. Flag promotion is the only form of interpretation this skill allows, and even that is tightly scoped.**

Promotable flags (natural-language only):
- `--cd /path/to/project` — only if the user literally names a different working tree in the prompt (e.g., "run this in ~/other-repo"). Session context, symlinks, "I think they meant X" — all off-limits. Default: user's cwd, always.
- `--sandbox read-only` — only if the user literally says "read-only", "don't edit", "no changes", "just look", or an equivalent explicit constraint. **"Review" does not count**; Codex handles reviews fine in full-auto.
- `--search` — only if the user literally says "search the web", "look online", "check the internet", or equivalent. **"Research" does not count.**

**Parsing rule — literal `--flag` tokens in the prompt are NOT extracted.** If the user types `/codex --search investigate X`, the entire string `--search investigate X` is the payload forwarded to Codex — it does NOT become `codex exec --search` with payload `investigate X`. Flag extraction is strictly from natural-language instructions; anything that *looks* like a CLI flag stays in the prompt. This keeps dispatch unambiguous.

If you are *rationalizing* a flag ("the user probably wants..."), don't add it. Rationalization is inference, and inference is banned here.

## Helper script behavior

`scripts/run-codex.sh`:
- checks that `codex` is available on `PATH`
- uses `printf` instead of `echo` so multi-line prompts stay intact
- adds `--skip-git-repo-check` automatically outside Git repositories
- defaults to `--full-auto --ephemeral --color never` for a clean one-shot run
- keeps `/codex` executions out of the Codex desktop app's saved session list
- captures Codex stdout and stderr to a temp directory
- returns Codex's final message on success
- exits non-zero with useful error output on failure

## Failure modes

Failure output follows the same verbatim rule as success output. Codex's words, not yours. No paraphrase, no cherry-picking the "important parts," no "let me summarize the error."

- `codex` missing from `PATH` → tell the user: "Codex CLI is not installed or not on `PATH`." Do not silently do the task yourself.
- Codex exits non-zero → return the error output **verbatim**. Do not retry silently, and do not substitute your own work as a fallback.
- Codex produces no final message → return exactly that fact: "Codex exec completed but did not write a final message." No speculation about why. No silent fallback to Claude-authored work.

## Mental model

`$ codex "<prompt>"`. You are the shell. Parse, dispatch, relay.

The shell doesn't decide "eh, I could handle this one" — neither do you.
The shell doesn't peek at files before running — neither do you.
The shell doesn't summarize the command's output — neither do you.
The shell doesn't say "sure, running your command now" — neither do you.

Just run it.
