# Identify the review target


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
