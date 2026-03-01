# MCP Server Reference

How MCP (Model Context Protocol) servers work across Claude Code and Codex.

## Claude Code

Claude Code reads MCP servers from `~/.mcp.json` (symlinked to `repo/.mcp.json`).

Current servers:

| Server | Type | URL |
|--------|------|-----|
| openaiDeveloperDocs | HTTP | `https://developers.openai.com/mcp` |

Additional servers are provided by plugins (context7, playwright, etc.) and managed through Claude Code's plugin system, not `.mcp.json`.

## Codex

Codex reads MCP servers from `~/.codex/config.toml` under `[mcp_servers]`.

To add the same servers manually:

```toml
[mcp_servers.openaiDeveloperDocs]
type = "http"
url = "https://developers.openai.com/mcp"
```

## Why config.toml isn't managed by this repo

Codex's `config.toml` mixes MCP servers with tool-specific settings:
- `model` — which model to use
- `approval_mode` — trust level for tool execution
- `full_auto_error_mode` — error handling behavior
- `agents_directory` — path to agent instructions
- Feature flags and sandbox settings

Symmlinking this file would override all those settings. Instead, MCP servers must be added to `config.toml` manually.

## Adding a new server to both tools

1. Add to `repo/.mcp.json` for Claude Code (takes effect via symlink)
2. Add to `~/.codex/config.toml` manually for Codex
3. Document it in this file
