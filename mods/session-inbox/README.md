# session-inbox

A Claude Code mod that collects what is waiting on you in a session: the
agent's questions, issues Claude noted, and your PRs' checks and reviews. It
lists them in the `/inbox` pane. A one-line band above the prompt shows where
the session stands and how many items wait.

## What you see

- **The band.** One line above the prompt: the session's goal, where the work
  stands, and how many items wait on you in `/inbox`. Any dev server or
  simulator the agent left running is listed under it. The items themselves
  appear only in the pane.
- **Stops.** When the session stops for something outside the chat, the band
  says why and what to do, as in "Stopped 2m ago: sign-in expired. Run
  /login, then send a message to resume." A stop is an expired sign-in, a
  billing problem, a reached usage limit with its reset time, or an API
  error. It clears when the next turn starts.
- **The Herdr sidebar line.** Inside Herdr, the session's sidebar row names
  what the session waits on. A stop comes first, with its fix, as in
  `! Signed out: /login`. An open permission prompt or question dialog comes
  next, as in `Allow push main to origin?`. Then come the number of waiting
  items and the first one. With nothing waiting, the line says where the
  work stands. The Waiting tab also shows a stop above its items.
- **Checks.** The mod records each test, type check, lint, build or
  validation command Claude runs, and how it ended. A failed check gets a
  line of its own under the band, as in "✗ npm test, 1 fail". The Waiting
  tab lists every check under Checks, which starts folded. A red ✗ after
  its title means a check failed. Click the title row to open it; the pane
  remembers. A check is marked "before the last
  edit" when files changed after it ran. A Markdown-only edit leaves tests,
  type checks and builds current.
- **Numbered answers.** Reply "1. yes 2. no" to the agent's numbered
  questions as usual. The mod attaches the full questions to your message,
  so the agent knows what each number meant.
- **Where this session stands.** After 15 minutes with no activity, or when you
  resume a session, the band expands into a short card. It shows the goal,
  what's done, where things stand, what's running, the last decisions, and
  how many items wait on you. It collapses when you send a message.
- **Last session in this folder.** A new session in a folder you worked in
  during the past week shows the previous session's card. "Continue from it"
  adds that card to your first message. "Hide" dismisses it.
- **/inbox** opens everything in a pane, with three tabs: Waiting, Notes and
  PRs. Each tab is a list with one selected row. The selected row is shaded
  blue, shows its full text, and lists its actions. The other rows take one
  line each, with a muted line between each two. The Waiting tab lists
  Questions first, newest first and numbered 1), 2), 3), then Your tasks.
  Lines join each section's title to its rows, as in a directory listing.
  - On a question, the digits send an answer to Claude as your message,
    quoting the question: `1: Node  2: Python`. If Claude is working, the
    answer waits until the turn ends. The recommended answer's key says so.
    The other actions follow, dimmer, on the same row when they fit, and
    on a line of their own when they don't.
  - `t` opens a one-line field for your own words, when no option fits.
    Enter sends them as your message, quoting the item. A question closes
    with your words as its answer. A task stays open until Claude closes it.
    The mobile app has no field, so it has no `t`.
  - `e: Explain` asks Claude what an item is about and what each choice
    means, without acting on it. The item stays open.
  - `x: Dismiss` drops a question. `d: Done` closes a task that is yours to
    do. A task also closes on its own when you run its command with `!`.
  - Under the list, the Waiting tab shows what's running, the checks, what
    Claude finished, and closed items. Every section folds: click anywhere
    on its title row, which lights up under the pointer. A folded section
    shows `▸` and an open one `▾`. Its count follows the title, muted.
    Checks, Finished by Claude and Closed share a card, with a line between
    each two. The mod remembers what you folded in later sessions, and the
    selection skips a folded section's rows.
  - The tab bar shows when the inbox last updated, at its right end. A tab
    you switch to starts at its top.
- **Keys.** While the pane has focus, `j` and `k` move the selection, `w`,
  `n` and `p` switch tabs, and each action's key presses it. `/inbox` gives
  the pane focus, and ctrl+x tab moves focus between the pane and the
  prompt. A label written `key: Action` has a key. A label in brackets, like
  `[ Open PR ]`, is click only. You can also click any action, or click a
  row's text to select it.
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
  tab lists them, newest first. The selected note has four actions:
  - `a: Address it` asks Claude to fix it.
  - `d: Discuss` asks Claude to talk it through before changing anything.
  - `t: Type a reply` sends the note back with your own words.
  - `x: Dismiss` drops it.
- **Answering in chat.** Claude reads the open items and notes beside each
  message you send, each with an id such as `i35`. When your message
  answers one, Claude first closes it with a `close` tool the mod gives it,
  passing your answer, before any other work. The item then shows in
  Closed with your answer, as if you had pressed it.
- **Claude closes items.** When an item is done or no longer applies,
  Claude closes it with a short reason. It moves to Closed as "Closed by
  Claude:" and the reason, dimmed because you did not decide it. Claude
  never closes a question to answer it for you.
- **Closing shows in place.** However an item closes, its row stays where it
  was for 8 seconds with a ✓ and the outcome, then leaves for Closed. The
  band shows the same ✓ line meanwhile, so you see it with the pane closed.

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

**`/inbox demo`** shows sample entries in every section of the band and
the pane, for work on the layout: questions, tasks, a permission prompt, a
just-closed item, checks, notes and two PRs. Their actions send nothing.
Your own inbox is untouched. Run `/inbox demo` again to go back.

The card, the open items and the notes survive compaction. The mod adds them to the
context the model rereads after compacting.

## How it works

After each reply, one Sonnet call reads the turn: your message, the `!` and
slash commands you ran, a list of what the agent did, and its reply. It also
reads the previous card and whether the `/inbox` pane is open. It returns an
updated card and the questions opened and closed. It adds a task for you only
when the agent cannot go on without it, not for an invitation to look at
finished work.

The Sonnet call also reads the latest check results, so the card does not
call a failing run passing. At the end of each turn, if Claude's reply says
tests, types, lint or a build pass when the latest run of that kind failed
or ran before the last edit, the mod sends Claude back once. Claude then
runs the check or says the change is untested. The mod reads the working
tree with git and never writes to the repo.

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

- If you answer within a few seconds of a reply, the inbox may not have the
  questions yet. The agent still reads your answer, without the attached
  question text.
- An item you never answer stays open for 12 of your prompts, then drops.
  Dismiss it sooner in /inbox.
- A model writes the card, so it can be wrong. The transcript is the record.
- A check whose output went to a file, with no exit status printed, is
  recorded as unknown.
- The mod reads at most 2000 uncommitted files, so changes past those go
  unseen.
