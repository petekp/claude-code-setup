# Briefing: what the adversarial reviews found

Five reviewers each attacked [2-vision.md](2-vision.md) from one angle:
coherence, harmony, simplicity, ingenuity and cognitive load. Each read the
first-principles doc, the vision, the evidence from Pete's sessions, the
field research, and a reference of what the mod API can do. Their verdicts,
and the changes each one forced, are below. The requirements that survived
are in [4-requirements.md](4-requirements.md).

## Where they agreed

Each of these came from three or more reviews.

1. **Requests and choices are one concept.** Both are a decision: a question,
   its options, the option recommended or taken, and a reason. Asked, it
   waits on the person. Made, it is shown so they can change it. Two types
   with different field names, and a rule that turns one into the other,
   made the model incoherent. (Coherence C8, simplicity, harmony H14.)
2. **The agent is the only author of items.** Every wrong item session-inbox
   showed came from a second model inferring it: the bogus task, the
   shortened aside, the toggle question. A wrong item costs more than a
   missing one. The summarizer may write a narrative, never an item.
   (Coherence C3, simplicity, ingenuity move 5, harmony H8.)
3. **A cheap check at the end of each turn replaces inference.** If the reply
   asks the person something that no item records, or claims success no
   check backs, the mod blocks the stop once and tells the agent. The agent
   fixes its own record, so it stays the only author. (Coherence C3 and C6,
   harmony H8 and H17, ingenuity move 3.)
4. **Stops and waits are measured, and the Herdr line is P0.** The costliest
   finding is a session waiting on Pete that he cannot see from outside it.
   Claude Code's own events name the cause exactly. The line in Herdr's
   sidebar is where he looks first, so it cannot be P1. (Simplicity, harmony
   H5, coherence C5, ingenuity move 2.)
5. **Build on what Claude Code already has.** AskUserQuestion is the question
   dialog Pete answers 92% of the time, and Herdr already marks a session
   blocked while it is open. `/goal` and ProposeGoal already judge "done"
   with a separate model. The task list already holds the agent's plan. The
   away recap already writes a return summary, sometimes a false one.
   Briefing mirrors and enforces these instead of rebuilding them. (Harmony
   H2 to H4 and H12, coherence C14, ingenuity move 10.)
6. **Pete's own rules decide what is asked.** "Choose visibly" must never
   cover what his rules reserve for his approval: scope changes, product and
   creative calls, commits and pushes, CI and release changes, outward
   messages, deleting data, spending money. (Harmony H1, coherence C1.)
7. **No timer answers for the person.** Proceeding after a deadline trusted
   the agent's own label of what can be undone, broke Pete's approval rules,
   duplicated the engine's own idle handling, and would fire while he works
   in another session. Consent comes only from his own message or press.
   (Harmony H1, coherence C10, ingenuity, simplicity.)
8. **No presses that only tidy.** Confirm, Keep and most Done presses ask the
   person to approve what they did not check, which the research shows turns
   into habit. Choices settle on their own; tasks close when their effect is
   measured. (Simplicity, coherence C8 and C9, ingenuity, harmony H14 and
   H18.)
9. **Presence is about the person, not the session.** Pete works in up to
   eleven sessions an hour. Being in another session is not being away.
   (Coherence C12, harmony H6, ingenuity move 9.)
10. **Tell the agent only what it does not know.** Echoing its own items and
    a paraphrase of its own reply back every turn costs context and can
    mislead it. Send the person's actions and measured changes; send the
    full record after a compaction. (Harmony H7, coherence C2.)

## Each review's verdict

### Coherence

"The model does not hang together yet." Three core rules contradicted each
other or the evidence: asking versus choosing, one author per fact, and
measured beats claimed. Two mechanisms the product depends on were
undefined: how a press reaches the agent, and which state wins when several
apply. The fixes: one Decision entity; the agent as the only author; a
defined path for every press (a hidden row mid-turn, a prompt when idle,
presses within a few seconds batched); "activity" measured and given a fixed
order; done counted only from a measured check or the person; subagents kept
out of the record.

### Harmony

"Briefing does not yet fit its surroundings." It rebuilt features Pete
already uses, its main lever contradicted his approval rules, and its line
and presence model did not match how he works across many sessions. The
facts that shaped the build: Herdr's sidebar fits about 22 characters, and
Pete's config draws the line dim; in his usual layout the Claude pane is
about 89 columns, so the pane sits inline above the prompt, not docked;
think-first already uses the band during a turn; Claude Code's away recap
competes for the return moment. Its rules of harmony are adopted in
[4-requirements.md](4-requirements.md).

### Simplicity

The vision answered each problem with its own entity: 76 concepts for the
person and 45 for the agent. Four things carry the value: a line that names
what each session needs, stops measured by the harness, one kind of item,
and a short catch-up rewritten after each turn. Its yes list has 14
requirements and about 24 concepts for the person. It also named the three
ways the design could stop being a briefing: the tool becomes a form, the
pane becomes a dashboard, and since-you-looked, doing-now and history become
a log.

### Ingenuity

"The vision diagnoses the problem well and then builds a display." The mod
sits inside the engine and can prevent most of what the vision planned to
report:

- **Hold irreversible acts in the tool layer.** A push, deploy, publish or
  outward message the person did not ask for waits as an exact act with one
  press to run it. Then the agent can choose freely on everything else. It
  called this the single most important idea.
- **Recover from stops that need no person**, and let one sign-in resume
  every session it stopped.
- **Answer Explain from a fork of the agent's own context**, in the pane,
  never in the chat.
- **Deliver presses mid-turn**, so a switched choice changes course within
  seconds.
- **Read the plan from the agent's own task list.**

It judged proceeding after a deadline, the summarizer as a backstop, and a
one-press confirmation of the goal "clever but wrong".

### Cognitive load

"The record is right. The surfaces show too much of it." As specified, a
return after 90 minutes took about 65 seconds to read against a 30-second
budget. The sidebar line did not fit: Herdr's sidebar is 26 columns, and the
ten lines published that night ran 39 to 80 characters, seven of them
leading with a count. The vision's words collided with Herdr's: Herdr's `×`
means a question or approval is on screen, so a permission prompt is
"needs you", not "stopped". What it would ship, and what the build adopts:

- **Three loud states and silence otherwise:** Needs you, Stopped, Ready to
  review. Working and idle show nothing, since Herdr's icon and the
  transcript already say so.
- **A sidebar grammar of at most 22 characters:** `? <label> +N` in yellow,
  `! <cause>: <fix>` in red, empty otherwise. The agent writes each item's
  short label itself, because a model shortening it afterwards is what made
  the inbox's items stop making sense.
- **A band that names one loud thing**, then at most one problem, then the
  absence: `Away 1h 30m: Claude chose 3 things, tests broke`.
- **A pane that leads with a verdict** of at most three lines, then fixed
  blocks in a fixed order, each capped.
- **One key rule:** 1 is always Claude's pick. 2 to 9 are the alternatives;
  e, x, d, j and k do the rest.
- **About ten product terms,** one name each, the same in the agent's
  guidance. Never on screen: destination, touchpoint, request, proceeded on,
  unbacked, evidence, stale, blocked.

## Decisions this synthesis made, and why

| Question | Decision | Reason |
|---|---|---|
| Keep a per-turn summary model? | Yes, for one thing: a catch-up of at most three lines, conclusion first, covering everything since the person last sent a prompt. It never writes or closes items, and it is never sent to the agent. | A conclusion-first catch-up is what oriented Pete in one read. The task list and measurements cannot write that sentence. Measured stops override anything it says. |
| Notes? | Folded into decisions. An out-of-scope finding is a decision the agent made not to act on now, shown with "Fix it now" as the other option. | Notes stayed empty in session-inbox, and the ones worth having are things the person may want to reverse. This changes Pete's 10-03 decision that notes hold anything non-urgent; flagged for him. |
| Inferred items? | None. The end-of-turn check makes the agent record what it forgot. | This reverses Pete's 10-03 choice of "inferred, agent corrects". Every wrong item came from inference. Flagged for him. |
| Proceed while away? | Cut. A "Going away" press may come later, sending Pete's own message naming what to proceed on. | Consent must come from him. |
| Hold irreversible acts? | Yes, but after the core. | It makes choosing visibly safe, and it is self-contained. |
| Done-when conditions? | Deferred. The goal is one sentence; if `/goal` is set, its condition shows under it. | `/goal` already has a separate judge. Conditions the agent ticks itself were the worker grading its own work. |
| Doing now? | Cut from the line and band. | It changes on every tool call; Herdr's icon and the transcript already show activity. |
| History? | Not shown. Closed items leave the pane; the catch-up covers recent work. | A log of closed items rebuilds the scrollback. |
