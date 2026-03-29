#!/bin/bash
# auto-handoff-on-compact.sh — Extract handoff from transcript before compaction
#
# Fires on PreCompact. Reads the transcript JSONL and creates a structured
# handoff from raw conversation data. Saved to ~/.claude/handoffs/auto-handoff.md
# and re-injected by inject-handoff-on-restart.sh after compaction completes.

set -euo pipefail

HANDOFF_DIR="$HOME/.claude/handoffs"
mkdir -p "$HANDOFF_DIR"

PAYLOAD=$(cat)
TRANSCRIPT=$(echo "$PAYLOAD" | jq -r '.transcript_path // empty' 2>/dev/null)
SESSION_ID=$(echo "$PAYLOAD" | jq -r '.session_id // empty' 2>/dev/null)
CWD=$(echo "$PAYLOAD" | jq -r '.cwd // empty' 2>/dev/null)

if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

HANDOFF_FILE="$HANDOFF_DIR/auto-handoff.md"

TRANSCRIPT="$TRANSCRIPT" SESSION_ID="$SESSION_ID" CWD="$CWD" python3 << 'PYEOF' > "$HANDOFF_FILE"
import json, os
from datetime import datetime

transcript_path = os.environ["TRANSCRIPT"]
session_id = os.environ.get("SESSION_ID", "unknown")
cwd = os.environ.get("CWD", "unknown")

user_messages = []
assistant_texts = []
tool_calls = []
files_modified = []
last_usage = None

with open(transcript_path) as f:
    for line in f:
        try:
            d = json.loads(line.strip())
            t = d.get("type")

            if t == "user":
                msg = d.get("message", {})
                if isinstance(msg, dict):
                    content = msg.get("content", "")
                    if isinstance(content, str) and content.strip():
                        user_messages.append(content[:500])
                    elif isinstance(content, list):
                        for part in content:
                            if isinstance(part, dict) and part.get("type") == "text":
                                user_messages.append(part.get("text", "")[:500])
                    user_messages = user_messages[-5:]

            elif t == "assistant":
                msg = d.get("message", {})
                if not isinstance(msg, dict):
                    continue
                if msg.get("usage"):
                    last_usage = msg["usage"]
                for block in (msg.get("content") or []):
                    if not isinstance(block, dict):
                        continue
                    if block.get("type") == "tool_use":
                        name = block.get("name", "")
                        inp = block.get("input", {})
                        if name in ("Edit", "Write"):
                            fp = inp.get("file_path", "")
                            if fp and fp not in files_modified:
                                files_modified.append(fp)
                        label = name
                        if "file_path" in inp:
                            label += f": {inp['file_path']}"
                        elif "command" in inp:
                            label += f": {inp['command'][:150]}"
                        elif "pattern" in inp:
                            label += f": {inp['pattern']}"
                        tool_calls.append(label)
                        tool_calls = tool_calls[-15:]
                    elif block.get("type") == "text" and block.get("text", "").strip():
                        assistant_texts.append(block["text"][:300])
                        assistant_texts = assistant_texts[-3:]
        except:
            continue

ctx = 0
if last_usage:
    ctx = (last_usage.get("input_tokens", 0)
         + last_usage.get("cache_creation_input_tokens", 0)
         + last_usage.get("cache_read_input_tokens", 0))

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"# Auto-Generated Handoff\n")
print(f"- **Generated:** {now}")
print(f"- **Session:** {session_id}")
print(f"- **Working directory:** {cwd}")
print(f"- **Context at compaction:** ~{ctx:,} tokens\n")

print("## Recent User Requests\n")
for i, m in enumerate(user_messages, 1):
    print(f"{i}. {m.replace(chr(10), ' ').strip()[:300]}")

if files_modified:
    print("\n## Files Modified\n")
    for fp in files_modified[-20:]:
        print(f"- `{fp}`")

if tool_calls:
    print("\n## Recent Tool Activity\n")
    for tc in tool_calls[-10:]:
        print(f"- {tc}")

if assistant_texts:
    print("\n## Last Assistant Outputs\n")
    for s in assistant_texts:
        print(f"> {s.replace(chr(10), ' ').strip()[:200]}\n")

print("\n## Continuation Instructions\n")
print("This was auto-extracted from the transcript before compaction.")
print("Continue the user's most recent request. Check modified files for state.")
print("If ~/.claude/handoffs/handoff.md exists (Claude-written), prefer that.")
PYEOF
