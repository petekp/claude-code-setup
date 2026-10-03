# session-inbox

A Claude Code mod that collects what is waiting on you in a session: the
agent's questions, issues Claude noted, and your PRs' checks and reviews. It
shows them above the prompt and in the `/inbox` pane, along with where the
session stands.

## What you see

- **Waiting on you.** After each reply, the band lists the questions the agent
  put to you. They carry the agent's own numbers and its recommendations. Reply
  "1. yes 2. no" as usual. The mod attaches the full questions to your message,
  so the agent knows what each number meant. When the agent's options are
  short, they appear as buttons beside the question. Pressing one sends it.
- **One line otherwise.** With nothing waiting, the band shows the session's
  goal and where the work stands. Any dev server or simulator the agent left
  running is listed under it.
- **Where this session stands.** After 15 minutes with no activity, or when you
  resume a session, the band expands into a short card. It shows the goal,
  what's done, where things stand, what's running, the last decisions, and
  what's waiting on you. It collapses when you send a message.
- **Last session in this folder.** A new session in a folder you worked in
  during the past week shows the previous session's card. "Continue from it"
  adds that card to your first message. "Hide" dismisses it.
- **/inbox** opens everything in a pane, with three tabs: Waiting, Notes and
  PRs. Each tab is a list with one selected row. The selected row is shaded,
  shows its full text, and lists its actions. The other rows take one line
  each.
  - On a question, the digits send an answer to Claude as your message,
    quoting the question: `1: Node  2: Python`. If Claude is working, the
    answer waits until the turn ends. The recommended answer is named above
    the keys. A question with no options gets `Reply`, which starts the
    answer in your prompt.
  - `e: Explain` asks Claude what an item is about and what each choice
    means, without acting on it. The item stays open.
  - `x: Dismiss` drops a question. `d: Done` closes a task that is yours to
    do. A task also closes on its own when you run its command with `!`.
  - Under the list, the Waiting tab shows what's running, what's done, and
    recent decisions. Press Done's or Decided's title to collapse it. The mod
    remembers that in later sessions.
- **Keys.** While the pane has focus, `j` and `k` move the selection, `w`,
  `n` and `p` switch tabs, and each action's key presses it. `/inbox` gives
  the pane focus, and ctrl+x tab moves focus between the pane and the
  prompt. A label written `key: Action` has a key. A label in brackets, like
  `[ Open PR ]`, is click only. You can also click any action, or click a
  row's number to select it.
- **Helper buttons.** When the agent's reply spells out how to do an item, the
  item gets buttons for it:
  - **Open a file.** `[ Open settings.json ]` opens it in the app macOS uses
    for that type, or your default text editor. Folders and apps are shown in
    Finder instead of launched.
  - **Copy a snippet and open its file.** `[ Copy env line and open .env.local ]`
    does both in one press.
  - **Run a command.** `[ Run removal command ]` sends the command to Claude
    as your message, and Claude runs it with the usual permission checks.
  - **Copy a sign-in command.** A command that signs in or asks for a
    password, like `npm login`, needs your own terminal. `[ Copy npm login ]`
    copies it. Run it in a terminal, or type `!` in the prompt and paste.
  - **Open a page.** `[ Open login docs ]` opens an https link.

  Every path, command, snippet and link must appear in the agent's reply or
  in what it did that turn. The mod drops anything else, so the model cannot
  invent one. The mod itself never runs a command.
- **Notes.** While it works, Claude records issues and opportunities it notices
  outside the current task: a bug, a risk, missing tests, tech debt, a chance
  to improve something. It also records a note when it works around a problem
  instead of fixing it, and when part of its change could not be tested. It uses a `note` tool the mod gives it, and keeps
  working on the task. The band shows "2 notes in /inbox". The pane's Notes
  tab lists them, newest first. The selected note has three actions:
  - `a: Address it` asks Claude to fix it.
  - `d: Discuss` asks Claude to talk it through before changing anything.
  - `x: Dismiss` drops it.

- **PRs.** The pane's PRs tab shows the pull requests this session
  opened or linked, and the current branch's PR. It checks them with `gh`
  every 2 minutes while you are at the session, and when you open the tab.
  It looks up which PR the current branch has only while the tab is open.
  Each PR shows:
  - whether it can merge, or what blocks it: draft, conflicts, failing
    checks, requested changes, open threads, missing approval, running checks
  - each failing check as a row. `f: Fix` asks Claude to find the cause in
    the logs and fix it, and `o: Open log` opens the check's page.
  - each unresolved review thread whose last comment is someone else's, so
    it waits on you, as a row. The selected thread shows the first comment
    and, under it, the latest reply. Its actions are `a: Address`,
    `r: Draft reply`, `d: Discuss` and `o: Open`. A PR with several such
    threads also has `[ Address all ]`. Claude never posts a reply or
    resolves a thread from these actions.
  - a count of open threads where you wrote the last comment. They wait on
    someone else, so they are hidden and don't block the merge.

  The band shows the first PR that needs you, like "PR #12 CI failing".
  The tab needs the `gh` CLI, signed in.

The card, the open items and the notes survive compaction. The mod adds them to the
context the model rereads after compacting.

## How it works

After each reply, one Sonnet call reads the turn: your message, the `!` and
slash commands you ran, a list of what the agent did, and its reply. It also
reads the previous card and whether the `/inbox` pane is open. It returns an
updated card and the questions opened and closed. It adds a task for you only
when the agent cannot go on without it, not for an invitation to look at
finished work.

When the inbox changes, the mod attaches it to your next message. Claude then
knows which items are still open and whether the pane is open, so it does not
ask you to open the pane or to act on a closed item.

Each update costs about 3k input and 500 output tokens. It runs after the
reply is shown and takes 3 to 5 seconds. When an update fails, or
when the mod loads into a conversation it has not read, such as after an
install mid-session, it catches up instead. One call over the whole
conversation closes the questions and notes that were handled and adds what
still waits on you.

The mod keeps each session's card in its store, so `claude --resume` brings
it back. It does nothing in headless `claude -p` runs.

## Limits

- If you answer within a few seconds of a reply, the band may not have the
  questions yet. The agent still reads your answer, without the attached
  question text.
- Items you never answer stay open. The band shows the newest ones and counts
  the rest. Dismiss them in /inbox.
- A model writes the card, so it can be wrong. The transcript is the record.
