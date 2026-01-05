#!/bin/bash
#
# Sets up symlinks from ~/.claude to this repository.
#
# What this does:
#   ~/.claude/skills   → ~/Code/claude-skills/skills
#   ~/.claude/commands → ~/Code/claude-skills/commands
#   ~/.claude/agents   → ~/Code/claude-skills/agents
#
# After running this, edits in either location are the same file.
# Commit and push from ~/Code/claude-skills as usual.
#
# Usage:
#   ./setup.sh         # Create symlinks (backs up existing dirs)
#   ./setup.sh --undo  # Remove symlinks and restore backups
#

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

# Directories to symlink
DIRS_TO_LINK=(skills commands agents)

link_dir() {
    local name=$1
    local source="$REPO_DIR/$name"
    local target="$CLAUDE_DIR/$name"

    # Skip if source doesn't exist in repo
    if [[ ! -d "$source" ]]; then
        echo "  ⏭  $name (not in repo, skipping)"
        return
    fi

    # Already a symlink pointing to the right place?
    if [[ -L "$target" ]]; then
        local current_target=$(readlink "$target")
        if [[ "$current_target" == "$source" ]]; then
            echo "  ✓  $name (already linked)"
            return
        else
            echo "  ⚠  $name is symlinked elsewhere: $current_target"
            echo "      Remove manually if you want to relink"
            return
        fi
    fi

    # Real directory exists - back it up
    if [[ -d "$target" ]]; then
        local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
        echo "  📦 Backing up $name → $backup"
        mv "$target" "$backup"
    fi

    # Create the symlink
    ln -s "$source" "$target"
    echo "  ✓  $name → $source"
}

unlink_dir() {
    local name=$1
    local target="$CLAUDE_DIR/$name"

    if [[ -L "$target" ]]; then
        rm "$target"
        echo "  ✓  Removed symlink: $name"

        # Find most recent backup
        local latest_backup=$(ls -1d "$target".backup.* 2>/dev/null | tail -1)
        if [[ -n "$latest_backup" ]]; then
            mv "$latest_backup" "$target"
            echo "      Restored from: $(basename "$latest_backup")"
        fi
    else
        echo "  ⏭  $name (not a symlink, skipping)"
    fi
}

if [[ "$1" == "--undo" ]]; then
    echo "Removing symlinks and restoring backups..."
    echo ""
    for dir in "${DIRS_TO_LINK[@]}"; do
        unlink_dir "$dir"
    done
else
    echo "Creating symlinks from ~/.claude to repo..."
    echo ""
    for dir in "${DIRS_TO_LINK[@]}"; do
        link_dir "$dir"
    done
    echo ""
    echo "Done! Edits in ~/.claude/$dir or $REPO_DIR/$dir are now the same file."
    echo ""
    echo "Note: settings.json is NOT symlinked (may contain machine-specific paths)."
    echo "Copy manually if needed: cp $REPO_DIR/settings.json $CLAUDE_DIR/"
fi
