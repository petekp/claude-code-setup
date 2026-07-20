---
name: pr-self-review
description: >-
  Leave short, casual first-person notes on your own pull request that head off
  the questions a reviewer is likely to ask about specific changes — the
  self-review pass good engineers do before requesting review. Use this whenever
  the user wants to annotate, comment on, or leave notes on their PR / changes /
  diff for a reviewer, pre-empt or anticipate reviewer questions, explain why a
  change was made, or "self-review" before sending a PR out — even if they don't
  say the word "skill" or name a specific PR. Posts the notes as inline review
  comments on the exact lines, in the user's voice, after showing the drafts for
  approval.
---

# PR self-review notes

The goal is simple: read your own diff the way the reviewer will, and leave a
quick note anywhere they'd stop and think *"wait, why did they do that?"* — so
they get the answer inline instead of having to ask, guess, or bounce the PR
back. A reviewer with your context moves faster and trusts the change more.

These notes are casual asides in the author's voice, not documentation. Think of
leaning over and saying one sentence to a teammate looking at your screen.

## 1. Find the PR

Default to the PR for the current branch:

```bash
gh pr view --json number,title,headRefName,url
```

If the user named a PR (a number or URL), use that instead. If there's no PR for
the current branch and none was named, say so and stop — there's nothing to
annotate yet.

## 2. Read the diff and pick the spots worth a note

```bash
gh pr diff <number>
```

Read the whole diff, then be **selective**. The reviewer-would-ask test: would a
competent teammate seeing this line pause and want an explanation? If the change
speaks for itself, leave it alone. A note on every hunk is noise — it trains the
reviewer to skim past your notes, which defeats the point. Usually a good
self-review is a handful of notes, not one per file.

**The sharpest filter: these notes carry *review-time* why, not *durable* why.**
Review-time why is "I did it this way instead of the alternative you're about to
suggest" — it matters to *this reviewer* on *this PR* and nobody a year from now.
That belongs on the PR. Durable why — the reason a line is the way it is that a
future editor with no memory of the PR still needs (a workaround for a library
bug, a non-obvious ordering constraint) — belongs in a **code comment**, not a
PR note. So before writing a note, check the diff: if the spot already has a
comment explaining it, the point is covered — skip it. Don't duplicate a code
comment as a PR note, and don't leave a note where a permanent comment is what
the code actually needs.

Spots that usually earn a note:

- **A choice that looks odd until you know why** — a workaround, an unusual
  pattern, doing it the "wrong" way for a real reason.
- **A deletion that looks like lost functionality** — reassure them it's dead
  code / moved / replaced, not an accident.
- **Something that looks inconsistent** with the surrounding code, but isn't.
- **A deliberate boundary** — "not handling X here, on purpose" — so they don't
  flag the gap as an oversight.
- **A decision you already know someone will second-guess** — get ahead of it.

Skip: renames, formatting, obvious one-liners, anything the code or the PR
description already makes clear.

## 3. Write the notes in the author's voice

Match how the author actually talks. If you don't have a strong read on their
voice, keep it plain and human. The defaults:

- **First person, casual.** Contractions, lowercase starts, the tone of a Slack
  aside. "kept this local so nothing else moves" — not "This was intentionally
  scoped locally to minimize blast radius."
- **One or two sentences.** If a note needs a paragraph, the code or the PR
  description probably needs the fix instead.
- **Explain the *why*, not the *what*.** The reviewer can read what the code
  does. Tell them the reason they can't see.
- **No jargon, no invented terms.** If a normal person wouldn't say it out loud,
  cut it. Avoid "by design", "invariant", "blast radius", "provenance" — say the
  plain-English version.
- **Answer the actual question.** The note should land as a reply to the "wait,
  why?" the reviewer just thought.
- **Backtick code references.** Wrap anything that's literally code in backticks:
  variable and function names, file paths, string values like `'all'`, types.
  GitHub renders it as inline code, so `drilldownRows` stands out from the prose
  instead of blending in. Leave plain-English feature names alone ("the comms
  log," "the scorecard") when they aren't a specific identifier.

### Don't let it read as AI-written

A self-review note works only because it reads as the author's own quick aside.
The instant a reviewer thinks "a bot wrote this," the note stops earning trust
and starts spending it — the opposite of the point. So cut the tells of
machine-written text ([Wikipedia keeps a running
list](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)). Almost none
of these show up when a real person dashes off a note, which is exactly why they
give the game away. The ones that creep into short notes:

- **Inflated words** — "crucial," "essential," "robust," "seamless," "leverage,"
  "utilize," "ensure," "facilitate," "comprehensive." Use the plain verb: uses,
  so, makes sure.
- **Throat-clearing** — "it's worth noting," "importantly," "notably," "of
  note." Just say the thing.
- **Balanced-clause flourishes** — "not just X, but Y," or three adjectives in a
  row ("clean, fast, and correct"). Nobody phrases a quick aside that carefully.
- **Connective filler** — "moreover," "furthermore," "additionally," "thus,"
  "hence." A one-liner has nothing to connect.
- **The em-dash aside.** Skip em-dashes in the notes; they're one of the
  strongest tells. Break the "statement, then reassuring clause" shape into a
  period, a comma, or a fragment instead.
- **Padding** — "essentially," "basically," "in order to," "due to the fact
  that." Cut it.

Matching the author's real voice already rules most of this out — people don't
write like this. If a line sounds like docs or a changelog, rewrite it until it
sounds like the author typing fast to a colleague.

### Examples

These show the shape and voice: a real question answered in one casual line.
Code references sit in backticks so they read as code, not prose.

**Example 1** — a deletion that looks like lost work
Change: the old counts-only leads funnel is removed
Note: "scorecard replaces this whole funnel now. left deals and appraisals alone."

**Example 2** — an unusual pattern with a real reason
Change: arcs are plain `<a>` tags instead of the router's `Link`
Note: "plain `<a>` because `Link` breaks inside an svg. not a style slip."

**Example 3** — a deliberate scope choice
Change: a local wrapper instead of editing the shared helper
Note: "kept this local instead of editing the shared helper, so nothing else shifts. easy to pull up later if we want it everywhere."

**Example 4** — getting ahead of a second-guess
Change: widening the list scope to `'all'` on a drill-down
Note: "widening to `'all'` on purpose. otherwise a converted lead the ring counted drops out of the list and the counts stop matching."

**Example 5** — a boundary, so it's not read as a gap
Change: an empty AI column that's always zero for now
Note: "stays 0 until the backend sends who finished the task. one line to wire up when it does."

## 4. Show the drafts and get the OK

Never post straight to the PR — these are public and teammates get notified, so
the author gets a look first. Present the drafts as a simple list they can scan
and edit:

```
src/features/home/use-home-runtime-data.ts:234
  "scorecard replaces this whole funnel now. left deals and appraisals alone."

src/features/home/leads-pipeline/home-lead-ring.tsx:174
  "plain <a> because Link breaks inside an svg. not a style slip."
```

Let them cut, reword, or add. Then post what they approved.

## 5. Post as one inline review

Post everything as a **single review** so the team gets one notification, not one
per note. Write the payload to a scratch file and send it with the reviews API
(`gh` fills in `{owner}`/`{repo}` from the current repo):

```jsonc
// review.json
{
  "event": "COMMENT",
  "comments": [
    {
      "path": "src/features/home/use-home-runtime-data.ts",
      "line": 234,
      "side": "RIGHT",
      "body": "scorecard replaces this whole funnel now. left deals and appraisals alone."
    }
  ]
}
```

```bash
gh api --method POST "repos/{owner}/{repo}/pulls/<number>/reviews" --input review.json
```

Send bodies from the file, never inline with `-f body="..."`. A note with
backticks in it (which most now have) would make the shell run whatever's inside
the backticks; from a JSON file the text goes through untouched.

`event: COMMENT` submits the notes as plain comments (this works on your own PR —
it's not an approval). Line numbers work like this:

- `side: RIGHT` + `line` = the line number **in the new version of the file**
  (what you see in the file at the branch head). Use this for anything added or
  changed — it's the common case.
- `side: LEFT` + `line` = the line number in the **old** file. Use it only when
  the note is about a removed line that no longer exists on the right.

The line must be one that actually appears in the diff, or the API rejects the
comment. If you're unsure of a number, read the file at the branch head and
count to the exact line rather than eyeballing the hunk header.

## 6. Confirm

Report back plainly: how many notes posted and the review/PR URL. If any comment
was rejected (usually a line that wasn't in the diff), say which one and either
retarget it to a nearby changed line or drop it — don't silently lose it.

## Edge cases

- **A point spans several files or is more general** than one line — post it as a
  short top-level comment instead of forcing it onto a single line:
  `gh pr comment <number> --body "..."`.
- **Nothing worth flagging** — say so. A clean, self-explanatory diff doesn't
  need notes, and inventing them just to have some is worse than none.
- **Re-running on a PR you've already annotated** — check existing review
  comments first (`gh api "repos/{owner}/{repo}/pulls/<number>/comments"`) so you
  don't repeat yourself; only add notes for spots you haven't covered.
- **Reworking a note you already posted** — edit it in place instead of posting a
  duplicate. Grab the id from the comments list, then PATCH it:
  `gh api --method PATCH "repos/{owner}/{repo}/pulls/comments/<comment_id>" --input body.json`,
  where `body.json` is `{"body": "..."}`. Same file-input trick keeps backticks safe.
