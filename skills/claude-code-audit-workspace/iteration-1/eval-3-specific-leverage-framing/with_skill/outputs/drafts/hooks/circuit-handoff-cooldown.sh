#!/usr/bin/env bash
# circuit-handoff-cooldown.sh
# Stop-hook wrapper that suppresses the circuit:handoff continuity nag
# when changes are below threshold — avoids training Claude to save
# continuity on every single-commit edit.
#
# Install: place at ~/.claude/hooks/circuit-handoff-cooldown.sh, chmod +x,
# then update your Stop hook in settings.json to call this wrapper BEFORE
# the circuit-engine continuity-guard call. See drafts/settings-diff.md.
#
# Exits 0 (nag allowed) only when one of:
#   - HEAD has advanced more than N commits since last continuity base_commit
#   - More than M minutes have passed since last continuity record
#   - HEAD is on a named merge commit (parents > 1)
# Otherwise exits 78 (EX_CONFIG) which your Stop hook treats as "skip nag".

set -euo pipefail

# --- tunables ---
COMMIT_THRESHOLD="${CIRCUIT_HANDOFF_COMMIT_THRESHOLD:-3}"
MINUTE_THRESHOLD="${CIRCUIT_HANDOFF_MINUTE_THRESHOLD:-20}"

cwd="$(pwd)"
continuity_dir="${cwd}/.circuit/control-plane/continuity-records"

# No continuity records at all -> allow nag (new project)
if [[ ! -d "$continuity_dir" ]]; then
  exit 0
fi

# Find the most recent continuity record by mtime
last_record="$(ls -t "$continuity_dir"/continuity-*.json 2>/dev/null | head -n1 || true)"
if [[ -z "$last_record" ]]; then
  exit 0
fi

# Extract base_commit and created_at via jq (fallback to python if jq absent)
if command -v jq >/dev/null 2>&1; then
  base_commit="$(jq -r '.git.base_commit // empty' "$last_record")"
  created_at="$(jq -r '.created_at // empty' "$last_record")"
else
  base_commit="$(python3 -c "import json,sys; d=json.load(open('$last_record')); print(d.get('git',{}).get('base_commit',''))")"
  created_at="$(python3 -c "import json,sys; d=json.load(open('$last_record')); print(d.get('created_at',''))")"
fi

# --- merge commit check (always allow nag on merges) ---
parents_count="$(git show --no-patch --format='%P' HEAD 2>/dev/null | wc -w | tr -d ' ')"
if [[ "$parents_count" -gt 1 ]]; then
  exit 0
fi

# --- commit-threshold check ---
if [[ -n "$base_commit" ]]; then
  advance="$(git rev-list --count "${base_commit}..HEAD" 2>/dev/null || echo 0)"
  if [[ "$advance" -gt "$COMMIT_THRESHOLD" ]]; then
    exit 0
  fi
else
  # No base_commit -> allow nag
  exit 0
fi

# --- time-threshold check ---
if [[ -n "$created_at" ]]; then
  # Parse ISO8601 created_at into epoch seconds; fall back to stat
  if command -v python3 >/dev/null 2>&1; then
    last_epoch="$(python3 -c "from datetime import datetime; import sys; t='$created_at'.rstrip('Z'); print(int(datetime.fromisoformat(t).timestamp()))" 2>/dev/null || stat -f %m "$last_record")"
  else
    last_epoch="$(stat -f %m "$last_record")"
  fi
  now_epoch="$(date +%s)"
  age_min=$(( (now_epoch - last_epoch) / 60 ))
  if [[ "$age_min" -gt "$MINUTE_THRESHOLD" ]]; then
    exit 0
  fi
fi

# All checks below threshold -> suppress nag
exit 78
