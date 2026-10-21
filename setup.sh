#!/bin/sh
#
# Wires this repo into Claude Code and Codex.
#
#   ~/.claude/scripts        -> repo/scripts
#   ~/.claude/skills/<name>  -> repo/skills/<name>, and each skill in ~/.agents/skills
#   ~/.codex/skills/<name>   -> repo/skills/<name>
#
# ~/.claude/settings.json belongs to Claude Code and is never linked. When it
# is missing, setup copies the snapshot written by scripts/settings-snapshot.sh.
#
# Usage:
#   ./setup.sh          create the links
#   ./setup.sh --undo   remove them
#
# To check the result, run scripts/skill-doctor.sh.

set -eu

REPO_DIR=$(CDPATH='' cd "$(dirname "$0")" && pwd -P)
SCRIPTS_LINK=$HOME/.claude/scripts
SETTINGS=$HOME/.claude/settings.json
SNAPSHOT=${CLAUDE_SETTINGS_SNAPSHOT:-$HOME/.agents/claude/settings.json}

if [ "${1:-}" = "--undo" ]; then
    if [ "$(readlink "$SCRIPTS_LINK" 2>/dev/null)" = "$REPO_DIR/scripts" ]; then
        rm "$SCRIPTS_LINK"
        echo "removed $SCRIPTS_LINK"
    fi
    "$REPO_DIR/scripts/link-skills.sh" --remove
    exit 0
fi

mkdir -p "$HOME/.claude"

if [ -L "$SCRIPTS_LINK" ] || [ ! -e "$SCRIPTS_LINK" ]; then
    if [ "$(readlink "$SCRIPTS_LINK" 2>/dev/null)" != "$REPO_DIR/scripts" ]; then
        rm -f "$SCRIPTS_LINK"
        ln -s "$REPO_DIR/scripts" "$SCRIPTS_LINK"
        echo "linked $SCRIPTS_LINK"
    fi
else
    echo "$SCRIPTS_LINK is a real directory. Move it aside and run setup again." >&2
    exit 1
fi

# Older versions of this repo linked the whole skills directory. Each agent
# directory now has to be real so other tools can install into it.
for dir in "$HOME/.claude/skills" "$HOME/.codex/skills"; do
    if [ -L "$dir" ]; then
        rm "$dir"
        echo "removed the directory link $dir"
    fi
done
"$REPO_DIR/scripts/link-skills.sh"

if [ ! -e "$SETTINGS" ]; then
    if [ -f "$SNAPSHOT" ]; then
        cp "$SNAPSHOT" "$SETTINGS"
        echo "copied $SNAPSHOT to $SETTINGS"
    else
        echo "No $SETTINGS and no snapshot at $SNAPSHOT. Claude Code creates settings on first run."
    fi
fi

echo "Done. Check the result with $REPO_DIR/scripts/skill-doctor.sh"
