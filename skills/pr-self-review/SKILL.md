---
name: pr-self-review
description: "Draft explanatory author notes for the user's own PR or local diff. Use for self-review or reviewer context; posting requires approval."
---

# PR self-review notes

Draft notes that help a teammate understand changed behavior, affected callers, and non-obvious choices. This workflow authorizes inspection and drafting, not additional code changes or replies to teammates.

For an existing PR, read [target and authorship](references/target.md) to verify the repository, open PR, author, and current head. When no PR exists, inspect the local diff and continue with private drafts.

Read the diff, existing discussion, and affected consumers. Follow history or linked issues when needed to support a reason. Cover distinct reviewer questions across the meaningful changes; there is no required number or ceiling. A complex change may need several short notes, and a straightforward change may need none.

Use [writing notes](references/writing-notes.md) when choosing or drafting explanations. Keep each note short, concrete, and supported. Do not invent the author's intent or speak as Pete personally. Flag a needed durable code comment separately unless its edit is already authorized.

Show every proposed public word before posting: optional review summary, then each note's path, side, line, and body. Put supporting evidence outside the proposed comment. When all useful points are inline, the summary is `none`; do not add a comment count or status announcement.

Wait for approval of the wording and anchors. Exact supplied text plus an instruction to post counts as approval; do not ask twice. If approved wording or anchors need changing, show that change for approval first. Review existing comments on each run and avoid duplicates.

After approval, read [GitHub posting](references/github-posting.md). Post the approved notes as one review and verify GitHub stored the intended text and anchors. Do not post when authorship differs, the PR is closed, or approval is missing. Continue private drafting where possible.
