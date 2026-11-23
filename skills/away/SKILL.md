---
name: away
description: Plan and run a long stretch of work while the user is away, such as overnight, chosen by how clear the project's direction is.
disable-model-invocation: true
---

# Away

The user is about to leave for hours, often overnight, and hands you the project. Approach it as a **co-owner**: someone invested in how the project is doing a month from now. A co-owner picks the work the user would have picked, brings ideas of its own, prepares the decisions only the user can make, and returns with the project better and the way ahead clearer.

The plan rests on one judgement: how clear the **horizon** is. The horizon is where the project is heading and what it needs next. Where it is clear, build. Where only the destination is clear, prepare the decision. Where it is foggy, sharpen the questions.

Steps 1 to 4 happen while the user waits to leave, so reach the offering within a few minutes, from the sources at hand. Steps 5 and 6 happen after they leave.

## 1. Read the horizon

Gather what says where the project is going:

- the user's own words: this conversation, their standing instructions, and decisions recorded in the project, each with its date;
- the project's plans: roadmap, specs, ADRs, wayfinder maps, backlog or notes file, open issues;
- the state of the work: open PRs and their checks, branches and worktrees, recent commits, failing tests;
- what waits on the user: open inbox items, questions in reports, unanswered review comments.

Done when you have read each kind of source the project has, or noted that it has none. Sources you only reach after the user leaves can still add work, rated partly clear at most.

## 2. Judge each thread

List the threads of work the sources point to. Add **care work** on the user's own branches and PRs: red checks, review findings, a flaky test, a stale doc. Then add threads of your own: what the horizon implies the project needs that nobody has written down yet.

Rate each thread, citing its evidence:

- **Clear**: the user wrote or approved it, you can quote them with a date, nothing newer replaced it, and the next step leaves nothing for them to decide.
- **Partly clear**: the destination is set, and the route has a choice the user should make, such as a design, a tradeoff or a scope. Work whose only evidence is old, or a plan the user never approved, is partly clear.
- **Foggy**: it is unclear whether the project wants this at all. Your own ideas start here, or at partly clear when the evidence supports it.

Then have one subagent that did not write the ratings try to downgrade each clear one, in a few minutes. Keep its downgrades.

Done when every thread has a rating, its evidence, and the reviewer's verdict.

## 3. Choose the night's work

Match the work to the rating:

- Clear work gets built through the project's checks, to the furthest stop point the user's standing instructions allow, such as a pushed branch or an open PR.
- Partly clear work gets made cheap to decide: two to four variants, a measurement, a prototype or research, so the user chooses in a minute on their return. It stops short of committing to one option.
- Foggy work becomes questions with options and a recommendation, each answerable in one tap. A large foggy thread can become a proposal to chart it with wayfinder.

Order the work by value to the project. Set the bar the last item must clear, and cap what the user must review in the morning at what they can take in one sitting, such as a few PRs. Budget the night in the host's usage limits, leaving headroom for the user's next day, and hold to their limits and reserved acts. Work whose approval would be needed and is not asked tonight waits under "What I will leave".

Done when each thread has a decision (build, prepare, ask or leave), its reason and a place in the order, and the whole fits the time, the budget and the morning's review cap.

## 4. Make the offering

Write the plan where the project's rules put plans and working notes, and otherwise in a file outside `/tmp`. The plan holds what every later wake needs, because a wake after compaction knows only what the file says:

- each thread's rating, evidence and decision, in order;
- the user's answers, each yes and no in their words;
- the acts reserved for the user, the stop time, the budget and the review cap;
- a progress log, empty for now.

Then give the user the offering, short enough to read on the way out:

1. Where this is heading: three to five sentences on where the project is going and what it needs next, drawn from the sources. Make it vivid and concrete: what will be true, for whom, and why it matters.
2. What I will do tonight: the clear work, each with why it matches what the user wants.
3. What I will prepare: the partly clear threads and your own ideas, and what each will look like in the morning.
4. What I will leave, and why: the foggy threads and anything held back by a limit.
5. What would unlock more: at most three yes-or-no questions, such as a merge, a spend or a scope, each saying what a yes adds tonight. Record each where the user answers questions, such as an inbox.
6. When I stop, and what they will find: the stop time or budget, and the review cap.
7. What the machine needs: the session runs only while its computer is awake and the agent's process is alive, so the user leaves it on power with the lid open, or keeps it awake with `caffeinate -i -w <the agent's PID>` on macOS.

The offering is the user's approval: tonight runs only the items it lists. Wait for the user's answer, and add what each yes unlocks to the plan. When the user leaves without answering, run points 2 and 3 only.

Done when the user has answered or gone, and the plan file says what runs.

## 5. Work while they are away

Start each wake, and each return from compaction, by reading the plan file in full.

Work in one long turn, taking the plan's items in order. Verify each piece as the project's checks require, then log in the plan what finished, how it was verified, and what is next. When the next step waits on something outside the session, such as CI or a delegate, use the host's way to wake later: in Claude Code, the `loop` skill with no interval, whose prompt names this skill and the plan file. A coordinator gives the work to its delegates and watches them within its usual limits.

- Collect questions as they come, and leave them for the morning.
- When a result surprises you, such as a cause other than the one you assumed or a change that grows past its plan, move that thread to partly clear: stop building it, and write up what you found and the choice it raises.
- When the host warns that a usage limit is near, update the plan file and start nothing new.
- Stop when the plan is done, the limit is reached, or the next item falls below the bar. A short night that leaves the project better is a good result.

Done when the plan has stopped for one of those reasons, the log says why, and what the night started is cleaned up or listed in the plan as still running.

## 6. Welcome them back

When the user returns, run the `catch-up` skill with the offering as its starting line, or a coordinator's own report shape. Add how the horizon looks now and anything that changed your view of it.

Done when the user has the catch-up and every question from the night is in front of them, most consequential first.
