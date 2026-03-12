#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  printf 'Usage: %s <file>\n' "$0" >&2
  exit 1
fi

file="$1"

if [ ! -f "$file" ]; then
  printf 'File not found: %s\n' "$file" >&2
  exit 1
fi

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$file"
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < "$file"
elif command -v xsel >/dev/null 2>&1; then
  xsel --clipboard --input < "$file"
elif command -v clip.exe >/dev/null 2>&1; then
  clip.exe < "$file"
else
  printf 'No clipboard command found. Prompt is still available at: %s\n' "$file"
  exit 0
fi

printf 'Copied %s to clipboard\n' "$file"
