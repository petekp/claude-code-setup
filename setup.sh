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
#   ~/.codex/skills       → repo/skills
#   ~/.agents/skills       → repo/skills
#   ~/.claude/CLAUDE.md    ← repo/instructions/common.md + claude-only.md (assembled)
#   ~/.codex/AGENTS.md     ← repo/instructions/common.md + codex-only.md (assembled)
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
AGENTS_DIR="$HOME/.agents"

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

assemble_instructions() {
    local instructions_dir="$REPO_DIR/instructions"

    if [[ ! -d "$instructions_dir" ]]; then
        echo "  ⏭  No instructions/ directory in repo, skipping"
        return
    fi

    local -a targets=(
        "$CLAUDE_DIR/CLAUDE.md:common.md:claude-only.md"
        "$CODEX_DIR/AGENTS.md:common.md:codex-only.md"
    )

    for entry in "${targets[@]}"; do
        IFS=: read -r target_file common_file specific_file <<< "$entry"
        local target_dir=$(dirname "$target_file")
        local target_name=$(basename "$target_file")

        if [[ ! -d "$target_dir" ]]; then
            echo "  ⏭  $target_dir not found, skipping $target_name"
            continue
        fi

        local common="$instructions_dir/$common_file"
        local specific="$instructions_dir/$specific_file"

        if [[ ! -f "$common" ]]; then
            echo "  ⏭  $common_file not found, skipping $target_name"
            continue
        fi

        # One-time backup (sentinel prevents overwriting original)
        local sentinel="$target_dir/.backup-pre-assembly"
        if [[ -f "$target_file" && ! -f "$sentinel" ]]; then
            if $DRY_RUN; then
                echo "  [dry-run] Would backup $target_name → $target_name.backup-pre-assembly"
            else
                cp "$target_file" "$sentinel"
                echo "  📦 Backed up $target_name (original saved for --undo)"
            fi
        fi

        # Assemble: common + specific (if it has content)
        if $DRY_RUN; then
            echo "  [dry-run] Would assemble $target_name from $common_file + $specific_file"
        else
            cat "$common" > "$target_file"
            if [[ -f "$specific" ]] && grep -q '[^[:space:]#]' "$specific" 2>/dev/null; then
                printf '\n' >> "$target_file"
                cat "$specific" >> "$target_file"
            fi
            echo "  ✓  $target_name assembled from $common_file + $specific_file"
        fi
    done
}

disassemble_instructions() {
    local -a targets=(
        "$CLAUDE_DIR/CLAUDE.md"
        "$CODEX_DIR/AGENTS.md"
    )

    for target_file in "${targets[@]}"; do
        local target_dir=$(dirname "$target_file")
        local target_name=$(basename "$target_file")
        local sentinel="$target_dir/.backup-pre-assembly"

        if [[ -f "$sentinel" ]]; then
            mv "$sentinel" "$target_file"
            echo "  ✓  Restored $target_name from pre-assembly backup"
        else
            echo "  ⏭  $target_name (no pre-assembly backup found)"
        fi
    done
}

link_codex_skills() {
    local skills_source="$REPO_DIR/skills"

    if [[ ! -d "$skills_source" ]]; then
        echo "  ⏭  No skills directory in repo, skipping"
        return
    fi

    if [[ ! -d "$CODEX_DIR" ]]; then
        echo "  ⏭  ~/.codex not found (Codex not installed?), skipping"
        return
    fi

    local target="$CODEX_DIR/skills"

    if [[ -L "$target" ]]; then
        local current_target=$(readlink "$target")
        if [[ "$current_target" == "$skills_source" ]]; then
            echo "  ✓  skills (already linked)"
            return
        else
            echo "  ⚠  skills is symlinked elsewhere: $current_target"
            echo "      Remove manually if you want to relink"
            return
        fi
    fi

    if [[ -d "$target" ]]; then
        if $DRY_RUN; then
            echo "  [dry-run] Would remove existing skills directory"
        else
            echo "  🗑  Removing existing skills directory"
            rm -rf "$target"
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would link: skills → $skills_source"
    else
        ln -s "$skills_source" "$target"
        echo "  ✓  skills → $skills_source"
    fi
}

unlink_codex_skills() {
    local target="$CODEX_DIR/skills"

    if [[ -L "$target" ]]; then
        local link_target=$(readlink "$target")
        if [[ "$link_target" == "$REPO_DIR/skills" ]]; then
            rm "$target"
            echo "  ✓  Removed symlink: skills"
        else
            echo "  ⏭  skills points elsewhere, skipping"
        fi
    else
        echo "  ⏭  skills (not a symlink, skipping)"
    fi
}

link_agents_skills() {
    local skills_source="$REPO_DIR/skills"

    if [[ ! -d "$skills_source" ]]; then
        echo "  ⏭  No skills directory in repo, skipping"
        return
    fi

    if [[ ! -d "$AGENTS_DIR" ]]; then
        echo "  ⏭  ~/.agents not found, skipping"
        return
    fi

    local target="$AGENTS_DIR/skills"

    if [[ -L "$target" ]]; then
        local current_target=$(readlink "$target")
        if [[ "$current_target" == "$skills_source" ]]; then
            echo "  ✓  skills (already linked)"
            return
        else
            echo "  ⚠  skills is symlinked elsewhere: $current_target"
            echo "      Remove manually if you want to relink"
            return
        fi
    fi

    if [[ -d "$target" ]]; then
        if $DRY_RUN; then
            echo "  [dry-run] Would remove existing skills directory"
        else
            echo "  🗑  Removing existing skills directory"
            rm -rf "$target"
        fi
    fi

    if $DRY_RUN; then
        echo "  [dry-run] Would link: skills → $skills_source"
    else
        ln -s "$skills_source" "$target"
        echo "  ✓  skills → $skills_source"
    fi
}

unlink_agents_skills() {
    local target="$AGENTS_DIR/skills"

    if [[ -L "$target" ]]; then
        local link_target=$(readlink "$target")
        if [[ "$link_target" == "$REPO_DIR/skills" ]]; then
            rm "$target"
            echo "  ✓  Removed symlink: skills"
        else
            echo "  ⏭  skills points elsewhere, skipping"
        fi
    else
        echo "  ⏭  skills (not a symlink, skipping)"
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
    echo ""
    echo "Agents skills:"
    unlink_agents_skills
    echo ""
    echo "System instructions:"
    disassemble_instructions
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
    echo "Codex skills:"
    link_codex_skills
    echo ""
    echo "Agents skills:"
    link_agents_skills
    echo ""
    echo "System instructions:"
    assemble_instructions
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
