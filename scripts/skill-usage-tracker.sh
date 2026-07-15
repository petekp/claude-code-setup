#!/bin/bash
#
# skill-usage-tracker.sh — logs skill invocations to ~/.claude/skill-usage.jsonl
#
# Registered twice in settings.json:
#   PostToolUse (matcher "Skill") — model-initiated Skill tool calls → {"via": "tool"}
#   UserPromptSubmit              — user-typed /skill-name prompts   → {"via": "slash"}
#
# A typed slash command is expanded inline by the harness, so it never touches
# the Skill tool; without the UserPromptSubmit path, user-invoked skills are
# invisible to this log. Codex and cloud/web sessions never run local hooks,
# so their usage is still invisible — don't prune skills from this log alone.
#
# Must always exit 0 and print nothing to stdout: a UserPromptSubmit hook's
# stdout is injected into the conversation, and a nonzero exit blocks the
# prompt.

USAGE_LOG="${SKILL_USAGE_LOG:-$HOME/.claude/skill-usage.jsonl}"

input=$(cat)

entry=$(printf '%s' "$input" | python3 -c '
import sys, json, os, datetime

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

event = data.get("hook_event_name", "")
cwd = data.get("cwd") or os.environ.get("SESSION_CWD") or os.getcwd()


def is_known_skill(name):
    if ":" in name:
        return True  # plugin-qualified, e.g. /circuit:run
    candidates = [os.path.expanduser("~/.claude/skills")]
    if cwd:
        candidates.append(os.path.join(cwd, ".claude", "skills"))
    return any(os.path.isdir(os.path.join(base, name)) for base in candidates)


skill = ""
via = ""
if event == "UserPromptSubmit":
    prompt = (data.get("prompt") or "").strip()
    if prompt.startswith("/"):
        token = prompt.split(None, 1)[0][1:]
        if token and is_known_skill(token):
            skill, via = token, "slash"
else:
    tool_input = data.get("tool_input", data)
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except Exception:
            tool_input = {}
    if isinstance(tool_input, dict):
        name = tool_input.get("skill", "")
        if name:
            skill, via = name, "tool"

if not skill:
    sys.exit(0)

ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
print(json.dumps({"skill": skill, "ts": ts, "project": cwd, "via": via}))
' 2>/dev/null)

if [[ -n "$entry" ]]; then
    mkdir -p "$(dirname "$USAGE_LOG")"
    printf '%s\n' "$entry" >> "$USAGE_LOG"
fi

exit 0
