#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd -P)
REPO_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd -P)
REPO_SKILLS_DIR=$REPO_DIR/skills
CODEX_SKILLS_DIR=$HOME/.codex/skills
CODEX_EXCLUDE_FILE=$REPO_DIR/codex-exclude

removed_broken=0
created_new=0
total_valid=0
excluded=0
shadowed=0
shadowed_names=

is_codex_excluded() {
    [ -f "$CODEX_EXCLUDE_FILE" ] || return 1
    while IFS= read -r line; do
        case $line in ''|\#*) continue ;; esac
        [ "$line" = "$1" ] && return 0
    done < "$CODEX_EXCLUDE_FILE"
    return 1
}

link_points_into_repo_skills() {
    raw_target=$(readlink "$1")
    case "$raw_target" in
        /*)
            case ${raw_target%/} in
                "$REPO_SKILLS_DIR"/*) return 0 ;;
                *) return 1 ;;
            esac
            ;;
        *)
            absolute_target=$(
                cd "$(dirname "$1")" &&
                cd "$raw_target" &&
                pwd -P
            ) || return 1
            case "$absolute_target" in
                "$REPO_SKILLS_DIR"/*) return 0 ;;
                *) return 1 ;;
            esac
            ;;
    esac
}

mkdir -p "$CODEX_SKILLS_DIR"

for existing in "$CODEX_SKILLS_DIR"/*; do
    [ -L "$existing" ] || continue

    # Only manage links that point into the repo's skills dir; leave
    # links owned by other tools alone.
    link_points_into_repo_skills "$existing" || continue

    skill_name=$(basename "$existing")
    expected=$REPO_SKILLS_DIR/$skill_name
    raw_target=$(readlink "$existing")

    if [ ! -d "$expected" ] || is_codex_excluded "$skill_name"; then
        # Repo skill was removed, or is excluded from Codex
        rm "$existing"
        removed_broken=$((removed_broken + 1))
    elif [ "${raw_target#/}" = "$raw_target" ] || [ "${raw_target%/}" != "$expected" ]; then
        # Relative or wrong-target link; removed here, recreated absolute below
        rm "$existing"
        removed_broken=$((removed_broken + 1))
    elif [ ! -e "$existing" ]; then
        rm "$existing"
        removed_broken=$((removed_broken + 1))
    fi
done

for skill_dir in "$REPO_SKILLS_DIR"/*; do
    [ -d "$skill_dir" ] || continue

    skill_name=$(basename "$skill_dir")
    skill_link=$CODEX_SKILLS_DIR/$skill_name

    if is_codex_excluded "$skill_name"; then
        excluded=$((excluded + 1))
        continue
    fi

    # A real directory sitting where a link belongs is a shadow: Codex reads
    # that copy and every later edit to the repo skill silently fails to reach
    # it. Two had drifted this way, one by three weeks. It is not removed
    # automatically — the copy could hold edits made directly in ~/.codex — but
    # it must not pass unmentioned, which is what the old blanket skip did.
    if [ -d "$skill_link" ] && [ ! -L "$skill_link" ]; then
        shadowed=$((shadowed + 1))
        shadowed_names="$shadowed_names $skill_name"
        continue
    fi

    if [ -e "$skill_link" ] || [ -L "$skill_link" ]; then
        continue
    fi

    ln -s "$skill_dir" "$skill_link"
    created_new=$((created_new + 1))
done

for existing in "$CODEX_SKILLS_DIR"/*; do
    [ -L "$existing" ] || continue
    [ -e "$existing" ] || continue
    link_points_into_repo_skills "$existing" && total_valid=$((total_valid + 1))
done

printf 'Removed %s broken symlinks, created %s new symlinks, %s excluded, %s total valid symlinks.\n' \
    "$removed_broken" \
    "$created_new" \
    "$excluded" \
    "$total_valid"

if [ "$shadowed" -gt 0 ]; then
    printf 'WARNING: %s repo skill(s) shadowed by a real directory in %s:%s\n' \
        "$shadowed" "$CODEX_SKILLS_DIR" "$shadowed_names"
    printf '  Codex reads that copy, not the repo. Compare, then replace with a link:\n'
    printf '    diff -r %s/<name> %s/<name>\n' "$CODEX_SKILLS_DIR" "$REPO_SKILLS_DIR"
fi
