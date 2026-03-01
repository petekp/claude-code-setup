#!/bin/bash
#
# Sets up symlinks from ~/.claude and ~/.codex to this repository.
#
# What this does:
#   ~/.claude/skills       → repo/skills
#   ~/.claude/commands     → repo/commands
#   ~/.claude/agents       → repo/agents
#   ~/.claude/hooks        → repo/hooks
#   ~/.claude/scripts      → repo/scripts
#   ~/.claude/settings.json → repo/settings.json
#   ~/.claude/statusline-command.sh ← repo/statusline-command.sh (copied)
#   ~/.mcp.json            → repo/.mcp.json
#   ~/.codex/skills/<each> → repo/skills/<each> (individual symlinks)
#
# After running this, edits in either location are the same file.
# Commit and push from this repo as usual.
#
# Usage:
#   ./setup.sh           # Create symlinks (backs up existing dirs)
#   ./setup.sh --dry-run # Preview changes without making them
#   ./setup.sh --undo    # Remove symlinks and restore backups
#

set -e

case "$(uname -s)" in
    Linux*|Darwin*)
        ;;
    MINGW*|CYGWIN*|MSYS*)
        echo "Windows detected. Please run in WSL or set up symlinks manually."
        echo "See README.md#windows-users for details."
        exit 1
        ;;
    *)
        echo "Unknown platform: $(uname -s)"
        echo "This script requires macOS or Linux."
        exit 1
        ;;
esac

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    shift
fi

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
CODEX_DIR="$HOME/.codex"

DIRS_TO_LINK=(skills commands agents hooks scripts)

FILES_TO_LINK=(settings.json)

FILES_TO_COPY=(statusline-command.sh)

HOME_FILES_TO_LINK=(.mcp.json)

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
        if $DRY_RUN; then
            echo "  [dry-run] Would backup $name → $backup"
        else
            echo "  📦 Backing up $name → $backup"
            mv "$target" "$backup"
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would link: $name → $source"
    else
        ln -s "$source" "$target"
        echo "  ✓  $name → $source"
    fi
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

link_file() {
    local name=$1
    local source="$REPO_DIR/$name"
    local target="$CLAUDE_DIR/$name"

    if [[ ! -f "$source" ]]; then
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

    if [[ -f "$target" ]]; then
        local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
        if $DRY_RUN; then
            echo "  [dry-run] Would backup $name → $backup"
        else
            echo "  📦 Backing up $name → $backup"
            mv "$target" "$backup"
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would link: $name → $source"
    else
        ln -s "$source" "$target"
        echo "  ✓  $name → $source"
    fi
}

unlink_file() {
    local name=$1
    local target="$CLAUDE_DIR/$name"

    if [[ -L "$target" ]]; then
        rm "$target"
        echo "  ✓  Removed symlink: $name"

        local latest_backup=$(ls -1 "$target".backup.* 2>/dev/null | tail -1)
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
            if $DRY_RUN; then
                echo "  [dry-run] Would backup $name → $backup"
            else
                echo "  📦 Backing up $name → $backup"
                cp "$target" "$backup"
            fi
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would copy: $name"
    else
        cp "$source" "$target"
        chmod +x "$target"
        echo "  ✓  $name (copied)"
    fi
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

link_home_file() {
    local name=$1
    local source="$REPO_DIR/$name"
    local target="$HOME/$name"

    if [[ ! -f "$source" ]]; then
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

    if [[ -f "$target" ]]; then
        local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
        if $DRY_RUN; then
            echo "  [dry-run] Would backup $name → $backup"
        else
            echo "  📦 Backing up $name → $backup"
            mv "$target" "$backup"
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would link: $name → $source"
    else
        ln -s "$source" "$target"
        echo "  ✓  $name → $source"
    fi
}

unlink_home_file() {
    local name=$1
    local target="$HOME/$name"

    if [[ -L "$target" ]]; then
        rm "$target"
        echo "  ✓  Removed symlink: $name"

        local latest_backup=$(ls -1 "$target".backup.* 2>/dev/null | tail -1)
        if [[ -n "$latest_backup" ]]; then
            mv "$latest_backup" "$target"
            echo "      Restored from: $(basename "$latest_backup")"
        fi
    else
        echo "  ⏭  $name (not a symlink, skipping)"
    fi
}

link_codex_skills() {
    local skills_source="$REPO_DIR/skills"
    local exclude_file="$REPO_DIR/codex-exclude"

    if [[ ! -d "$skills_source" ]]; then
        echo "  ⏭  No skills directory in repo, skipping"
        return
    fi

    if [[ ! -d "$CODEX_DIR" ]]; then
        echo "  ⏭  ~/.codex not found (Codex not installed?), skipping"
        return
    fi

    # Load exclude list
    local -a excludes=()
    if [[ -f "$exclude_file" ]]; then
        while IFS= read -r line; do
            line="${line%%#*}"        # strip comments
            line="${line// /}"        # strip whitespace
            [[ -n "$line" ]] && excludes+=("$line")
        done < "$exclude_file"
    fi

    mkdir -p "$CODEX_DIR/skills"

    local count=0
    local skipped=0
    for skill_dir in "$skills_source"/*/; do
        [[ ! -d "$skill_dir" ]] && continue
        local name=$(basename "$skill_dir")
        [[ "$name" == .* ]] && continue

        # Check exclude list
        local excluded=false
        for ex in "${excludes[@]}"; do
            if [[ "$name" == "$ex" ]]; then
                excluded=true
                break
            fi
        done
        if $excluded; then
            skipped=$((skipped + 1))
            continue
        fi

        local target="$CODEX_DIR/skills/$name"

        if [[ -L "$target" ]]; then
            local current_target=$(readlink "$target")
            if [[ "$current_target" == "$skill_dir" || "$current_target" == "${skill_dir%/}" ]]; then
                count=$((count + 1))
                continue
            fi
        fi

        if [[ -d "$target" && ! -L "$target" ]]; then
            local backup="$target.backup.$(date +%Y%m%d-%H%M%S)"
            if $DRY_RUN; then
                echo "  [dry-run] Would backup $name → $backup"
            else
                mv "$target" "$backup"
            fi
        fi

        if $DRY_RUN; then
            echo "  [dry-run] Would link: $name"
        else
            ln -sf "$skill_dir" "$target"
        fi
        count=$((count + 1))
    done
    echo "  ✓  $count skills linked, $skipped excluded (preserving .system/)"
}

unlink_codex_skills() {
    local skills_source="$REPO_DIR/skills"

    if [[ ! -d "$CODEX_DIR/skills" ]]; then
        echo "  ⏭  No Codex skills directory found"
        return
    fi

    local count=0
    for target in "$CODEX_DIR/skills"/*/; do
        [[ ! -L "${target%/}" ]] && continue
        local link_target=$(readlink "${target%/}")
        if [[ "$link_target" == "$skills_source"* ]]; then
            rm "${target%/}"
            count=$((count + 1))
        fi
    done
    echo "  ✓  Removed $count Codex skill symlinks"
}

if [[ "$1" == "--undo" ]]; then
    echo "Removing symlinks and restoring backups..."
    echo ""
    echo "Directories:"
    for dir in "${DIRS_TO_LINK[@]}"; do
        unlink_dir "$dir"
    done
    echo ""
    echo "Symlinked files:"
    for file in "${FILES_TO_LINK[@]}"; do
        unlink_file "$file"
    done
    echo ""
    echo "Copied files:"
    for file in "${FILES_TO_COPY[@]}"; do
        remove_file "$file"
    done
    echo ""
    echo "Home directory files:"
    for file in "${HOME_FILES_TO_LINK[@]}"; do
        unlink_home_file "$file"
    done
    echo ""
    echo "Codex skills:"
    unlink_codex_skills
else
    if $DRY_RUN; then
        echo "Previewing Claude Code + Codex configuration setup (no changes will be made)..."
    else
        echo "Setting up Claude Code + Codex configuration..."
    fi
    echo ""
    echo "Symlinking directories:"
    for dir in "${DIRS_TO_LINK[@]}"; do
        link_dir "$dir"
    done
    echo ""
    echo "Symlinking files:"
    for file in "${FILES_TO_LINK[@]}"; do
        link_file "$file"
    done
    echo ""
    echo "Copying files:"
    for file in "${FILES_TO_COPY[@]}"; do
        copy_file "$file"
    done
    echo ""
    echo "Symlinking home directory files:"
    for file in "${HOME_FILES_TO_LINK[@]}"; do
        link_home_file "$file"
    done
    echo ""
    echo "Codex skills (individual symlinks):"
    link_codex_skills
    echo ""
    if $DRY_RUN; then
        echo "Dry run complete. Run without --dry-run to apply changes."
    else
        echo "Done!"
        echo ""
        echo "Notes:"
        echo "  • See templates/ for settings and MCP config examples"
        echo ""
        echo "First time? See FORKING.md for customization guide."
    fi
fi
