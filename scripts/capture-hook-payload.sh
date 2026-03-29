#!/bin/bash
# Temporary hook to capture raw payload JSON from Claude Code hooks
# Writes each invocation to a timestamped file for inspection
#
# To use: Add this as a hook command for any event in settings.json
# To stop: Remove the hook entry and delete this file

CAPTURE_DIR="$HOME/.claude/hook-captures"
mkdir -p "$CAPTURE_DIR"

# Read stdin (the JSON payload)
PAYLOAD=$(cat)

# Write to timestamped file with event context
TIMESTAMP=$(date +%s%N)
EVENT_FILE="$CAPTURE_DIR/${TIMESTAMP}.json"

echo "$PAYLOAD" | jq '.' > "$EVENT_FILE" 2>/dev/null || echo "$PAYLOAD" > "$EVENT_FILE"

# Also append a summary line to a log for quick scanning
echo "$PAYLOAD" | jq -c '{
  ts: now | todate,
  event: (.hook_event // .event // "unknown"),
  has_tokens: (has("input_tokens") or has("total_tokens") or has("usage") or has("context_window")),
  keys: (keys | join(","))
}' >> "$CAPTURE_DIR/summary.jsonl" 2>/dev/null
