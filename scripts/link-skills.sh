#!/bin/sh
#
# Links skills into each agent's skills directory.
#
#   repo skills/<name>         -> ~/.claude/skills/<name> and ~/.codex/skills/<name>
#   ~/.agents/skills/<name>    -> ~/.claude/skills/<name>
#
# Codex reads ~/.agents/skills on its own, so store skills only need linking
# for Claude. Each agent directory stays a real directory that its own tools
# also write to (skills.sh installs, Claude Code's synced/ folder), so this
# script only touches links that point into the repo or the store.
#
# Prints nothing when there is nothing to do: SessionStart hook output goes
# into the model's context.
#
# Usage: link-skills.sh [--remove]
#   --remove  delete every link this script manages (used by setup.sh --undo)

set -eu

REPO_SKILLS=$(CDPATH='' cd "$(dirname "$0")/../skills" && pwd -P)
STORE=$HOME/.agents/skills
CLAUDE_DIR=${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}
CODEX_DIR=${CODEX_SKILLS_DIR:-$HOME/.codex/skills}
STORE_REAL=$(CDPATH='' cd "$STORE" 2>/dev/null && pwd -P || echo "$STORE")

REMOVE=0
[ "${1:-}" = "--remove" ] && REMOVE=1

say() { printf 'link-skills: %s\n' "$1"; }

is_skill() { [ -f "$1/SKILL.md" ]; }

# A link is ours when its target, as written, is inside the repo's skills
# folder or the store. Dangling links count, so deleted skills get cleaned up.
is_managed_link() {
    [ -L "$1" ] || return 1
    case "$(readlink "$1")" in
        "$REPO_SKILLS"/*|"$STORE"/*|"$STORE_REAL"/*|../../.agents/skills/*) return 0 ;;
    esac
    return 1
}

# ensure_link <agent dir> <name> <source dir>
ensure_link() {
    dest=$1/$2
    if [ -L "$dest" ]; then
        # Any link that already resolves to the source is fine, including the
        # relative links skills.sh writes.
        [ "$(realpath "$dest" 2>/dev/null)" = "$(realpath "$3")" ] && return 0
        if is_managed_link "$dest"; then
            rm "$dest"
        else
            say "WARN $dest points at $(readlink "$dest"), not $3; left alone"
            return 0
        fi
    elif [ -e "$dest" ]; then
        say "WARN $dest is a real directory, so it hides $3; compare them, then replace it with a link"
        return 0
    fi
    ln -s "$3" "$dest"
    say "linked $dest"
}

# prune <agent dir> <include store: 1|0>
prune() {
    for link in "$1"/* "$1"/.[!.]*; do
        is_managed_link "$link" || continue
        name=$(basename "$link")
        if [ "$REMOVE" = "0" ] && [ -e "$link" ]; then
            is_skill "$REPO_SKILLS/$name" && continue
            [ "$2" = "1" ] && is_skill "$STORE/$name" && continue
        fi
        rm "$link"
        say "removed $link"
    done
}

for dir in "$CLAUDE_DIR" "$CODEX_DIR"; do
    if [ -L "$dir" ]; then
        say "WARN $dir is a symlink; it must be a real directory. Run ./setup.sh"
        exit 0
    fi
    mkdir -p "$dir"
done

prune "$CLAUDE_DIR" 1
prune "$CODEX_DIR" 0
[ "$REMOVE" = "1" ] && exit 0

for src in "$REPO_SKILLS"/*/; do
    src=${src%/}
    is_skill "$src" || continue
    name=$(basename "$src")
    ensure_link "$CLAUDE_DIR" "$name" "$src"
    ensure_link "$CODEX_DIR" "$name" "$src"
done

for src in "$STORE"/*; do
    is_skill "$src" || continue
    name=$(basename "$src")
    if is_skill "$REPO_SKILLS/$name"; then
        say "WARN $name is both in the repo and in $STORE; the repo copy is linked"
        continue
    fi
    ensure_link "$CLAUDE_DIR" "$name" "$STORE/$name"
done
