#!/usr/bin/env bash
# session-size-warning.sh
#
# PostToolUse hook that warns Claude when the current session has grown large,
# so it can proactively offer a handoff instead of piling more work into the
# same thread.
#
# Install: add to ~/.claude/settings.json under hooks.PostToolUse:
#   {
#     "name": "session-size-warning",
#     "script": "~/.claude/hooks/session-size-warning.sh",
#     "pattern": ".*"
#   }
#
# Thresholds are tunable via env.
set -euo pipefail

SESSION_ID="${CLAUDE_SESSION_ID:-}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}"
WARN_TOOLS="${CC_SESSION_WARN_TOOLS:-80}"
WARN_MINUTES="${CC_SESSION_WARN_MIN:-60}"

if [[ -z "$SESSION_ID" || -z "$PROJECT_DIR" ]]; then
  exit 0
fi

ENCODED_PROJECT="$(echo -n "$PROJECT_DIR" | tr '/' '-')"
SESSION_FILE="$HOME/.claude/projects/${ENCODED_PROJECT}/${SESSION_ID}.jsonl"

if [[ ! -f "$SESSION_FILE" ]]; then
  exit 0
fi

# Count tool_use events (cheap: grep-count "tool_use" lines).
TOOL_COUNT=$(grep -c '"type":"tool_use"' "$SESSION_FILE" 2>/dev/null || echo 0)

# First timestamp in the file (ISO 8601).
FIRST_TS=$(head -1 "$SESSION_FILE" | python3 -c '
import sys, json
try:
    d = json.loads(sys.stdin.read())
    print(d.get("timestamp",""))
except Exception:
    print("")
' 2>/dev/null || echo "")

MINUTES=0
if [[ -n "$FIRST_TS" ]]; then
  MINUTES=$(python3 -c "
from datetime import datetime, timezone
try:
    t = datetime.fromisoformat('$FIRST_TS'.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    print(int((now - t).total_seconds() // 60))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
fi

# Fire the warning once per session: drop a sentinel file.
SENTINEL="$HOME/.claude/cache/session-size-warned/${SESSION_ID}"
mkdir -p "$(dirname "$SENTINEL")"
if [[ -f "$SENTINEL" ]]; then
  exit 0
fi

if (( TOOL_COUNT >= WARN_TOOLS )) || (( MINUTES >= WARN_MINUTES )); then
  touch "$SENTINEL"
  cat <<EOF >&2
[session-size-warning] This session has reached ${TOOL_COUNT} tool uses and ${MINUTES} minutes.
Consider proposing a handoff (circuit:handoff save) before the next distinct subtask rather than continuing to grow this session.
The user's next prompt may belong in a fresh session with a clean context window.
EOF
fi

exit 0
