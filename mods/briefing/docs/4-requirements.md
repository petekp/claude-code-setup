# Briefing: revised requirements

Briefing keeps one shared record of each session's work: the goal, the
decisions Claude asked or made, the tasks only the person can do, and facts
the tools measured. It shows that record where Pete looks: Herdr's sidebar,
the band above the prompt, and a pane. Claude reads the same record.

This list replaces the requirements in [2-vision.md](2-vision.md). The five
reviews that shaped it are summarized in [3-reviews.md](3-reviews.md). What
testing found, and what it changed, is in [5-test-report.md](5-test-report.md).

## Principles

1. **Both sides read the same record.** Claude is told what changed that it
   did not change itself, and nothing else.
2. **Ask for the person's calls; decide the rest visibly.** Claude asks for
   whatever Pete's own rules reserve for his approval, for product, design and
   creative calls, and for anything with no reasonable default. It decides the
   rest itself and records the decisions he might have made differently.
3. **Claude is the only author of items.** No second model creates or closes
   an item. A check at the end of each turn asks Claude to record what it
   forgot.
4. **Measured beats claimed.** Stops, open dialogs, check results and file
   changes come from Claude Code's own events and from git.
5. **Quiet unless Pete must act.** The sidebar line and the band change only
   when Pete's next action changes. Working and idle show nothing.
6. **No presses that only tidy.** Claude's choices leave the list on their
   own, half a day after it made them. Tasks close when their effect is
   measured.
7. **Consent comes only from Pete.** A press, his own message, or his answer
   in a dialog. A dialog that times out while he is away answers nothing for
   him.
8. **One vocabulary, one key grammar,** the same on every surface and in
   Claude's guidance.

## Words on screen

| Concept | On screen |
|---|---|
| Something only Pete can answer or do | **Needs you** |
| A session halted by something outside the chat | **Stopped:** cause and fix |
| A decision Claude asked | the question, ending in "?" |
| A decision Claude made | under **Claude chose**: the question → the choice, then "not" and the alternatives |
| A task | the instruction |
| An outward act held for Pete | under Needs you: "Run held: Push main to origin" |
| The recommendation | **Recommended:** option. Reason |
| A check command's result | ✓ or ✗ with its name: "✓ npm test, 3 pass" |
| A check that ran before the files last changed | "before the last edit" |
| What happened during an absence | **Away** 1h 30m: counts of what changed |
| The catch-up after a reply | **Now:** |

Never on screen: request, destination, touchpoint, proceeded, unbacked,
evidence, stale, blocked, working, idle.

Colors: yellow means Needs you; red means stopped, failed, or cannot be
undone; green means passed. Everything secondary is dim. Marks: `?` and `!`
on the sidebar only; ✓ ✗ in the pane and band.

## The record

One record per session, saved to its own file so concurrent sessions never
write the same file. It survives `/resume`, `/clear`, compaction and a reload
of the mod.

- **Goal.** One sentence, written by Claude. Optional. A new goal leaves
  Claude's earlier choices in place, since Pete may not have reviewed them.
- **Decision.** An id (d1), a question, two to four options, the pick
  (recommended when asked, taken when made), a reason, an optional detail on
  what each option leads to, and an optional label of at most 16 characters
  for the sidebar. Status: *waiting* (asked), *made*, *answered*, *switched*,
  *withdrawn*. Pete answers or switches by press, in chat (which Claude
  records), or in a question dialog. Claude withdraws. A decision Pete
  touched is never rewritten.
- **Task.** An id (t1), the instruction, at most one helper (a command to
  run with `!`, a file, a link). Closes when the mod sees its command run
  without error, when Claude records it done, or by Pete's Done press.
- **Held act.** An outward or destructive tool call the mod refused to run.
  It waits with its exact input, and one press runs it as Pete's own request.
- **Check.** The last result of each check command Claude ran: name, pass or
  fail, summary line, and when it ran.
- **Work.** The working tree's content when the mod last read it: HEAD, and a
  hash of each file that differs from HEAD. Also when that content last
  changed. The mod reads it with git and never writes to the repo. A commit
  moves content into HEAD without changing it.
- **Stop.** Sign-in expired, billing, usage limit, or an API error. Measured.
- **Catch-up.** One to three lines, conclusion first, written by a fast model
  after each reply, covering everything since Pete's last typed message or
  press. Measured facts override it. It never touches items and is never sent
  to Claude.
- **Log.** Every change, with who made it: Pete, Claude, or measured.

## Held acts

The mod holds a call when it reaches outside the machine or destroys work.

- **Pushes, pull request and issue writes, releases, publishes and deploys**
  run when Pete's latest message asked for that kind of act in his own
  words, or when he answered yes to a question that named it. Anything else
  holds them: a question about the act, a refusal ("don't push yet"), a
  pasted error that mentions it, or a word that only implies it ("sync").
- **Force-pushes, discarded local work, deletions, and messages sent to
  people** always wait for a press, whatever Pete's messages said. The press
  is his approval of that exact command.
- **A held discard** runs only while the files are as they were when it was
  held. If they changed, Run refuses and tells Claude, so newer work is never
  thrown away.
- **Dry runs and reads pass.** `--dry-run`, `gh api` reads, and connector
  tools whose names only read are never held.

## Requirements

Status: **verified live** means built and seen working in a real session.
**Tested** means built and covered by the mod's tests, not yet seen in a real
session. **Later** means not built.

### P0: the core

| # | Requirement | Status |
|---|---|---|
| R1 | One record per session, in its own file. `/clear` starts a new record. `/resume`, `claude --resume` and a reload of the mod restore the session's own. | verified live |
| R2 | The `record` tool: goal, ask, chose, task, close. It refuses a decision with options but no recommendation and no reason, a repeat of an open question, and a choice for an id Pete did not leave to Claude. Closing an item Pete already settled leaves it as it is and says so. It answers with the ids. | verified live |
| R3 | Guidance at session start, stable for the session, mapping ask versus decide onto Pete's approval rules, naming what the mod holds, and teaching ids in replies. | verified live |
| R4 | Claude is told, with each typed prompt or press, what Pete and the tools changed since it last looked. After a compaction or a resume it gets the whole record. | tested |
| R5 | Stops measured from `classic.StopFailure`. | tested |
| R6 | Open dialogs measured: a permission prompt or an AskUserQuestion dialog is Needs you with its text. Each dialog closes when its own tool call ends. A question dialog's header is its sidebar label, and its answer is recorded as a decision. | verified live |
| R7 | Checks measured from Claude's commands, marked "before the last edit" when the files' content changed after they ran. | verified live |
| R8 | The sidebar line, at most 22 characters: `! cause: fix`, else `? label +N`, else empty. | verified live |
| R9 | The band: one loud thing, at most one problem, the Away line. Nothing during a quiet turn. | verified live |
| R10 | The pane: a verdict of at most three lines; then Needs you, Goal and proof, Claude chose, Earlier. Fixed order, capped, keyboard first. It opens sized to its content, on its first row. | verified live |
| R11 | One key grammar: j and k move; 1 is Claude's pick; 2 to 9 are the alternatives; e explains; x dismisses; d marks a task done. After an answer the selection advances and digits pause briefly. | verified live |
| R12 | A press reaches Claude by one path: presses within a few seconds are sent together, as Pete's own message when Claude is idle, or as a note Claude reads at its next step when it is working. A press on a settled item does nothing and says so. | verified live |
| R13 | At the end of each turn, if the reply asks Pete something no item records, the mod blocks the stop once and asks Claude to record it or say it is not a decision. | tested |
| R14 | The catch-up after each reply. | verified live |

### P1: what makes it excellent

| # | Requirement | Status |
|---|---|---|
| R15 | Explain answers in the pane, from a fork of Claude's own context, never in the chat. | verified live |
| R16 | Held acts, as described above. The refused call names its id, and one press runs it as Pete's own request. | verified live |
| R17 | At the end of a turn, if the reply claims success and the latest check of that kind failed or ran before the files last changed, the mod blocks the stop once and says so. Both checks share that one block. | tested |
| R18 | The Away line: after 15 minutes without Pete's input in this session, what changed since, counted from the log, until he sends a typed message. | tested |
| R19 | Presence across sessions: away means no input in any Briefing session, so working in another session is not being away. | later |
| R20 | One `/login` resumes every session the expired sign-in stopped. | later |
| R21 | Turns stopped by an overloaded or failing API resume on their own, at most three times, if Pete has not typed since. | later |

### P2: frontier

| # | Requirement | Status |
|---|---|---|
| R22 | Done-when conditions shown under the goal, ticked only by a measured check or by Pete. Mirrors `/goal` when set. | later |
| R23 | Next needs you: what Claude will next need Pete for, from its own task list. | later |
| R24 | The pull request for the branch: one item per PR, CI as proof. | later |
| R25 | A "Going away" press that sends Pete's own message naming the decisions Claude may proceed on. | later |
| R26 | Notify through Herdr when a stop or a question waits while Pete is in another session. | later |
| R27 | Rewrite or replace Claude Code's own away recap so only one return summary shows. | later |

## Never

- Items created or closed by a second model.
- A timer that answers for Pete.
- Presses that only tidy: Confirm, Keep.
- A line or band that changes with each tool call.
- A log of everything in the pane.

## Pete's earlier decisions this changes

Two of Pete's decisions from 2026-10-03, made for session-inbox, are
reversed here. Both are open for him to overrule.

- **"Inferred, agent corrects"** becomes "Claude is the only author, and a
  check at the end of each turn asks it to record what it forgot". Every
  wrong inbox item came from inference.
- **"Notes hold anything non-urgent"** becomes "a finding outside the task is
  a decision Claude made not to act on now", with the other option one press
  away. Notes stayed empty in session-inbox, and the useful ones were
  reversible choices.
