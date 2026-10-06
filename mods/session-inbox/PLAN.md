# Plan: session-inbox mod

Pete asked on 2026-10-01 for two ideas from the session-history review to be
spiked, rebuilt from scratch as one mod, then iterated and polished overnight.

1. **Decisions that don't scroll away.** The questions the agent put to Pete,
   kept above the prompt until he answers them.
2. **A re-entry card.** Where the session stands, shown when he comes back to it.

They became one mod, `session-inbox`, because both come from the same per-turn
summary. Its README describes what Pete sees.

## Spike questions and findings

- **S1. Fork or plain completion?** `model.fork` at turn end returned a good card
  and decision list in 2–5 s. A fork rereads the whole conversation. In a
  200k-token Opus session, that adds one full-context request per turn. A plain
  `model.complete` on Sonnet reads only this turn's exchange plus the previous
  card. That costs about 2.7k tokens in and 250 out at low effort, and the
  replays below show the card stays accurate. **Decision:** complete per turn.
  The fork is used only to catch up on turns the per-turn update missed.
- **S2. Does a detached update survive?** Yes. A promise started in
  `turn.complete` and not awaited finished in an interactive session and
  updated the band. Timers die when a `claude -p` run exits, and the mod is off
  in headless runs anyway.
- **S3. Does prompt context reach the model?** Yes. `prompt.submit` `context`
  arrives as "prompt.submit hook additional context: …", and the model treats it
  as data.
- **S4. How does the band render?** At 160×45 the band received `bodyColumns`
  160 and `maxRows` 16, with an engine-drawn `[-]` collapse control. Docking the
  `/inbox` pane narrows the band to the transcript column.
- **S5. What survives compaction?**
  - `prompt.context` blocks are recomputed after compaction, and the model saw
    the new block.
  - A row added with `$.session.append` inside the `session.compact` hook was
    lost.
  - System prompt sections are cached, so an answer that changes every turn
    spends the prompt cache.
  - **Decision:** carry the card through compaction in a `prompt.context`
    block only.
- **Extraction quality.**
  - **Model:** on 13 real answers from Pete's transcripts, Sonnet beat Haiku.
    It caught more real questions and invented fewer.
  - **Format:** replaying 3 real sessions (69 turns), JSON output failed to
    parse 17% of the time. A line format (`GOAL:`, `NEW: kind | label | ask |
    options | rec`) failed 0 of 69, and still fails 0 of 69 with the final
    prompt at low effort.
  - **Latency:** median 2–4 s, worst 6.7 s. The call has a 45 s timeout.

## Design

- **Per turn:** after each main-loop reply, one Sonnet call takes the previous
  card, the open items, Pete's message, the agent's activity and its reply. It
  returns the card and the items opened and closed.
  - The activity covers edits, commands, local URLs in command output, skills,
    agents, MCP calls, and AskUserQuestion answers.
  - Items get internal ids, so the model can close them. The band shows the
    agent's own numbering, because that is what Pete answers to.
- **Answers:** when Pete's prompt answers the latest batch, the mod attaches the
  matching questions to it. That covers "1. yes" on separate lines or on one
  line, "Q2 - …", "go" and "all recommended".
- **Band states:**
  1. Last session in this folder, on a fresh session.
  2. Where this session stands, after 15 idle minutes or on resume.
  3. Waiting on you.
  4. One goal line, plus anything running.
  5. A single line while the agent works.
- **Buttons:** anything in brackets is a button, and nothing else is.
  - A question's options are buttons. Pressing one sends
    `Re "<question>": <option>` as the person's own message, which Pete asked
    for on 2026-10-02. It quotes the question instead of its number, because a
    number only maps back while no other prompt has been sent since the reply.
    The item closes at once, so a second press cannot send it twice. The
    recommended option is drawn as the primary button.
  - Each press is its own message. Answering three questions sends three
    messages, and the ones sent mid-turn wait for the turn to end.
  - **Helper buttons**, requested by Pete on 2026-10-02, act on an item's first
    step. The per-turn call adds `HELP: <item> | <kind> | <value> | <name>`
    lines. Their kinds are open a file, copy a snippet, run a command, and
    open an https link. A snippet and a file on the same item become one
    button, "Copy env line and open .env.local", at Pete's request. A
    snippet is text to paste into a file, never a command.
  - **Quote check:** every helper value must appear word for word in the reply
    or the activity. In a live run without it, the model invented an npm token
    URL.
  - **Commands go to Claude.** `[ Run <name> ]` sends the command as the
    person's message, and Claude runs it under the usual permission checks.
    The mod cannot run it in the prompt's shell mode: a filled "! cmd" reaches
    the model as text, because only a typed "!" switches modes.
  - **Sign-in commands are copied.** A command matching `login`, `auth`,
    `sudo`, `passwd` and similar needs the person's terminal, so its button
    copies it. The mod decides this, not the model: asked to choose, Sonnet
    labelled the same jq command both ways across runs.
  - **Restated items:** the model sometimes rewrites an open item as a NEW
    line. The mod merges a NEW line into an open item when it carries that
    item's id as its label, asks the same question, or shares at least 70%
    of its key words (and at least 2) with an open item of the same kind.
    The helpers move to the open item.
  - **Opening files:** `open` uses the app registered for the file type. A file
    with no registered type, such as `.env.local`, falls back to `open -t`,
    the default text editor. Folders, executables and app bundles are shown in
    Finder with `open -R`, so nothing launches.
- **Notes**, requested by Pete on 2026-10-02: a second pane tab where Claude
  records issues and opportunities outside the current task.
  - **Claude records them with a tool,** `mcp__session-inbox__note`, served by
    the mod. The main agent saw the code; the per-turn summary model sees only
    the final reply, so it would miss anything Claude did not write there.
  - The tool is listed up front instead of behind tool search, and needs no
    permission prompt, since it only writes to the card.
  - **A system prompt section asks Claude to use it.** With the tool
    description alone, Claude saw the tool but put its findings in the reply.
    With the section, it recorded a note on its own in the same task.
  - **Address it / Discuss** send the note back as the person's message and
    remove it. Dismiss removes it.
  - **No duplicates:** the per-turn call sees the notes, so a noted finding
    does not also become a "Waiting on you" question. Before that, it did.
    Notes with the same title as an open one are skipped, and the carried
    context lists note titles so Claude does not record one twice.
  - **Tabs** are two Buttons with a colored marker each: yellow for Waiting,
    purple (`autoAccept`) for Notes. ● marks the current tab, ○ the other.
    The engine has no tab element, and a Button label cannot take a color, so
    the marker carries it. The tab's color also marks its section rule, its
    item markers, and the band's note count.
- **PRs tab**, requested by Pete on 2026-10-02.
  - **Which PRs:** links to GitHub PRs in Claude's replies, the output of
    `gh pr create`, and the current branch's PR. Other commands' output is
    ignored, because `gh pr list` prints PRs that are not this session's. Up
    to 6 linked PRs are kept in the ledger, so they survive resume.
  - **Data:** `gh pr view --json` for state, mergeability, review decision
    and the check rollup, plus one GraphQL call for unresolved review
    threads, which `gh pr view` cannot return. The mod calls `gh` itself
    instead of the better-github-skill scripts, so it works wherever `gh`
    is signed in.
  - **Whose turn:** a thread waits on the person when someone else wrote its
    last comment. The GraphQL call reads the viewer's login and each thread's
    last comment. This one rule hides the PR author's notes to reviewers
    until a reviewer answers, and shows bot threads, which the person still
    has to resolve. The tab shows the latest reply, because that is the
    comment waiting on the person.
  - **Refresh:** every 2 minutes while the person is not away and the
    session has a PR, on opening the tab, and when a PR is linked.
  - **Branch PR lookup:** asking `gh` which PR the current branch has runs
    only while the PRs tab is on screen, so sessions with no PR make no `gh`
    calls. Once found, that PR is refreshed by its number like a linked one,
    so the band's PR status stays current after the tab closes. Approved by
    Pete on 2026-10-02. Each PR's
    view and threads are fetched in parallel, and all PRs at once. One
    refresh runs at a time. A failed fetch keeps the last data and shows the
    error.
  - **Actions** send a request to Claude as the person's message. `send()`
    records which button sent it, so the per-turn call knows. Address and
    Draft reply tell Claude not to post on GitHub or resolve threads, since
    posting is an outward action the person approves separately. Fix asks
    before changing CI configuration.
  - Not built yet: posting an approved draft, Merge, description drift,
    self-review and screenshot buttons, nudges.
- **Staleness:** items unanswered for 12 prompts are dropped. The band shows the
  newest batch and counts the rest, and `/inbox` lists everything.
- **State:**
  - `$.state` holds the ledger, presence and the previous-session offer.
  - `$.store` keeps each session's ledger, for resume, and the latest ledger
    per project root, for the next session.
  - The store keeps the 40 most recent sessions.

## Verification

- 19 tests pass under `claude plugin test`. They cover parsing (HELP lines
  and the quote check included), applying
  updates, answer mapping, carry text, and the hooks end to end: a turn
  becoming band items, "1. yes" carrying the question, the away view after 15
  minutes, catching up after a failed update, and a headless run doing
  nothing.
- `tsc` and `claude plugin validate` are clean.
- Driven live in interactive child sessions through tmux. Every state was checked:
  - band items from a real reply
  - numbered answers closing them
  - a running server showing up
  - the `/inbox` pane
  - open items surviving `/compact`
  - the idle view after 16 minutes
  - quoting a row with ctrl+x tab and Enter, then answering it
  - the last-session offer and "Continue from it" reaching the model
  - `--resume` restoring the card
  - `/clear` resetting it
  - helper buttons from a real turn, copying a command, and the combined copy
    and open putting the snippet on the clipboard and opening `.env.local`
- Notes, live: Claude recorded a note unprompted while adding a flag, the
  Notes tab listed it, and Discuss sent it back. Claude discussed it without
  editing.
- Helper extraction on two replies, 3 runs each: Sonnet attached the right
  file, snippet, command and link to the right item every time.

## Open

- Loading it in every session needs `CLAUDE_CODE_PLUGIN_DIRS` in
  `~/.claude/settings.json`. That is Pete's call.
- The model is fixed to Sonnet. A `userConfig` option could make it switchable.

## Keyboard-first pane

Built on 2026-10-02 after Pete found the pane hard to parse. Every control had
the same bracket chrome, each item carried its own row of buttons, and every
action needed the mouse.

- **Selection.** Each tab is a list with one selected row. The `selection`
  state keeps each tab's selected id and position. When the selected row goes
  away, such as an answered question, the row now at that position is
  selected, so answering moves down the list.
- **Keys.** Buttons carry `hotkey`, which presses them while the pane has
  focus. `j` and `k` move, `w`, `n` and `p` switch tabs. The selected row's
  answers and helps take digits, as a survey numbers them. Letters are
  per tab: `e` explain, `d` done or discuss, `x` dismiss, `a` address, `r`
  draft reply, `f` fix, `o` open. Only the selected row draws its actions, so
  no two buttons share a key.
- **Two button styles.** `plain` buttons draw `key: Label` with the key in the
  accent color. Click-only buttons keep the bracket chrome. A plain button
  without a hotkey draws as bare text, which reads as static, so the pane
  uses them only for row numbers and section toggles.
- **The selected row** has a one-column bar in the tab's color, which spans
  wrapped lines because it is a stretched Box with a background. It reads
  top to bottom: a context line naming what it is (Question, Your task,
  Issue, Review thread, Failing check) in the tab's color, the title in
  bold, the detail, then the keys, each set off by a blank line. Selecting a
  row scrolls the pane the least that shows it whole (`$.ui.scroll` with
  `block: 'nearest'`).
- **Focus on open** is a request: the engine grants it only while the prompt
  holds the keys over an empty composer. Otherwise the pane opens without
  the keyboard. ctrl+x tab cycles the prompt, the band and the pane.
- **Tabs** are a filled chip in the tab's color for the current tab
  (`inverseText` on the color) and `n: Notes` buttons for the others. The
  chip is two rows high: a row of `▄` above its label and `▀` below, in its
  color, so the label sits in the middle.
- **Layers.** The tab bar sits on a raised panel
  (`userMessageBackground`), and the list sits on the pane's own background
  under it. In the `dark` theme, the selected row is tinted with its
  tab's color, at about 15% over the pane's rgb(38, 38, 38). At 25% the dim
  text on it lost contrast. Hex colors
  do not follow the theme, so the other themes use the `selectionBg` theme
  key instead. The pane reads the theme with `$.config.list()`. Done and
  Decided are dim, so they sit behind the open items.
- **No header.** The pane used to open with the card's goal and status. Pete
  found it of little use: the goal drifted to the latest side task, and the
  status repeated the Waiting tab or went stale between replies. The band
  still shows both.
- **Review comments** render with the `Markdown` element, so code spans and
  emphasis survive.
- **Theme:** read once at load and on `config.set` for `theme`, into the
  `isDarkTheme` state, not on every render.
- **Pane open:** `$.ui.panes()` answers whether the pane is shown, so the
  branch-PR lookup needs no module flag and survives a reload.
- **No footer.** When the inbox last updated sits at the tab bar's right
  end, and wraps under the tabs when the pane is too narrow. The footer
  also showed `j: Next  k: Previous`, or how to give the pane the keys.
  A pane takes a key only as a Button's hotkey, so `j` and `k` are Buttons
  in a `display="none"` Box, and their hotkeys still fire.
- **Verified in a test session:** hotkeys fire while the pane has focus, and
  focus stays in the pane after a key sends a prompt. ctrl+x tab toggles
  focus. Theme keys and hex work as backgrounds. `Box` accepts only
  `borderStyle`, not per-side borders.
- **The band keeps bracketed, click-only buttons.** A bare digit typed into
  an empty prompt presses a band hotkey, which would capture "1. yes" as the
  person starts typing it.
- **Not used:** hover reveal. Hover cannot be checked in the test harness,
  and the selection already limits each row's buttons.

## Catching up instead of Rebuild

Pete asked on 2026-10-02 why Rebuild was needed when the mod updates after
every turn. It existed only for turns the per-turn update never saw, so the
mod now handles those itself and the button is gone.

- **When it catches up.** After a failed update, the ledger may have missed
  that turn, so `presence.error` doubles as the signal. A reload that cuts an
  update off (`isUpdating` still set at load) records an error too. The mod
  also catches up when it loads with an empty card into a conversation whose
  `$.session.turns()` is above zero: an install mid-session, or lost state.
  A turn counter compared against `turns()` was considered and rejected:
  prompts queued during a turn, aborted turns and turns started by
  notifications would make it trigger full re-reads that are not needed.
- **Catch-up.** The next update is then a `model.fork` over the whole
  conversation instead of the turn alone: at load right away, otherwise after
  the next reply. It passes the current card, open items and
  notes with their ids. It closes what the conversation handled, keeps what
  still waits, and adds what is new, so ids and the Decided list survive.
  Success clears the error. A catch-up that keeps failing is retried as a
  full re-read after each reply, with no backoff.
- **Handled notes close.** The `<notes>` block now carries ids, and a
  `CLOSED` line can name a note, so a note the conversation fixed or set
  aside leaves the Notes tab without a button press.

## Fewer tasks, more context

Pete asked on 2026-10-03 for the inbox to ask less of him and to know more
about what he is doing. It started when Claude's reply said "Run /inbox to
see it" while the pane was already open, and the mod turned that line into a
task.

Three gaps caused it:

- **The task rule is loose.** A "do" item is any action only the person can
  take. "Look at the result" qualifies, though nothing waits on it.
- **Neither model knows what the person sees.** The per-turn call reads only
  the exchange. Claude reads the carried card, which does not say the pane is
  open.
- **Only a button closes a task.** When the person does the thing, they must
  still press Done.

### Changes

1. **A task must block something.** The per-turn prompt makes a "do" item
   only when the agent cannot continue or finish without it, and only the
   person can do it. It skips invitations to look at or try finished work,
   optional suggestions, and anything the person already has on screen.
   Reason: each item costs the person a decision, even to dismiss it.
2. **Tell both models what the person sees.** The mod knows whether the
   `/inbox` pane is open and which tab shows. Reason: with it, Claude does
   not ask the person to open the pane, and the per-turn call does not make
   a task of it.
   - The per-turn call reads it in a `<screen>` block.
   - Claude reads it beside the person's prompt, with the open items and
     notes, whenever any of them changed since Claude last read them. The
     carried card cannot do this: `prompt.context` blocks reach only a
     conversation's first message and are rebuilt after compaction.
   - A system prompt section tells Claude to check that list before telling
     the person an item is open. Without it, Claude told Pete to dismiss a
     task the per-turn call had already closed.
3. **Close a task when the person does it.** The mod watches the person's own
   slash commands and `!` shell commands through `session.append`, and adds
   them to what the person sent that turn, with a shell command's output.
   - A `!` command that exactly matches a task's run or sign-in step closes
     the task at once, with no model call. The row carries no exit code, so
     this happens only when the command wrote nothing to stderr.
   - Otherwise the per-turn call reads the command and its output, and
     closes the task when the output shows it worked.
   - Reason: the person already did the work, so pressing Done adds nothing.
     The exact match means the mod never closes a task by guessing.

### Verified

- **Spike.** A `!` command reaches `session.append` as two rows with door
  `command`: `<bash-input>cmd</bash-input>`, then
  `<bash-stdout>…</bash-stdout><bash-stderr>…</bash-stderr>`. It never reaches
  `prompt.submit`, so the mod could not see it before. A slash command is a
  `local_command` row with `<command-name>/name</command-name>`. In the spike,
  a `!` command also started a model turn.
- **Replay on Sonnet.** The trigger turn, with the pane open:
  - the old prompt made the "Run /inbox and check the footer" task in 2 of 2
    runs
  - the new prompt made no task in 3 of 3 runs
  - a reply asking the person to run `npm login` still made the sign-in task
    in 3 of 3 runs
  - a reply waiting on the person's verdict on a color still made a question
    in 3 of 3 runs
- **Tests.** `readCommandRow` reads the spike's row formats, and
  `tasksRunBy` matches only the exact command. `claude plugin test` cannot
  raise `session.append`, so the hook itself has no end-to-end test.

### Notes at concrete moments

Notes stayed empty through a whole session that hit two note-worthy
problems. Claude judged both part of the task, so "outside the current task"
never applied. The guidance now names two moments that are easy to pass over
while focused on a task: working around a problem instead of fixing it, and
leaving part of a change untested.

### Checked live

Run in child sessions through tmux, with the repo's mod loaded by
`--plugin-dir`, on a scratch project whose `npm test` points at a missing
script.

- **Note at a workaround.** Asked to fix a bug and run the tests, Claude
  hit the broken `npm test`, ran `node --test` instead, and recorded a note
  about the script without being asked. The old guidance may have caught
  this one too, since the script is also an issue outside the task.
- **Inbox beside the prompt.** After Pete dismissed a question in the pane,
  Claude answered "where do things stand" with only the open question, and
  knew the pane was open.
- **Dismissed questions came back.** Claude saw a question leave the list
  without knowing why, asked it again, and the per-turn call added it
  again. Now Claude reads what was settled since its last look and how,
  and the per-turn call reads `<decided>` and must not add one again. In a
  second run, Claude said the question was dismissed and left it alone.
- **A `!` command closes its task.** Running a task's exact command with
  `!` removed it from the band before the per-turn update ran.
- **`session.append` cost.** The hook first ran for every transcript row,
  each a worker hop of 4 to 40 ms. A `{ door: 'command' }` matcher limits
  it to command rows.

### Prompts the mod sends skip its own hooks

A plugin's own `$.prompt.submit` runs the prompt chain without that
plugin's `prompt.submit` hook. Verified in a test and in a live transcript.
Before the fix, every prompt a button sent (an answer, Explain, Address,
Run) reached Claude without inbox context, and the per-turn call never saw
it as Pete's message.

- **Bookkeeping in `send()`.** `notePrompt` records a prompt in the
  person's words: presence, the turn count, the person's text, the press,
  and the context Claude reads beside it. The `prompt.submit` hook calls it
  for typed prompts, and `send()` calls it for the mod's own. The hook
  skips the mod's own prompts, so none is counted twice. This replaced the
  press queue, which matched submitted text back to the button that sent it.
- **Context in a hidden row.** A plugin's own prompt cannot carry
  `context`, so the mod appends it with `$.session.append`, as a user-role
  row the model reads and the transcript does not show. The engine may run a
  button's prompt at once, after the running turn, or inside it. So
  `send()` keeps the context by the prompt's text, and the mod's
  `session.append` hook on `prompt` and `delivery` rows appends it just
  before the prompt's own row is stored. Appending it at press time put it
  in the running turn, one message ahead of its prompt. A refused append
  does not stop the prompt.
- **No answer check on presses.** A button's prompt already says what it
  does. The answer check read the item an Explain or Run prompt quotes as
  answered.
- **Settled items always go out.** Claude had never been sent an inbox when
  its own reply asked the questions. Pressing then left the inbox empty, and
  the rule against sending an empty inbox Claude had not seen also dropped
  the dismissal. Anything settled since Claude's last look now goes out
  regardless.
- **Checked live.** Pete dismissed one question and answered the other by
  button. The hidden row listed both outcomes, and Claude said it would not
  ask the dismissed question again. A press while Claude worked was queued,
  and when it ran after the turn, its hidden row sat directly before it. `claude plugin test` cannot observe the
  appended row; the hook test checks that the per-turn call reads the
  pressed answer as Pete's message.

## Product direction

Set with Pete on 2026-10-03, after a session where the inbox kept drifting
from reality: a task for a pane he already had open, Claude telling him to
dismiss a task that had already closed, and an empty Notes tab.

**The job.** Pete runs many sessions at once. The inbox answers "does this
session need me, and for what?" at a glance, and makes answering cheap.

**Trust comes first.** Once an item can be wrong, Pete has to check every
item, and the inbox becomes one more thing to manage. Three parties hold a
picture of the session: Pete, the per-turn model, and Claude. All three must
read the same current ledger.

**Principles.**
- An item exists only when the session is blocked on Pete, or something
  goes wrong without him.
- The inbox closes what it can see done. Done and Dismiss are fallbacks.
- Nothing worth knowing scrolls away.

**Decisions.**
- **Who creates items: Claude, through one tool.** Pete chose this on
  2026-10-04. The per-turn model writes only the card. Not built yet; see
  [Taking Briefing's strongest parts](#taking-briefings-strongest-parts).
- **Notes become Claude chose.** Pete chose this on 2026-10-04. A finding
  outside the task is a call Claude made, and Claude records it with the
  same tool. Not built yet; see
  [Taking Briefing's strongest parts](#taking-briefings-strongest-parts).
- **Scope: across sessions.** The inbox shows what every open session needs
  from Pete, not only the one he is in. Not built yet. What exists: the
  mod's store already keeps each session's ledger under `s:<session id>`.
- **The moment that matters most: returning after time away.** When Pete
  comes back, the inbox must tell him which sessions need him, what each
  did while he was gone, and what each waits on. Glancing and answering
  serve that moment.

- **Where Pete looks first on return: the Herdr sidebar.**

**What returning implies for the cross-session work.**
- **Where the view lives: the Herdr sidebar.** It has to be the first thing
  Pete sees on return, before he picks a session. Herdr builds each agent's
  sidebar rows from tokens named in `~/.config/herdr/config.toml`
  (`[ui.sidebar.agents] rows`). `herdr pane report-metadata <pane>
  --source <id> --token NAME=VALUE` sets a custom token on a pane, and
  `herdr api snapshot` showed it stored on that pane, next to the pane's
  Claude session id. So each session's mod can publish its own one-line
  status to its own pane (`$HERDR_PANE_ID`), and the sidebar shows every
  session at once. No session has to read another's ledger. Not yet seen:
  a custom token rendered in a sidebar row, which needs a config row Pete
  adds.
- **Live updates matter less.** A return reads the stored ledgers when Pete
  comes back, so polling the store is enough. Whether one session's mod sees
  another's writes as they happen is worth knowing, not a blocker.
- **Answering from another session can wait.** Pete can switch to the
  session that needs him.

### Sidebar status line, first version

- After each ledger change, at load, and at session end, the mod runs
  `herdr pane report-metadata $HERDR_PANE_ID --source session-inbox --token
  inbox=<line>`, only when the line changed. Outside Herdr it does nothing.
- The line counts what waits on Pete, such as "2 questions · 1 task", with
  notes after. With nothing waiting it shows the card's NOW line. It is cut
  at 60 characters. Session end clears it, because the pane outlives the
  session.
- Pete's `~/.config/herdr/config.toml` shows it as a third, dim row of each
  agent: `[{ token = "$inbox", dim = true }]`. Herdr requires a `$` on a
  custom token in config, and does not allow one in the pane's token name.
  `herdr config check` passed and the server reloaded it.
- Only sessions that run the mod publish a line, so the sidebar shows every
  session only once the mod loads everywhere (`CLAUDE_CODE_PLUGIN_DIRS`).
- Seen rendered on 2026-10-03: the session's agent row showed a dim third
  line, "3 tasks", under the workspace name.

**What the first version shows.**
- A count says how much waits, not what. On return, "3 tasks" does not
  tell Pete whether to switch to that session.
- Herdr sorts the agents panel by priority (`agent_panel_sort`). A session
  that waits on Pete still sorts like any idle agent, so it can sit below
  sessions that need nothing.
- **Sorting by "blocked" does not work from the mod.** The mod reported the
  agent `blocked` with `herdr pane report-agent --source session-inbox`.
  Herdr kept the Claude integration's state: `working` during the turn and
  `done` after it, both with the report in place. Herdr takes an agent's
  state from the integration's source alone, so a waiting session cannot
  sort to the top this way.
  Pete chose on 2026-10-03 to drop sorting. The line names what each
  session waits on, which is the signal he scans for.

### Items only in the pane

Pete asked on 2026-10-03 for waiting items to stop appearing inline in the
session. The band no longer lists items or their buttons. It shows one line:
the goal, where the work stands, and "N waiting on you in /inbox", with the
note and PR hints after it. The away card and the last-session card show the
count instead of the items. The pane is the one place to read and answer
them. Numbered answers typed in the prompt still map to the latest batch.

### History in the Waiting tab

Pete asked on 2026-10-03 for Done and Decided to read better. Each decision
ran its question and outcome together on one dim line, and wrapped lines
started at the left edge, so entries blurred together.

- Every entry has its marker in its own column, so wrapped lines hang under
  the text.
- A decision is two lines: the question, dim, then the outcome under it.
  The outcome is bold when Pete decided it, and dim when it lapsed:
  dismissed, or no longer applying. Its age sits at the right.
- A blank line separates decisions. Done entries stay one per line.
- Entries sit indented two columns under their section header. The header
  (Done, Decided, Running) is at full brightness with a dim rule to the
  pane's edge. A Button takes no bold or color, and the whole title must stay
  clickable to collapse the section, so brightness and the rule set it apart.

### Which questions become items

Pete flagged a bad item on 2026-10-03: "Describe what happens when you click
a toggle: plain click or drag?" It came from a diagnostic question, which he
answered by replying. The shortened wording no longer made sense, and its
only answer action, Reply, started a message he could type anyway.

- A question becomes an item only when the agent's work waits on its answer.
  A question about what the person saw, meant or wants is skipped, because
  they answer it in their next message.
- An item's question is at most 12 words, or up to 16 when 12 would lose its
  meaning. It keeps every alternative the original names.
- A question with no options has Explain and Dismiss, and no Reply. The
  answer check does not look for a quoted item, since Reply was the only
  thing that quoted one.

Replayed through Sonnet with the new instructions. The reply behind the bad
item made no item in 4 runs. A reply blocked on choosing an AWS profile made
an item in both runs, with the profiles as options. So did a reply asking
approval for these fixes, which also closed the bad item.

## Taking Briefing's strongest parts

Decided with Pete on 2026-10-04. Briefing (`mods/briefing`) was built to
replace this mod. Pete chose to bring its strongest parts into Inbox
instead, designed as one experience. Steps 1 and 2 are built; the rest is
not built yet.

### One author for each fact

| Author | Writes |
|---|---|
| The tools, read by the mod | Stops, open prompts, held actions, check results, PRs, running servers |
| Claude, through one tool | Its questions, its tasks, and the calls it made that Pete might make differently |
| The per-turn Sonnet call | The card: goal, where the work stands, what is done |
| Pete | Answers, switches, dismissals |

Inbox's wrong items all came from the per-turn call creating them: a task
for a pane that was already open, a diagnostic question made into an item,
and restated questions that needed word-overlap merging. The PRs tab reads
GitHub directly, so it cannot invent an item. So Inbox grows by what
the tools measure and by what Claude declares. The per-turn call only
narrates.

### What to take, strongest first

1. **Stops and open prompts.** A stop is a session halted by something
   outside the chat: an expired sign-in, billing, a usage limit, or an API
   error. Claude Code's events name each one. Inbox reads none of them
   today, so a stopped session looks idle. The sidebar line puts a stop
   first, with its fix (`! Signed out: /login`), then an open permission
   prompt or question dialog (`? Allow git push`), then Inbox's items as
   now. In 45 days of Pete's transcripts, the costliest problem was a
   session waiting on him that he could see only by visiting it. A question
   dialog that timed out while Pete was away is recorded as Claude's call,
   not as his answer.
2. **Claude writes its own items.** One tool lets Claude record its
   questions, its tasks and its calls, and close them. It replaces `note`.
   The per-turn call stops creating items and writes only the card. At the
   end of each turn, a reply that asks Pete something no item records is
   sent back once, so Claude records it. Inbox's first principle is that
   every item can be trusted, and every wrong item came from inference. The
   cost: when Claude forgets, Inbox shows less, until the end-of-turn check
   catches it. Pete chose this on 2026-10-04.
3. **Measured check results.** The mod records each test, build and lint
   command Claude runs, its result, and whether files changed after it. The
   card shows them, as in "✓ npm test, 12 pass", and the per-turn call reads
   them, so the card cannot call a failing run passing. A reply that claims
   tests pass when the last run failed, or ran before the last edit, is sent
   back once. Pete asked an agent to prove or verify a claim about 100 times
   in 45 days.
4. **Held actions, for acts that cannot be undone or that speak for Pete.**
   Force-pushes, discarding local work, deletions, and messages sent to
   people wait in the Waiting tab with the exact command or text. One press
   runs it. Claude keeps working meanwhile, where a permission prompt stops
   the turn. A held discard runs only while the files are unchanged. This
   also finishes the PRs tab: an approved reply draft becomes a held post,
   one press from GitHub. Pete chose this scope on 2026-10-04. Pushes,
   releases and deploys stay with Claude Code's permission rules.
5. **Claude chose replaces Notes.** Notes stayed empty in real sessions. A
   finding outside the task is a call Claude made: to leave it for now. The
   tab lists each call Claude made that Pete might make differently, as
   "question → choice, not alternative". Pressing the alternative switches
   it, which replaces Address. `e` explains, which replaces Discuss. Calls
   leave the list half a day after Claude made them, which replaces
   Dismiss. Pete chose this on 2026-10-04.

### What not to take

- **Briefing's catch-up and Away line.** The card already covers both.
- **Briefing's band, pane and record files.** Inbox's are further along.
- **Releasing a held push from Pete's words.** It was Briefing's most
  fragile part. Testing found four phrasings that released a held action
  Pete had not asked for.
- **Explain in a fork, presses read mid-turn, and batched presses.** Each is
  a small gain. Later, if Pete misses them.

### What Pete sees change

- **Sidebar:** a stop or an open prompt comes before the first item.
- **Band:** a stop replaces it. The status line carries measured check
  results.
- **Pane:** Waiting lists stops and held actions first, then Claude's
  questions and tasks. Notes becomes Claude chose. PRs is unchanged.
- **Keys:** `1` is always Claude's pick: the recommended answer, a held
  action's Run, or a task's helper.

No tab or section is added. Stops and held actions are new kinds of waiting
item, check results sit on the existing status line, and Claude chose takes
the Notes tab's place.

### Order of work

Each step ships alone and is checked in a live session.

1. Built. Stops and open prompts in the sidebar, band and Waiting tab. Item
   creation does not change.
2. Built. Measured check results in the card, and the end-of-turn check for
   a false "tests pass".
3. Waits until Pete has used steps 1 and 2 for about a day, his choice on
   2026-10-04. Claude as author: the tool, its guidance, the end-of-turn
   question check, the per-turn call writing only the card, and Claude
   chose. The tool must stay loaded up front after `/resume`. In a resumed
   session Briefing's tool came back behind tool search, with its guidance
   missing.
4. Held actions, and posting an approved PR reply with one press.

Briefing can be retired after step 4. Its docs stay as the research behind
this plan.

### Step 1: stops and open prompts

Built on 2026-10-04.

- **Stops** come from `classic.StopFailure`, for the main agent only. The
  next `turn.start` clears a stop. So does `/login` after a sign-in stop.
- **A usage limit and a busy server send the same error word,
  `rate_limit`.** Only the message Claude Code showed tells them apart:
  "You've hit your weekly limit · resets 7:33pm", or "Server is temporarily
  limiting requests (not your usage limit)". The mod reads that message and
  keeps the reset time for the sidebar: `! Limit: resets 7:33pm`. If Claude
  Code rewords the message, a usage limit reads as an API error.
- **Dialogs** come from `classic.PermissionRequest` and from AskUserQuestion
  calls. Each closes when its own tool call returns, a subagent's included.
  Every dialog closes when the main turn ends.
- **The sidebar line** is published in order, and each publish reads the
  state when it runs. A dialog that opens and closes quickly cannot leave a
  stale line.
- **A question dialog that timed out** while Pete was away reaches the
  per-turn call as unanswered by him. Not tested.
- **Checked live** in tmux sessions with a stand-in `herdr` that logged each
  line:
  - A permission prompt set the line to "Allow delete the note.txt written
    to the wrong folder?". Cancelling the prompt restored the line.
  - A stand-in API that answered 429 like a reached usage limit set the band
    to "Stopped just now: usage limit reached. Resume after 7:33pm." and the
    line to `! Limit: resets 7:33pm`.
  - A 429 without the usage-limit headers read "the API is limiting
    requests".
  - The Waiting tab showed the stop above its list.
- **Sign-in stop, seen live** in a session with its own config folder and a
  fake API key, against a stand-in API that answered 401. Claude Code sent
  `authentication_failed`. The band read "Stopped just now: sign-in
  expired. Run /login, then send a message to resume." and the line read
  `! Signed out: /login`. Claude Code's own message was "Invalid API key ·
  Fix external API key": with an API key in the environment, `/login` is
  the wrong fix. Pete signs in with his subscription, where it is right.
- **Not seen live:** a billing stop.

### Step 2: measured check results

Built on 2026-10-04.

- **Recognized checks** are Briefing's list: test runners, type checkers,
  linters, builds and validation scripts. The mod looks in each part of a
  Bash command, not inside quotes or heredocs, and only at the main agent's
  commands.
- **Results** come from, in order:
  1. A printed exit status: `echo "exit=$?"`, `tsc exit 2`, or a bare
     `echo $?`.
  2. The command's own exit status, when the check ends the command.
  3. Pass and fail counts in the output.

  A check whose output went to a file with no status shown is unknown. The
  first live run read `exit=1` as a pass, and this order fixes it.
- **Before the last edit.** The mod reads the working tree with git: HEAD,
  plus a hash of each uncommitted file. It reads it before recording a
  check, when Claude stops, and at the end of a turn. A commit only moves
  content into HEAD, so it changes nothing. A Markdown-only change leaves
  tests, type checks and builds current. Lint and validation go stale on
  any change. The Markdown rule exists because the check sent Claude back
  for saying tests passed after only README and plan edits.
- **Where results show:** a failed check gets a line of its own under the
  band, since a narrow band cut it off the end of the status line. The away
  card has a row of all checks, and the Waiting tab has a Checks section.
- **The per-turn call** reads a `<checks>` block. It may write that a check
  passes only when the block shows it passing and current.
- **The end-of-turn check** runs in `classic.Stop`. It sends Claude back
  once when the reply says tests, types, lint or a build pass and the latest
  check of that kind failed or is stale. It leaves hedged claims, such as
  "should pass", and claims with no check of their kind alone.
- **Checked live** in the toy `tally` project:
  - `npm test` was recorded as passing in the Waiting tab.
  - After an edit to `tally.js` with no new run, a reply ending "All tests
    pass." was sent back. Claude then said the edit was untested, and the
    card read "edit made, tests not re-run after it".
  - After a run and a README-only edit, the same claim went through.
  - A failing run showed "✗ npm test, exit 1" under the band and in the
    Waiting tab.

### Claude closes items

Built on 2026-10-04, at Pete's request, ahead of step 3. It is the tool his
2026-10-03 decision "inferred, agent corrects" called for.

- **Why.** A resumed session showed a task that no longer applied. Inbox had
  not been loaded for nine hours of that conversation, so its saved ledger
  was stale. An Explain turn cannot close the item it explains, and only
  Pete could dismiss it, though Claude knew it was obsolete. Rereading the
  whole conversation on resume was considered and rejected. That trigger is
  rare, the reread costs a full-context call, and it is the same inference
  that makes wrong items. A close tool fixes stale items from any cause.
- **How.** The inbox context beside each prompt, and the compaction carry
  for this session, show each item's and note's id. The `close` tool takes
  an id and a reason of a few words. An item moves to Decided with the
  outcome "closed by Claude: <reason>", drawn dim like a dismissal. A note,
  which Claude recorded itself, is removed. The guidance tells Claude to
  close what is done or no longer applies, and never to close a question to
  answer it for the user. The previous session's carry has no ids, since
  its items are not this session's.
- **Served in the general `tool.call` hook.** A matcher naming a tool
  registered at run time does not type-check, because the engine's types
  list only tools known when they were generated.
- **Checked live** in a fresh session: told that its naming question was
  settled elsewhere, Claude called `close` on `i1` without being asked to,
  with no permission prompt, and the item moved to Decided. The same session
  showed a question dialog in the sidebar as "Should the CLI be named tally
  or sum?", which cleared when the dialog was cancelled.

### Your own words on an item

Built on 2026-10-04 at Pete's request: a free-text answer for when none of
an item's options fits.

- **`t` opens a one-line field** under the selected row in the Waiting and
  Notes tabs, and `$.ui.focus` gives it the keyboard. Enter sends the words
  as Pete's message, quoting the item. An empty field sends nothing.
  Selecting another row closes the field.
- **What happens to the item.** A question closes with Pete's words as its
  answer, as an option press does, so a second send cannot repeat it. A task
  stays open, because Claude can now close it once the message settles it. A
  note leaves the Notes tab, as Address does, since it went back to Claude.
- **How this differs from the removed Reply button.** Reply filled the
  prompt and added nothing a typed message could not do. The field keeps
  Pete in the pane, and its message names the item, so the answer is tied
  to the item without numbering.
- **The mobile app** draws no text field, so there the key is not shown.
- **Checked live:** on a "tally or sum?" question, `t` put the keyboard on
  the field, and "cnt, short for count" reached Claude as `Re "Should the
  CLI be named tally or sum?": cnt, short for count`. The question closed.

### Answers typed in chat close their items at once

Built on 2026-10-05. Pete answered questions by typing in the chat, and the
items stayed in Waiting until the per-turn update ran after Claude's whole
reply, minutes later on a long turn. He asked for the item to register as
answered right away, with visible confirmation, and then move to Decided.

- **Claude closes it first.** The `close` tool takes `answer`, the user's
  answer in their words, as well as `reason`. Its description and the
  guidance tell Claude to close an item the user's message answered before
  any other work. Claude already reads the open items, with ids, beside
  each message, and it asked the question, so it judges best whether the
  message answers it. A model call at submit time was considered and
  rejected: it is a second model judging items, which step 3 moves away
  from. The per-turn update still closes what Claude misses, after the
  reply.
- **An answer is the person's decision.** Its outcome is the answer itself,
  drawn bold in Decided like a pressed answer, not "closed by Claude".
- **Confirmation in place.** Every close, from any source, keeps the item's
  row where it was for 8 seconds with a ✓ and the outcome, then the row
  leaves. The band shows "✓ question → outcome" for the same time. An item
  dropped as stale has no outcome and leaves at once.
- **A 24-hour expiry was considered and rejected.** Pete found the window
  arbitrary, and his problem was answers not registering, not age.
- **Checked live:** with two questions open, Pete's stand-in typed "go with
  tally: as the prefix. leave the rounding question for later". Claude's
  first action was `close(i1, answer: "go with tally:")`. About 5 seconds
  after sending, the row read "✓ … Go with tally:", the rounding question
  stayed open, and the ✓ row left 8 seconds later.
- **Behind tool search in a reloaded session.** In a fresh session Claude
  called `close` directly. In a session where the mod reloaded mid-way, the
  tool was listed behind tool search, so Claude must find it first.

### Checks start folded

Pete asked on 2026-10-05 for the Checks section to start collapsed. Checks
are proof to look up, not something to act on, and a failed check already
shows under the band. Checks became a collapsible section like Done and
Decided. The stored preference now records each section Pete toggled, true
for folded, and a section he never toggled uses its default: Checks folded,
Done and Decided open. The older list of folded sections is read as before.

### The Waiting tab's layout

Pete reviewed the tab in `/inbox demo` on 2026-10-05. He set legibility as
the goal, not fewer lines. The changes:

- **Questions, then Your tasks.** Each group has a header, so a row needs
  no kind marker. Questions come first because each takes one key. Every
  row's handle is a dot, and a just-closed row's is a ✓.
- **No numbers in the left column.** Claude's numbers for its questions
  looked like the answer keys: with question 1 selected, 2 answers it and
  does not select question 2. "1. yes" typed in chat still maps by number.
- **No permission prompt or question dialog in the pane.** It shows in the
  session already, and the pane cannot answer it. The Herdr sidebar line
  still names it.
- **The selected row.** The recommendation is marked on its answer's key,
  as "1: ISO 8601 (recommended)". A recommendation that names no answer
  keeps its own line. The answers, and Done on a task, come first. Type,
  Explain and Dismiss follow, dimmer, on the same row when it fits them, and
  otherwise on a line of their own, so a row never wraps mid-way. They are
  at full weight when they are the only keys.
- **Section headers.** Checks shows a red ✗ while a check fails, folded or
  open. Done is now "Finished by Claude" and Decided is "Closed", because a
  task's Done key sent it to Decided. Stored section keys stay `done` and
  `decided`. Section titles have no rule beside them; the tree joins each
  open title to its rows. All text starts at one column, with markers in
  the column before it.
- **Selection and dividers, in every tab.** The selected row is blue in all
  three tabs: a muted `#2d3846` in the dark theme, and the theme's
  `selectionBg` elsewhere. Pete removed the blue bar at its left edge; the
  background alone marks it. It used to take its tab's
  amber, purple or teal, and amber read as a warning. A line separates each
  two rows: `#3c3c3c` in the dark theme, about half the contrast of the
  theme's `subtle` gray, and `subtle` in other themes. It starts where the rows' text
  starts and runs to the pane's edge. It replaced zebra stripes, which only the dark theme
  could draw, since no theme key sits that close to the pane's background.
- **The tab bar scrolls with the list.** No pane option pins a row. The
  tab bar and the footer the pane had then, pinned as absolute Boxes at
  `scroll.offset` and `scroll.offset + bodyRows - 1`, stuttered. On each scroll, Claude Code paints the
  moved window at once and draws the pane again 10 to 15 ms later, so for
  one frame the bars moved with the list. Sampled through 25 wheel ticks,
  63 of 448 screens showed a bar off its row. A mod cannot remove that
  frame. Its `ui.scroll` hook runs before the move, and a mod that scrolls
  the list itself cannot bring the selected row into view, because its own
  `$.ui.scroll` calls skip its hook and the API reports no row positions.
  The request for a fixed header and footer is upstream issue #99449, with
  these terminal findings in a comment.
- **A tab switch scrolls the pane to its start,** so the new tab shows the
  tab bar and its first rows.
- **A selected row scrolls into view whole.** The selected row alone draws
  an absolute target Box that spans it, and `select()` scrolls to that.
  `$.ui.scroll` refuses a key it has not drawn yet, so `select()` retries
  for up to 10 frames. Scrolling to the row's own key measured the row
  before it redrew expanded, and the row's end could land out of view.
- **A click on a row's text selects it.** Only the one-character dot took
  the click before. A Box cannot take a press, so the text is a plain
  Button. A Button label does not truncate, so the mod clips it to the
  pane's width.
- **A selected note leads with its title.** Its first line is the title and
  its age. The kind and the file sit on the line under it.
- **Numbered questions, newest first.** Questions are numbered 1), 2), 3)
  by their place in the list. The newest batch comes first, so its numbers
  match the ones Claude used in its reply. Tasks keep a dot.
- **A tree under each section.** Lines join a section's title to its rows,
  as in a directory listing: ├─ for each child, └─ for the last, │ between,
  in the theme's `subtle` gray.
  A PR's title and its rows form one tree, and its state sits on the trunk.
  Rows wrap to any height, so the lines sit in an absolutely positioned Box
  that spans the row, and the row clips the rest. The row clips, not that
  Box: Claude Code draws what an absolute Box clips near the window's top
  once its row scrolls out of view (anthropics/claude-code#100030). A blank line, crossed by the trunk,
  separates each open title from its rows.
- **Every section folds from its title row.** Questions, Your tasks and
  Running fold like Checks, Finished by Claude and Closed. A click anywhere
  on the title row folds or opens the
  section: `▸` folded or `▾` open, the title, and its count, muted. The
  triangles replaced `>` and `v`: they are one shape in two states, where
  `v` read as a letter. A Button's label takes one style, so the caret, the
  title and the count are Buttons of their own, and a last Button of spaces
  pads the row to its edge. Each part also inverts while the pointer is
  anywhere on the row, the dim caret and count at full strength, so the row
  lights as one bar the way a single Button does. A Button's label cannot be bold, and a bold title drawn over it took
  the clicks, so titles are regular weight. A failing check adds a red ✗
  after the count. Checks, Finished by Claude and Closed share one card,
  with a divider between each two.
  The selection skips a folded section's rows, and the Waiting tab still
  counts every open item.
- **Sections on cards.** In the dark theme the pane's body is `#1a1a1a`,
  darker than its former rgb(38, 38, 38), and each section sits on a card
  of that former color: Questions, Your tasks, Running, a stop, the folding
  sections together, the Notes list, and each PR. The card color is the
  theme's `composerSidebarBackground`. Other themes draw neither, since the
  body color is hex.
