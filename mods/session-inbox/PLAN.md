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
  - **Actions** send a request to Claude as the person's message. The mod
    queues each text it sends, and `prompt.submit` matches the submitted text
    against the queue, so the per-turn call knows which button sent it. Address and
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
