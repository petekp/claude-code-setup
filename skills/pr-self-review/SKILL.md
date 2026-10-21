---
name: pr-self-review
description: "Draft explanatory author-context comments for the user's own PR or local diff. Use for self-review or reviewer context, not a formal review submission. Posting requires approval."
---

# PR author context

Draft notes that help a teammate understand changed behavior, affected callers, and non-obvious choices. This workflow authorizes inspection and drafting, not additional code changes or replies to teammates.

Here, self-review means inspecting the author's own changes and explaining them to reviewers. Publish that context as standalone comments. Do not create or submit a grouped GitHub review, or issue an approval or request-changes verdict.

For an existing PR, read [target and authorship](references/target.md) to verify the repository, open PR, author, and current head. When no PR exists, inspect the local diff and continue with private drafts.

Read the diff, existing discussion, and affected consumers. Follow history or linked issues when needed to support a reason. Cover distinct reviewer questions across the meaningful changes; there is no required number or ceiling. A complex change may need several short notes, and a straightforward change may need none.

Use [writing notes](references/writing-notes.md) when choosing or drafting explanations. Keep each note short, concrete, and supported. Do not invent the author's intent or speak as Pete personally. Flag a needed durable code comment separately unless its edit is already authorized.

Distinguish the two comment formats:

- **PR conversation comments:** ordinary comments in the PR conversation, with links to the relevant committed code. These are not attached to a review.
- **Single inline comments:** individual notes on changed lines, equivalent to **Add single comment**, not **Start a review**. GitHub calls these review comments internally, even when posted individually.

Follow the user's placement preference. If "regular" or "non-review" could mean either format in context, clarify that distinction before posting. Do not silently switch formats.

Show the chosen format and every proposed public word before posting. For inline notes, include each path, side, line, and body. For conversation comments, include the code links in the proposed text. Put supporting evidence outside the proposed comments. Add a general comment only when it explains a useful point spanning files; do not invent a review summary or status announcement.

Wait for approval of the wording, format, and anchors or links. Exact supplied text plus an instruction to post counts as approval; do not ask twice. If those approved details need changing, show the revision for approval first. Read existing comments on each run and avoid duplicates.

After approval, read [GitHub posting](references/github-posting.md). Post the approved standalone comments through the matching comments endpoint and verify GitHub stored the intended text and location. Do not post when authorship differs, the PR is closed, or approval is missing. Continue private drafting where possible.
