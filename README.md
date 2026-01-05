# My Claude Code Setup

Personal Claude Code configuration: skills, commands, agents, hooks, and statusline.

## Setup

Clone the repo and run the setup script to symlink everything to `~/.claude`:

```bash
git clone https://github.com/petekp/claude-code-setup.git ~/Code/claude-code-setup
cd ~/Code/claude-code-setup
./setup.sh
```

This creates symlinks and copies files:

| Source | Target | Method |
|--------|--------|--------|
| `skills/` | `~/.claude/skills` | symlink |
| `commands/` | `~/.claude/commands` | symlink |
| `agents/` | `~/.claude/agents` | symlink |
| `hooks/` | `~/.claude/hooks` | symlink |
| `statusline-command.sh` | `~/.claude/statusline-command.sh` | copy |

## What's Included

| File/Dir | Purpose |
|----------|---------|
| `skills/` | Custom skills for Claude Code |
| `commands/` | Custom slash commands |
| `agents/` | Custom agent definitions |
| `hooks/` | Event-triggered automation |
| `statusline-command.sh` | Git-aware statusline script |
| `CLAUDE.md` | Global instructions for Claude |
| `settings.json` | Reference permissions/plugins config |
| `templates/` | Example configs for manual setup |

## Syncing

Since directories are symlinked, just commit and push:

```bash
cd ~/Code/claude-code-setup
git add -A && git commit -m "Update config" && git push
```

To pull updates on another machine:

```bash
cd ~/Code/claude-code-setup
git pull
```

## Manual Configuration

Some files need manual setup since they contain machine-specific values:

### settings.json

Contains absolute paths and machine-specific permissions. Review and copy if needed:

```bash
cp settings.json ~/.claude/settings.json
```

### settings.local.json

For machine-specific permissions (system commands, etc.). See the template:

```bash
cp templates/settings.local.json.template ~/.claude/settings.local.json
```

### .mcp.json

For MCP server configurations. See the template:

```bash
cp templates/.mcp.json.template ~/.claude/.mcp.json
```

## Undo

To remove symlinks and restore any backed-up directories:

```bash
./setup.sh --undo
```

## What's NOT Backed Up

These files are machine-specific or regenerated automatically:

- `hud.json` - Pinned projects (absolute paths)
- `settings.local.json` - Machine-specific permissions
- `history.jsonl` - Chat history
- `projects/` - Project-specific settings
- `plugins/installed_plugins.json` - Reinstall via `/plugins install`
