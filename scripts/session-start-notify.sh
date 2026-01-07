#!/bin/bash
input=$(cat)
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')

if [ "$stop_hook_active" = "true" ]; then
  exit 0
fi

project_name=$(basename "$PWD" | tr -cs '[:alnum:]' ' ')
say -r 250 "Session started in $project_name"
