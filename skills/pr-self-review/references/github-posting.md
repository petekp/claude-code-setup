# Publish approved PR self-review notes

Read this file only after the user approves every public word and anchor.

## 1. Recheck the target

Fetch the current account and PR again:

```bash
gh api user --jq .login
gh pr view <number> --repo <owner/repo> \
  --json author,headRefOid,state,url
```

Stop if the signed-in account is no longer the author, the PR is not open, or
the current `headRefOid` differs from the SHA used to draft the notes. When the
head changes, re-read the diff, rebuild every affected anchor, and show the
revised review for approval.

Check for comments or general points added since drafting:

```bash
gh api --paginate \
  "repos/<owner>/<repo>/pulls/<number>/comments?per_page=100"
gh api --paginate \
  "repos/<owner>/<repo>/pulls/<number>/reviews?per_page=100"
gh api --paginate \
  "repos/<owner>/<repo>/issues/<number>/comments?per_page=100"
```

Compare ideas, not just exact text. If an approved note is now redundant, show
the updated set before posting.

## 2. Build one valid review payload

Write plain JSON to a scratch file with a file-editing tool. Do not include JSON
comments, and do not interpolate review text into a shell command.

GitHub requires a top-level `body` when `event` is `COMMENT`. Use that body for
any point spanning several files. When every point is inline, use the quiet
summary the user approved. Match the count: "left one note inline" for one, or
"left a few notes inline" for several.

Pin the review to the approved head with `commit_id`:

```json
{
  "commit_id": "<approved-head-sha>",
  "body": "left one note inline.",
  "event": "COMMENT",
  "comments": [
    {
      "path": "src/components/table.tsx",
      "line": 84,
      "side": "RIGHT",
      "body": "this size only applies to table selection. existing checkboxes keep their current size."
    }
  ]
}
```

Use `side: "RIGHT"` with the new-file line number for added or changed lines.
Use `side: "LEFT"` with the old-file line number only for removed lines. Every
anchor must appear in the captured diff.

If there are no inline notes, omit `comments`. If there is no useful summary or
inline note, post nothing.

## 3. Validate and post

Validate the payload before sending it:

```bash
jq -e . <review-file> >/dev/null
```

Post everything as one comment-only review:

```bash
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  "repos/<owner>/<repo>/pulls/<number>/reviews" \
  --input <review-file> \
  --jq '{id, html_url, state, commit_id, body}'
```

Keep backticks and other punctuation inside the JSON file. Never pass a comment
body through a shell argument.

## 4. Verify what GitHub stored

Record the returned review ID and URL, then fetch its inline comments:

```bash
gh api --paginate \
  "repos/<owner>/<repo>/pulls/<number>/reviews/<review-id>/comments?per_page=100" \
  --jq 'map({path, line, side, body, html_url})'
```

Compare the stored review with the approval: summary, count, path, line, side,
and body must match. Report the note count and review URL.

## 5. Handle failures without guessing

If the POST fails, do not assume that nothing landed and do not retry at once.
Fetch the PR reviews and comments, then look for the exact approved text.

If an anchor or body must change, show the revision and get approval again. Only
retry notes confirmed missing. Report anything that could not be posted.

To revise an existing inline comment, fetch its ID and send the approved body
from a JSON file:

```bash
gh api --method PATCH \
  "repos/<owner>/<repo>/pulls/comments/<comment-id>" \
  --input <body-file>
```

Use `{"body":"<approved text>"}` in the body file. Verify the stored result
after the update.
