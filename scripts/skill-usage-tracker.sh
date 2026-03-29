#!/bin/bash
#
# skill-usage-tracker.sh — PostToolUse hook for tracking skill invocations
#
# This hook fires after the Skill tool is used. It extracts the skill name
# from the tool input and logs it to ~/.claude/skill-usage.jsonl.
#
# Hook config (settings.json):
#   "PostToolUse": [
#     {
#       "matcher": "Skill",
#       "hooks": [
#         {
#           "type": "command",
#           "command": "~/.claude/scripts/skill-usage-tracker.sh"
#         }
#       ]
#     }
#   ]

USAGE_LOG="$HOME/.claude/skill-usage.jsonl"
REPO_DIR="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"
SKILL_MANAGER="$REPO_DIR/scripts/skill-manager.sh"

# Read hook input from stdin (JSON with tool_input)
input=$(cat)

# Extract skill name from the hook input
# The Skill tool input looks like: {"skill": "skill-name", "args": "..."}
skill_name=$(echo "$input" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    # Hook input has tool_input as a nested object or string
    tool_input = data.get('tool_input', data)
    if isinstance(tool_input, str):
        tool_input = json.loads(tool_input)
    print(tool_input.get('skill', ''))
except:
    pass
" 2>/dev/null)

if [[ -z "$skill_name" ]]; then
    exit 0
fi

# Log the invocation
timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
project="${SESSION_CWD:-$PWD}"

mkdir -p "$(dirname "$USAGE_LOG")"
python3 -c "
import json, sys
json.dump({'skill': sys.argv[1], 'ts': sys.argv[2], 'project': sys.argv[3]}, sys.stdout)
" "$skill_name" "$timestamp" "$project" >> "$USAGE_LOG"
echo "" >> "$USAGE_LOG"
