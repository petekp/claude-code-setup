# Templates

Configuration templates and references for Claude Code setup.

## Files

| File | Purpose | Usage |
|------|---------|-------|
| `.mcp.json.template` | MCP server configuration | Copy to project root as `.mcp.json` and add your servers |

For settings, read the repo's real [`settings.json`](../settings.json) — it is
committed in full. There used to be a trimmed copy here, but a second copy of a
file that changes every session only drifts.

## Recommended Approach

**Don't copy `settings.json` directly.** It contains:
- Hardcoded paths specific to the original author
- Plugin preferences you may not want
- Permissions you haven't earned yet

Instead, let your permissions build organically:

1. Use Claude Code normally
2. Accept or deny permissions as they come up
3. Your `~/.claude/settings.json` accumulates what you actually use

## If You Want Specific Patterns

Open the repo's `settings.json` and copy individual patterns you want:

```bash
# View the reference
cat settings.json

# Then add specific patterns to your settings.json, like:
# "Bash(git add:*)"
# "Bash(pnpm:*)"
```

## Machine-Specific Settings

For permissions that differ per machine, create `~/.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(./your-local-script.sh)"
    ]
  }
}
```

It merges over the shared `settings.json` and stays out of version control.
