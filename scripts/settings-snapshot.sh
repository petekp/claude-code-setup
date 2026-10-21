#!/bin/sh
#
# Copies live Claude Code settings into a snapshot for version control.
#
# ~/.claude/settings.json belongs to Claude Code. It rewrites the file itself
# (/model, /effort, /config, plugin installs), and so do tools that install
# hooks. The snapshot records it in a git repo you control; it is never
# linked back, so those writes cannot break anything.
#
# Usage:
#   settings-snapshot.sh           write the snapshot
#   settings-snapshot.sh --diff    show how live settings differ from it
#
# The snapshot path defaults to ~/.agents/claude/settings.json. Set
# CLAUDE_SETTINGS_SNAPSHOT to use another path.

set -eu

LIVE=$HOME/.claude/settings.json
SNAPSHOT=${CLAUDE_SETTINGS_SNAPSHOT:-$HOME/.agents/claude/settings.json}

# Machine state that Claude Code rewrites on its own schedule.
FILTER='del(.feedbackSurveyState)'

command -v jq >/dev/null || { echo "settings-snapshot: jq is required" >&2; exit 1; }
[ -f "$LIVE" ] || { echo "settings-snapshot: $LIVE not found" >&2; exit 1; }

if [ "${1:-}" = "--diff" ]; then
    [ -f "$SNAPSHOT" ] || { echo "no snapshot at $SNAPSHOT"; exit 0; }
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    jq -S "$FILTER" "$SNAPSHOT" > "$tmp/snapshot.json"
    jq -S "$FILTER" "$LIVE" > "$tmp/live.json"
    diff -u --label snapshot --label live "$tmp/snapshot.json" "$tmp/live.json" || true
    exit 0
fi

mkdir -p "$(dirname "$SNAPSHOT")"
jq "$FILTER" "$LIVE" > "$SNAPSHOT.tmp"
mv "$SNAPSHOT.tmp" "$SNAPSHOT"
echo "Wrote $SNAPSHOT"
