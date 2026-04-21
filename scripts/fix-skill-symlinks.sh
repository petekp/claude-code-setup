#!/bin/bash
#
# fix-skill-symlinks.sh — Convert relative symlinks in skills/ to absolute
#
# Problem: ~/.claude/skills is itself a symlink to the repo. When tools like
# `npx skills add` create relative symlinks inside it (e.g. ../../.agents/...),
# the relative path resolves from the repo's physical location, not from
# ~/.claude/skills. This makes the skill invisible to Claude Code.
#
# This script finds any relative symlinks in the skills directory and rewrites
# them as absolute paths. Safe to run on every SessionStart.

set -euo pipefail

SKILLS_DIR="$(cd "$(dirname "$0")/.." && pwd -P)/skills"

[[ -d "$SKILLS_DIR" ]] || exit 0

fixed=0

for link in "$SKILLS_DIR"/*; do
    [[ -L "$link" ]] || continue

    target=$(readlink "$link")

    # Skip if already absolute
    [[ "$target" == /* ]] && continue

    # Resolve what this relative path was *intended* to point to.
    # npx skills creates symlinks relative to ~/.claude/skills/ (the symlink
    # path), so resolve from there rather than the physical repo path.
    intended=$(cd "$HOME/.claude/skills" 2>/dev/null && cd "$(dirname "$target")" 2>/dev/null && echo "$(pwd -P)/$(basename "$target")") || continue

    if [[ -d "$intended" ]]; then
        rm "$link"
        ln -s "$intended" "$link"
        fixed=$((fixed + 1))
    fi
done

if [[ $fixed -gt 0 ]]; then
    echo "Fixed $fixed relative skill symlink(s) to absolute"
fi
