# Forking Guide

How to make this repo your own.

## Step 1: Fork and Clone

1. Click **Fork** on the GitHub repo page
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-code-setup.git
   cd claude-code-setup
   ```

## Step 2: Run Setup

```bash
./setup.sh
```

This symlinks directories into `~/.claude/`, links skills into `~/.codex/`, and assembles system instructions for both tools.

## Step 3: Detach from Upstream (Optional)

Your fork tracks the original repo by default. To make it fully independent:

```bash
git remote remove upstream 2>/dev/null || true
git remote -v
# Should show only: origin  https://github.com/YOUR_USERNAME/...
```

## Step 4: Make It Yours

### Edit CLAUDE.md

Replace the coding conventions with your own preferences. The defaults are opinionated toward React/TypeScript.

### Add or Remove Skills

```bash
# Remove a skill you don't need
rm -rf skills/nextjs-boilerplate

# Add your own
mkdir skills/my-skill
# Create skills/my-skill/SKILL.md with frontmatter
```

Skill structure:
```markdown
---
name: my-skill
description: When to use this skill
---

# My Skill

Content here...
```

### Add or Remove Commands

```bash
# Remove a command
rm commands/synthesize-feedback.md

# Add your own
# Create commands/my-command.md with frontmatter
```

Command structure:
```markdown
---
description: What this command does
allowed-tools: Bash, Edit, Read
---

Instructions for Claude...
```

### Update /squad

If you keep the `/squad` command, update the skill catalog in `commands/squad.md` to match your actual skills.

## Step 5: Handle Permissions

The `templates/settings.json.reference` is **reference only**. It contains:
- Hardcoded paths (`/Users/petepetrash/...`)
- Plugin preferences specific to the original author

**Don't copy it directly.** Instead:

### Option A: Build Organically (Recommended)
Just use Claude Code. Accept or deny permissions as they come up. Your settings build naturally.

### Option B: Copy Specific Patterns
```bash
# View the reference
cat templates/settings.json.reference

# Open your settings
code ~/.claude/settings.json

# Copy permission patterns you want, like:
# "Bash(git add:*)"
# "Bash(pnpm:*)"
```

See [templates/README.md](templates/README.md) for more details.

## What to Customize

| Item | Location | Action |
|------|----------|--------|
| Shared instructions | `instructions/common.md` | Rules for both Claude Code and Codex |
| Claude-only instructions | `instructions/claude-only.md` | Claude Code-specific rules |
| Codex-only instructions | `instructions/codex-only.md` | Codex-specific rules |
| Coding conventions | `CLAUDE.md` (repo root) | Per-project preferences (not assembled) |
| Skills | `skills/` | Add/remove as needed |
| Commands | `commands/` | Add/remove as needed |
| Agents | `agents/` | Add/remove as needed |
| Hooks | `hooks/` | Add/remove as needed |
| Codex exclusions | `codex-exclude` | Skills to skip for Codex |
| Statusline | `statusline-command.sh` | Customize or delete |
| MCP servers | `.mcp.json` | Claude Code servers (Codex: manual) |
| Permissions | `templates/settings.json.reference` | Reference only |

## Syncing Your Changes

From the repo directory:

```bash
git add -A
git commit -m "Customize for my workflow"
git push
```

## Pulling Updates from Original (Optional)

If you want new skills/commands from the original repo:

```bash
# Add upstream (once)
git remote add upstream https://github.com/petekp/claude-code-setup.git

# Fetch and merge
git fetch upstream
git merge upstream/main
```

This may conflict with your customizations. Most forkers should just maintain their own version.
