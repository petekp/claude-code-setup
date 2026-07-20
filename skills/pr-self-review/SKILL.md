---
name: pr-self-review
description: >-
  Draft short, plainspoken notes in the author's voice that help reviewers
  understand non-obvious choices, boundaries, and preserved behavior in the
  author's own pull request or local diff. Use when the user asks to
  self-review, annotate, or add reviewer context to their PR or changes. Draft
  locally when no PR exists, and post approved notes as one GitHub review when
  a PR does exist. Do not use for reviewing someone else's PR, writing code
  comments, explaining code generally, or drafting a PR description. Never
  post without explicit approval.
---

# PR self-review notes

Read the diff as a reviewer and answer the few questions the code cannot answer
for itself. Zero notes is a good result when the change is already clear. Most
PRs need zero to three; larger or unusually subtle changes may need more.

These are quick asides to a teammate, not documentation or a defense of the
change.

## 1. Establish the target and authorship

Default to the PR for the current branch. If the user names a PR number or URL,
use that target and its repository for every command.

```bash
gh pr view \
  --json number,title,body,author,headRefName,headRefOid,state,url
gh api user --jq .login
```

Add the PR number or URL after `view` when the user names a target. Pass
`--repo <owner/repo>` when a numbered target belongs to a repository other than
the current one. A full PR URL can be used directly.

Record the PR URL, `owner/repo`, number, author, and `headRefOid`. Only write
self-review notes when the signed-in account is the PR author and the PR is
open. If the identities differ, stop rather than speaking as someone else.

If no PR exists, continue in draft-only mode. Read the local branch diff against
its intended base plus any staged and unstaged changes. Ask for the base only if
it cannot be discovered safely. Explain that the notes cannot be posted until a
PR exists.

## 2. Gather the context before choosing notes

Read, in this order:

1. The user's stated intent, PR title and body, and any linked issue.
2. Existing PR discussion and review comments.
3. The whole diff, then the nearby code and tests for any candidate note.
4. Relevant history when the reason still is not clear.

```bash
gh pr diff <target> --repo <owner/repo>
gh api --paginate "repos/<owner>/<repo>/pulls/<number>/comments?per_page=100"
gh api --paginate "repos/<owner>/<repo>/pulls/<number>/reviews?per_page=100"
gh api --paginate "repos/<owner>/<repo>/issues/<number>/comments?per_page=100"
```

Check recent comments the author wrote or approved in the same repository when
you need a voice sample:

```bash
gh api "repos/<owner>/<repo>/pulls/comments?sort=created&direction=desc&per_page=100" \
  --jq '.[] | select(.user.login == "<author-login>") | {body,path,created_at}'
```

Copy the texture, never the wording. Prefer current user context over older
examples.

## 3. Pick only useful notes

Draft a note only when all of these are true:

- A capable reviewer is likely to pause at this exact change.
- The explanation helps them judge the change, not merely accept it.
- The fact or reason is supported by the user, PR, code, tests, or history.
- The PR body, code comments, and existing discussion do not already cover it.
- It fits in one or two plain sentences.

Good candidates include a surprising but verified choice, a deletion that may
look like lost behavior, a narrow scope boundary, behavior that deliberately
stays unchanged, or a known limitation the reviewer needs to judge now.

Skip obvious edits, formatting, routine renames, and explanations that only
repeat the diff. Never invent the author's intent. If the reason is unclear,
state the visible effect without claiming intent, ask the user, or skip the
note.

A constraint that will still matter after merge may need a code comment. A PR
note can help the current review, but it must not be the only place durable
knowledge lives. Flag that separately; do not edit the code unless asked.

## 4. Write in the author's PR-comment voice

Use recent same-repo comments as the strongest style evidence. For Pete, use
this dedicated PR-comment register rather than importing the broader
`write-as-pete` tics:

- Start with the fact. Lowercase starts are normal when they match the nearby
  precedent; preserve official names and code casing.
- Use one or two short sentences. A useful shape is what changes, followed by
  what stays or why it matters.
- Prefer direct, pronoun-light wording. Use `we` only for a documented shared
  decision. Use `I` only when Pete explicitly stated a personal choice.
- Use an exact code or domain term only when its exact meaning matters. Put code
  identifiers in backticks; prefer the plain feature name otherwise.
- Use the least technical words that stay accurate. If the reviewer must decode
  two internal terms in one sentence, rewrite it around what changes, what
  stays, or what breaks. Avoid abstract labels such as "client contract,"
  "runtime payload," and "availability sanitizer" when the concrete behavior
  is easier to say.
- Keep punctuation quiet. Do not add hype, jokes, coined phrases, emojis,
  ellipses, or decorative em dashes to make the note sound more like Pete.
- Avoid defensive phrases such as "on purpose" and "not a style slip." State
  the cause and effect, then let the reviewer judge it.
- Avoid unsupported promises such as "easy to add later" or "one line to wire
  up."

Read every draft together before presenting it. Remove repeated openings and
sentence shapes. Delete anything that sounds like PR-body copy, a changelog, or
a bot explaining the code.

### Shapes, not templates

Never copy these sentences into a real review. Use them only to calibrate the
level of detail, after verifying every claim.

- Scope: "this size only applies to table selection. existing checkboxes keep
  their current size."
- Preserved behavior: "the old action fields are gone. message and recipient
  checks still work as before."
- Exact legacy input: "old links may still include `panel`. we ignore it here
  and clear it on the next navigation."
- Plain translation: prefer "the picker still switches when the current option
  is unavailable" over "the availability sanitizer preserves the runtime
  invariant."

## 5. Show every public word and get approval

Present the proposed review summary and every inline note. For each inline note,
show the path, side, line, and body. If a claim needed investigation, show its
basis outside the quoted comment so the user can verify it without making the
public note denser.

```text
Review summary
  "left one note inline."

src/components/table.tsx:84 (RIGHT)
  "this size only applies to table selection. existing checkboxes keep their current size."
  Basis: the other checkbox callers still use the default size.
```

Wait for explicit approval before posting. Exact comment text paired with a
clear instruction to post already counts as approval; do not ask twice. Post
only the approved wording and anchors. If either changes, show the change and
get approval again.

## 6. Publish and verify

After approval, read [references/github-posting.md](references/github-posting.md)
and follow it exactly. Post one review, then compare what GitHub stored with the
approved summary and comments.

## Edge cases

- If nothing earns a note, say so and post nothing.
- Put a cross-file point in the review summary, not a separate PR comment.
- Check existing comments on every run, not only when the skill is re-run.
- Edit an existing note in place rather than duplicating it, but show any new
  wording for approval first unless the user supplied the exact edit and told
  you to post it.
