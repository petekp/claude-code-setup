# briefing

A Claude Code mod that keeps one shared record of a session's work, for you
and Claude: the goal, what Claude needs from you, what it chose for you, and
what the tools proved. You see the record in Herdr's sidebar, in a band above
the prompt, and in the `/briefing` pane. Claude reads the same record, so you
both refer to items by the same ids.

Briefing is an experiment from early October 2026, written before the
[inbox](https://github.com/petekp/inbox) mod, and is no longer maintained.
Don't load it with the inbox: both write Herdr's `inbox` sidebar token.

## Try it

Start a new session in any project with only this mod loaded. Change the
path if the repo lives elsewhere.

```sh
claude --settings '{"env":{"CLAUDE_CODE_PLUGIN_DIRS":"~/Code/claude-code-setup/mods/briefing"}}'
```

`/reload-plugins` cannot add the mod to a session that is already running.
Claude Code reads `CLAUDE_CODE_PLUGIN_DIRS` only when a session starts.

To load it in every session, point `env.CLAUDE_CODE_PLUGIN_DIRS` in
`~/.claude/settings.json` at this folder instead of the inbox mod's folder.
Sessions started earlier keep the old mod until they restart.

## What you see

- **The sidebar line.** At most 22 characters in Herdr's sidebar. `! Signed
  out: /login` when the session stopped and how to fix it. `? Publish to npm
  +2` when something waits on you, with how many more. Empty otherwise.
- **The band.** One line above the prompt, only when it matters. "Needs you:"
  and the first thing waiting, a failed check or one that predates the last
  edit, and after 15 minutes away, what changed meanwhile. After a reply,
  "Now:" and the catch-up's first line.
- **The pane.** `/briefing` opens it, sized to its content, on its first row.
  From the top:
  - The catch-up: one to three lines on where the work stands and what
    changed since your last message. A fast model writes it after each
    reply. Measured facts override what Claude claimed.
  - **Needs you**: a stop, an open dialog, a held act, a decision Claude
    asked, or a task only you can do.
  - **Goal**: the goal, the latest check results, and the branch with what
    is uncommitted and unpushed.
  - **Claude chose**: decisions Claude made that you might have made
    differently, as "question → choice, not alternative". Press another
    option to switch it. Choices leave the list half a day after Claude
    made them.
  - **Earlier**: the last few settled items.

## Keys

In the pane, `j` and `k` move the selection. On the selected item:

- `1` takes Claude's pick: the recommended or chosen option, a held act's
  Run, or a task's helper. On a question with no recommendation, `1` is
  "Your call", which leaves it to Claude.
- `2` to `9` pick the other options.
- `e` explains the item in the pane, from a fork of Claude's own context.
- `x` dismisses a question, declines a held act, or marks a task "won't do".
- `d` marks a task done. A task with a command also closes when you run that
  command with `!` and it succeeds.

Presses made within two seconds of each other reach Claude as one message.
If Claude is working, it reads them with its next tool result, so it can
change course within the turn.

## Held acts

Some tool calls wait for your press instead of running. Claude sees why, and
the pane shows the exact command with Run and Decline.

- Pushes, pull request and issue changes, releases, publishes and deploys
  wait unless your latest message asked for that kind of act, or you said
  yes to a question that named it.
- Force-pushes, discarded local work, deletions, and messages sent to people
  always wait.
- A held discard runs only while the files are as they were when it was
  held, so it never throws away newer work.
- Dry runs and reads never wait.

## What Claude does

The mod gives Claude a `record` tool and short standing guidance. Claude
records the goal, asks for your calls with a recommendation, records the
choices it made itself, and adds tasks only you can do. It refers to items by
id in its replies.

At the end of each turn the mod checks Claude's reply once. If it asks you
something no item records, or claims tests pass when the latest run failed or
predates the last edit, Claude is sent back to fix its record or its claim.

## Where things live

- `hooks/register.tsx`: the hooks and the drawing.
- `hooks/record.ts`: the record and every change to it.
- `hooks/acts.ts`: which tool calls are held, and what your words asked for.
- `hooks/evidence.ts`: checks, their results, and stops.
- `hooks/git.ts`: reading git status and content snapshots.
- `hooks/turn-check.ts`: the end-of-turn check.
- `hooks/catchup.ts`, `hooks/views.ts`, `hooks/guidance.ts`: the catch-up,
  on-screen wording, and what Claude is told.
- Records: `~/.claude/briefing/sessions/<session id>.json`, one per session,
  deleted after 30 days.

## Checks

```sh
claude plugin test .
npx -y -p typescript tsc --noEmit -p .
claude plugin validate .
```

## Docs

- [1-first-principles.md](docs/1-first-principles.md): what a person needs
  from a session they are not watching, and why.
- [2-vision.md](docs/2-vision.md): the product vision and first requirements.
- [3-reviews.md](docs/3-reviews.md): five adversarial reviews of them.
- [4-requirements.md](docs/4-requirements.md): the revised requirements and
  their status.
- [5-test-report.md](docs/5-test-report.md): what testing found and fixed,
  and what is open.
- [research-field.md](docs/research-field.md): what other agent tools do.
