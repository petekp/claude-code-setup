#!/usr/bin/env bash
# Session cleanup: remove stale agent-browser PID/socket files and kill
# session-scoped helper processes. Always exits successfully.
#
# NOTE: Do NOT kill MCP server processes here (context7-mcp, playwright-mcp,
# agentation-mcp, deepwiki, figma-console-mcp, etc.). Claude Code manages
# their lifecycle. Killing them with pkill -f nukes servers serving OTHER
# active sessions.

for pattern in \
  'agent-browser.*daemon' \
  'chrome-headless-shell'
do
  pkill -f "$pattern" >/dev/null 2>&1 || true
done

rm -f \
  "$HOME"/.agent-browser/*.pid \
  "$HOME"/.agent-browser/*.sock \
  2>/dev/null || true

exit 0
