#!/bin/bash
# token-watchdog.sh — Monitors context window usage via hook payloads
#
# Called by Claude Code hooks (TaskCompleted, Stop, PostToolUse).
# Reads the session transcript to compute current context window size.
# When threshold is exceeded, returns advisory text that Claude sees.
#
# The hook output appears as "additionalContext" in Claude's next turn,
# effectively nudging Claude to create a handoff document.

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
# Threshold in tokens at which to warn (default: 200000)
WARN_THRESHOLD="${CLAUDE_TOKEN_WARN_THRESHOLD:-200000}"
# Threshold at which to strongly advise handoff (default: 300000)
HANDOFF_THRESHOLD="${CLAUDE_TOKEN_HANDOFF_THRESHOLD:-300000}"
# Where to write the handoff
HANDOFF_DIR="$HOME/.claude/handoffs"
# State file to avoid repeated warnings
STATE_DIR="$HOME/.claude/token-watchdog"

mkdir -p "$STATE_DIR" "$HANDOFF_DIR"

# ── Read hook payload from stdin ───────────────────────────────────────────
PAYLOAD=$(cat)

SESSION_ID=$(echo "$PAYLOAD" | jq -r '.session_id // empty' 2>/dev/null)
TRANSCRIPT=$(echo "$PAYLOAD" | jq -r '.transcript_path // empty' 2>/dev/null)

# Exit silently if we don't have what we need
if [ -z "$SESSION_ID" ] || [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

# ── Check if we already warned for this session ───────────────────────────
WARNED_FILE="$STATE_DIR/${SESSION_ID}.warned"
HANDOFF_FILE="$STATE_DIR/${SESSION_ID}.handoff-advised"

# ── Compute current context window from last assistant message ─────────────
CONTEXT_TOKENS=$(python3 -c "
import json, sys

last_usage = None
transcript_path = '$TRANSCRIPT'

try:
    with open(transcript_path) as f:
        for line in f:
            try:
                d = json.loads(line.strip())
                if d.get('type') == 'assistant':
                    msg = d.get('message', {})
                    if isinstance(msg, dict) and msg.get('usage'):
                        last_usage = msg['usage']
            except:
                pass

    if last_usage:
        ctx = (last_usage.get('input_tokens', 0)
               + last_usage.get('cache_creation_input_tokens', 0)
               + last_usage.get('cache_read_input_tokens', 0))
        print(ctx)
    else:
        print(0)
except Exception as e:
    print(0, file=sys.stderr)
    print(0)
" 2>/dev/null)

# Default to 0 if computation failed
CONTEXT_TOKENS="${CONTEXT_TOKENS:-0}"

# ── Evaluate thresholds and output advisory ────────────────────────────────
if [ "$CONTEXT_TOKENS" -ge "$HANDOFF_THRESHOLD" ] && [ ! -f "$HANDOFF_FILE" ]; then
  # Critical — past handoff threshold
  touch "$HANDOFF_FILE"

  # Format for human readability
  CTX_K=$((CONTEXT_TOKENS / 1000))
  THRESH_K=$((HANDOFF_THRESHOLD / 1000))

  cat <<EOF
[TOKEN WATCHDOG] Context window is at ${CTX_K}k tokens (threshold: ${THRESH_K}k).

ACTION REQUIRED — Complete these steps IN ORDER:

1. WRITE a comprehensive handoff document to: ${HANDOFF_DIR}/handoff.md
   Include these sections:
   - ## Original Task — what the user asked for
   - ## Completed Work — what's done (file paths, specific changes)
   - ## Current State — where things stand right now
   - ## Next Steps — exactly what to do next, in order
   - ## Key Decisions — choices made and why
   - ## Gotchas — anything to watch out for

2. TELL the user: "Context is at ${CTX_K}k tokens. I've saved a handoff. Type /clear to reset context — I'll automatically pick up where I left off."

The SessionStart hook will re-inject the handoff after /clear, so continuity is preserved.
If all work is complete, write RELAY_COMPLETE at the end of the handoff file.
EOF

elif [ "$CONTEXT_TOKENS" -ge "$WARN_THRESHOLD" ] && [ ! -f "$WARNED_FILE" ]; then
  # Warning — approaching limit
  touch "$WARNED_FILE"

  CTX_K=$((CONTEXT_TOKENS / 1000))
  THRESH_K=$((WARN_THRESHOLD / 1000))

  cat <<EOF
[TOKEN WATCHDOG] Context window is at ${CTX_K}k tokens (warn threshold: ${THRESH_K}k).

Consider running /handoff soon to save progress. Context will be compacted when it gets larger.
You can also write progress notes to: ${HANDOFF_DIR}/handoff.md
EOF

fi
# Below thresholds: output nothing (hook is silent)
