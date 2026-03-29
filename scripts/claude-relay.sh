#!/bin/bash
# claude-relay.sh — Self-rebooting Claude Code sessions with handoff continuity
#
# Usage:
#   claude-relay "Build the authentication system for my Next.js app"
#   claude-relay --budget 1.50 "Refactor the database layer"
#   claude-relay --max-sessions 5 "Add tests to the API routes"
#   claude-relay --resume  # Pick up from the last handoff
#   claude-relay --dry-run "Test prompt"  # Show what would happen without running
#
# How it works:
#   1. Runs claude -p with your task and a budget cap
#   2. Claude works autonomously, writing a handoff file as it goes
#   3. When the session ends (budget hit or work done), the script checks for a handoff
#   4. If a handoff exists, a new session starts with the handoff as context
#   5. Rinse and repeat until work is complete or max sessions reached
#
# The handoff file acts as a "baton" passed between sessions.
# Each session reads the previous handoff, does work, and writes an updated one.

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
HANDOFF_DIR="$HOME/.claude/handoffs"
RELAY_LOG="$HANDOFF_DIR/relay.log"
BUDGET="${CLAUDE_RELAY_BUDGET:-2.00}"
MAX_SESSIONS="${CLAUDE_RELAY_MAX_SESSIONS:-10}"
PERMISSION_MODE="${CLAUDE_RELAY_PERMISSION_MODE:-default}"
MODEL="${CLAUDE_RELAY_MODEL:-}"
DRY_RUN=false
RESUME=false
VERBOSE=false

# ── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
${BOLD}claude-relay${NC} — Self-rebooting Claude Code sessions

${BOLD}USAGE:${NC}
  claude-relay [OPTIONS] "Your task description"
  claude-relay --resume

${BOLD}OPTIONS:${NC}
  --budget <USD>        Max spend per session (default: \$${BUDGET})
  --max-sessions <N>    Max number of relay sessions (default: ${MAX_SESSIONS})
  --permission-mode <M> Permission mode: default, auto, plan (default: ${PERMISSION_MODE})
  --model <model>       Model to use (default: whatever claude uses)
  --resume              Resume from the last handoff file
  --dry-run             Show what would be executed without running
  --verbose             Show full claude output (default: summary only)
  --clean               Remove all handoff files and start fresh
  -h, --help            Show this help

${BOLD}ENVIRONMENT VARIABLES:${NC}
  CLAUDE_RELAY_BUDGET             Default budget per session
  CLAUDE_RELAY_MAX_SESSIONS       Default max sessions
  CLAUDE_RELAY_PERMISSION_MODE    Default permission mode
  CLAUDE_RELAY_MODEL              Default model

${BOLD}EXAMPLES:${NC}
  claude-relay "Build auth system with Clerk for my Next.js app"
  claude-relay --budget 3.00 --max-sessions 20 "Full test coverage for API"
  claude-relay --permission-mode auto "Refactor database layer"
  claude-relay --resume
EOF
  exit 0
}

log() {
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${DIM}[$ts]${NC} $1"
  echo "[$ts] $(echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g')" >> "$RELAY_LOG"
}

banner() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}Claude Relay${NC} — Session $1 of $MAX_SESSIONS            ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}  ${DIM}Budget: \$$BUDGET per session${NC}                         ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ── Parse Arguments ────────────────────────────────────────────────────────
TASK=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --budget)     BUDGET="$2"; shift 2 ;;
    --max-sessions) MAX_SESSIONS="$2"; shift 2 ;;
    --permission-mode) PERMISSION_MODE="$2"; shift 2 ;;
    --model)      MODEL="$2"; shift 2 ;;
    --resume)     RESUME=true; shift ;;
    --dry-run)    DRY_RUN=true; shift ;;
    --verbose)    VERBOSE=true; shift ;;
    --clean)
      rm -rf "$HANDOFF_DIR"
      echo -e "${GREEN}Cleaned handoff directory${NC}"
      exit 0
      ;;
    -h|--help)    usage ;;
    -*)           echo -e "${RED}Unknown option: $1${NC}"; usage ;;
    *)            TASK="$1"; shift ;;
  esac
done

# ── Setup ──────────────────────────────────────────────────────────────────
mkdir -p "$HANDOFF_DIR"

HANDOFF_FILE="$HANDOFF_DIR/handoff.md"
SESSION_LOG_DIR="$HANDOFF_DIR/sessions"
mkdir -p "$SESSION_LOG_DIR"

# ── Resume mode ────────────────────────────────────────────────────────────
if [ "$RESUME" = true ]; then
  if [ ! -f "$HANDOFF_FILE" ]; then
    echo -e "${RED}No handoff file found at $HANDOFF_FILE${NC}"
    echo "Run a relay session first, or provide a task."
    exit 1
  fi
  TASK="$(cat "$HANDOFF_FILE")"
  log "${YELLOW}Resuming from existing handoff${NC}"
fi

if [ -z "$TASK" ]; then
  echo -e "${RED}No task provided.${NC} Usage: claude-relay \"Your task here\""
  echo "Or use --resume to continue from a previous handoff."
  exit 1
fi

# ── Handoff instruction injected into every session ────────────────────────
HANDOFF_INSTRUCTION="

---
## SESSION CONTINUITY PROTOCOL

You are running inside claude-relay, an auto-rebooting session system.
Your session has a budget cap of \$$BUDGET. When you approach the limit, the session
will end and a NEW session will start from your handoff document.

**You MUST maintain a handoff file** at: $HANDOFF_FILE

### Handoff file requirements:
1. **Update it frequently** — after completing each significant step
2. **Structure it clearly** with these sections:
   - ## Original Task — what was asked
   - ## Completed Work — what's done (with file paths and specific changes)
   - ## Current State — where things stand right now
   - ## Next Steps — exactly what to do next, in order
   - ## Key Decisions — important choices made and why
   - ## Gotchas — anything the next session needs to watch out for
3. **Be specific** — file paths, function names, exact commands
4. **Write it for a fresh Claude** that has zero context about prior work

### When your work is fully complete:
- Write RELAY_COMPLETE on its own line at the end of the handoff file
- This signals the relay to stop spawning new sessions

### Important:
- Do NOT assume the next session will have any memory of this session
- The handoff file is the ONLY communication channel between sessions
- Write it as if briefing a colleague who just joined the project
---"

# ── Main Relay Loop ────────────────────────────────────────────────────────
SESSION=1
ORIGINAL_TASK="$TASK"

while [ "$SESSION" -le "$MAX_SESSIONS" ]; do
  banner "$SESSION"

  # Build the prompt
  if [ "$SESSION" -eq 1 ] && [ "$RESUME" != true ]; then
    PROMPT="${TASK}${HANDOFF_INSTRUCTION}"
  else
    PROMPT="You are continuing work from a previous session. Here is the handoff document:

${TASK}${HANDOFF_INSTRUCTION}

Pick up EXACTLY where the previous session left off. Check the 'Next Steps' section
and continue from there. Do NOT redo completed work."
  fi

  # Build claude command
  CMD=(claude -p --max-budget-usd "$BUDGET" --permission-mode "$PERMISSION_MODE")
  if [ -n "$MODEL" ]; then
    CMD+=(--model "$MODEL")
  fi

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
    echo -e "  ${DIM}${CMD[*]}${NC}"
    echo -e "  ${DIM}Prompt length: $(echo -n "$PROMPT" | wc -c | tr -d ' ') chars${NC}"
    echo ""
    echo -e "${BOLD}Prompt preview (first 500 chars):${NC}"
    echo "$PROMPT" | head -c 500
    echo ""
    exit 0
  fi

  log "${BLUE}Starting session $SESSION${NC}"
  log "${DIM}Budget: \$$BUDGET | Mode: $PERMISSION_MODE${NC}"

  # Run claude and capture output
  SESSION_OUTPUT_FILE="$SESSION_LOG_DIR/session-${SESSION}-$(date +%s).log"
  START_TIME=$(date +%s)

  set +e
  if [ "$VERBOSE" = true ]; then
    echo "$PROMPT" | "${CMD[@]}" 2>&1 | tee "$SESSION_OUTPUT_FILE"
    EXIT_CODE=${PIPESTATUS[1]}
  else
    echo "$PROMPT" | "${CMD[@]}" > "$SESSION_OUTPUT_FILE" 2>&1
    EXIT_CODE=$?
  fi
  set -e

  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))

  log "${DIM}Session $SESSION finished in ${DURATION}s (exit code: $EXIT_CODE)${NC}"

  # Show session summary if not verbose
  if [ "$VERBOSE" != true ]; then
    LINES=$(wc -l < "$SESSION_OUTPUT_FILE" | tr -d ' ')
    echo -e "${DIM}Session output: $LINES lines → $SESSION_OUTPUT_FILE${NC}"

    # Show last 10 lines as summary
    echo -e "${DIM}─── Last 10 lines ───${NC}"
    tail -10 "$SESSION_OUTPUT_FILE"
    echo -e "${DIM}─────────────────────${NC}"
  fi

  # Check for completion signal
  if [ -f "$HANDOFF_FILE" ] && grep -q "RELAY_COMPLETE" "$HANDOFF_FILE" 2>/dev/null; then
    log "${GREEN}${BOLD}Work complete! RELAY_COMPLETE signal received.${NC}"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ${BOLD}Relay finished after $SESSION session(s)${NC}               ${GREEN}║${NC}"
    echo -e "${GREEN}║  ${DIM}Total time: ${DURATION}s for this session${NC}               ${GREEN}║${NC}"
    echo -e "${GREEN}║  ${DIM}Handoff: $HANDOFF_FILE${NC}     ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    exit 0
  fi

  # Check if handoff exists for next session
  if [ -f "$HANDOFF_FILE" ]; then
    TASK="$(cat "$HANDOFF_FILE")"
    log "${YELLOW}Handoff found — relaying to session $((SESSION + 1))${NC}"
    echo ""
  else
    log "${RED}No handoff file generated. Session may have completed or failed.${NC}"
    echo -e "${YELLOW}Check session output: $SESSION_OUTPUT_FILE${NC}"
    echo -e "${YELLOW}If work is incomplete, re-run with: claude-relay --resume${NC}"
    exit 1
  fi

  SESSION=$((SESSION + 1))

  # Brief pause between sessions to avoid rate limits
  if [ "$SESSION" -le "$MAX_SESSIONS" ]; then
    echo -e "${DIM}Starting next session in 3s...${NC}"
    sleep 3
  fi
done

log "${RED}Max sessions ($MAX_SESSIONS) reached. Work may be incomplete.${NC}"
echo -e "${YELLOW}Last handoff saved at: $HANDOFF_FILE${NC}"
echo -e "${YELLOW}Resume with: claude-relay --resume${NC}"
exit 2
