---
description: Commit staged changes and push to the remote branch
allowed-tools: Bash
---

## Commit and Push

Execute the following steps:

### 1. Check for staged changes

Run `git diff --cached --stat` to see what's staged. If nothing is staged, tell the user and stop.

### 2. Show the diff

Run `git diff --cached` to show the actual changes. Present a brief summary of what's changing.

### 3. Generate a commit message

Based on the staged diff, write a concise commit message following these conventions:

- Use conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep the first line under 72 characters
- Focus on *what* changed and *why*, not *how*

### 4. Create the commit

Commit with the generated message using a heredoc:

```bash
git commit -m "$(cat <<'EOF'
<commit message here>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: <model name> <noreply@anthropic.com>
EOF
)"
```

### 5. Push to remote

Check if the current branch has an upstream tracking branch:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

- If it has a tracking branch: `git push`
- If no tracking branch exists: `git push -u origin <current-branch-name>`

### 6. Confirm success

After pushing, run `git log -1 --oneline` and `git status` to confirm everything worked. Report the commit hash and any relevant info (like a link to create a PR if this is a feature branch).
