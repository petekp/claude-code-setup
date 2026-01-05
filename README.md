# Claude Code Setup

A ready-to-fork Claude Code configuration with skills, commands, agents, and hooks.

## Quick Start

### Forking (Recommended)

1. **Fork this repo** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-code-setup.git ~/Code/claude-code-setup
   cd ~/Code/claude-code-setup
   ./setup.sh
   ```
3. **Make it yours** — see [FORKING.md](FORKING.md) for customization guide

### Direct Clone (For Personal Use)

```bash
git clone https://github.com/petekp/claude-code-setup.git ~/Code/claude-code-setup
cd ~/Code/claude-code-setup
./setup.sh
```

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `cognitive-foundations` | User psychology, attention, memory limits, HCI research |
| `design-critique` | UI/UX reviews with severity ratings and accessibility checks |
| `dreaming` | Expansive thinking, 10x questions, breaking constraints |
| `interaction-design` | Component behaviors, micro-interactions, state transitions |
| `model-first-reasoning` | Formal logic, state machines, constraint systems |
| `nextjs-boilerplate` | Next.js + Tailwind + shadcn/ui project setup |
| `oss-product-manager` | Open source strategy, community dynamics, governance |
| `react-component-dev` | React patterns, forwardRef, accessibility, composition |
| `startup-wisdom` | Product strategy, PMF, prioritization, founder decisions |
| `stress-testing` | Pre-mortems, risk analysis, assumption audits |
| `tutorial-writing` | Educational content, step-by-step implementation guides |
| `typography` | Type scales, font selection, hierarchy, readability |
| `unix-macos-engineer` | Shell scripts, CLI tools, launchd, system admin |
| `ux-writing` | Microcopy, error messages, empty states, voice/tone |
| `wise-novice` | Fresh perspectives, naive questions, challenging assumptions |

### Commands

| Command | Purpose |
|---------|---------|
| `/commit-and-push` | Generate conventional commit and push to remote |
| `/interview` | Gather context for planning with suggested answers |
| `/squad` | Deploy multiple skills on a single request |
| `/synthesize-feedback` | Consolidate feedback from multiple LLMs |
| `/verify` | Run lint and typecheck before committing |

### Agents

| Agent | Purpose |
|-------|---------|
| `playwright-qa-tester` | Focused QA testing with Playwright |

### Hooks

| Hook | Purpose |
|------|---------|
| `pre-commit-verify` | Reminder to verify before committing |

## How It Works

Running `./setup.sh` creates symlinks:

| Source | Target | Method |
|--------|--------|--------|
| `skills/` | `~/.claude/skills` | symlink |
| `commands/` | `~/.claude/commands` | symlink |
| `agents/` | `~/.claude/agents` | symlink |
| `hooks/` | `~/.claude/hooks` | symlink |
| `statusline-command.sh` | `~/.claude/statusline-command.sh` | copy |

Edits in either location update the same files. Just commit and push to sync.

## Customizing

After forking, see [FORKING.md](FORKING.md) for how to:

- Edit `CLAUDE.md` with your coding conventions
- Add/remove skills and commands
- Update the `/squad` catalog
- Handle permissions

## Reference Files

These files are **not symlinked** — they're for reference or manual setup:

| File | Purpose | Action |
|------|---------|--------|
| `settings.example.json` | Example permissions config | Review for patterns, don't copy directly |
| `templates/settings.local.json.template` | Machine-specific permissions | Copy to `~/.claude/` and edit |
| `templates/.mcp.json.template` | MCP server config | Copy to `~/.claude/` and edit |
| `CLAUDE.md` | Coding conventions | Edit to match your style |

### Why settings.example.json?

The example settings file contains:
- Hardcoded paths specific to the original author
- Plugin preferences that may not match yours
- Permission patterns you might want to adopt

**Don't copy it directly.** Instead, review it for patterns and build your own permissions through normal Claude Code usage.

## Syncing Changes

Since everything is symlinked:

```bash
cd ~/Code/claude-code-setup
git add -A && git commit -m "Update config" && git push
```

## Undo

```bash
./setup.sh --undo
```

This removes symlinks and restores any backed-up directories.

## License

MIT
