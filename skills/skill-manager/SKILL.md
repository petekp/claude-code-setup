---
name: skill-manager
description: >
  Manage, audit, and maintain your skill ecosystem. Use when the user asks to
  "check my skills", "audit skills", "find duplicate skills", "which skills am I using",
  "prune unused skills", "are my skills synced", "check for skill updates",
  "skill report", "skill health", or mentions skill maintenance, cleanup, or organization.
---

# Skill Manager

Unified tool for managing your skill ecosystem across Claude, Codex, and Agents runtimes.

## Available Commands

Run these via the `skill-manager.sh` script in the repo's `scripts/` directory:

```bash
# Full audit — runs all checks in one pass
~/.claude/scripts/skill-manager.sh report

# Individual commands
~/.claude/scripts/skill-manager.sh usage          # Show skill usage frequency
~/.claude/scripts/skill-manager.sh usage --top 10  # Top 10 most-used skills
~/.claude/scripts/skill-manager.sh dupes           # Detect redundant/duplicate skills
~/.claude/scripts/skill-manager.sh check           # Verify availability for Claude/Codex/Agents
~/.claude/scripts/skill-manager.sh sync            # Validate repo sync status
~/.claude/scripts/skill-manager.sh update          # Check for npx skill updates
~/.claude/scripts/skill-manager.sh prune           # List candidates for removal
```

## When to Run Each Command

| Command  | When to Use |
|----------|-------------|
| `report` | Periodic full health check (weekly or monthly) |
| `usage`  | Before pruning — see which skills are actually used |
| `dupes`  | After installing new skills — check for overlap |
| `check`  | After setup.sh or when skills seem missing |
| `sync`   | After editing skills — verify everything is linked |
| `update` | Periodically — check if npx-installed skills have newer versions |
| `prune`  | When the skill list feels bloated — find removal candidates |

## How Usage Tracking Works

A PostToolUse hook in `settings.json` fires every time the Skill tool is used. It logs:
- Skill name
- Timestamp (UTC)
- Project directory

Data is stored in `~/.claude/skill-usage.jsonl` (one JSON object per line). The `usage` and `prune` commands read this data to generate reports.

## How to Use This Skill

When the user asks about skill management, run the appropriate command and present the results. For general questions, run `report` for a full picture.

### Interpreting Results

- **Check**: Green means properly linked. Yellow means something unexpected. Red means broken.
- **Sync**: Verifies all three runtimes (Claude, Codex, Agents) point to the repo's skills directory.
- **Dupes**: Groups skills by prefix and checks keyword overlap in descriptions. High overlap (>40%) suggests consolidation.
- **Usage**: Shows invocation counts and last-used dates. "Never used" skills are prune candidates.
- **Prune**: Combines usage data with overlap analysis to suggest removals.

### Archiving Skills

To archive a skill (remove from active use but keep for reference):

```bash
mv skills/<name> ~/.claude/skills-archive/
```

This removes it from all three runtimes (since they symlink to the repo's skills/).
