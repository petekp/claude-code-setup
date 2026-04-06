#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: run-cursor.sh [--cd DIR] [--mode MODE] [--model MODEL]

Reads the Cursor agent prompt from stdin and prints its final output to stdout.
EOF
}

workdir=$(pwd)
agent_mode=""
model=""

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
    --mode)
      if (($# < 2)); then
        echo "Missing value for --mode" >&2
        exit 64
      fi
      agent_mode=$2
      shift 2
      ;;
    --model)
      if (($# < 2)); then
        echo "Missing value for --model" >&2
        exit 64
      fi
      model=$2
      shift 2
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

if ! command -v cursor >/dev/null 2>&1; then
  echo "Cursor CLI is not installed or not on PATH." >&2
  exit 127
fi

if [ ! -d "$workdir" ]; then
  echo "Working directory does not exist: $workdir" >&2
  exit 66
fi

tmp_root=${TMPDIR:-/tmp}
tmp_dir=$(mktemp -d "$tmp_root/cursor-skill-XXXXXX")
prompt_file=$tmp_dir/prompt.txt
output_file=$tmp_dir/output.txt
log_file=$tmp_dir/cursor.log

cleanup() {
  rm -rf "$tmp_dir"
}

trap cleanup EXIT

cat >"$prompt_file"
if [ -z "$(tr -d '[:space:]' < "$prompt_file")" ]; then
  echo "Prompt is empty. Pass the text that follows /gemini on stdin." >&2
  exit 64
fi

prompt=$(<"$prompt_file")

cmd=(cursor agent)

# Headless flags: --print for non-interactive, --force to allow all tools,
# --trust to skip workspace trust prompt, --output-format text for clean output
cmd+=(--print --force --trust --output-format text)

if [ -n "$model" ]; then
  cmd+=(--model "$model")
fi

cmd+=(--workspace "$workdir")

if [ -n "$agent_mode" ]; then
  cmd+=(--mode "$agent_mode")
fi

# Prompt is the final positional argument
cmd+=("$prompt")

set +e
"${cmd[@]}" >"$output_file" 2>"$log_file"
exit_code=$?
set -e

if ((exit_code != 0)); then
  echo "Cursor agent failed with exit code $exit_code." >&2
  if [ -s "$log_file" ]; then
    cat "$log_file" >&2
  fi
  exit "$exit_code"
fi

if [ ! -s "$output_file" ]; then
  echo "Cursor agent completed but produced no output." >&2
  if [ -s "$log_file" ]; then
    cat "$log_file" >&2
  fi
  exit 65
fi

cat "$output_file"
