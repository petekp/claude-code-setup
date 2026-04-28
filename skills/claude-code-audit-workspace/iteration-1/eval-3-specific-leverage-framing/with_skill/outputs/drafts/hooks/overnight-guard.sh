#!/usr/bin/env bash
# overnight-guard.sh
# SessionStart:resume hook that detects an in-progress overnight run
# and re-injects the overnight-autonomy contract header.
#
# Install: place at ~/.claude/hooks/overnight-guard.sh, chmod +x,
# then register in settings.json under hooks.SessionStart.resume.
#
# An "overnight run" is marked by a sentinel file:
#   <project-root>/.claude/overnight-logs/<YYYY-MM-DD>-session.md
# with a header line matching "# Overnight session" (case-insensitive).
# If found AND the file's mtime is within the last 18 hours, the hook
# emits the contract header to stdout so Claude re-adopts it at turn 1.

set -euo pipefail

cwd="$(pwd)"
today="$(date +%Y-%m-%d)"
yesterday="$(date -v-1d +%Y-%m-%d 2>/dev/null || date --date='1 day ago' +%Y-%m-%d)"

log_dir="${cwd}/.claude/overnight-logs"
today_log="${log_dir}/${today}-session.md"
yesterday_log="${log_dir}/${yesterday}-session.md"

for log in "$today_log" "$yesterday_log"; do
  if [[ -f "$log" ]]; then
    mtime_epoch="$(stat -f %m "$log" 2>/dev/null || stat -c %Y "$log")"
    now_epoch="$(date +%s)"
    age_h=$(( (now_epoch - mtime_epoch) / 3600 ))
    if [[ "$age_h" -lt 18 ]]; then
      if head -n 3 "$log" | grep -iq "^# Overnight session"; then
        cat <<EOT
[overnight-guard] Resumed overnight session detected (log: ${log}, age: ${age_h}h).
The overnight-autonomy contract is back in effect:
- TaskList upfront before any edit.
- Root-cause hypotheses (2+) before any fix.
- Amend-commit loop for in-flight work only.
- Max 3 additional Codex calls remaining (check morning log for used count).
- Morning log appended at ${log}.
- Never ask the user a question — log to "Open questions" and pick the most defensible option.
Stop only on genuine blocker or exhausted budget.
EOT
        exit 0
      fi
    fi
  fi
done

# No active overnight run detected; output nothing, exit clean
exit 0
