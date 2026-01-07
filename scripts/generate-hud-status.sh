#!/bin/bash

# Claude HUD Status Generator
# This script is called by a Stop hook to generate project status
# Runs status generation in background for instant hook response

# Read hook input from stdin
input=$(cat)

# Parse fields
cwd=$(echo "$input" | jq -r '.cwd // empty')
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty')
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')

# Prevent infinite loops - if we're already in a stop hook, exit
if [ "$stop_hook_active" = "true" ]; then
  echo '{"ok": true}'
  exit 0
fi

# Validate inputs
if [ -z "$cwd" ] || [ -z "$transcript_path" ]; then
  echo '{"ok": true}'
  exit 0
fi

# Check transcript exists
if [ ! -f "$transcript_path" ]; then
  echo '{"ok": true}'
  exit 0
fi

# Return success immediately, then generate status in background
echo '{"ok": true}'

# Run status generation in background (detached from terminal)
(
  # Ensure .claude directory exists in project
  mkdir -p "$cwd/.claude"

  # Extract recent context from transcript (last 100 lines, filter for user/assistant)
  context=$(tail -100 "$transcript_path" | grep -E '"type":"(user|assistant)"' | tail -20)

  if [ -z "$context" ]; then
    exit 0
  fi

  # Call Claude CLI to generate status (--no-session-persistence prevents creating sessions)
  response=$(/opt/homebrew/bin/claude -p \
    --no-session-persistence \
    --output-format json \
    --model haiku \
    "Summarize this coding session as JSON with fields: working_on (string), next_step (string), status (in_progress/blocked/needs_review/paused/done), blocker (string or null). Context: $context" 2>/dev/null)

  # Validate we got valid JSON back
  if ! echo "$response" | jq -e . >/dev/null 2>&1; then
    exit 0
  fi

  # Extract the result field which contains Claude's response
  result_text=$(echo "$response" | jq -r '.result // empty')

  if [ -z "$result_text" ]; then
    exit 0
  fi

  # Try to extract JSON from the result (may be wrapped in markdown code block)
  status=$(echo "$result_text" | jq -e . 2>/dev/null)

  if [ -z "$status" ] || [ "$status" = "null" ]; then
    status=$(echo "$result_text" | sed -n '/^```json/,/^```$/p' | sed '1d;$d' | jq -e . 2>/dev/null)
  fi

  if [ -z "$status" ] || [ "$status" = "null" ]; then
    status=$(echo "$result_text" | sed -n '/^```/,/^```$/p' | sed '1d;$d' | jq -e . 2>/dev/null)
  fi

  if [ -z "$status" ] || [ "$status" = "null" ]; then
    exit 0
  fi

  # Add timestamp
  status=$(echo "$status" | jq --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '. + {updated_at: $ts}')

  # Write status file
  echo "$status" > "$cwd/.claude/hud-status.json"

) &>/dev/null &

# Detach background process
disown 2>/dev/null

exit 0
