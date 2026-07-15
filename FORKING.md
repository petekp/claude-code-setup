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

This symlinks the repo's `skills/` and `scripts/` directories (plus `settings.json` and `.mcp.json`) into `~/.claude/`. Codex picks up skills via `scripts/sync-codex-skills.sh`, which runs on every Claude Code session start.

## Step 3: Detach from Upstream (Optional)

Your fork tracks the original repo by default. To make it fully independent:

```bash
git remote remove upstream 2>/dev/null || true
git remote -v
# Should show only: origin  https://github.com/YOUR_USERNAME/...
```

## Step 4: Make It Yours

### Edit CLAUDE.md and AGENTS.md

The root `CLAUDE.md`/`AGENTS.md` describe this repo's conventions to agents working *in* it. Your personal global instructions live in `~/.claude/CLAUDE.md` (Claude Code) and `~/.codex/AGENTS.md` (Codex) — those are managed outside this repo.

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
| Repo conventions for agents | `CLAUDE.md` / `AGENTS.md` (repo root) | Describe your repo to agents working in it |
| Skills | `skills/` | Add/remove as needed |
| Hook scripts | `scripts/` | Referenced from `settings.json` hooks |
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
