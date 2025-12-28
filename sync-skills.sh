#!/bin/bash

set -e

REPO_SKILLS="$(cd "$(dirname "$0")" && pwd)/skills"
TARGET_DIR="$HOME/.claude/skills"

if [[ ! -d "$REPO_SKILLS" ]]; then
    echo "Error: Source directory not found: $REPO_SKILLS"
    exit 1
fi

mkdir -p "$TARGET_DIR"

echo "Syncing skills from $REPO_SKILLS to $TARGET_DIR"

for skill_dir in "$REPO_SKILLS"/*/; do
    skill_name=$(basename "$skill_dir")
    target_skill_dir="$TARGET_DIR/$skill_name"

    mkdir -p "$target_skill_dir"

    rsync -av --delete \
        --exclude '.local*' \
        --exclude '*.local*' \
        --exclude '.DS_Store' \
        "$skill_dir" "$target_skill_dir/"

    echo "  ✓ $skill_name"
done

repo_skills=$(ls -1 "$REPO_SKILLS" 2>/dev/null | sort)
target_skills=$(ls -1 "$TARGET_DIR" 2>/dev/null | grep -v '^\.' | sort)

orphaned=$(comm -13 <(echo "$repo_skills") <(echo "$target_skills"))

if [[ -n "$orphaned" ]]; then
    echo ""
    echo "Orphaned skills in target (not in repo):"
    for skill in $orphaned; do
        echo "  - $skill"
    done
    echo ""
    echo "Run with --prune to remove orphaned skills"

    if [[ "$1" == "--prune" ]]; then
        for skill in $orphaned; do
            echo "Removing $TARGET_DIR/$skill"
            rm -rf "$TARGET_DIR/$skill"
        done
    fi
fi

echo ""
echo "Sync complete."
