---
name: pr-description
description: "Write or update a GitHub PR description as a short, skimmable list of key points grounded in the diff and real verification. Use when opening a PR or editing its description."
---

# PR description

Write for a teammate who knows the product, hasn't followed the work, and is reading between other tasks. They should get the point from the bold text alone and stop once they have enough. A dense description goes unread even when it's accurate.

Read the actual diff and enough context to establish the problem, the resulting behavior, and the review risks. Don't invent motivation or claim verification you haven't done.

## Shape

- Use the repository's PR template headings when it has them. Under each heading, write bullets, not paragraphs.
- Start each bullet with a bold lead-in that states the point as a full claim. Add one or two short sentences only when the reader needs the reason or the consequence.
- One point per bullet, most important first. A bold label can group related bullets, as in the example.
- Keep the body to one screen, about 300 words including tests. A small change needs one to three bullets. Over budget, cut reasons before points, then the least important points.
- When revising, rewrite the whole body within that budget. Replace a wrong line instead of appending a section for each new finding.

## Content

Cover these in order, skipping any that don't apply:

1. What was wrong or missing, with its impact as a number when one exists.
2. What the change does.
3. What behaves differently after merge, including effects outside the changed code.
4. Decisions, risks, or known flaws the reviewer should check.
5. What's not in this PR, only where a reader would assume otherwise.
6. Tests: what was verified, and what wasn't.

Leave out file-by-file narration, how the problem was found, mechanism the diff already shows, boilerplate, and mannered prose.

## Evidence

Link evidence from the bullet it supports, such as docs, a dashboard query, or source lines, instead of collecting it in its own section. Reasoning about a specific line belongs in an inline author note from `pr-self-review`, not the body. Use [evidence selection](references/evidence.md) for screenshots, recordings, and other proof. Reuse verification already done for the current change, and put a material gap beside the claim it limits.

## Example shape

Not text to copy:

```markdown
## What and why

- **Password resets fail for any email address containing `+`.** The reset link puts the address in the query string, which decodes `+` as a space, per the framework's [docs](…).
- **412 resets failed in August,** per the [error dashboard](…).
- **The endpoint now reads the address from the request body.** The body keeps the `+`.

**After merge, a reset for a `+` address works like any other:**

- It sends the reset email.
- It counts toward the hourly reset limit.

## Tests

- **A new test requests a reset for a `+` address.** On main, it finds no account.
- **Not tested with the live email provider.**
```

## Publishing

Read [Pete's PR workflow](/Users/petepetrash/.agents/private-guidance/pr-workflow.md) during PR preparation. It covers screenshot and author-note choices, approval, and neutral teammate replies. Prepare and inspect available screenshots before offering attachment, and continue authorized PR work while optional choices are pending.

Publish with `gh pr create --body-file` or `gh pr edit --body-file` using actual multiline text in a file. Re-read the raw saved body afterward to verify the intended text.

For any existing or new image or video attachment, read [attachment links](references/attachment-links.md). Preserve original permanent upload URLs, run the checker before publishing and on the fetched raw body afterward, and inspect the rendered PR. A successful preview alone does not establish URL permanence. Never commit PR screenshots or upload them without approval.

Author self-review notes are a separate optional workflow using `pr-self-review`. Publishing the description does not authorize review comments or replies to teammates.
