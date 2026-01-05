#!/bin/bash
#
# Sets up symlinks from ~/.claude to this repository.
#
# What this does:
#   ~/.claude/skills   → repo/skills
#   ~/.claude/commands → repo/commands
#   ~/.claude/agents   → repo/agents
#   ~/.claude/hooks    → repo/hooks
#   ~/.claude/statusline-command.sh ← repo/statusline-command.sh (copied)
#
# After running this, edits in either location are the same file.
# Commit and push from this repo as usual.
#
# Usage:
#   ./setup.sh         # Create symlinks (backs up existing dirs)
#   ./setup.sh --undo  # Remove symlinks and restore backups
#

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

DIRS_TO_LINK=(skills commands agents hooks)

FILES_TO_COPY=(statusline-command.sh)

link_dir() {
    local name=$1
    local source="$REPO_DIR/$name"
    local target="$CLAUDE_DIR/$name"

    if [[ ! -d "$source" ]]; then
        echo "  ⏭  $name (not in repo, skipping)"
        return
    fi

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

    if [[ -d "$target" ]]; then
        local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
        echo "  📦 Backing up $name → $backup"
        mv "$target" "$backup"
    fi

    ln -s "$source" "$target"
    echo "  ✓  $name → $source"
}

unlink_dir() {
    local name=$1
    local target="$CLAUDE_DIR/$name"

    if [[ -L "$target" ]]; then
        rm "$target"
        echo "  ✓  Removed symlink: $name"

        local latest_backup=$(ls -1d "$target".backup.* 2>/dev/null | tail -1)
        if [[ -n "$latest_backup" ]]; then
            mv "$latest_backup" "$target"
            echo "      Restored from: $(basename "$latest_backup")"
        fi
    else
        echo "  ⏭  $name (not a symlink, skipping)"
    fi
}

copy_file() {
    local name=$1
    local source="$REPO_DIR/$name"
    local target="$CLAUDE_DIR/$name"

    if [[ ! -f "$source" ]]; then
        echo "  ⏭  $name (not in repo, skipping)"
        return
    fi

    if [[ -f "$target" ]]; then
        if cmp -s "$source" "$target"; then
            echo "  ✓  $name (already up to date)"
            return
        else
            local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
            echo "  📦 Backing up $name → $backup"
            cp "$target" "$backup"
        fi
    fi

    cp "$source" "$target"
    chmod +x "$target"
    echo "  ✓  $name (copied)"
}

remove_file() {
    local name=$1
    local target="$CLAUDE_DIR/$name"

    if [[ -f "$target" ]]; then
        local latest_backup=$(ls -1 "$target".backup.* 2>/dev/null | tail -1)
        if [[ -n "$latest_backup" ]]; then
            mv "$target" "$target.from-repo"
            mv "$latest_backup" "$target"
            echo "  ✓  Restored $name from backup"
        else
            echo "  ⏭  $name (no backup to restore, leaving as-is)"
        fi
    else
        echo "  ⏭  $name (not present)"
    fi
}

if [[ "$1" == "--undo" ]]; then
    echo "Removing symlinks and restoring backups..."
    echo ""
    echo "Directories:"
    for dir in "${DIRS_TO_LINK[@]}"; do
        unlink_dir "$dir"
    done
    echo ""
    echo "Files:"
    for file in "${FILES_TO_COPY[@]}"; do
        remove_file "$file"
    done
else
    echo "Setting up Claude Code configuration..."
    echo ""
    echo "Symlinking directories:"
    for dir in "${DIRS_TO_LINK[@]}"; do
        link_dir "$dir"
    done
    echo ""
    echo "Copying files:"
    for file in "${FILES_TO_COPY[@]}"; do
        copy_file "$file"
    done
    echo ""
    echo "Done!"
    echo ""
    echo "Notes:"
    echo "  • settings.example.json is for reference only (contains hardcoded paths)"
    echo "  • See templates/ for settings.local.json and .mcp.json examples"
    echo ""
    echo "First time? See FORKING.md for customization guide."
fi
