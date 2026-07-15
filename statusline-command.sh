#!/bin/bash
exec 2>/dev/null

# Read JSON input from stdin
input=$(cat)

# Parse needed JSON fields once
parsed=$(printf '%s' "$input" | jq -r '[
  (.cwd // ""),
  ((.context_window.current_usage.input_tokens // 0)
   + (.context_window.current_usage.cache_creation_input_tokens // 0)
   + (.context_window.current_usage.cache_read_input_tokens // 0) | tostring),
  (.context_window.context_window_size // ""),
  (.transcript_path // "")
] | @tsv')

tab=$(printf '\t')
IFS="$tab" read -r cwd context_tokens window_size transcript_path <<EOF
$parsed
EOF

if [ -z "$cwd" ]; then
  cwd="$PWD"
fi

raw_context_tokens="$context_tokens"

case "$context_tokens" in
  ''|*[!0-9]*) context_tokens=0 ;;
esac

case "$window_size" in
  ''|*[!0-9]*) window_size="" ;;
esac

# Abbreviate home directory with ~
home="$HOME"
display_cwd="${cwd/#$home/~}"

# Build the status line
status=""

# Cache expensive git and process lookups for a short TTL
cache_file="/tmp/statusline-cache-$USER"
cache_ttl=2
cache_key=$(printf '%s' "$cwd" | cksum | awk '{ printf "%s-%s", $1, $2 }')
now=$(date +%s)

case "$now" in
  ''|*[!0-9]*) now=0 ;;
esac

cache_hit=0
cache_is_git=0
cache_branch=""
cache_changed=0
cache_proc_count=0

if [ -n "$cache_key" ] && [ -f "$cache_file" ]; then
  cache_line=$(awk -F '\t' -v key="$cache_key" -v now="$now" '$1 == key && $2 >= now { print; exit }' "$cache_file")

  if [ -n "$cache_line" ]; then
    IFS="$tab" read -r _ cache_expiry cache_is_git cache_branch cache_changed cache_proc_count <<EOF
$cache_line
EOF
    cache_hit=1
  fi
fi

if [ "$cache_hit" -eq 0 ]; then
  if git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null; then
    cache_is_git=1
    cache_branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD)
    cache_changed=$(git -C "$cwd" status --porcelain | wc -l | tr -d ' ')
  fi

  cache_proc_count=$(pgrep -f 'context7-mcp|playwright-mcp|mcp-remote.*deepwiki|figma-console-mcp|agentation-mcp|agent-browser.*daemon|app-server-broker|chrome-headless-shell' | wc -l | tr -d ' ')

  case "$cache_changed" in
    ''|*[!0-9]*) cache_changed=0 ;;
  esac

  case "$cache_proc_count" in
    ''|*[!0-9]*) cache_proc_count=0 ;;
  esac

  if [ -n "$cache_key" ]; then
    cache_expiry=$((now + cache_ttl))
    cache_tmp=$(mktemp "${cache_file}.XXXXXX")

    if [ -n "$cache_tmp" ]; then
      if [ -f "$cache_file" ]; then
        awk -F '\t' -v key="$cache_key" -v now="$now" '$1 != key && $2 >= now { print }' "$cache_file" > "$cache_tmp"
      else
        : > "$cache_tmp"
      fi

      printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
        "$cache_key" \
        "$cache_expiry" \
        "$cache_is_git" \
        "$cache_branch" \
        "$cache_changed" \
        "$cache_proc_count" >> "$cache_tmp"

      mv "$cache_tmp" "$cache_file"
    fi
  fi
fi

case "$cache_is_git" in
  1) ;;
  *) cache_is_git=0 ;;
esac

case "$cache_changed" in
  ''|*[!0-9]*) cache_changed=0 ;;
esac

case "$cache_proc_count" in
  ''|*[!0-9]*) cache_proc_count=0 ;;
esac

if [ "$cache_is_git" -eq 1 ]; then
  status=$(printf "\033[36m%s\033[0m \033[34m%s\033[0m" "$display_cwd" "$cache_branch")
  if [ "$cache_changed" -gt 0 ]; then
    status="${status} $(printf "\033[33m±%s\033[0m" "$cache_changed")"
  fi
else
  status=$(printf "\033[36m%s\033[0m" "$display_cwd")
fi

# Append token usage if available
if [ -n "$window_size" ] && [ -n "$raw_context_tokens" ]; then
  used_k=$(awk -v value="$context_tokens" 'BEGIN { printf "%.0fk", value / 1000 }')
  window_label=$(awk -v value="$window_size" 'BEGIN {
    if (value >= 1000000) {
      printf "%.0fM", value / 1000000
    } else {
      printf "%.0fk", value / 1000
    }
  }')

  if [ "$context_tokens" -ge 250000 ]; then
    token_color="\033[31m"
  elif [ "$context_tokens" -ge 200000 ]; then
    token_color="\033[33m"
  else
    token_color="\033[32m"
  fi

  status="${status} $(printf "\033[2m·\033[0m ${token_color}%s\033[2m/%s\033[0m" "$used_k" "$window_label")"
fi

# Append Claude-spawned process count
if [ "$cache_proc_count" -gt 0 ]; then
  if [ "$cache_proc_count" -gt 15 ]; then
    status="${status} $(printf "\033[2m·\033[0m \033[31m%s\033[2m procs\033[0m" "$cache_proc_count")"
  else
    status="${status} $(printf "\033[2m· %s procs\033[0m" "$cache_proc_count")"
  fi
fi

# Append last-turn timestamp in absolute time format
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
  timestamp=$(date -r "$(stat -f "%m" "$transcript_path")" "+%-m/%-d %-I:%M %p" | sed 's/ AM$/am/;s/ PM$/pm/')
  if [ -n "$timestamp" ]; then
    status="${status} $(printf "\033[2m· %s\033[0m" "$timestamp")"
  fi
fi

printf "%s" "$status"
