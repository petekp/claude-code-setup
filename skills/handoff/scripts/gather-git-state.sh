#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Not a git repository\n'
  exit 0
fi

working_dir="$PWD"
repo_root="$(git rev-parse --show-toplevel)"
branch="$(git branch --show-current 2>/dev/null || true)"
if [ -z "$branch" ]; then
  branch="detached HEAD"
fi

printf 'Working directory: %s\n' "$working_dir"
printf 'Repository root: %s\n' "$repo_root"
printf 'Branch: %s\n' "$branch"

if upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null)"; then
  ahead_behind="$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null || true)"
  if [ -n "$ahead_behind" ]; then
    behind="${ahead_behind%%$'\t'*}"
    ahead="${ahead_behind##*$'\t'}"
    printf 'Upstream: %s\n' "$upstream"
    printf 'Ahead/behind: %s ahead, %s behind\n' "$ahead" "$behind"
  fi
fi

printf '\nRecent commits:\n'
git log --oneline -5 2>/dev/null || true

status="$(git status --short)"
printf '\nWorking tree changes:\n'
if [ -n "$status" ]; then
  printf '%s\n' "$status"
else
  printf 'clean\n'
fi
