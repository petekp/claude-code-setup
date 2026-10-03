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
  line, "Q2 - …", "go" and "all recommended", and a row quoted from the band.
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
  the keyboard, and its footer says ctrl+x tab, which cycles the prompt,
  the band and the pane.
- **Tabs** are a filled chip in the tab's color for the current tab
  (`inverseText` on the color) and `n: Notes` buttons for the others.
- **Layers.** The tab bar and the footer sit on raised panels
  (`userMessageBackground`), and the list sits on the pane's own background
  between them. In the `dark` theme, the selected row is tinted with its
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
- **Focus:** `Pane.isFocused` decides the footer: the move keys while
  focused, "ctrl+x tab for keys" otherwise.
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
  `context`, so `send()` appends it first with `$.session.append`, as a
  user-role row the model reads and the transcript does not show. A refused
  append does not stop the prompt.
- **Settled items always go out.** Claude had never been sent an inbox when
  its own reply asked the questions. Pressing then left the inbox empty, and
  the rule against sending an empty inbox Claude had not seen also dropped
  the dismissal. Anything settled since Claude's last look now goes out
  regardless.
- **Checked live.** Pete dismissed one question and answered the other by
  button. The hidden row listed both outcomes, and Claude said it would not
  ask the dismissed question again. `claude plugin test` cannot observe the
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
- **Who creates items: inferred, agent corrects.** The per-turn model keeps
  inferring items from the exchange. Claude can close or fix an item the
  model got wrong. Not built yet: Claude needs a tool for it.
- **What Notes hold: anything non-urgent Pete should know.** Claude's own
  notes stay. The per-turn model also lifts caveats out of Claude's replies:
  limits, workarounds, untested parts and risks. A caveat qualifies only if
  it could change something Pete does later. Not built yet: the notes need a
  source, so tool notes and inferred caveats can be told apart and merged.
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
