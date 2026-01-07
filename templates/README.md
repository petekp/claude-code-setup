# Templates

Configuration templates and references for Claude Code setup.

## Files

| File | Purpose | Usage |
|------|---------|-------|
| `settings.json.reference` | Example permissions and settings | **Reference only** — contains hardcoded paths. Review for patterns to copy. |
| `settings.local.json.template` | Machine-specific permissions | Copy to `~/.claude/settings.local.json` and customize |
| `.mcp.json.template` | MCP server configuration | Copy to project root as `.mcp.json` and add your servers |

## Recommended Approach

**Don't copy `settings.json.reference` directly.** It contains:
- Hardcoded paths specific to the original author
- Plugin preferences you may not want
- Permissions you haven't earned yet

Instead, let your permissions build organically:

1. Use Claude Code normally
2. Accept or deny permissions as they come up
3. Your `~/.claude/settings.json` accumulates what you actually use

## If You Want Specific Patterns

Open `settings.json.reference` and copy individual patterns you want:

```bash
# View the reference
cat templates/settings.json.reference

# Then add specific patterns to your settings.json, like:
# "Bash(git add:*)"
# "Bash(pnpm:*)"
```

## Machine-Specific Settings

`settings.local.json.template` is for permissions that differ per machine:

```json
{
  "permissions": {
    "allow": [
      "Bash(./your-local-script.sh)"
    ]
  }
}
```

Copy to `~/.claude/settings.local.json` and customize for each machine.
