#!/bin/bash
#
# Sets up symlinks from ~/.claude to this repository.
#
# What this does:
#   ~/.claude/skills       → repo/skills
#   ~/.claude/scripts      → repo/scripts
#   ~/.claude/settings.json → repo/settings.json
#   ~/.claude/statusline-command.sh ← repo/statusline-command.sh (copied)
#   ~/.mcp.json            → repo/.mcp.json
#
# Codex skill syncing (~/.codex/skills, honoring codex-exclude) is handled by
# scripts/sync-codex-skills.sh, which runs on every Claude Code SessionStart.
#
# After running this, edits in either location are the same file.
# Commit and push from this repo as usual.
#
# Usage:
#   ./setup.sh              # Create symlinks (backs up existing dirs)
#   ./setup.sh --dry-run    # Preview changes without making them
#   ./setup.sh --undo       # Remove symlinks and restore backups
#   ./setup.sh --verify     # Check current state without changing anything
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

REPO_DIR="$(cd "$(dirname "$0")" && pwd -P)"
CLAUDE_DIR="$HOME/.claude"

DIRS_TO_LINK=(skills scripts)

FILES_TO_LINK=(settings.json)

FILES_TO_COPY=(statusline-command.sh)

HOME_FILES_TO_LINK=(.mcp.json)

# ─── Pre-flight checks ───────────────────────────────────────────────────────

preflight() {
    local errors=0

    if ! command -v git &>/dev/null; then
        echo "  ✗  git not found — install git first"
        errors=$((errors + 1))
    fi

    if [[ ! -d "$REPO_DIR/.git" ]]; then
        echo "  ✗  $REPO_DIR is not a git repository"
        errors=$((errors + 1))
    fi

    if [[ ! -d "$REPO_DIR/skills" ]]; then
        echo "  ✗  skills/ directory missing from repo"
        errors=$((errors + 1))
    fi

    if [[ $errors -gt 0 ]]; then
        echo ""
        echo "Pre-flight failed with $errors error(s). Fix the above before running setup."
        exit 1
    fi
}

# ─── Ensure target directories exist ─────────────────────────────────────────

ensure_dirs() {
    local dirs=("$CLAUDE_DIR" "$CLAUDE_DIR/skills-archive")

    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            if $DRY_RUN; then
                echo "  [dry-run] Would create $dir"
            else
                mkdir -p "$dir"
                echo "  ✓  Created $dir"
            fi
        fi
    done
}

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

# ─── Verify: check current state without changing anything ────────────────────

verify() {
    echo "Verifying current setup..."
    echo ""

    local issues=0

    # Check target directories exist
    echo "Target directories:"
    for dir in "$CLAUDE_DIR"; do
        if [[ -d "$dir" ]]; then
            echo "  ✓  $dir"
        else
            echo "  ✗  $dir (missing)"
            issues=$((issues + 1))
        fi
    done
    echo ""

    # Check Claude directory symlinks
    echo "Claude symlinks:"
    for name in "${DIRS_TO_LINK[@]}"; do
        local target="$CLAUDE_DIR/$name"
        local source="$REPO_DIR/$name"
        if [[ -L "$target" ]]; then
            local actual=$(readlink "$target")
            if [[ "$actual" == "$source" ]]; then
                if [[ ! -e "$target" ]]; then
                    echo "  ✗  $name → $source (target does not exist)"
                    issues=$((issues + 1))
                else
                    echo "  ✓  $name → $source"
                fi
            else
                echo "  ⚠  $name → $actual (expected $source)"
                issues=$((issues + 1))
            fi
        elif [[ -d "$target" ]]; then
            echo "  ✗  $name is a regular directory (not symlinked)"
            issues=$((issues + 1))
        else
            echo "  ✗  $name (missing)"
            issues=$((issues + 1))
        fi
    done
    echo ""

    # Check Claude file symlinks
    echo "Claude files:"
    for name in "${FILES_TO_LINK[@]}"; do
        local target="$CLAUDE_DIR/$name"
        local source="$REPO_DIR/$name"
        if [[ -L "$target" ]]; then
            local actual=$(readlink "$target")
            if [[ "$actual" == "$source" ]]; then
                if [[ ! -e "$target" ]]; then
                    echo "  ✗  $name → $source (target does not exist)"
                    issues=$((issues + 1))
                else
                    echo "  ✓  $name → $source"
                fi
            else
                echo "  ⚠  $name → $actual (expected $source)"
                issues=$((issues + 1))
            fi
        elif [[ -f "$target" ]]; then
            echo "  ⚠  $name exists but is not symlinked"
            issues=$((issues + 1))
        else
            echo "  ✗  $name (missing)"
            issues=$((issues + 1))
        fi
    done
    echo ""

    # Check copied files
    echo "Copied files:"
    for name in "${FILES_TO_COPY[@]}"; do
        local target="$CLAUDE_DIR/$name"
        local source="$REPO_DIR/$name"
        if [[ -f "$target" ]]; then
            if cmp -s "$source" "$target"; then
                echo "  ✓  $name (up to date)"
            else
                echo "  ⚠  $name (out of date — differs from repo)"
                issues=$((issues + 1))
            fi
        else
            echo "  ✗  $name (missing)"
            issues=$((issues + 1))
        fi
    done
    echo ""

    # Check home files
    echo "Home directory files:"
    for name in "${HOME_FILES_TO_LINK[@]}"; do
        local target="$HOME/$name"
        local source="$REPO_DIR/$name"
        if [[ -L "$target" ]]; then
            local actual=$(readlink "$target")
            if [[ "$actual" == "$source" ]]; then
                if [[ ! -e "$target" ]]; then
                    echo "  ✗  $name → $source (target does not exist)"
                    issues=$((issues + 1))
                else
                    echo "  ✓  $name → $source"
                fi
            else
                echo "  ⚠  $name → $actual (expected $source)"
                issues=$((issues + 1))
            fi
        elif [[ -f "$target" ]]; then
            echo "  ⚠  $name exists but is not symlinked"
            issues=$((issues + 1))
        else
            echo "  ✗  $name (missing)"
            issues=$((issues + 1))
        fi
    done
    echo ""

    # Check skill structure
    echo "Skill health:"
    local valid=0
    local invalid=0
    for skill_dir in "$REPO_DIR/skills"/*/; do
        [[ -d "$skill_dir" ]] || continue
        if [[ -f "$skill_dir/SKILL.md" ]]; then
            valid=$((valid + 1))
        else
            echo "  ⚠  $(basename "$skill_dir"): missing SKILL.md"
            invalid=$((invalid + 1))
        fi
    done
    echo "  ✓  $valid skills with valid SKILL.md"
    if [[ $invalid -gt 0 ]]; then
        echo "  ✗  $invalid skills missing SKILL.md"
        issues=$((issues + 1))
    fi
    echo ""

    # Optional tools
    echo "Optional tools:"
    if command -v node &>/dev/null; then
        echo "  ✓  node $(node --version)"
    else
        echo "  -  node not found (needed for npx skills)"
    fi
    if command -v codex &>/dev/null; then
        echo "  ✓  codex $(codex --version 2>/dev/null || echo '(version unknown)')"
    else
        echo "  -  codex not found"
    fi
    echo ""

    # Summary
    if [[ $issues -eq 0 ]]; then
        echo "All checks passed. Setup is healthy."
    else
        echo "$issues issue(s) found. Run ./setup.sh to fix."
    fi
    return $issues
}

# ─── Main dispatch ────────────────────────────────────────────────────────────

if [[ "$1" == "--verify" ]]; then
    verify
    exit $?
elif [[ "$1" == "--undo" ]]; then
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
else
    # Pre-flight checks
    echo "Pre-flight checks:"
    preflight
    echo "  ✓  All checks passed"
    echo ""

    if $DRY_RUN; then
        echo "Previewing Claude Code + Codex configuration setup (no changes will be made)..."
    else
        echo "Setting up Claude Code + Codex configuration..."
    fi
    echo ""

    # Ensure target directories exist before linking
    echo "Ensuring target directories:"
    ensure_dirs
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
    if $DRY_RUN; then
        echo "Dry run complete. Run without --dry-run to apply changes."
    else
        echo "Done!"
        echo ""
        echo "Run ./setup.sh --verify to confirm everything is healthy."
        echo ""
        echo "Notes:"
        echo "  • See templates/ for settings and MCP config examples"
        echo ""
        echo "First time? See FORKING.md for customization guide."
    fi
fi
