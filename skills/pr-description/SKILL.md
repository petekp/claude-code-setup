---
name: pr-description
description: "Write or update a GitHub PR description grounded in the diff and real verification. Use when opening a PR or editing its description."
---

# PR description

Read the actual diff and enough context to establish the problem, resulting behavior, and important review risks. Describe the final change for a teammate who knows the product but has not followed the conversation. Do not invent motivation or claim verification you have not performed.

Lead with the concrete change and why it matters. Use short, literal sentences. Keep a small change to a few sentences; a typical feature usually needs under 150 words of prose plus useful evidence. Add structure only when complexity or the repository template calls for it. Omit file-by-file narration, boilerplate, unsupported promises, and mannered prose.

Use [evidence selection](references/evidence.md) when choosing screenshots, transcripts, or other proof. Reuse relevant verification already completed for the current change. Put material gaps beside the claims they limit.

Read [Pete's PR workflow](/Users/petepetrash/.agents/private-guidance/pr-workflow.md) during PR preparation. It covers screenshot and author-note choices, approval, and neutral teammate replies. Prepare and inspect available screenshots before offering attachment; continue authorized PR work while optional choices are pending.

For publishing a description, use `gh pr create --body-file` or `gh pr edit --body-file` with actual multiline text in a file. Re-read the raw saved body afterward to verify the intended text.

For any existing or new image/video attachment, read [attachment links](references/attachment-links.md). Preserve original permanent upload URLs, run the checker before publishing and on the fetched raw body afterward, and inspect the rendered PR. A successful preview alone does not establish URL permanence. Never commit PR screenshots or upload them without approval.

Author self-review notes are a separate optional workflow using `pr-self-review`. Publishing the description does not authorize review comments or replies to teammates.
