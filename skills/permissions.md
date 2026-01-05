---
description: Pre-allow common safe bash commands in Claude Code settings
---

# Permissions Setup

Configure Claude Code to pre-allow commonly used bash commands that are safe in your development environment.

## Instructions

Read the user's current Claude Code settings from `~/.claude/settings.json`, then update the `permissions.allow` array to include these commonly safe bash commands:

### Build & Package Management
- `Bash(pnpm:*)` - pnpm commands (install, add, remove, build, dev, test, etc.)
- `Bash(npm:*)` - npm commands
- `Bash(yarn:*)` - yarn commands
- `Bash(npx:*)` - npx execution

### Git Operations
- `Bash(git status:*)`, `Bash(git diff:*)`, `Bash(git log:*)` - read-only git
- `Bash(git add:*)`, `Bash(git commit:*)` - staging and commits
- `Bash(git branch:*)`, `Bash(git checkout:*)`, `Bash(git stash:*)` - branch management
- `Bash(git fetch:*)`, `Bash(git pull:*)`, `Bash(git push)` - remote sync
- `Bash(git cherry-pick:*)`, `Bash(git rebase:*)`, `Bash(git merge:*)` - history operations

### GitHub CLI
- `Bash(gh pr:*)`, `Bash(gh api:*)`, `Bash(gh repo:*)`, `Bash(gh run:*)` - GitHub operations

### File System (Read-Only)
- `Bash(ls:*)`, `Bash(tree:*)`, `Bash(cat:*)`, `Bash(find:*)` - directory listing
- `Bash(grep:*)`, `Bash(wc:*)` - file searching and counting

### TypeScript & Linting
- `Bash(npx tsc:*)`, `Bash(npx eslint:*)` - type checking and linting

### Process Management
- `Bash(lsof:*)`, `Bash(pkill:*)` - process inspection and management

### Environment
- `Bash(env)`, `Bash(echo:*)` - environment inspection

## Merge Strategy

When updating settings:
1. Read existing `~/.claude/settings.json`
2. Preserve all existing settings
3. Merge new permissions with existing `permissions.allow` array (avoid duplicates)
4. Write back the updated settings

## User Customization

After showing the proposed changes, ask the user if they want to:
1. Apply all recommended permissions
2. Select specific categories to add
3. Add custom commands beyond the defaults

Always show the user what will be added before making changes.
