#!/bin/bash

# Get current directory name
dir_name=$(basename "$PWD")

# Check if in a git repo
if git rev-parse --is-inside-work-tree &>/dev/null; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

  # Check for uncommitted changes
  if ! git diff --quiet --no-optional-locks 2>/dev/null || ! git diff --cached --quiet --no-optional-locks 2>/dev/null; then
    dirty=" ✗"
  else
    dirty=""
  fi

  echo -e "\033[36m${dir_name}\033[0m \033[34mgit:(\033[31m${branch}\033[34m)\033[33m${dirty}\033[0m"
else
  echo -e "\033[36m${dir_name}\033[0m"
fi
