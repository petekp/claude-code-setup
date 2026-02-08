# Claude Code Setup

My portable, version-controlled Claude Code configuration. Fork it, customize it, sync it across machines.

## Quick Start

```bash
git clone https://github.com/petekp/claude-code-setup.git
cd claude-code-setup && ./setup.sh
```

That's it. Your Claude Code now uses this repo's skills, commands, agents, and hooks.

## How It Works

The setup script symlinks this repo's directories into `~/.claude/`:

```
~/.claude/
├── skills/   → <repo>/skills/
├── commands/ → <repo>/commands/
├── agents/   → <repo>/agents/
├── hooks/    → <repo>/hooks/
└── scripts/  → <repo>/scripts/
```

Edit files in either location—they're the same files. Commit and push to sync across machines.

## Fork and Customize

1. Fork this repo on GitHub
2. Clone your fork and run `./setup.sh`
3. See [FORKING.md](FORKING.md) for customization guidance

## Syncing

```bash
# Push changes
git add -A && git commit -m "Update config" && git push

# Pull on another machine
git pull
```

## Undo

```bash
./setup.sh --undo
```

Removes symlinks and restores any backed-up directories.

## Reference Files

Some files aren't symlinked—they're templates or references for manual setup. See [templates/README.md](templates/README.md) for details.

## Troubleshooting

**Skills/commands not appearing?**
1. Check symlinks: `ls -la ~/.claude/skills`
2. Validate frontmatter: `./scripts/validate.sh`
3. Restart Claude Code

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
