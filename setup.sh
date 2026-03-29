#!/bin/bash
#
# Sets up symlinks from ~/.claude and ~/.agents to this repository.
#
# What this does:
#   ~/.claude/skills       → repo/skills
#   ~/.claude/agents       → repo/agents
#   ~/.claude/hooks        → repo/hooks
#   ~/.claude/scripts      → repo/scripts
#   ~/.claude/settings.json → repo/settings.json
#   ~/.claude/statusline-command.sh ← repo/statusline-command.sh (copied)
#   ~/.mcp.json            → repo/.mcp.json
#   ~/.agents/skills/*     → repo/skills/* (per-skill, honoring codex-exclude)
#   ~/.claude/CLAUDE.md    ← repo/instructions/common.md + claude-only.md (assembled)
#   ~/.agents/AGENTS.md    ← repo/instructions/common.md + codex-only.md (assembled)
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

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
AGENTS_DIR="$HOME/.agents"
CODEX_EXCLUDE="$REPO_DIR/codex-exclude"

DIRS_TO_LINK=(skills agents hooks scripts)

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
    local dirs=("$CLAUDE_DIR" "$AGENTS_DIR" "$CLAUDE_DIR/skills-archive")

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

# ─── Read codex-exclude into a lookup list ────────────────────────────────────

load_codex_excludes() {
    CODEX_EXCLUDED_SKILLS=()
    if [[ -f "$CODEX_EXCLUDE" ]]; then
        while IFS= read -r line; do
            [[ -z "$line" || "$line" == \#* ]] && continue
            line=$(echo "$line" | xargs)
            [[ -z "$line" ]] && continue
            CODEX_EXCLUDED_SKILLS+=("$line")
        done < "$CODEX_EXCLUDE"
    fi
}

is_codex_excluded() {
    local skill="$1"
    for excluded in "${CODEX_EXCLUDED_SKILLS[@]}"; do
        if [[ "$skill" == "$excluded" ]]; then
            return 0
        fi
    done
    return 1
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

assemble_instructions() {
    local instructions_dir="$REPO_DIR/instructions"

    if [[ ! -d "$instructions_dir" ]]; then
        echo "  ⏭  No instructions/ directory in repo, skipping"
        return
    fi

    local -a targets=(
        "$CLAUDE_DIR/CLAUDE.md:common.md:claude-only.md"
        "$AGENTS_DIR/AGENTS.md:common.md:codex-only.md"
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
        "$AGENTS_DIR/AGENTS.md"
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

    # Migrate from old directory-level symlink to per-skill symlinks
    if [[ -L "$target" ]]; then
        if $DRY_RUN; then
            echo "  [dry-run] Would migrate from directory symlink to per-skill symlinks"
        else
            rm "$target"
            echo "  ↑  Migrating from directory symlink to per-skill symlinks"
        fi
    fi

    # Ensure skills directory exists as a real directory
    if [[ ! -d "$target" ]]; then
        if $DRY_RUN; then
            echo "  [dry-run] Would create $target/"
        else
            mkdir -p "$target"
        fi
    fi

    load_codex_excludes

    local linked=0
    local excluded=0
    local already=0

    # Remove stale symlinks (skills that were deleted or newly excluded)
    for existing in "$target"/*/; do
        [[ -L "${existing%/}" || -d "$existing" ]] || continue
        local skill_name
        skill_name="$(basename "$existing")"

        if [[ -L "${existing%/}" ]]; then
            if is_codex_excluded "$skill_name"; then
                if $DRY_RUN; then
                    echo "  [dry-run] Would remove excluded skill: $skill_name"
                else
                    rm "${existing%/}"
                    echo "  ✗  Removed excluded: $skill_name"
                fi
            elif [[ ! -d "$skills_source/$skill_name" ]]; then
                if $DRY_RUN; then
                    echo "  [dry-run] Would remove stale link: $skill_name"
                else
                    rm "${existing%/}"
                    echo "  🗑  Removed stale: $skill_name"
                fi
            fi
        fi
    done

    # Link each skill, skipping excluded ones
    for skill_dir in "$skills_source"/*/; do
        [[ -d "$skill_dir" ]] || continue
        local skill_name
        skill_name="$(basename "$skill_dir")"
        local skill_target="$target/$skill_name"

        if is_codex_excluded "$skill_name"; then
            excluded=$((excluded + 1))
            continue
        fi

        if [[ -L "$skill_target" ]]; then
            local current
            current=$(readlink "$skill_target")
            if [[ "$current" == "$skill_dir" || "$current" == "${skill_dir%/}" ]]; then
                already=$((already + 1))
                continue
            else
                if ! $DRY_RUN; then
                    rm "$skill_target"
                fi
            fi
        fi

        if $DRY_RUN; then
            echo "  [dry-run] Would link: $skill_name"
        else
            ln -s "$skill_dir" "$skill_target"
        fi
        linked=$((linked + 1))
    done

    if $DRY_RUN; then
        echo "  [dry-run] Would link $linked skills, skip $excluded excluded"
    else
        echo "  ✓  $linked linked, $already already current, $excluded excluded"
    fi
}

unlink_agents_skills() {
    local target="$AGENTS_DIR/skills"

    # Handle legacy directory-level symlink
    if [[ -L "$target" ]]; then
        local link_target=$(readlink "$target")
        if [[ "$link_target" == "$REPO_DIR/skills" ]]; then
            rm "$target"
            echo "  ✓  Removed directory symlink: skills"
        else
            echo "  ⏭  skills points elsewhere, skipping"
        fi
        return
    fi

    # Handle per-skill symlinks
    if [[ -d "$target" ]]; then
        local removed=0
        for skill_link in "$target"/*/; do
            [[ -L "${skill_link%/}" ]] || continue
            local link_dest
            link_dest=$(readlink "${skill_link%/}")
            if [[ "$link_dest" == "$REPO_DIR/skills/"* ]]; then
                rm "${skill_link%/}"
                removed=$((removed + 1))
            fi
        done
        if [[ $removed -gt 0 ]]; then
            echo "  ✓  Removed $removed skill symlinks"
        else
            echo "  ⏭  No repo skill symlinks found"
        fi
    else
        echo "  ⏭  skills (not present, skipping)"
    fi
}

# ─── Verify: check current state without changing anything ────────────────────

verify() {
    echo "Verifying current setup..."
    echo ""

    local issues=0

    # Check target directories exist
    echo "Target directories:"
    for dir in "$CLAUDE_DIR" "$AGENTS_DIR"; do
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

    # Check Agents per-skill symlinks
    echo "Agents skills (Codex reads from here):"
    local agents_target="$AGENTS_DIR/skills"
    if [[ -L "$agents_target" ]]; then
        echo "  ⚠  Directory-level symlink (should be per-skill). Run setup.sh to migrate."
        issues=$((issues + 1))
    elif [[ -d "$agents_target" ]]; then
        load_codex_excludes
        local agents_ok=0
        local agents_missing=0
        local agents_excluded=0
        for skill_dir in "$REPO_DIR/skills"/*/; do
            [[ -d "$skill_dir" ]] || continue
            local sname
            sname="$(basename "$skill_dir")"
            if is_codex_excluded "$sname"; then
                agents_excluded=$((agents_excluded + 1))
                if [[ -L "$agents_target/$sname" ]]; then
                    echo "  ⚠  $sname is excluded but still linked"
                    issues=$((issues + 1))
                fi
                continue
            fi
            if [[ -L "$agents_target/$sname" ]]; then
                agents_ok=$((agents_ok + 1))
            else
                agents_missing=$((agents_missing + 1))
            fi
        done
        echo "  ✓  $agents_ok linked, $agents_excluded excluded"
        if [[ $agents_missing -gt 0 ]]; then
            echo "  ✗  $agents_missing skills missing"
            issues=$((issues + 1))
        fi
    else
        echo "  ✗  $agents_target (missing)"
        issues=$((issues + 1))
    fi
    echo ""

    # Check assembled instructions
    echo "System instructions:"
    if [[ -f "$CLAUDE_DIR/CLAUDE.md" ]]; then
        echo "  ✓  CLAUDE.md exists"
    else
        echo "  ✗  CLAUDE.md missing"
        issues=$((issues + 1))
    fi
    if [[ -f "$AGENTS_DIR/AGENTS.md" ]]; then
        echo "  ✓  AGENTS.md exists"
    else
        echo "  ✗  AGENTS.md missing"
        issues=$((issues + 1))
    fi
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
    echo ""
    echo "Agents skills:"
    unlink_agents_skills
    echo ""
    echo "System instructions:"
    disassemble_instructions
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
    echo "Agents skills (per-skill, honoring codex-exclude):"
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
        echo "Run ./setup.sh --verify to confirm everything is healthy."
        echo ""
        echo "Notes:"
        echo "  • See templates/ for settings and MCP config examples"
        echo ""
        echo "First time? See FORKING.md for customization guide."
    fi
fi
