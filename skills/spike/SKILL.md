---
name: spike
description: >
  Run a spike — a timeboxed, deliberately disposable experiment whose only job is to answer the
  unknowns in a task before anyone commits to a real implementation. Use whenever the user says
  "spike", "spike this", "let's spike it", "throwaway", "proof of concept", "POC", "quick and
  dirty", "just to see if it works", "prototype it", "tracer bullet", or "hack something
  together". Also use — even without those words — when the user is weighing whether an approach
  is viable, asks "would this even work", "can we do X with Y", "how hard would this be", "is
  this fast enough", "how many places does this touch", or is about to start a large effort whose
  shape depends on a fact nobody has checked yet. Prefer this over building the real thing when
  the honest answer to "do we know this will work?" is no.
---

# Spike

A spike is not a small implementation. It is an **experiment that buys information**, and the code
is the apparatus, not the product. The value ships in the findings; the code gets deleted.

Holding that distinction is the whole skill. The failure mode is not writing bad spike code — bad
spike code is correct. The failure mode is drifting: starting with a question, getting something
working, and quietly sliding into building the feature. That produces shortcut-quality code that
nobody dares delete and nobody wants to own.

## The contract

1. **A spike answers questions.** If you cannot state what you'd learn, it isn't a spike.
2. **The code is disposable and is actually disposed of.** Torn down when the findings are written.
3. **Nothing from the spike is promoted.** The real implementation is written fresh, informed by
   what was learned. Copying spike code forward smuggles the shortcuts into production.
4. **A null result is a result.** "This approach can't work because X" is a successful spike, often
   the most valuable kind. Never twist a spike toward a positive answer.

## Step 1 — Name the unknowns before writing anything

Turn the vague ask ("let's spike the new sync layer") into a short numbered list of questions that
could come back **no**. Then state them and start. Don't wait for approval — but do state them,
because if you picked the wrong questions the user can redirect you in one sentence, and that's far
cheaper than finding out at the end.

A real spike question is falsifiable and decision-changing. Apply both tests:

- **Falsifiable** — there's an observation that would settle it. "Is the architecture good?" fails.
  "Does the batch endpoint return partial failures per-item or fail the whole batch?" passes.
- **Decision-changing** — write down what you'd do differently for each answer. If both answers
  lead to the same plan, drop the question; you're about to spend effort on something you already
  know how to handle.

Common shapes worth reaching for:

| Kind | The question | What the apparatus looks like |
|---|---|---|
| Feasibility | Can this library/API/runtime actually do the thing? | Smallest call that either works or errors |
| Integration | Do these two systems agree on shape, timing, auth, ordering? | Wire them together end to end, nothing else |
| Performance | Is it fast/small enough at realistic N? | Crude benchmark with realistic data volume |
| Blast radius | How many call sites / files / migrations does this touch? | Search + a mechanical change to a couple, then count |
| Ergonomics | Does this API feel right to call from where it'll be called? | Write the *call sites* first, stub the implementation |

Also decide, up front, the **kill criterion**: what result would make you abandon this approach
entirely? Naming it in advance is what stops the spike from rationalizing its way to yes.

Finally, pick a **budget** and say it out loud — a rough scope like "three small experiments" or a
wall-clock box. A spike without a budget becomes an implementation.

## Step 2 — Pick a venue per spike

Where the code lives is a function of what the question needs. Choose the cheapest venue that can
actually answer it:

- **Session scratchpad (outside the repo)** — for self-contained questions: library behavior,
  algorithm shape, data format, API response shapes. Nothing can leak into a commit. Default here.
- **Untracked `spikes/<topic>/` inside the repo** — when the question needs the project's real
  imports, types, config, or test runner. Confirm it's gitignored before writing; if it isn't, add
  it to `.git/info/exclude` (local-only, doesn't dirty the repo's `.gitignore`).
- **A `spike/<topic>` branch or worktree** — when the question requires modifying existing code in
  place: blast-radius counts, migration mechanics, "what breaks if I change this signature". A
  worktree is better than a branch here, because it leaves the user's working tree untouched.

Whichever venue, say where you put it. The user should never have to hunt for spike leftovers.

## Step 3 — Write deliberately cheap code

Spike code should be visibly, unmistakably a spike. This is not laziness — it's a signal to every
future reader (including you, tomorrow) that this was never reviewed and must not be trusted.

Skip on purpose: error handling, edge cases, abstraction, naming discipline, types beyond what the
compiler forces, cleanup, and config. Hardcode credentials-free values, inline everything, print
freely. If you catch yourself extracting a helper "since we'll need it later" — stop. Later is a
different codebase.

The one thing worth doing carefully is **the measurement**. A spike that "seems to work" has
answered nothing. Print the actual response, assert the actual count, time the actual run. The
strongest form is a single throwaway test that fails if the answer is no — it makes the result
reproducible and impossible to fudge.

Two live tripwires:

- **Scope drift** — you're handling a case that no question asked about. Stop, note it in findings
  as a known unknown, move on.
- **Question drift** — you're deep in something interesting that answers none of the listed
  questions. Either promote it to a real question (say so) or drop it.

Mocking is fine and often correct — but never mock the thing under test. A spike on "does the
payment provider handle partial refunds" that mocks the provider has proven nothing.

## Step 4 — Report findings, then tear down

Report findings first, delete second, so the evidence exists before the apparatus is gone. Then
actually delete: remove the scratch files, drop the branch or worktree, confirm the repo is clean.
Leftover spike directories are how disposable code becomes permanent by accident.

Use this structure — brevity is the point, a spike report that reads like a design doc has lost
the plot:

```markdown
# Spike: <topic>

**Question(s) asked:** <the numbered list from step 1>
**Verdict:** <viable / viable with caveats / not viable> — one sentence.

## What we learned
For each question: the answer, and the evidence that settles it — actual output, timings,
counts, error text. Not "it worked", but what specifically happened.

## What surprised us
Things that were assumed and turned out false. Usually the highest-value section.

## Still unknown
Questions that didn't get answered, and why they weren't cheap to answer. These become the
next spike or a known risk on the real implementation.

## Recommended approach
The shape the real implementation should take, in a few bullets — informed by the above, and
written so someone could start from it without reading the spike code.

## Cost signals
Rough size of the real thing: files touched, migrations needed, new dependencies, hard parts.
```

Write it to a durable location the user will find — the repo docs area if the project has one, the
scratchpad otherwise — and say where it is.

## Boundaries

**Don't build the real thing in this skill.** When the user says "great, let's do it", that's a new
piece of work: fresh code, real error handling, real tests, informed by the findings doc. If they
ask to just clean up the spike instead, say plainly that rewriting is usually faster than
laundering shortcut code, then follow their call — it's theirs to make.

**Don't spike what's already known.** If the answer is in the codebase, the docs, or one search,
go find it. A spike is for questions the environment can't answer by reading.

**Don't spike to avoid deciding.** If the real blocker is a product or taste call rather than a
technical fact, no experiment will resolve it. Put the decision to the user instead.
