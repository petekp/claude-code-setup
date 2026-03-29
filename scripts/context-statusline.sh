#!/bin/bash
# context-statusline.sh — Shows context window usage in Claude Code status line
#
# Reads JSON from stdin (provided by Claude Code harness) and outputs
# a compact status string showing context usage percentage and warnings.
#
# Setup:
#   In ~/.claude/settings.json, set:
#   "preferences": { "statusline": "~/.claude/scripts/context-statusline.sh" }
#
# JSON fields available from harness:
#   - exceeds_200k_tokens (boolean)
#   - context_window.used_percentage (float 0-100)
#   - context_window.current_usage.input_tokens (int)
#   - context_window.current_usage.output_tokens (int)
#   - context_window.current_usage.cache_creation_input_tokens (int)
#   - context_window.current_usage.cache_read_input_tokens (int)
#   - model (string)
#   - session_id (string)

INPUT=$(cat)

# Extract fields with defaults
EXCEEDS=$(echo "$INPUT" | jq -r '.exceeds_200k_tokens // false' 2>/dev/null)
PCT=$(echo "$INPUT" | jq -r '.context_window.used_percentage // 0' 2>/dev/null)
INPUT_TOKENS=$(echo "$INPUT" | jq -r '.context_window.current_usage.input_tokens // 0' 2>/dev/null)
OUTPUT_TOKENS=$(echo "$INPUT" | jq -r '.context_window.current_usage.output_tokens // 0' 2>/dev/null)

# Format token count as human-readable (e.g., 150k, 1.2M)
format_tokens() {
  local tokens=$1
  if [ "$tokens" -ge 1000000 ]; then
    printf "%.1fM" "$(echo "scale=1; $tokens / 1000000" | bc 2>/dev/null || echo "?")"
  elif [ "$tokens" -ge 1000 ]; then
    printf "%.0fk" "$(echo "scale=0; $tokens / 1000" | bc 2>/dev/null || echo "?")"
  else
    echo "$tokens"
  fi
}

TOTAL=$((INPUT_TOKENS + OUTPUT_TOKENS))
TOTAL_FMT=$(format_tokens "$TOTAL")

# Build status string with progressive urgency
if [ "$EXCEEDS" = "true" ]; then
  # Critical — past 200k, should handoff soon
  echo "CTX: ${TOTAL_FMT} [$(printf '%.0f' "$PCT")%] RUN /handoff NOW"
elif [ "$(echo "$PCT > 75" | bc 2>/dev/null)" = "1" ]; then
  # Warning — getting close
  echo "CTX: ${TOTAL_FMT} [$(printf '%.0f' "$PCT")%] consider /handoff"
elif [ "$(echo "$PCT > 50" | bc 2>/dev/null)" = "1" ]; then
  # Moderate usage
  echo "CTX: ${TOTAL_FMT} [$(printf '%.0f' "$PCT")%]"
else
  # Normal
  echo "ctx: ${TOTAL_FMT} [$(printf '%.0f' "$PCT")%]"
fi
