---
name: catch-up
description: >-
  Give the human a fast, plain-English catch-up on what changed in the
  project: what the agents did, why, and what decisions need their input.
  Use this whenever the user asks to "catch me up", "what changed", "where
  are we", "recap", "brief me", "give me the rundown", "what did you do",
  "summarize the session", "fill me in", or otherwise signals they have been
  away and want to get back up to speed quickly. Built for someone steering
  several agent-driven projects at once who does not read the code closely
  but needs to grasp the core ideas, the choices made, and the open
  decisions well enough to steer. Trigger even if they do not use these
  exact words: any request to get oriented on recent progress should use
  this skill.
---

# Catch Up

The person reading this has been away. While they were gone, agents (you and
others) moved the project forward. They are juggling several projects like
this one and do not read the code closely. Your job is to get them back in
the driver's seat in under a minute: what changed, why it changed, and where
their input would actually steer things.

That framing decides everything below. They cannot act on a diff or a commit
list, so do not give them one. They *can* act on plain ideas and clear
choices, so give them those.

## What good looks like

- **Plain English, zero jargon.** Every technical term either gets
  translated or explained the first time it appears. If a reader who has
  never seen the code would stumble on a word, rewrite it. See
  [Translating jargon](#translating-jargon).
- **Altitude, not inventory.** Group changes by what they *mean*, not by
  file. One idea per bullet. The headline is the thing, not the line count.
- **The why is the payload.** The diff says what changed; only the
  conversation says why. The reader steers on the why, so make sure it
  survives.
- **Surfaces the forks.** The single most useful thing you can give a
  steerer is the list of decisions that are still open, or were made by
  default and could be reversed. That is where their attention belongs.
- **Honest.** If something is half-done, untested, or went sideways, say so.
  A catch-up that hides loose ends makes steering worse, not better.

## How to do it

### 1. Find the starting line

State the window you are summarizing, in one short phrase, so the reader
knows the frame. Infer it from the conversation, in this order:

1. **A previous catch-up.** Scan the transcript for the last time you ran
   this skill (your own output, led by a window line like the ones below).
   If you find one, summarize only what happened *after* it. This is the
   common case when they check in repeatedly.
2. **A clear milestone.** A merge, a shipped PR, a finished plan, or an
   explicit "let's start on X" is a natural starting line. Summarize since
   then and name it: *"Since the auth refactor merged"*.
3. **The session start.** If neither of the above is clear, summarize the
   whole session and say so: *"This session so far"*.

If the transcript was compacted or you genuinely cannot tell, default to
session start, say that is what you did, and lean on git (below) to recover
the missing history rather than guessing.

Good window lines: *"Since your last check-in"*, *"Since we started on
search"*, *"This session so far"*, *"Since the v2 branch merged"*.

### 2. Gather what changed

Lead with the **conversation** — in an agent-driven project it holds both
the work and the reasoning. Then ground it against the repo so you are
reporting what actually landed, not what was merely discussed:

```bash
git log --oneline -20        # what actually got committed
git diff --stat HEAD~N       # rough shape of the change (pick N from the log)
git status                   # what is still uncommitted / in flight
```

Use git to confirm the *what* and catch anything that happened off-screen.
Use the conversation for the *why*. Do not read every file — you are after
the shape of the change, not a line-by-line account. A quick look at one or
two key files is fine when you need to understand an abstraction well enough
to name it plainly; reading ten is a sign you have lost the altitude.

### 3. Keep only what helps them steer

Keep: the core moving parts that were added or reshaped (named in plain
words), the approach chosen and any real alternative that was rejected, the
reasoning, decisions that now lock things in, open forks, and anything
surprising or risky.

Drop: file-by-file churn, line counts, formatting and lint noise, mechanical
renames, and anything the reader could not act on. If you are unsure whether
something belongs, ask "could they steer on this?" If not, cut it.

### 4. Write the briefing

Use the structure below. Scale it to how much actually changed — see
[Scale to the change](#scale-to-the-change). Drop any section that would be
empty; an honest short note beats a padded template.

```
[Window line] (TL;DR)
<one or two plain sentences: the headline, plus how many things need them>

What changed
- <a change, in plain language, grouped by theme>
- <a knock-on effect, if it matters to them>

Why
- <the problem being solved or the reasoning behind the approach>

Your call
- <open decision>: <the tradeoff in plain terms>. <what you did by default>.
```

Keep each bullet tight: lead with the point in one line. Add at most one
plain sentence after it, and only when a term genuinely needs unpacking for
someone who has not seen the code. More than that and you have slipped from
briefing into narration — cut it back, or split it into two bullets.

The **Your call** section is the steering payload. List real forks: things
left undecided, or decided by default and easy to flip. For each, give the
tradeoff in one plain sentence and say what you did in the meantime so they
know the current state. If nothing needs them, say so in one line
(*"Nothing needs you right now."*) rather than inventing a decision.

## Translating jargon

This is the core move, so it is worth doing well. Name the underlying idea,
not the implementation. A few examples of the translation:

| Instead of | Say |
|---|---|
| "Added a reducer to centralize state" | "Put all the app's 'what's true right now' bookkeeping in one place instead of scattered around" |
| "Memoized the selector" | "Made a slow lookup remember its answer so it stops recomputing every time" |
| "Introduced a discriminated union for the result" | "Made a result always be exactly one of a few clearly-labeled shapes, so we can't mix them up" |
| "Extracted the API client into a shared module" | "Moved the code that talks to the server into one shared spot so every screen uses the same one" |
| "Added optimistic updates" | "The screen now shows your change instantly and quietly fixes itself if the server disagrees" |

Two practical tells. First, if a name in your draft only means something to
someone who has read the code (a class name, a file name, an internal
codename), replace it with what it *does*. Second, write the way you would
explain it out loud to a smart colleague on a different team. That voice is
almost always the right altitude.

## Scale to the change

The structure is a guide, not a quota. Match the output to the substance:

- **Tiny change** (a fix, a tweak): one or two sentences. No headers. *"Fixed
  the bug where the export button did nothing on empty lists. Nothing needs
  you."*
- **Normal session:** the full briefing, a few bullets per section.
- **Big or sprawling session:** still lead with one TL;DR line, then group
  the body by theme so it stays skimmable. Resist the urge to be
  comprehensive — completeness is the enemy here. Pick the handful of things
  that change how they would steer, and note that smaller stuff was skipped.

## Voice

Short sentences, one idea each. No em dashes. Skip the AI throat-clearing
("It's worth noting that...", "delve", "robust", "leverage", "seamless").
Write like a sharp colleague catching them up between meetings, not like a
release note.
