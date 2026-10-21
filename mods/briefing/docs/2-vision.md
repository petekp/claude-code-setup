# Briefing: product vision and first requirements

Briefing is a Claude Code mod. It keeps the person and the agent working from
the same picture of the work: where it is going, where it stands, what each
needs from the other, and what is proven. The agent keeps moving without
taking decisions away from the person. The person can step away and, on
return, recover the whole situation in thirty seconds.

It follows from [1-first-principles.md](1-first-principles.md). It inherits
nothing from session-inbox, the earlier experiment, except its lessons and
some reusable parts. The adversarial reviews of this document are in
[3-reviews.md](3-reviews.md), and the requirements that survived them are in
[4-requirements.md](4-requirements.md).

## Who it is for

One person running several Claude Code sessions in parallel inside Herdr, a
terminal multiplexer, often stepping away between them. They want the agent
to do more on its own, and they never want to be surprised by what it did.

## Principles

These settle trade-offs. When two conflict, the earlier one wins.

1. **Both sides read the same record.** Whatever the person sees, the agent
   is told, and the reverse. Neither side works from its memory of the chat.
2. **Ask only when blocked. Otherwise choose visibly.** A question stops the
   work. A recorded choice does not, and the person can still change it.
3. **State, not stream.** Show what is true now. History stays collapsed.
4. **One author per fact.** The agent declares, the summarizer summarizes,
   the tools measure, the person decides.
5. **Measured beats claimed.** Where a fact can be measured, show the
   measurement, not someone's description of it.
6. **The person never does housekeeping.** Items close when the work
   resolves them. Nothing needs tidying.
7. **Presses, not forms.** Every action in the pane is one press. Anything
   that needs words goes through the chat.
8. **Every line earns its place.** If the person would not act on a line or
   need to know it, the line is not shown.

## What already exists, and how Briefing uses it

| Existing | What it does | Briefing's relation |
|---|---|---|
| The chat | Reasoning, explanation, negotiation | Stays the place for words. Briefing never asks for text in the pane. |
| Herdr's sidebar | One row per session | Briefing writes each session's line there. It does not build its own list of sessions. |
| Claude Code's `/goal` | A separate model checks a stated condition after every turn and keeps the agent going until it holds | Briefing can hand its definition of done to `/goal`, so the worker is not its own judge. |
| Claude Code's footer | Permission mode, plan mode | Briefing does not repeat modes. |
| session-inbox | Inferred inbox items, notes, PR threads | Replaced. Its parsers for `!` commands, PR threads and the Herdr line can be reused. |

## The record

The briefing is one record per session. It is kept in the session's state
and saved to disk, so it survives a resume, a compaction and a reload of the
mod.

### Destination

- **Goal**: one sentence, in the person's terms.
- **Done when**: two to five conditions a reader could check. Each is open,
  met with the evidence that met it, or failed.
- **Confirmed**: whether the person has confirmed this destination. A change
  to it clears the confirmation.
- **Blocked**: set when the agent cannot reach the goal as stated, with the
  reason. Saying so is a normal outcome, not a failure to hide.
- Author: the agent. The person confirms it with a press, or changes it by
  saying so in the chat.

### Requests: what needs the person

- **Kinds**: *decide*, a question only the person can answer, and *do*, an
  action only the person can take: sign in, check something on their device,
  reply to a teammate.
- **Fields**: the question in the agent's words, at most about 16 words;
  optional detail; options, with the recommended one marked; what it holds
  up; whether the steps it gates can be undone; and one-press helper steps,
  such as opening a file, copying text, running a command or opening a link.
- **Lifecycle**: open, then answered, done, dismissed, withdrawn by the agent,
  or proceeded on while the person was away. A request proceeded on becomes a
  choice, so the person can still change it. Closed requests move to
  history with their outcome.
- Author: the agent. The summarizer adds one only when a reply plainly stops
  for the person and the agent did not record it.

### Choices: what the agent chose for the person

- **Fields**: what was chosen, the alternatives set aside, one line of
  reason, when.
- **States**: standing, changed (the person picked an alternative), or kept
  (the person confirmed it).
- Author: the agent, whenever it makes a choice the person might reasonably
  have made differently: behavior, interface, dependencies, scope, data, or
  anything costly to undo later. Not internal implementation details.

### Evidence: measured, not claimed

- **Checks**: commands recognized as checks (tests, type checks, linters,
  builds, validators), each with its last result, its summary line, its time,
  and whether files changed after it ran.
- **Changes**: the files changed in the session, with line counts from git.
- **Running**: background tasks and dev servers, with their URLs.
- **Unbacked claims**: a reply that says "tests pass" or "fixed" when no check
  ran after the last edit.
- Author: the tools, except unbacked claims, which the summarizer flags.

### Notes

Things the agent noticed outside the task: a bug, a risk, missing tests, a
workaround it took, something it could not verify. Non-urgent. Author: the
agent.

### Status

- **State**: working, needs you, stopped, ready for review, blocked, or
  idle. *Stopped* means something outside the conversation halted the
  session: an API error, an expired sign-in, a usage limit, or a permission
  prompt nobody has answered.
- **Doing now**, while the agent works: the latest tool call in plain words,
  such as "Running the tests" or "Editing pane.tsx". Author: measured.
- **Now**, after a reply: one line on where the work stands. Author: the
  summarizer.
- **Next touchpoint**: when the agent expects to need the person next, and
  for what. Author: the summarizer, from the reply.

### Presence

When the person last showed activity in the session: typing, sending, a
press, a command. Whether they count as away, and their away setting.
Author: measured.

## Surfaces

### The line, in Herdr's sidebar

One line per session for the glance across sessions: the first thing waiting
on the person, or what the agent is doing, or that the work is ready for
review or blocked.

### The band, above the prompt

One line, always visible in the session: state, now or doing now, how many
requests wait, and a checks badge: passing, failing, or stale after edits.
After an absence, the band says what changed while the person was gone,
until they open the pane or send a prompt.

### The pane

One view, ordered by the five needs. A section shows only when it has
something.

1. **Header**: state, now, next touchpoint, and how long the agent has
   waited.
2. **Since you looked**: one line per change since the person last showed
   activity: requests added, choices made, conditions met, checks that
   changed, requests proceeded on. Shown after an absence until the person
   acts in the session.
3. **Needs you**: requests, those that block the work first. Digits answer.
4. **Chosen for you**: standing choices, newest first. A press switches to an
   alternative or keeps the choice.
5. **Destination**: the goal, its confirmation, and the done-when checklist
   with evidence.
6. **Evidence**: checks, changed files, running tasks, unbacked claims.
7. **Notes**.
8. **History**, collapsed: answered requests, changed and kept choices,
   closed notes.

Keyboard first; the mouse works too. Moving the selection, answering,
explaining, dismissing and switching a choice each take one key.

### The agent's copy

The agent receives a compact copy of the briefing:

- with each prompt, when anything changed since it last saw the briefing,
  including what was settled since;
- in full after a compaction, so nothing the person sees is lost from the
  agent's side;
- mid-turn, as a hidden note, when the person leaves or returns.

At session start the agent gets short guidance on the tool and on asking
versus choosing.

### The agent's tool

One tool, `update`, takes any of: requests to add, choices to record, the
destination, conditions met, notes, and items to close or correct. One call
at the end of a turn records everything. Choices can also be recorded the
moment they are made.

## Requirements

**P0** is the core without which Briefing has no point. **P1** makes it
excellent. **P2** is the frontier, built once the core is solid.

### Shared record

- **R1 (P0)** One saved record per session holding the destination,
  requests, choices, evidence, notes, status and presence. It survives
  resume, compaction and a reload of the mod.
- **R2 (P0)** The agent receives the briefing with each prompt when it
  changed since the agent last saw it, including what was settled since,
  and in full after a compaction.
- **R3 (P0)** The agent is told what the person has on screen: whether the
  pane is open.

### The agent's tool

- **R4 (P0)** `update` records requests (kind, question, detail, options,
  recommendation, what it holds up, whether it can be undone, helper
  steps), choices (what, alternatives, why), the destination (goal, done
  when, blocked), conditions met with evidence, and notes. It returns the
  ids it assigned.
- **R5 (P0)** The same tool closes, withdraws or corrects any request,
  choice or note by id, with an outcome. The agent can fix a wrong item
  without the person.
- **R6 (P0)** Every *decide* request carries a recommendation and a one-line
  reason, or says why the agent has none. The tool refuses one without
  either.
- **R7 (P0)** The tool refuses a request that repeats an open one, and says
  which.
- **R8 (P0)** Guidance at session start teaches the rule: ask only when the
  work cannot continue without the answer; otherwise choose, record the
  choice, and continue. Diagnostic and clarifying questions the person
  answers in their next message are never requests.

### Summarizer

- **R9 (P0)** After each reply, one fast model call writes now, the next
  touchpoint, and what got done.
- **R10 (P0)** The same call closes requests the person answered in their own
  words.
- **R11 (P1)** The same call adds a request only when the reply plainly stops
  for the person and the agent did not record it, marked as found in the
  reply.
- **R12 (P1)** The same call flags claims of success that the evidence does
  not back.

### Measured evidence and liveness

- **R13 (P0)** Detect a session stopped by something outside the
  conversation: an API error, an expired sign-in, a usage limit, a
  permission prompt waiting for an answer. Show it as the session's state,
  with the one action that unsticks it, everywhere the state shows.
- **R14 (P0)** Recognize check commands among the commands the agent runs,
  and record each result: pass or fail, the summary line, the time.
- **R15 (P0)** Track file edits, and mark a check stale when files changed
  after it ran.
- **R16 (P0)** While a turn runs, show what the agent is doing from its
  latest tool call.
- **R17 (P1)** Track background tasks and dev servers with their URLs.
- **R18 (P1)** Show where the work lives: the branch, uncommitted changes,
  unpushed commits, and changed files with line counts, from git.

### The person's actions

- **R19 (P0)** Answer a request with one press of an option. The answer goes
  to the agent as the person's message, quoting the question, and the
  request closes at once.
- **R20 (P0)** Switch a choice to an alternative, or keep it, with one press.
  The agent is told.
- **R21 (P0)** Dismiss any request, choice or note with one press. The agent
  is told.
- **R22 (P0)** Confirm the destination with one press.
- **R23 (P1)** Ask the agent to explain any item. The item stays open, and the
  request is never read as an answer.
- **R24 (P0)** Mark a *do* request done, and use its helper steps, with one
  press each.
- **R25 (P0)** Typed answers count: "1. yes 2. no" answers the latest
  numbered requests, and the summarizer closes requests answered in prose.
- **R26 (P0)** A press on an item that is already closed does nothing and
  says so. A second press of the same button sends nothing twice.

### Surfaces

- **R27 (P0)** The band: one line with state, now or doing now, the request
  count, and the checks badge.
- **R28 (P0)** The pane: one view in the order above, sections shown only
  when they have something, keyboard and mouse.
- **R29 (P1)** The line in Herdr's sidebar, updated on every change. It names
  the first request or the stop, never only a count.
- **R30 (P1)** History, collapsed by default.
- **R31 (P1)** The pane shows when the briefing last updated, and says so
  when an update is running or failed.
- **R32 (P1)** Each surface teaches itself in one line where it appears: the
  empty pane says what will show there, and the band names `/briefing`.

### Presence and return

- **R33 (P0)** Record when the person last showed activity: typing, a sent
  prompt, a press, a command.
- **R34 (P0)** After the person has been away for a set time, compute what
  changed since their last activity. Show it in the band and at the top of
  the pane until they act in the session.
- **R35 (P1)** Tell the agent when the person leaves and when they return,
  mid-turn included, so it batches questions and leans toward recorded
  choices while they are gone.

### Proceeding while the person is away

- **R36 (P1)** An away setting: off, or proceed after 15, 30 or 60 minutes.
  When it is on and the person is away, a request with a recommendation that
  gates only steps that can be undone is answered with the recommendation
  once that time passes. The mod sends the answer as its own message, not
  as the person's.
- **R37 (P1)** Requests that gate steps which cannot be undone never proceed
  on their own: pushing, deploying, sending messages, deleting data,
  spending money.
- **R38 (P1)** Each request proceeded on becomes a standing choice and
  appears in *Since you looked*.

### Review

- **R39 (P1)** When every done-when condition is met, the state becomes
  *ready for review*, and the pane leads with the conditions and their
  evidence, checks, changed files, unbacked claims, and the checks only the
  person can do.

### Frontier

- **R40 (P2)** Hand the done-when conditions to `/goal` with one press, so a
  separate model holds the agent to them.
- **R41 (P2)** The pull request for the session's branch: its review threads
  as requests, its CI checks as evidence.
- **R42 (P2)** When the person corrects the agent the same way twice, a note
  offers to save the correction as a lasting rule.
- **R43 (P2)** Off-plan work: flag edits to files unrelated to the
  destination.
- **R44 (P2)** Messages the person queued mid-turn, each shown as waiting or
  delivered, so they never re-send one.

## Non-goals

- Replacing the chat. Reasoning, explanations and disagreement stay there.
- Text entry in the pane. Words go through the prompt.
- Running commands for the person without the usual permission checks.
- A list of sessions of its own. Herdr's sidebar is that list.
- Team features. One person, one machine.

## How we will know it works

- On return, the person can say where the work stands and what it needs
  within 30 seconds, without scrolling the chat.
- In a week of use, the person calls no request pointless.
- Most requests are answered with a single press.
- The agent never says something about the briefing that contradicts it.
- Fewer stops per hour of agent work than with session-inbox, because more
  choices are recorded instead of asked.

## Open questions

- Should the summarizer add requests at all, or only report that a reply
  seems to wait on the person?
- How long counts as away?
- Does the pane need history, or does the chat cover it?
- Where should unbacked claims show?
