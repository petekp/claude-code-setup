# Publish approved author-context comments

Read this file only after the user approves the wording, comment format, and locations.

## Recheck the target and discussion

```bash
gh api user --jq .login
gh pr view <number> --repo <owner/repo> \
  --json author,headRefOid,state,url
```

Stop if the signed-in account is no longer the author, the PR is not open, or
the head differs from the approved SHA. Re-read the diff and show any revised
wording, anchors, or links for approval before posting.

Check for comments added since drafting:

```bash
gh api --paginate "repos/<owner>/<repo>/pulls/<number>/comments?per_page=100"
gh api --paginate "repos/<owner>/<repo>/pulls/<number>/reviews?per_page=100"
gh api --paginate "repos/<owner>/<repo>/issues/<number>/comments?per_page=100"
```

Compare ideas, not just exact text. If an approved note is now redundant, show
the updated set before posting.

## Use the approved comment format

Write each payload as plain JSON in a scratch file. Keep comment text out of
shell arguments, and validate the file with `jq -e . <payload-file>`.

**Do not create a pending review or submit a grouped review.** Never use
`POST /pulls/<number>/reviews` or `POST /reviews/<id>/events` for this workflow.
Approval to post author context does not authorize either operation.

### PR conversation comment

Use the issue-comments endpoint for an ordinary PR conversation comment.
Include approved links to the exact committed code when relevant:

```json
{
  "body": "[src/components/table.tsx:84](https://github.com/OWNER/REPO/blob/COMMIT/src/components/table.tsx#L84)\n\nThis size applies to the header action. Existing row actions keep their current size."
}
```

```bash
gh api --method POST \
  "repos/<owner>/<repo>/issues/<number>/comments" \
  --input <payload-file> --jq '{id, html_url, body}'
```

This format has no review association. Use it when that is the user's requirement.

### Single inline comment

Use the individual pull-request-comments endpoint for an approved inline note,
equivalent to **Add single comment**. Pin it to the approved head:

```json
{
  "commit_id": "<approved-head-sha>",
  "path": "src/components/table.tsx",
  "line": 84,
  "side": "RIGHT",
  "body": "This size applies to the header action. Existing row actions keep their current size."
}
```

```bash
gh api --method POST \
  "repos/<owner>/<repo>/pulls/<number>/comments" \
  --input <payload-file> --jq '{id, html_url, path, line, side, body}'
```

Post one request per approved inline note. Do not wrap notes in a `comments`
array or follow up with a review-submission request. Use `RIGHT` for new-file
lines and `LEFT` for removed old-file lines; each anchor must be in the diff.

GitHub's API calls these [review comments](https://docs.github.com/en/rest/pulls/comments)
and may return a `pull_request_review_id`. Posting individually does not make
them ordinary conversation comments. Do not promise that inline notes have no
review metadata or substitute them when the user approved conversation comments.

## Verify and handle failures

Record each returned ID and URL. Fetch the stored comment from the endpoint
matching its format:

```bash
gh api "repos/<owner>/<repo>/issues/comments/<comment-id>"
gh api "repos/<owner>/<repo>/pulls/comments/<comment-id>"
```

Verify the author and exact body. For inline comments, also verify the commit,
path, side, and line; for conversation comments, verify the approved code links.
Report the posted comment links, not a review URL.

If a POST fails, inspect the existing comments before retrying. Match the
approved text and location, and retry only notes confirmed missing. Do not
repost successful comments or change their format to work around an error.

If wording or location must change, show the revision and get approval first.
Use the matching comment endpoint with `PATCH` and a JSON body file for an
approved edit, then verify the stored result. Deleting or moving existing
comments requires authorization. GitHub [does not allow deletion of a submitted review](https://docs.github.com/en/rest/pulls/reviews#delete-a-pending-review-for-a-pull-request);
do not promise to erase that record when correcting an accidental review submission.
