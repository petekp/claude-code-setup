#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: run-codex.sh [--cd DIR] [--sandbox MODE] [--search] [--no-ephemeral]

Reads the Codex prompt from stdin and prints Codex's final message to stdout.
EOF
}

workdir=$(pwd)
sandbox_mode=""
use_search=0
use_ephemeral=1

while (($# > 0)); do
  case "$1" in
    --cd)
      if (($# < 2)); then
        echo "Missing value for --cd" >&2
        exit 64
      fi
      workdir=$2
      shift 2
      ;;
    --sandbox)
      if (($# < 2)); then
        echo "Missing value for --sandbox" >&2
        exit 64
      fi
      sandbox_mode=$2
      shift 2
      ;;
    --search)
      use_search=1
      shift
      ;;
    --no-ephemeral)
      use_ephemeral=0
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 64
      ;;
  esac
done

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI is not installed or not on PATH." >&2
  exit 127
fi

if [ ! -d "$workdir" ]; then
  echo "Working directory does not exist: $workdir" >&2
  exit 66
fi

tmp_root=${TMPDIR:-/tmp}
tmp_dir=$(mktemp -d "$tmp_root/codex-skill-XXXXXX")
prompt_file=$tmp_dir/prompt.txt
output_file=$tmp_dir/last-message.txt
log_file=$tmp_dir/codex.log

cleanup() {
  rm -rf "$tmp_dir"
}

trap cleanup EXIT

cat >"$prompt_file"
if [ -z "$(tr -d '[:space:]' < "$prompt_file")" ]; then
  echo "Prompt is empty. Pass the text that follows /codex on stdin." >&2
  exit 64
fi

cmd=(codex)

if ((use_search)); then
  cmd+=(--search)
fi

cmd+=(exec --color never -o "$output_file" -C "$workdir")

if [ -z "$sandbox_mode" ] || [ "$sandbox_mode" = "workspace-write" ]; then
  cmd+=(--full-auto)
else
  cmd+=(--sandbox "$sandbox_mode")
fi

if ((use_ephemeral)); then
  cmd+=(--ephemeral)
fi

if ! git -C "$workdir" rev-parse --show-toplevel >/dev/null 2>&1; then
  cmd+=(--skip-git-repo-check)
fi

set +e
"${cmd[@]}" <"$prompt_file" >"$log_file" 2>&1
exit_code=$?
set -e

if ((exit_code != 0)); then
  echo "Codex exec failed with exit code $exit_code." >&2
  if [ -s "$log_file" ]; then
    cat "$log_file" >&2
  fi
  exit "$exit_code"
fi

if [ ! -s "$output_file" ]; then
  echo "Codex exec completed but did not write a final message." >&2
  if [ -s "$log_file" ]; then
    cat "$log_file" >&2
  fi
  exit 65
fi

cat "$output_file"
