#!/bin/bash
#
# skill-manager.sh — Unified skill management CLI
#
# Subcommands:
#   usage    — Show skill usage frequency (which skills you actually use)
#   dupes    — Detect redundant or duplicate skills
#   check    — Verify skills are available to Claude and Codex
#   sync     — Validate skills are synced between repo and runtimes
#   update   — Check for npx-installed skill updates
#   report   — Full audit (runs all checks)
#   log      — Log a skill invocation (called by hook)
#   prune    — List candidates for removal (low usage + high overlap)
#
# Usage:
#   ./scripts/skill-manager.sh <subcommand> [options]
#   ./scripts/skill-manager.sh report          # full audit
#   ./scripts/skill-manager.sh usage --top 10  # top 10 used skills
#   ./scripts/skill-manager.sh dupes           # find duplicates
#

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
AGENTS_DIR="$HOME/.agents"
SKILLS_DIR="$REPO_DIR/skills"
USAGE_LOG="$CLAUDE_DIR/skill-usage.jsonl"
CODEX_EXCLUDE="$REPO_DIR/codex-exclude"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

header() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━ $1 ━━━${NC}"
    echo ""
}

ok()   { echo -e "  ${GREEN}✓${NC}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✗${NC}  $1"; }
info() { echo -e "  ${CYAN}ℹ${NC}  $1"; }
dim()  { echo -e "  ${DIM}$1${NC}"; }

# ─── log: Record a skill invocation ───────────────────────────────────────────

cmd_log() {
    local skill_name="${1:-}"
    if [[ -z "$skill_name" ]]; then
        echo "Usage: skill-manager log <skill-name>" >&2
        return 1
    fi

    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local project="${PWD}"

    mkdir -p "$(dirname "$USAGE_LOG")"
    echo "{\"skill\":\"$skill_name\",\"ts\":\"$timestamp\",\"project\":\"$project\"}" >> "$USAGE_LOG"
}

# ─── usage: Show skill usage frequency ────────────────────────────────────────

cmd_usage() {
    local top_n="${1:-0}"
    header "Skill Usage Report"

    if [[ ! -f "$USAGE_LOG" ]]; then
        info "No usage data yet. Usage is tracked automatically via the PostToolUse hook."
        info "Invoke skills normally and data will accumulate over time."
        echo ""
        return 0
    fi

    local total_invocations
    total_invocations=$(wc -l < "$USAGE_LOG" | tr -d ' ')
    info "Total invocations recorded: ${BOLD}$total_invocations${NC}"
    echo ""

    # List all repo skills
    local all_skills=()
    if [[ -d "$SKILLS_DIR" ]]; then
        while IFS= read -r d; do
            all_skills+=("$(basename "$d")")
        done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
    fi

    # Count usage per skill
    local usage_counts
    usage_counts=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="skill"){print $(i+2)}}}' "$USAGE_LOG" | sort | uniq -c | sort -rn)

    echo -e "  ${BOLD}Count  Last Used    Skill${NC}"
    echo -e "  ${DIM}─────  ──────────   ─────${NC}"

    local displayed=0
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        local count skill last_used
        count=$(echo "$line" | awk '{print $1}')
        skill=$(echo "$line" | awk '{print $2}')

        # Find last usage timestamp
        last_used=$(grep "\"skill\":\"$skill\"" "$USAGE_LOG" | tail -1 | awk -F'"' '{for(i=1;i<=NF;i++){if($i=="ts"){print $(i+2)}}}' | cut -c1-10)

        printf "  ${GREEN}%5d${NC}  %s   %s\n" "$count" "$last_used" "$skill"
        displayed=$((displayed + 1))
        if [[ "$top_n" -gt 0 && "$displayed" -ge "$top_n" ]]; then
            break
        fi
    done <<< "$usage_counts"

    # Find never-used skills
    echo ""
    local never_used=()
    for s in "${all_skills[@]}"; do
        if ! echo "$usage_counts" | awk '{print $2}' | grep -qx "$s"; then
            never_used+=("$s")
        fi
    done

    if [[ ${#never_used[@]} -gt 0 ]]; then
        echo -e "  ${YELLOW}Never used (${#never_used[@]} skills):${NC}"
        for s in "${never_used[@]}"; do
            dim "    $s"
        done
    fi
    echo ""
}

# ─── dupes: Detect redundant or duplicate skills ─────────────────────────────

cmd_dupes() {
    header "Redundancy & Duplicate Detection"

    if [[ ! -d "$SKILLS_DIR" ]]; then
        fail "Skills directory not found: $SKILLS_DIR"
        return 1
    fi

    local tmpdir
    tmpdir=$(mktemp -d)
    trap "rm -rf $tmpdir" RETURN

    # Extract skill metadata to temp files
    local skill_list="$tmpdir/skills.txt"
    : > "$skill_list"

    for skill_dir in "$SKILLS_DIR"/*/; do
        local skill_id
        skill_id="$(basename "$skill_dir")"
        local skill_file="$skill_dir/SKILL.md"

        [[ -f "$skill_file" ]] || continue

        echo "$skill_id" >> "$skill_list"

        # Extract description from frontmatter
        local desc
        desc=$(awk '/^---$/{if(++c==2)exit} c==1 && /^description:/{found=1; sub(/^description:\s*/,""); line=$0} c==1 && found && /^  /{line=line " " $0} END{print line}' "$skill_file" | head -c 200)
        echo "$desc" > "$tmpdir/${skill_id}.desc"

        # Extract keywords (lowercase words > 4 chars, excluding stop words)
        echo "$desc" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alpha:]' '\n' | \
            awk 'length > 4' | \
            grep -vxE '(about|after|asked|based|before|being|between|claude|could|doing|every|first|given|going|helps|might|needs|never|other|asked|should|skill|since|start|state|their|these|thing|those|under|until|using|wants|which|where|while|would|asked|asked)' | \
            sort -u > "$tmpdir/${skill_id}.kw"
    done

    # Group by prefix pattern
    echo -e "  ${BOLD}Skills by prefix group:${NC}"
    echo ""

    local prefixes=("method-" "agent-" "vercel-" "swiftui-" "claude-md-" "plugin-dev:" "architecture-")
    for prefix in "${prefixes[@]}"; do
        local count
        count=$(grep -c "^${prefix}" "$skill_list" 2>/dev/null || true)
        count=$(echo "$count" | tr -d '[:space:]')
        count="${count:-0}"
        if [[ "$count" -gt 1 ]]; then
            info "${BOLD}${prefix}*${NC} ($count skills)"
            grep "^${prefix}" "$skill_list" | while IFS= read -r sid; do
                local short_desc
                short_desc=$(head -c 80 "$tmpdir/${sid}.desc" 2>/dev/null)
                dim "    $sid — $short_desc"
            done
            echo ""
        fi
    done

    # Find keyword overlaps between non-grouped skills
    echo -e "  ${BOLD}Potential overlaps (shared keywords):${NC}"
    echo ""

    local skill_ids=()
    while IFS= read -r sid; do
        skill_ids+=("$sid")
    done < "$skill_list"

    local found_overlap=false
    for ((i=0; i<${#skill_ids[@]}; i++)); do
        for ((j=i+1; j<${#skill_ids[@]}; j++)); do
            local s1="${skill_ids[$i]}"
            local s2="${skill_ids[$j]}"

            # Skip if same prefix group (already reported)
            local same_group=false
            for prefix in "${prefixes[@]}"; do
                if [[ "$s1" == ${prefix}* && "$s2" == ${prefix}* ]]; then
                    same_group=true
                    break
                fi
            done
            $same_group && continue

            # Count shared keywords using comm
            local shared_file="$tmpdir/shared_${i}_${j}.txt"
            comm -12 "$tmpdir/${s1}.kw" "$tmpdir/${s2}.kw" > "$shared_file" 2>/dev/null
            local shared
            shared=$(wc -l < "$shared_file" | tr -d ' ')
            local total1
            total1=$(wc -l < "$tmpdir/${s1}.kw" | tr -d ' ')
            local total2
            total2=$(wc -l < "$tmpdir/${s2}.kw" | tr -d ' ')

            # Flag if > 40% of the smaller skill's keywords overlap
            local min_total=$total1
            [[ $total2 -lt $min_total ]] && min_total=$total2

            if [[ $min_total -gt 0 && $shared -gt 3 ]]; then
                local pct=$((shared * 100 / min_total))
                if [[ $pct -ge 40 ]]; then
                    found_overlap=true
                    local shared_words
                    shared_words=$(tr '\n' ' ' < "$shared_file")
                    warn "${BOLD}$s1${NC} <-> ${BOLD}$s2${NC} (${pct}% keyword overlap)"
                    dim "    Shared: $shared_words"
                    echo ""
                fi
            fi
            rm -f "$shared_file"
        done
    done

    if ! $found_overlap; then
        ok "No high-overlap pairs detected outside of known groups."
    fi
    echo ""
}

# ─── check: Verify availability for Claude and Codex ─────────────────────────

cmd_check() {
    header "Skill Availability Check"

    local claude_skills_dir="$CLAUDE_DIR/skills"
    local agents_skills_dir="$AGENTS_DIR/skills"

    # Check Claude skills directory
    echo -e "  ${BOLD}Claude Code (~/.claude/skills):${NC}"
    if [[ -L "$claude_skills_dir" ]]; then
        local target
        target=$(readlink "$claude_skills_dir")
        if [[ "$target" == "$SKILLS_DIR" ]]; then
            ok "Symlinked to repo ($target)"
        else
            warn "Symlinked to different location: $target"
        fi
    elif [[ -d "$claude_skills_dir" ]]; then
        warn "Is a regular directory (not symlinked to repo)"
    else
        fail "Not found"
    fi
    echo ""

    # Check Agents skills directory (Codex reads from here)
    echo -e "  ${BOLD}Agents/Codex (~/.agents/skills):${NC}"
    if [[ -d "$agents_skills_dir" && ! -L "$agents_skills_dir" ]]; then
        # Per-skill symlinks (expected)
        local linked=0
        local broken=0
        for link in "$agents_skills_dir"/*/; do
            [[ -L "${link%/}" ]] || continue
            if [[ -d "$link" ]]; then
                linked=$((linked + 1))
            else
                broken=$((broken + 1))
            fi
        done
        ok "$linked skills linked (per-skill)"
        if [[ $broken -gt 0 ]]; then
            warn "$broken broken symlinks"
        fi
    elif [[ -L "$agents_skills_dir" ]]; then
        local target
        target=$(readlink "$agents_skills_dir")
        warn "Directory-level symlink ($target) — run ./setup.sh to migrate to per-skill"
    else
        fail "Not found — run ./setup.sh to link"
    fi
    echo ""

    # Validate each skill has proper SKILL.md
    echo -e "  ${BOLD}Skill structure validation:${NC}"
    local valid=0
    local invalid=0
    local issues=()

    for skill_dir in "$SKILLS_DIR"/*/; do
        local skill_id
        skill_id="$(basename "$skill_dir")"
        local skill_file="$skill_dir/SKILL.md"

        if [[ ! -f "$skill_file" ]]; then
            issues+=("$skill_id: missing SKILL.md")
            invalid=$((invalid + 1))
            continue
        fi

        # Check frontmatter exists
        if ! head -1 "$skill_file" | grep -q '^---$'; then
            issues+=("$skill_id: SKILL.md missing frontmatter")
            invalid=$((invalid + 1))
            continue
        fi

        # Check name field
        if ! awk '/^---$/{if(++c==2)exit} c==1' "$skill_file" | grep -q '^name:'; then
            issues+=("$skill_id: missing 'name' in frontmatter")
            invalid=$((invalid + 1))
            continue
        fi

        # Check description field
        if ! awk '/^---$/{if(++c==2)exit} c==1' "$skill_file" | grep -q '^description:'; then
            issues+=("$skill_id: missing 'description' in frontmatter")
            invalid=$((invalid + 1))
            continue
        fi

        valid=$((valid + 1))
    done

    ok "$valid skills have valid structure"
    if [[ ${#issues[@]} -gt 0 ]]; then
        fail "$invalid skills have issues:"
        for issue in "${issues[@]}"; do
            dim "    $issue"
        done
    fi
    echo ""

    # Check Codex exclusions
    echo -e "  ${BOLD}Codex exclusions (codex-exclude):${NC}"
    if [[ -f "$CODEX_EXCLUDE" ]]; then
        local excluded=0
        while IFS= read -r line; do
            [[ -z "$line" || "$line" == \#* ]] && continue
            line=$(echo "$line" | xargs)
            [[ -z "$line" ]] && continue
            if [[ -d "$SKILLS_DIR/$line" ]]; then
                dim "    $line (excluded from Codex)"
                excluded=$((excluded + 1))
            else
                warn "$line listed in codex-exclude but doesn't exist in skills/"
            fi
        done < "$CODEX_EXCLUDE"
        info "$excluded skills excluded from Codex"
    else
        info "No codex-exclude file found"
    fi
    echo ""
}

# ─── sync: Validate repo sync status ─────────────────────────────────────────

cmd_sync() {
    header "Repo Sync Validation"

    local claude_skills_dir="$CLAUDE_DIR/skills"
    local agents_skills_dir="$AGENTS_DIR/skills"

    local all_synced=true

    echo -e "  ${BOLD}Symlink status:${NC}"

    # Claude: directory-level symlink
    if [[ -L "$claude_skills_dir" ]]; then
        local target
        target=$(readlink "$claude_skills_dir")
        if [[ "$target" == "$SKILLS_DIR" ]]; then
            ok "Claude: linked to repo"
        else
            fail "Claude: linked to wrong location ($target)"
            all_synced=false
        fi
    elif [[ -d "$claude_skills_dir" ]]; then
        fail "Claude: regular directory (not symlinked)"
        all_synced=false
    else
        fail "Claude: directory missing"
        all_synced=false
    fi

    # Agents: per-skill symlinks
    if [[ -d "$agents_skills_dir" && ! -L "$agents_skills_dir" ]]; then
        ok "Agents: per-skill symlinks"
    elif [[ -L "$agents_skills_dir" ]]; then
        warn "Agents: directory-level symlink (run ./setup.sh to migrate to per-skill)"
        all_synced=false
    else
        fail "Agents: directory missing"
        all_synced=false
    fi
    echo ""

    # Check git status of skills directory
    echo -e "  ${BOLD}Git status for skills/:${NC}"
    local git_status
    git_status=$(cd "$REPO_DIR" && git status --porcelain -- skills/ 2>/dev/null || echo "")

    if [[ -z "$git_status" ]]; then
        ok "Skills directory is clean (no uncommitted changes)"
    else
        warn "Uncommitted changes in skills/:"
        echo "$git_status" | while IFS= read -r line; do
            dim "    $line"
        done
    fi
    echo ""

    # Check for skills in archive that might need cleanup
    local archive_dir="$CLAUDE_DIR/skills-archive"
    if [[ -d "$archive_dir" ]]; then
        echo -e "  ${BOLD}Archived skills ($archive_dir):${NC}"
        local archived_count=0
        for d in "$archive_dir"/*/; do
            [[ -d "$d" ]] || continue
            dim "    $(basename "$d")"
            archived_count=$((archived_count + 1))
        done
        info "$archived_count skills in archive"
    fi
    echo ""

    if $all_synced; then
        ok "All runtime directories are properly synced to repo."
    else
        warn "Run ./setup.sh to fix symlinks."
    fi
    echo ""
}

# ─── update: Check for npx skill updates ─────────────────────────────────────

cmd_update() {
    header "Skill Update Check"

    # Check if npx skills CLI is available
    if ! command -v npx &>/dev/null; then
        fail "npx not found. Install Node.js to use the skills CLI."
        return 1
    fi

    info "Checking for updates via skills CLI..."
    echo ""

    # Run npx skills check
    local check_output
    if check_output=$(npx skills check 2>&1); then
        echo "$check_output" | while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                echo "  $line"
            fi
        done
    else
        warn "Skills CLI check returned non-zero. Output:"
        echo "$check_output" | while IFS= read -r line; do
            dim "    $line"
        done
    fi
    echo ""

    # Show installed skills version info
    info "To update all skills: npx skills update"
    info "To update one skill:  npx skills update <name>"
    echo ""
}

# ─── prune: List candidates for removal ──────────────────────────────────────

cmd_prune() {
    header "Prune Candidates"

    local total_skills=0
    local candidates=()

    # Count all skills
    for skill_dir in "$SKILLS_DIR"/*/; do
        [[ -d "$skill_dir" ]] || continue
        total_skills=$((total_skills + 1))
    done

    info "Analyzing $total_skills skills for prune candidates..."
    echo ""

    # If usage data exists, find low-usage skills
    if [[ -f "$USAGE_LOG" ]]; then
        local total_invocations
        total_invocations=$(wc -l < "$USAGE_LOG" | tr -d ' ')

        # Get usage counts
        local usage_counts
        usage_counts=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="skill"){print $(i+2)}}}' "$USAGE_LOG" | sort | uniq -c | sort -rn)

        # Find skills used 0-1 times
        echo -e "  ${BOLD}Low usage (0-1 invocations):${NC}"
        for skill_dir in "$SKILLS_DIR"/*/; do
            [[ -d "$skill_dir" ]] || continue
            local skill_id
            skill_id="$(basename "$skill_dir")"
            local count
            count=$(echo "$usage_counts" | awk -v s="$skill_id" '$2==s{print $1}')
            count="${count:-0}"

            if [[ "$count" -le 1 ]]; then
                local desc=""
                local skill_file="$skill_dir/SKILL.md"
                if [[ -f "$skill_file" ]]; then
                    desc=$(awk '/^---$/{if(++c==2)exit} c==1 && /^description:/{sub(/^description:\s*/,""); print}' "$skill_file" | head -c 60)
                fi
                candidates+=("$skill_id")
                if [[ "$count" -eq 0 ]]; then
                    dim "    ${YELLOW}[never used]${NC} $skill_id — $desc"
                else
                    dim "    ${DIM}[used once]${NC}  $skill_id — $desc"
                fi
            fi
        done
    else
        info "No usage data available yet. Start using skills to build a usage profile."
        info "All skills without usage data are listed below:"
        echo ""
        for skill_dir in "$SKILLS_DIR"/*/; do
            [[ -d "$skill_dir" ]] || continue
            local skill_id
            skill_id="$(basename "$skill_dir")"
            candidates+=("$skill_id")
            dim "    $skill_id"
        done
    fi

    echo ""
    info "${#candidates[@]} of $total_skills skills are prune candidates."
    info "Review these skills and archive any you don't need:"
    dim "    mv skills/<name> ~/.claude/skills-archive/"
    echo ""
}

# ─── report: Full audit ──────────────────────────────────────────────────────

cmd_report() {
    echo ""
    echo -e "${BOLD}${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║     Skill Manager — Full Audit      ║${NC}"
    echo -e "${BOLD}${BLUE}╚══════════════════════════════════════╝${NC}"

    local skill_count=0
    for d in "$SKILLS_DIR"/*/; do
        [[ -d "$d" ]] && skill_count=$((skill_count + 1))
    done
    echo ""
    info "Skills in repo: ${BOLD}$skill_count${NC}"
    info "Report generated: $(date '+%Y-%m-%d %H:%M')"

    cmd_check
    cmd_sync
    cmd_dupes
    cmd_usage
    cmd_prune

    echo ""
    echo -e "${BOLD}${BLUE}━━━ Update Check ━━━${NC}"
    echo ""
    info "Run '${BOLD}skill-manager update${NC}' separately to check for npx skill updates."
    info "(Skipped in report because it requires network access.)"
    echo ""

    echo -e "${BOLD}${GREEN}Audit complete.${NC}"
    echo ""
}

# ─── Main dispatch ────────────────────────────────────────────────────────────

usage() {
    echo "Usage: skill-manager <command> [options]"
    echo ""
    echo "Commands:"
    echo "  usage [--top N]  Show skill usage frequency"
    echo "  dupes            Detect redundant/duplicate skills"
    echo "  check            Verify skill availability for Claude/Codex"
    echo "  sync             Validate repo sync status"
    echo "  update           Check for npx skill updates"
    echo "  prune            List candidates for removal"
    echo "  report           Full audit (runs all checks)"
    echo "  log <name>       Log a skill invocation (used by hook)"
    echo ""
    echo "Examples:"
    echo "  skill-manager report         # run full audit"
    echo "  skill-manager usage --top 10 # top 10 most-used skills"
    echo "  skill-manager dupes          # find redundant skills"
}

main() {
    local cmd="${1:-}"
    shift 2>/dev/null || true

    case "$cmd" in
        usage)
            local top_n=0
            while [[ $# -gt 0 ]]; do
                case "$1" in
                    --top) top_n="${2:-10}"; shift 2 ;;
                    *) shift ;;
                esac
            done
            cmd_usage "$top_n"
            ;;
        dupes)     cmd_dupes ;;
        check)     cmd_check ;;
        sync)      cmd_sync ;;
        update)    cmd_update ;;
        prune)     cmd_prune ;;
        report)    cmd_report ;;
        log)       cmd_log "$@" ;;
        help|--help|-h)  usage ;;
        "")        usage ;;
        *)
            echo "Unknown command: $cmd" >&2
            echo "" >&2
            usage >&2
            exit 1
            ;;
    esac
}

main "$@"
