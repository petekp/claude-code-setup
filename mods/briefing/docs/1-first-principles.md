# The shared state of the work

Thinking from first principles about what belongs in a pane beside an AI
coding agent's chat. Written by Claude on 2026-10-03, from the session-inbox
experiment, our sessions, and what the field has learned. The product vision
that follows from it is [2-vision.md](2-vision.md).

## Conclusions first

- A chat is a log of what was said. Working together also needs a record of
  what is true now. The pane should hold that record: the shared state of the
  work.
- The person needs five things from it, in this order:
  1. What needs them, and what each thing holds up. That includes a session
     stopped by something outside the conversation, such as an expired
     sign-in, which today nothing reports.
  2. What changed since they last looked.
  3. Where the work is going, and how far along it is.
  4. What the agent chose on their behalf.
  5. What is verified, as opposed to only claimed.
- The agent should read the same state every turn. Shared state grounds both
  sides only if both read it.
- The largest lever is fewer questions, not better ones. When a choice can be
  undone, the agent should make it, show it, and let the person change it in
  one press. The agent keeps moving, and the person keeps control.
- Each fact should have one author. The agent declares what it needs and what
  it chose. A second model summarizes where things stand. The tools measure
  what ran and what passed. The person decides.

## What chat does badly

Chat is the right medium for reasoning together. It is the wrong medium for
knowing where things stand. Each limit below has a specific cost.

1. **It records events, not state.** A decision in message 12 may be reversed
   in message 40. A task may be finished by a command nobody mentioned. To
   know what is true now, the person replays the log in their head. People do
   this badly after a break, and the agent loses it when its context is
   compacted.
2. **Position is the only emphasis.** The newest text sits at the bottom,
   whatever its importance. A question that blocks the work appears wherever
   the agent happened to write it, often at the end of a long reply. The next
   reply buries it.
3. **One channel carries everything.** Progress, findings, questions,
   warnings, evidence and plans arrive in the same prose. The person sorts
   each sentence while reading, and skimming misses things.
4. **Turns tie the person's attention to the agent's clock.** The agent stops
   when it needs input, and the work waits until the person returns. Either
   the agent idles or the person watches.
5. **The agent writes faster than anyone can check.** It produces a thousand
   words in seconds. The person reads a few hundred a minute and verifies far
   slower. So they either approve without reading or become the bottleneck.
6. **Choices are made silently.** A task involves dozens of small decisions:
   names, structure, what to skip, which library. The reply mentions some of
   them, inconsistently. The person finds the rest when something surprises
   them.
7. **Claims carry no evidence.** "The tests pass" and "this should work" look
   the same on screen. Trust becomes all or nothing instead of matching the
   evidence.
8. **The destination is never shown back.** The goal lives in the first
   message and in the person's head, and it shifts. The agent's understanding
   of it is visible only when someone asks. A divergence is found late, when
   it is expensive.
9. **Both sides forget.** The model's context is compacted or reset. The
   person sleeps and switches between sessions. The log is the only memory,
   and it is too long to reread.
10. **Each session is an island.** Someone running six sessions has to visit
    each one to learn which needs them.
11. **Free text is a poor answer format.** "1. yes 2. Python 3. skip" has to
    be parsed and matched to questions. A prose answer can leave a question
    unanswered without anyone noticing.
12. **The agent cannot see what asking costs.** It does not know whether the
    person is at their desk, deep in other work, or asleep. So it asks at the
    wrong times, about the wrong things.

## What chat does well

Chat should stay the place for reasoning through a problem, negotiating
scope, explaining, disagreeing, and open-ended exploration. A pane that tries
to replace conversation becomes a form. The division is: chat for reasoning,
the pane for state.

## The moments the person needs it

Each moment has its own time budget.

| Moment | Time | The person's question | What answers it |
|---|---|---|---|
| Glance | 2 seconds | Does this session need me? | One line: its state and the one thing it needs. |
| Return | 30 seconds | Where were we, and what happened? | What changed since they looked, what was chosen for them, what waits on them. |
| Answer | Seconds per item | What do you need? | Each request with its options, the recommendation, and what it holds up. One press answers. |
| Steer | Anytime | Is it heading the right way? | The destination as the agent understands it, and the choices so far. |
| Accept | Minutes | Is it really done? | What changed, what was checked and how, what only the person can check. |
| Across sessions | 5 seconds | Which session should I attend to? | Every session's state, sorted by who waits on whom. |

Return matters most. Pete said so when asked, and it follows from how he
works: many sessions and frequent breaks. It is also where chat is weakest,
because the answer is spread across everything said while he was gone.

## What I would want, as the agent

I am the other party in these sessions, so here is my side.

What I would want to show the person:

- **My understanding of the destination**, in one sentence plus a short
  definition of done, so they can correct it before I spend an hour on the
  wrong thing. Building the wrong thing is the most expensive mistake I make.
- **What I need, ranked by what it holds up.** Only the questions whose answer
  changes my next step.
- **The choices I made without asking**, each one changeable. This is what lets
  me keep working while they are away, without taking control from them.
- **What I verified, and how**, and what I could not verify, such as how
  something looks on their phone.
- **What I noticed outside the task**, somewhere it does not derail the reply.
- **When I will next need them**, so they can plan their attention.

What I would want from the person:

- The destination in their words, and what done means to them.
- Their taste on the choices that are matters of taste.
- Fast answers on the few things that truly block me, and freedom on the rest.
- The checks only they can do: their device, their eyes, their accounts.
- Corrections early, while they are cheap.

What I would want from the pane:

- **To read the same state the person sees, every turn.** In this project I
  told Pete to dismiss an inbox task that did not exist. I was working from my
  memory of the conversation instead of the inbox he was looking at.
- **To know what the person can see.** I told Pete to open a pane he already
  had open.
- **To write my own commitments.** In this project a second model turned my
  curious aside into an inbox item, then shortened it until it no longer made
  sense. I knew the question blocked nothing. The summarizer could not.
- **To correct what I wrote.** When an item was wrong, I had no way to close
  it, so Pete had to.
- **Not to fill in forms every turn.** If recording state costs more than it
  saves, I will do it badly. A durable commitment deserves a tool call. A
  summary of where things stand does not.

## What our sessions showed

A scripted pass covered 45 days of transcripts: 3,740 typed messages in 221
sessions. On a typical day Pete typed into six or seven sessions, and into up
to eleven within one hour. The agent's reply before each of his messages ran
a median of about 1,700 characters. His own median message is 13 words. The
counts are rough. Ranked by what they cost him:

1. **A session waits on him, and he learns it only by visiting it.** The wait
   is often outside the conversation: an expired sign-in, an API error, a
   usage limit, a permission prompt. 44% of Claude Code's own "while you were
   away" recaps ended with the next step on him. The night this was written,
   an expired sign-in stopped approved work for 40 minutes, while a recap
   described the work as under way.
2. **"Done" that he cannot see.** A stale build, a second running instance, a
   pane that did not reload. 52 messages in 27 sessions say some form of
   "I'm still seeing the old behavior."
3. **The agent's picture of the state is wrong.** It presents a settled
   constraint as news, or calls an item open after it closed. Each catch
   lowers his trust in every other claim.
4. **Every return starts with re-orientation.** About 85 "remind me" and
   "where are we" messages in 49 sessions, plus a catch-up command run 21
   times, once in four sessions within three minutes.
5. **Replies too long to act on.** A command that rewrites the last reply in
   plain words ran 33 times. The replies it rewrote had a median of 2,900
   characters.
6. **Batches of decisions he cannot answer in one pass.** Of 108 numbered
   replies, 53 asked something back, such as "3. what is this?" In one
   ledger, 13 of 14 open decisions had no recommendation. He asked "what
   would you recommend" 43 times.
7. **The agent decides or builds more than asked.** 35 pushbacks of the
   "is there a simpler way" kind. Product and creative calls made alone are
   what he most wants to weigh in on.
8. **Chores pushed back to him.** Run this, edit that file, restart those
   sessions. Some are real limits; some are habit.
9. **Context lost between sessions, agents and compactions.** 399
   compactions in 82 sessions. He ends up carrying the thread between
   Claude and Codex, branches and sessions.
10. **Adding to a running turn means interrupting it.** 406 messages were
    queued mid-turn, and 149 were re-sent within five minutes.
11. **Trust follows evidence.** About 100 messages ask the agent to prove or
    verify something. When a recommendation comes with its reason, he
    delegates.

What helped: one-press answers, which settled four product decisions in
seven minutes; an Explain press that revived a 32-hour-old decision; a
catch-up that led with its conclusion; lists that live outside the chat;
recommendations with reasons; and things he could see.

What he rejected in the inbox: a manual refresh button, tasks for things
already on screen, items inline in the chat, items made from diagnostic
questions, a Reply button, and sorting sessions in Herdr. The inbox's own
failures taught one lesson: a bogus task, a false claim about an item, one
question asked twice and answered twice, an Explain press read as an answer,
a stale button that re-answered a finished item. A wrong item costs more
than a missing one, because it makes him check every item.

## What the field has learned

A survey of products and studies from 2024 to 2026 is in
[research-field.md](research-field.md), with its sources. What bears on
this design:

- **Approval at the wrong grain turns into habit.** People approve 93% of
  Claude Code permission prompts, and Anthropic's own docs say that after
  the tenth approval "you're clicking through rather than reviewing."
- **Plans are approved for fluency.** In a CHI 2025 study, people trusted
  plausible but wrong plans, and their edits made good plans worse. A plan
  needs its load-bearing assumptions marked. A list of choices the agent
  made does exactly that.
- **"Done" needs a judge other than the worker.** Agents declare victory
  early. On impossible test tasks, one model cheated its way to a pass in
  more than half the cases, and an explicit way to give up cut that
  sharply. A respectable "blocked" outcome removes the reason to fake
  completion.
- **Evidence beats assertion.** People verify less when verification is
  costly, so cheap evidence reduces blind trust. Codex cites terminal logs.
  Google's Antigravity produces screenshots and recordings.
- **Asking pays when it is structured.** On underspecified tasks, letting the
  agent ask improved results by up to 74%. Claude already stops to ask more
  than twice as often as people interrupt it.
- **Interruptions work best negotiated.** People did best when they chose
  when to attend. Notifications held until a natural break caused less
  frustration than immediate ones.
- **Compaction loses the trail of files first.** Summaries forget which files
  were created, changed or read before they forget anything else.
- **Goal drift grows with context.** Restating the goal counters it. Manus
  keeps rewriting a todo file for that reason.
- **Claude Code already ships parts of this.** Its agent view lists sessions
  that need input first, with the question. `/goal` has a separate model
  check a stated condition after each turn. Hooks fire before and after
  compaction. A pane should use these, not rebuild them.
- **The biggest gap:** no product reviewed tells the person when the agent
  will next need them, or for what.

## Theory that applies

- **Grounding.** Herbert Clark describes conversation as building common
  ground: facts each party knows the other knows. People ground with evidence
  of understanding, such as a nod or a restatement, and spend the least joint
  effort that is enough for the purpose. A chat with an agent has weak
  grounding. The person cannot see what the agent understood, and the agent
  cannot see what the person read. The pane can make both visible: the
  agent's understanding of the goal and its choices on one side, and what the
  person has seen and decided on the other.
- **Situation awareness.** Mica Endsley's three levels are perceiving what is
  happening, understanding what it means for the goal, and projecting what
  happens next. Activity feeds stop at the first level. The pane has to reach
  the third: what the work waits on, and when the person will next be needed.
- **Mixed initiative.** Eric Horvitz's principles for interfaces that share
  initiative say to weigh the expected value of acting against asking, to
  consider the cost of interrupting, and to make the agent's actions easy to
  inspect and undo. That is the case for choosing visibly instead of asking.
- **Interruption and resumption.** Interrupting at a natural break costs less
  than interrupting mid-task, and resuming after an interruption takes time
  spent rebuilding context. So asks should arrive in batches at the agent's
  breaks, and a return briefing should do the rebuilding for the person.
- **Trust calibration.** John Lee and Katrina See found that people trust
  automation appropriately when its reliability is observable. A pane that
  separates measured results from claims makes reliability observable.
- **Ironies of automation.** Lisanne Bainbridge showed that the more a system
  does on its own, the more its operator's job becomes monitoring, which
  people do badly, and the less context they have when they must step in. So
  the pane should not ask to be watched. It should let the person recover the
  situation quickly when they choose to look.

## Ideas at the frontier

These have little or no good product form yet.

1. **The briefing as a shared contract.** One small record of the work that both
   parties read and both can change: the goal, what done means, what is
   decided, what is open. The person changes it by talking or pressing; the
   agent changes it with tools. Chat becomes the conversation about the
   briefing, not the only record of it.
2. **Choose visibly instead of asking.** When a choice can be undone and the
   agent has a reasonable default, it chooses, records the choice and its
   alternatives, and continues. The person sees "Chose Node over Python" and
   can switch it in one press. A question becomes a decision with a default,
   which turns most interruptions into notifications.
3. **Proceed after a deadline.** Some organizations run on lazy consensus:
   silence by a deadline means yes. A person leaving for the night could let
   the agent take its own recommendation on reversible questions after a
   waiting period, so work continues while they sleep. Irreversible actions
   would always wait.
4. **Measured evidence.** Every claim of done should show its proof. Much of
   that proof can be measured instead of claimed: the last test run, its
   result, and whether files changed after it. "Checks pass, run after the
   last edit" is a fact the pane can compute without trusting anyone's prose.
5. **Asking that knows the person's attention.** If the agent knows the
   person is away, it should batch its questions for their return and lean
   toward choosing visibly. If they are at the desk, a quick question is
   cheap.
6. **What changed, computed from state.** What changed since the person last
   looked can be computed exactly from the record: new requests, new
   choices, items finished, checks that changed. No one needs to write it,
   and its length follows the length of the absence.
7. **A definition of done, shown back.** The agent writes what done means as
   two to four checkable conditions and ticks them off with evidence. The
   person corrects the list early. This is the cheapest way to catch a
   misunderstood goal.
8. **Triage across sessions.** One view of every session, sorted by what waits
   on the person and for how long, with a press that jumps to that session.
9. **A review guide.** When work is ready for review, show what changed, where
   the risk is, what was verified, and what only the person can check, so
   their review effort goes where it matters.
10. **Learning from corrections.** When the person corrects the agent the same
    way twice, offer to save the correction as a lasting rule.
11. **The next touchpoint.** Show when the agent expects to need the person
    next, such as "visual check after the build, about 10 minutes", so they
    can plan their attention.

## The shape that falls out

**One shared record, four authors.** Each fact has one author, and each
author does what it is good at:

| Author | Writes | Why this author |
|---|---|---|
| The agent, through tools | What it needs from the person, the choices it made, notes, the definition of done | Only the agent knows whether a question blocks it, and it keeps its own wording. |
| A summarizer model, after each turn | Where the work stands, what got done, a backstop for requests the agent forgot to record | Summaries are cheap to get slightly wrong, and the agent should not spend effort writing them. |
| The tools themselves | Edits, commands, test and build results, running servers, time | Measured facts need no trust. |
| The person | Answers, changed choices, dismissals, the goal when they restate it | Decisions are theirs. |

**Three surfaces, one per moment:**

- **The line**, in the multiplexer's sidebar: one line per session, for the
  glance across sessions.
- **The band** above the prompt: the session's state in one line, for the
  glance while working in it.
- **The pane**: the full briefing, ordered by the five needs, for returning,
  answering and accepting.

**The agent's copy.** The same record, compact, reaches the agent with each
prompt when it changes, so both parties read the same facts.

## Tensions to settle in the vision

- **Declared or inferred.** Declared requests are accurate but depend on the
  agent remembering to record them. Inferred ones need no effort but can be
  wrong, as the bad toggle item was. The shape above makes declaration
  primary and inference a backstop. Is a backstop worth a second source of
  items?
- **Recall or noise.** Every item costs attention. Missing a real request is
  bad; inventing one is also bad. Where is the line?
- **Autonomy or control.** Proceeding after a deadline buys speed and risks
  surprise. Which choices qualify, and how does the person opt in?
- **How much structure.** A definition of done, choices, requests, evidence,
  notes, the plan, running servers, pull requests: each is useful, and
  together they are too much. Which survive?
- **Session or workspace.** Pull request reviews and other sessions matter to
  the person but are not this session's work. Do they belong in this pane?
