#!/bin/bash
# token-watchdog.sh — Monitors context window usage via hook payloads
#
# Dual-mode:
#   1. UserPromptSubmit — emits JSON envelope with additionalContext that Claude
#      sees at the start of its next turn. This is the primary trigger.
#   2. Stop / PostToolUse / TaskCompleted — emits plain-text advisory (legacy).
#
# When threshold is crossed and the cwd is a Circuit project (has .circuit/),
# the advisory instructs Claude to run `/circuit:handoff save` before replying.
# Otherwise it falls back to the generic handoff.md flow.
#
# Thresholds (env-tunable):
#   CLAUDE_TOKEN_WARN_THRESHOLD — soft warning (default: 180000)
#   CLAUDE_TOKEN_HANDOFF_THRESHOLD — strong action (default: 200000)
#
# State dir: $HOME/.claude/token-watchdog/<session>.{warned,handoff-advised}

set -euo pipefail

WARN_THRESHOLD="${CLAUDE_TOKEN_WARN_THRESHOLD:-180000}"
HANDOFF_THRESHOLD="${CLAUDE_TOKEN_HANDOFF_THRESHOLD:-200000}"
HANDOFF_DIR="$HOME/.claude/handoffs"
STATE_DIR="$HOME/.claude/token-watchdog"

mkdir -p "$STATE_DIR" "$HANDOFF_DIR"

PAYLOAD=$(cat)

SESSION_ID=$(printf '%s' "$PAYLOAD" | jq -r '.session_id // empty' 2>/dev/null || true)
TRANSCRIPT=$(printf '%s' "$PAYLOAD" | jq -r '.transcript_path // empty' 2>/dev/null || true)
HOOK_EVENT=$(printf '%s' "$PAYLOAD" | jq -r '.hook_event_name // empty' 2>/dev/null || true)
CWD=$(printf '%s' "$PAYLOAD" | jq -r '.cwd // empty' 2>/dev/null || true)

if [ -z "${SESSION_ID:-}" ] || [ -z "${TRANSCRIPT:-}" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

if [ -z "${CWD:-}" ]; then
  CWD="$PWD"
fi

IS_CIRCUIT="no"
if [ -d "$CWD/.circuit" ]; then
  IS_CIRCUIT="yes"
fi

WARNED_FILE="$STATE_DIR/${SESSION_ID}.warned"
HANDOFF_FILE_MARKER="$STATE_DIR/${SESSION_ID}.handoff-advised"

CONTEXT_TOKENS=$(TRANSCRIPT_PATH="$TRANSCRIPT" python3 -c '
import json, os, sys

last_usage = None
path = os.environ["TRANSCRIPT_PATH"]

try:
    with open(path) as f:
        for line in f:
            try:
                d = json.loads(line.strip())
                if d.get("type") == "assistant":
                    msg = d.get("message", {})
                    if isinstance(msg, dict) and msg.get("usage"):
                        last_usage = msg["usage"]
            except Exception:
                pass
    if last_usage:
        ctx = (last_usage.get("input_tokens", 0)
               + last_usage.get("cache_creation_input_tokens", 0)
               + last_usage.get("cache_read_input_tokens", 0))
        print(ctx)
    else:
        print(0)
except Exception:
    print(0)
' 2>/dev/null || echo 0)

CONTEXT_TOKENS="${CONTEXT_TOKENS:-0}"

# ── Message builders (heredocs live in functions, never inside $() ) ──────

body_handoff_circuit() {
  local ctx_k="$1" thresh_k="$2"
  cat <<MSG
# Context Guard — handoff threshold reached

Context window is at ~${ctx_k}k tokens (threshold: ${thresh_k}k).

Before responding to the user's prompt, take these actions in order:

1. Invoke the \`/circuit:handoff\` skill with \`save\` to persist continuity through Circuit's control plane. This captures the current run pointer, workflow state, lane, pending checkpoints, and any open artifacts into a continuity record under \`.circuit/control-plane/continuity-records/\`.

2. Tell the user exactly this: "Context at ${ctx_k}k tokens. Circuit handoff saved — safe to /clear now. In the next thread, I will auto-resume from the continuity record, or you can run /circuit:run continue or /circuit:handoff resume explicitly."

3. Do NOT proceed with the user's current prompt until the handoff save completes. If the prompt is substantive work, it should land in the next thread with fresh context, not here.

The Circuit continuity record is richer than a generic handoff file and integrates with any active workflow run, so prefer it over writing handoff.md directly when inside a Circuit project.
MSG
}

body_handoff_generic() {
  local ctx_k="$1" thresh_k="$2" handoff_dir="$3"
  cat <<MSG
# Context Guard — handoff threshold reached

Context window is at ~${ctx_k}k tokens (threshold: ${thresh_k}k).

Before responding to the user's prompt, write a comprehensive handoff to ${handoff_dir}/handoff.md with these sections:
- Original Task — what the user asked for
- Completed Work — what is done (file paths, specific changes)
- Current State — where things stand right now
- Next Steps — exactly what to do next, in order
- Key Decisions — choices made and why
- Gotchas — anything to watch out for

Then tell the user: "Context at ${ctx_k}k tokens. Handoff saved to ${handoff_dir}/handoff.md. Type /clear to reset — the SessionStart hook will re-inject the handoff so I pick up where I left off."

The SessionStart hook (inject-handoff-on-restart.sh) re-injects this document after /clear, so continuity is preserved across the thread boundary.
MSG
}

body_warn_circuit() {
  local ctx_k="$1" thresh_k="$2" handoff_k="$3"
  cat <<MSG
# Context Guard — soft warning

Context at ~${ctx_k}k tokens (warn: ${thresh_k}k, handoff: ${handoff_k}k).

You are approaching the handoff threshold. Finish the current slice, then plan to invoke /circuit:handoff save before the next substantive request. If the user submits a large new task, start the response by running the handoff first so the new work begins in a fresh thread.
MSG
}

body_warn_generic() {
  local ctx_k="$1" thresh_k="$2" handoff_k="$3" handoff_dir="$4"
  cat <<MSG
# Context Guard — soft warning

Context at ~${ctx_k}k tokens (warn: ${thresh_k}k, handoff: ${handoff_k}k).

Finish the current action cleanly. Consider writing progress notes to ${handoff_dir}/handoff.md before the next large request so a /clear is safe.
MSG
}

emit_message() {
  local body="$1"
  if [ "$HOOK_EVENT" = "UserPromptSubmit" ]; then
    jq -n --arg body "$body" '{
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: $body
      }
    }'
  else
    printf '%s\n' "$body"
  fi
}

CTX_K=$((CONTEXT_TOKENS / 1000))

if [ "$CONTEXT_TOKENS" -ge "$HANDOFF_THRESHOLD" ] && [ ! -f "$HANDOFF_FILE_MARKER" ]; then
  touch "$HANDOFF_FILE_MARKER"
  THRESH_K=$((HANDOFF_THRESHOLD / 1000))
  if [ "$IS_CIRCUIT" = "yes" ]; then
    BODY="$(body_handoff_circuit "$CTX_K" "$THRESH_K")"
  else
    BODY="$(body_handoff_generic "$CTX_K" "$THRESH_K" "$HANDOFF_DIR")"
  fi
  emit_message "$BODY"
elif [ "$CONTEXT_TOKENS" -ge "$WARN_THRESHOLD" ] && [ ! -f "$WARNED_FILE" ]; then
  touch "$WARNED_FILE"
  THRESH_K=$((WARN_THRESHOLD / 1000))
  HANDOFF_K=$((HANDOFF_THRESHOLD / 1000))
  if [ "$IS_CIRCUIT" = "yes" ]; then
    BODY="$(body_warn_circuit "$CTX_K" "$THRESH_K" "$HANDOFF_K")"
  else
    BODY="$(body_warn_generic "$CTX_K" "$THRESH_K" "$HANDOFF_K" "$HANDOFF_DIR")"
  fi
  emit_message "$BODY"
fi

exit 0
