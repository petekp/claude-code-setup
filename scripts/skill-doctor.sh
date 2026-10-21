#!/bin/sh
#
# Runs at every SessionStart. Links skills with link-skills.sh, then reports
# anything that needs a decision. It changes nothing else.
#
# Usage:
#   skill-doctor.sh            full report
#   skill-doctor.sh --quiet    hook mode: silent when healthy

set -u

SCRIPT_DIR=$(CDPATH='' cd "$(dirname "$0")" && pwd -P)
REPO_SKILLS=$(dirname "$SCRIPT_DIR")/skills
STORE=$HOME/.agents/skills
LOCK=$HOME/.agents/.skill-lock.json
LIVE_SETTINGS=$HOME/.claude/settings.json
SNAPSHOT=${CLAUDE_SETTINGS_SNAPSHOT:-$HOME/.agents/claude/settings.json}

QUIET=0
[ "${1:-}" = "--quiet" ] && QUIET=1

problems=0
ok()   { [ "$QUIET" = "1" ] || printf '  ok    %s\n' "$1"; }
warn() { printf '  WARN  %s\n' "$1"; problems=$((problems + 1)); }

"$SCRIPT_DIR/link-skills.sh"

# Links that point nowhere. link-skills.sh already removed its own, so these
# belong to another tool or were made by hand.
for dir in "$HOME/.claude/skills" "$HOME/.codex/skills" "$STORE"; do
    for link in "$dir"/*; do
        [ -L "$link" ] && [ ! -e "$link" ] && warn "dangling link: $link -> $(readlink "$link")"
    done
done

# A skill folder with no SKILL.md loads as nothing and reports no error.
for dir in "$REPO_SKILLS"/*/ "$STORE"/*/; do
    dir=${dir%/}
    [ -d "$dir" ] && [ ! -f "$dir/SKILL.md" ] && warn "no SKILL.md: $dir"
done

# A real directory in ~/.claude/skills is a skill outside both the repo and
# the store. synced/ belongs to Claude Code.
for entry in "$HOME/.claude/skills"/*; do
    [ -d "$entry" ] && [ ! -L "$entry" ] || continue
    [ "$(basename "$entry")" = "synced" ] && continue
    warn "skill outside the repo and store: $entry (move it into skills/ or $STORE)"
done

# `ln -s dir path` where path is already that directory creates dir/<name>
# pointing back at dir. The tree becomes endless: codesign rejects an app
# bundle that carries one, and recursive copies never finish.
loops=$(find -H "$REPO_SKILLS"/* "$STORE"/* -mindepth 1 -maxdepth 3 -type l 2>/dev/null | while IFS= read -r link; do
    holder=$(CDPATH='' cd "$(dirname "$link")" && pwd -P)
    target=$(CDPATH='' cd "$holder" 2>/dev/null && cd "$(readlink "$link")" 2>/dev/null && pwd -P) || continue
    case "$holder/" in ("$target"/*) printf '%s\n' "$link" ;; esac
done)
for link in $loops; do
    warn "link points at its own parent: $link"
done

# `skills update -g` walks the lockfile's keys, not the disk. A key whose files
# are gone gets reinstalled on the next update. `skills remove` cannot clear
# it; delete the key from the lockfile.
if [ -f "$LOCK" ] && command -v jq >/dev/null 2>&1; then
    for name in $(jq -r '.skills | keys[]' "$LOCK"); do
        [ -e "$STORE/$name" ] || warn "lockfile entry with no files: $name (delete it from $LOCK)"
    done
fi

# Live settings belong to Claude Code and the tools that edit it. The private
# repo keeps a snapshot. A difference means something changed live settings:
# you, Claude Code, or a tool installing hooks.
if [ -f "$SNAPSHOT" ] && [ -f "$LIVE_SETTINGS" ] && command -v jq >/dev/null 2>&1; then
    if [ "$("$SCRIPT_DIR/settings-snapshot.sh" --diff | wc -l)" -gt 0 ]; then
        warn "live settings differ from the snapshot. Review: $SCRIPT_DIR/settings-snapshot.sh --diff"
    else
        ok "live settings match the snapshot"
    fi
fi

# Sessions append to the papercut log without reading it, so repeats pile up
# until a triage merges them. Count dated lines: some sessions omit the "- ".
# A triage backs the log up first, so a backup under 30 days old means one ran
# recently. The log can stay over 40 after a triage, so without this check
# every session would ask for another.
PAPERCUTS=$HOME/.claude/PAPERCUTS.md
recent_triage=$(find "$HOME/.claude" -maxdepth 1 -name 'PAPERCUTS.*.bak.md' -mtime -30 2>/dev/null | head -n 1)
if [ -f "$PAPERCUTS" ] && [ -z "$recent_triage" ] && [ "$(grep -cE '^(- )?[0-9]{4}-[0-9]{2}-[0-9]{2}' "$PAPERCUTS")" -gt 40 ]; then
    warn "$PAPERCUTS has more than 40 entries. Triage it in a background subagent, following the Papercuts section of ~/.claude/CLAUDE.md."
fi

if [ "$problems" -gt 0 ]; then
    [ "$QUIET" = "1" ] && echo "skill-doctor: $problems issue(s). Full report: ~/.claude/scripts/skill-doctor.sh"
    [ "$QUIET" = "1" ] || exit 1
fi
[ "$QUIET" = "1" ] || echo "Healthy."
exit 0
