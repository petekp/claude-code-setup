---
name: pr-description
description: "Write or update a GitHub PR description a teammate understands in one quick read: a picture first by default, then a few plain sentences grounded in the diff and real verification. Use when opening a PR or editing its description."
---

# PR description

Write for a teammate who knows the product, hasn't followed the work, and is reading between other tasks. After one quick read they should know what changed and what to check. A dense description goes unread even when it's accurate.

Read the actual diff and enough context to establish the problem, the resulting behavior, and the review risks. Don't invent motivation or claim verification you haven't done.

## Picture first

Start every description with a picture, above the first heading. Leave it out only when it would repeat what one sentence already says.

- **A visible change** gets an actual-product before-and-after image from `pr-screenshot-comparison`. Capture it with seeded or test data, and crop out customer names and contact details. When you can't capture one, say so under the tests.
- **Every other change** gets a Mermaid diagram, which GitHub renders. Draw the behavior before and after, or the flow, sequence, contract or state the change touches. That covers a rule change, a new API or command, a request path, a race, a lifecycle, and data moving between services. Draw the change itself, not the system around it.
- **A visible change that also changes a flow** gets both: the image first, then the diagram.
- **Skip the picture** for a change a diagram can't add to, such as a copy fix, a dependency bump, a rename, or a comment-only change.

[Evidence selection](references/evidence.md) covers recordings, command output, and data shapes. Put them under the picture, or use one in its place when it shows the change better.

## Plain text

- **Size the text to the change.** A change with one or two points gets two to four sentences. Use bullets once there are three or more separate points. Use the repository's PR template headings when it has them. Keep your own text, tests included, under about 200 words. The template's checklist and other required sections don't count. Over budget, cut reasons before points, then the least important points.
- **Describe what the user sees, in the words the team uses about the product:** screens, features, and customer situations. Write "the Team Chat message box", not the component's name, and "a rep turned Eve off", not the field value that records it. Name code only where the reviewer has to act on it. Explain how the code works in inline author notes instead.
- **Make every sentence state an effect, a risk, or a check.** Cover these in order, as far as they apply: what was wrong, what the change does, what else behaves differently after merge, what the reviewer should check, and what's not in this PR when a reader would assume it is.
- **Bold one line, the takeaway, or none.**
- **Tests list what a person checked by hand and what wasn't checked.** CI results already show on the PR.
- **When revising, rewrite the whole body.** Replace a wrong line instead of appending a section for each new finding.

Link evidence from the sentence it supports, such as docs, a dashboard query, or source lines. Reuse verification already done for the current change, and put a material gap beside the claim it limits.

## Cold read

Before publishing, give only the description text to a reader with no other context. Ask them what changed, what to check, which terms they would have to ask the author about, and, when the description has no picture, whether one would have shown the change faster than the text. A yes to the last means add one. Rewrite when an answer is wrong or takes more than two sentences. Also rewrite each flagged term that comes from the code rather than the product. Then ask again. Terms the team uses every day, such as the names of its tools and people, can stay. When you have no way to hand the text to a separate reader, skip this step and say so in your handoff.

## Example

An 8-line fix to a chat editor. Not text to copy:

```markdown
[before and after image]

## What and why

Fixes PAD-2336.

**Starting a list in the Team Chat message box left the placeholder showing behind the bullet.** The placeholder now hides once a list or quote starts, and comes back when it's removed.

The post edit form and the recon notes box use the same editor, so they get the fix too.

## Tests

- Checked by hand in Team Chat: typing `- `, `1. ` and `> `, the list button, and backspacing out of a list.
- Not checked by hand in the post edit form or the recon notes box.
- No automated test added.
```

## Publishing

Inspect screenshots before attaching them, and continue authorized PR work while optional choices are pending.

Publish with `gh pr create --body-file` or `gh pr edit --body-file` using actual multiline text in a file. Re-read the raw saved body afterward to verify the intended text.

For any existing or new image or video attachment, read [attachment links](references/attachment-links.md). Preserve original permanent upload URLs, run the checker before publishing and on the fetched raw body afterward, and inspect the rendered PR. A successful preview alone does not establish URL permanence. Keep PR screenshots out of Git, and upload them only with the author's authorization. Standing authorization counts.

Author self-review notes are a separate optional workflow using `pr-self-review`. Publishing the description does not authorize review comments or replies to teammates.
