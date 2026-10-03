# think-first

A Claude Code mod that keeps you doing your own thinking about your business
and its users. It does two things:

- Before Claude answers a question about the business, it asks for your take.
- On any prompt, you can predict the result. After the turn, a check tells
  you where your thinking was off.

PLAN.md explains the reasoning and the review that shaped this version.

## Your take first

1. You ask a question about your business or its users, such as "Why do small
   teams cancel in their second month?".
2. The mod holds the prompt back and puts it in the prompt box again, with
   `My take:` on a new line. A notice says why.
3. Write your take and press Enter. Claude is told to say what holds up, what's
   wrong or missing, and what evidence would settle it, before giving its own
   answer.
4. To skip, press Enter with the line empty. The question goes as it was, and
   the session doesn't ask again for 30 minutes.

Details:

- **What gets caught.** A Haiku call decides which prompts count, using the
  definition in `CLASSIFY` in `hooks/register.tsx`. Code, tooling, chores,
  and short replies go straight through. Edit the definition to match what
  you mean by a thinking question.
- **Writing your own take.** You can add a `My take:` line to any prompt
  without being asked. Claude gets the same instruction, and it counts as a
  take.

## Predictions

1. Add a line starting `expect:` to any prompt:
   ```
   Find out why cancellations rose in September
   expect: the price change in August drove it
   ```
2. The mod removes the line before Claude sees the prompt. While the turn
   runs, the band above the prompt shows your prediction.
3. When the turn ends, a Sonnet call compares your prediction with Claude's
   reply. It rates the prediction Hit, Partly right, Miss, or Too vague to
   check, and says in one sentence where your thinking was off.
4. Press ctrl+x tab, then:
   - `d` to discuss, which puts your prediction and the verdict in the prompt
     box as a question for Claude
   - `x` to dismiss

A prediction that names something checkable teaches more than "it will
work", which gets rated Too vague.

## /think

Covers the last 6 weeks, across every project:

- how many thinking questions got your take first
- your prediction ratings
- one row per week
- **Where your thinking was off:** your latest missed, partly right, and
  vague predictions, each with the check's sentence. This list is the one
  worth rereading.

## Where the data lives

Each take and prediction is one JSON file in `~/.claude/think-first/records/`.

## Loading it

- **This session:** hot reload loads it from the session's mods folder.
- **Another session:** `claude --plugin-dir ~/Code/claude-code-setup/mods/think-first`
- **Every session:** add the folder to `CLAUDE_CODE_PLUGIN_DIRS` in
  `~/.claude/settings.json`. That change is yours to make.

## Limits

- **Delay.** Each prompt of 20 or more characters waits for the Haiku call,
  about a second.
- **Sorting mistakes.** The sorting will sometimes be wrong. A missed
  thinking question just goes through. A wrong catch costs one Enter.
- **Prompts typed during a turn.** These reach the running turn directly,
  and the mod leaves them alone. An `expect:` line in one reaches Claude.
- **Shared band.** The band above the prompt shows one plugin's row at a
  time. In a live test, this mod's prediction row showed in place of
  session-inbox's.
- **Claude Code only.** Codex sessions don't run mods.

## Checks

```sh
claude plugin validate mods/think-first
claude plugin test mods/think-first
```
