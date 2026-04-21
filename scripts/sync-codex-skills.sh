#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd -P)
REPO_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd -P)
REPO_SKILLS_DIR=$REPO_DIR/skills
CODEX_SKILLS_DIR=$HOME/.codex/skills

removed_broken=0
created_new=0
total_valid=0

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

    expected="$REPO_SKILLS_DIR/$(basename "$existing")"
    if [ ! -d "$expected" ]; then
        continue
    fi

    raw_target=$(readlink "$existing")

    if [ "${raw_target#/}" = "$raw_target" ] || [ "${raw_target%/}" != "$expected" ]; then
        rm "$existing"
        removed_broken=$((removed_broken + 1))
    elif ! link_points_into_repo_skills "$existing"; then
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

printf 'Removed %s broken symlinks, created %s new symlinks, %s total valid symlinks.\n' \
    "$removed_broken" \
    "$created_new" \
    "$total_valid"
