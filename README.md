# Claude Code + Codex Setup

Portable, version-controlled configuration for **Claude Code** and **OpenAI Codex**. Fork it, customize it, sync it across machines.

## Quick Start

```bash
git clone https://github.com/petekp/claude-code-setup.git
cd claude-code-setup && ./setup.sh
```

That's it. Both tools now use this repo's skills and scripts.

## How It Works

The setup script symlinks this repo into `~/.claude/`:

```
~/.claude/
├── skills/    → <repo>/skills/
├── scripts/   → <repo>/scripts/
├── settings.json → <repo>/settings.json
├── statusline-command.sh ← <repo> (copied)
│
~/.mcp.json    → <repo>/.mcp.json
```

Edit files in either location — they're the same files. Commit and push to sync across machines.

### Codex Skill Syncing

Skills are symlinked individually into `~/.codex/skills/` (Codex doesn't support directory-level symlinks) by `scripts/sync-codex-skills.sh`, which runs automatically on every Claude Code session start. Skills listed in `codex-exclude` are skipped — these conflict with Codex built-ins or would show up as duplicates.

### MCP Servers

Claude Code reads MCP servers from `~/.mcp.json` (symlinked). Codex reads them from `~/.codex/config.toml` (manually managed).

## Fork and Customize

1. Fork this repo on GitHub
2. Clone your fork and run `./setup.sh`
3. See [FORKING.md](FORKING.md) for customization guidance

## Syncing

```bash
# Push changes
git add -A && git commit -m "Update config" && git push

# Pull on another machine
git pull && ./setup.sh
```

## Undo

```bash
./setup.sh --undo
```

Removes symlinks and restores backed-up directories.

## Reference Files

Some files aren't symlinked — they're templates or references for manual setup. See [templates/README.md](templates/README.md) for details.

## Troubleshooting

**Skills/commands not appearing in Claude Code?**
1. Check symlinks: `ls -la ~/.claude/skills`
2. Validate frontmatter: `./scripts/validate.sh`
3. Restart Claude Code

**Skills not appearing in Codex?**
1. Check symlinks: `ls -la ~/.codex/skills`
2. Verify the skill isn't in `codex-exclude`
3. Start a Claude Code session (the sync hook runs on SessionStart), or run `./scripts/sync-codex-skills.sh` directly

**Permission denied?**
```bash
chmod +x setup.sh && ./setup.sh
```

**Preview before running?**
```bash
./setup.sh --dry-run
```

**Windows?**
Use WSL or set up symlinks manually.

## License

MIT
