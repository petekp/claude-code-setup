#!/bin/bash
# Records MCP auth state, but only when it changes.
#
# Runs on SessionStart and Stop, so it samples often. Each run builds a
# fingerprint of (installed version + which servers need auth) and compares it
# to the last one. Identical fingerprint means nothing happened, so it exits
# without writing. The log therefore holds transitions only: the moment a
# server dropped to needs-auth, or came back, or the version changed.
#
# Concurrency is captured at the moment of the transition, which is the whole
# point -- it tells us whether re-auth events line up with parallel sessions
# (refresh-token rotation races) or with version bumps (Keychain ACL breakage).
#
# Deliberately does NOT run `claude mcp list`: that spawns another process that
# would refresh tokens and join the very race we are trying to measure.

LOG="$HOME/.claude/mcp-auth-events.jsonl"
FP_FILE="$HOME/.claude/.mcp-auth-fingerprint"
CACHE="$HOME/.claude/mcp-needs-auth-cache.json"
VERSIONS_DIR="$HOME/.local/share/claude/versions"

event="${1:-unknown}"

# Servers currently flagged as needing auth, sorted for a stable fingerprint.
if [ -f "$CACHE" ]; then
  needs_auth=$(grep -o '"[a-zA-Z]*:[^"]*:[^"]*"' "$CACHE" 2>/dev/null | tr -d '"' | sort | paste -sd, -)
else
  needs_auth=""
fi

# Newest installed version. Cheaper than `claude --version`, which would boot
# the whole runtime on every Stop hook.
version=$(ls -t "$VERSIONS_DIR" 2>/dev/null | head -1)

fingerprint="${version}|${needs_auth}"
last=$(cat "$FP_FILE" 2>/dev/null)

if [ "$fingerprint" = "$last" ]; then
  exit 0
fi

printf '%s' "$fingerprint" > "$FP_FILE"

# Matches real sessions only. The trailing space-or-EOL keeps out
# claude-in-chrome, and the lowercase name keeps out the Claude.app helpers.
concurrent=$(ps -eo command 2>/dev/null | grep -E '(^|/)claude($| )' | grep -vc grep | tr -d ' ')
ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Quote the comma-separated server list into a JSON array.
if [ -n "$needs_auth" ]; then
  servers=$(printf '%s' "$needs_auth" | awk -F, '{for(i=1;i<=NF;i++){printf "%s\"%s\"", (i>1?",":""), $i}}')
else
  servers=""
fi

printf '{"ts":"%s","event":"%s","version":"%s","needs_auth":[%s],"concurrent_sessions":%s,"prev_fingerprint":"%s"}\n' \
  "$ts" "$event" "$version" "$servers" "$concurrent" "$last" >> "$LOG"

exit 0
