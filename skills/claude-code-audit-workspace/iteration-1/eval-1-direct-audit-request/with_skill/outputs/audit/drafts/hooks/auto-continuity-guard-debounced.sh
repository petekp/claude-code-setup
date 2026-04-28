#!/usr/bin/env bash
# auto-continuity-guard-debounced.sh
#
# Replacement for the existing Stop-hook auto-continuity guard that fires the
# "Auto-continuity guard: save before stopping" nag. The current implementation
# re-fires within the same session whenever the continuity record is >0s old,
# which produces 4-5 consecutive nags at end of long/overnight sessions and
# costs ~1KB of injected user-turn text per nag.
#
# This replacement adds:
#   1. Per-session debounce (default 600s between fires for the same session).
#   2. Autonomous-mode bypass (reads $AUTONOMOUS_MODE env or a marker file).
#   3. Nag-budget cap (max 2 nags per session ever).
#
# Installation:
#   1. Save this file to ~/.claude/scripts/auto-continuity-guard-debounced.sh
#   2. chmod +x ~/.claude/scripts/auto-continuity-guard-debounced.sh
#   3. In settings.json, replace the Stop-hook call (currently calls circuit-engine
#      directly via the /circuit:handoff skill) with this script.
#
# Behavior summary:
#   - Reads session id from $CLAUDE_SESSION_ID (or derives from cwd transcript path).
#   - Maintains state file at ~/.claude/cache/continuity-guard-state/<sid>.json
#     with fields: { last_nag_ts: int, nag_count: int }.
#   - Emits the guard nag to stdout only if the debounce + cap + mode checks pass.
#   - Otherwise exits 0 silently.

set -euo pipefail

DEBOUNCE_SECONDS="${CONTINUITY_GUARD_DEBOUNCE:-600}"
MAX_NAGS="${CONTINUITY_GUARD_MAX_NAGS:-2}"
STATE_DIR="${HOME}/.claude/cache/continuity-guard-state"

mkdir -p "$STATE_DIR"

session_id="${CLAUDE_SESSION_ID:-unknown}"
state_file="$STATE_DIR/${session_id}.json"

now="$(date +%s)"

# --- Autonomous mode bypass --------------------------------------------------
# If the user started the session with autonomous language, a small marker
# file is dropped by the autonomous-governor skill at session start. If present,
# we no-op entirely.
autonomous_marker="$STATE_DIR/${session_id}.autonomous"
if [[ -f "$autonomous_marker" ]]; then
    exit 0
fi

# Also support an env var that the user can export per-shell:
if [[ "${AUTONOMOUS_MODE:-}" == "1" ]]; then
    exit 0
fi

# --- Load state --------------------------------------------------------------
if [[ -f "$state_file" ]]; then
    last_nag_ts=$(jq -r '.last_nag_ts // 0' "$state_file" 2>/dev/null || echo 0)
    nag_count=$(jq -r '.nag_count // 0' "$state_file" 2>/dev/null || echo 0)
else
    last_nag_ts=0
    nag_count=0
fi

# --- Debounce check ----------------------------------------------------------
elapsed=$(( now - last_nag_ts ))
if (( elapsed < DEBOUNCE_SECONDS && last_nag_ts > 0 )); then
    # Too soon since last nag in this session. Skip.
    exit 0
fi

# --- Cap check ---------------------------------------------------------------
if (( nag_count >= MAX_NAGS )); then
    # Already nagged the max number of times this session. Claude got the message.
    exit 0
fi

# --- Actual continuity-state check (unchanged from original) -----------------
# Delegate to the project's own circuit-engine if present; otherwise no-op.
project_root="${CLAUDE_PROJECT_ROOT:-$(pwd)}"
circuit_bin="$project_root/.circuit/bin/circuit-engine"

if [[ ! -x "$circuit_bin" ]]; then
    # No circuit setup in this project; nothing to guard.
    exit 0
fi

# Let circuit-engine tell us if a save is warranted.
# Exit 0 with no stdout = nothing to say. Non-zero = emit the nag.
if guard_output="$("$circuit_bin" continuity guard-check 2>&1)"; then
    # Guard is satisfied; nothing to nag about.
    exit 0
fi

# --- Emit the nag (and update state) -----------------------------------------
cat <<EOF
Stop hook feedback:
Auto-continuity guard: $guard_output

Before this turn ends, invoke the \`circuit:handoff\` skill with \`save\` (or run
\`.circuit/bin/circuit-engine continuity save\` directly) to persist a continuity
record capturing this chunk of work. If there is genuinely no work worth
persisting, say so in one short sentence and return control.

(This guard will not re-fire for ${DEBOUNCE_SECONDS}s, and is capped at ${MAX_NAGS}
nags per session. Claude Code audit 2026-04: the previous implementation fired 4-5
times in a row at end of overnight sessions.)
EOF

# Update state.
new_count=$(( nag_count + 1 ))
cat > "$state_file" <<EOF_JSON
{"last_nag_ts": $now, "nag_count": $new_count}
EOF_JSON

exit 0
