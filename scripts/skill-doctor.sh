#!/bin/bash
#
# skill-doctor.sh — Keep skills/ healthy without anyone having to remember to
#
# Skill wiring in this repo has several moving parts that drift independently:
# a skills.sh store in ~/.agents/skills, symlinks from skills/ into it,
# ~/.claude/skills pointing back at this repo, and plugin-provided skills that
# share the same namespace. Each has a way of breaking quietly — a skill simply
# stops being offered, with nothing printed anywhere.
#
# So this script runs on every SessionStart. The rule it follows:
#
#   auto-fix what is provably safe and reversible; report what needs judgment.
#
# Fixed automatically:
#   - relative symlinks in skills/ rewritten as absolute (see below)
#   - a stale SKILLS.md / skills/.gitignore regenerated
#
# Reported, never touched:
#   - dangling symlinks (deleting someone's skill is not the script's call)
#   - repo skills shadowed by an enabled plugin
#   - skills installed in the store but not linked into skills/
#   - ~/.claude/settings.json having stopped being a symlink
#
# The relative-symlink case is the subtle one. `npx skills add` links a skill as
# ../../.agents/skills/<name>, which is correct when skills/ really is
# ~/.claude/skills — two levels below home. Here ~/.claude/skills is itself a
# symlink into this repo, so the link is created physically in the repo and
# ../../ resolves to the repo's parent instead of home. The link dangles and the
# skill vanishes. Resolving the target from the *logical* ~/.claude/skills path
# recovers what was intended.
#
# Usage:
#   skill-doctor.sh            full report, including healthy checks
#   skill-doctor.sh --quiet    hook mode: silent when healthy, speaks up when not

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$REPO_DIR/skills"
STORE="$HOME/.agents/skills"
SETTINGS_LINK="$HOME/.claude/settings.json"

QUIET=0
[ "${1:-}" = "--quiet" ] && QUIET=1

[ -d "$SKILLS_DIR" ] || exit 0

problems=0   # things a human has to decide about
repairs=0    # things fixed without asking

note() {  # shown only in full mode; the healthy-path narration
    [ "$QUIET" = "1" ] || printf '  ok    %s\n' "$1"
}
fixed() {
    printf '  fixed %s\n' "$1"
    repairs=$((repairs + 1))
}
warn() {
    printf '  WARN  %s\n' "$1"
    problems=$((problems + 1))
}

# ---------------------------------------------------------------- symlinks

relative=0
dangling=""

for link in "$SKILLS_DIR"/*; do
    [ -L "$link" ] || continue
    name=$(basename "$link")
    target=$(readlink "$link")

    if [ "${target#/}" = "$target" ]; then
        # Relative. Recover the intent by resolving from the logical
        # ~/.claude/skills rather than from the repo's physical location.
        intended=$(cd "$HOME/.claude/skills" 2>/dev/null &&
                   cd "$(dirname "$target")" 2>/dev/null &&
                   printf '%s/%s' "$(pwd -P)" "$(basename "$target")")
        if [ -n "$intended" ] && [ -d "$intended" ]; then
            ln -sfn "$intended" "$link"
            fixed "$name: relative link rewritten absolute"
            relative=$((relative + 1))
            continue
        fi
    fi

    [ -e "$link" ] || dangling="$dangling$name -> $target"$'\n'
done

[ "$relative" = "0" ] && note "no relative symlinks in skills/"

if [ -n "$dangling" ]; then
    while IFS= read -r d; do
        [ -n "$d" ] && warn "dangling symlink: $d"
    done <<< "$dangling"
    echo "        the target is gone; relink it or: rm skills/<name>"
else
    note "no dangling symlinks"
fi

# ------------------------------------------------------------- husk skills
#
# A skill directory that exists but has no readable SKILL.md. This slips past
# everything else: the directory is present so `[ -d ]` passes, and validate.sh
# returns early on a missing file rather than complaining. Found in the wild as
# store entries whose SKILL.md was a symlink into a sibling repo directory that
# had since been deleted — four empty husks, invisible and unusable.

husks=""
for entry in "$SKILLS_DIR"/*; do
    [ -d "$entry" ] || continue
    name=$(basename "$entry")
    [ -f "$entry/SKILL.md" ] || husks="$husks$name"$'\n'
done
if [ -n "$STORE" ] && [ -d "$STORE" ]; then
    for entry in "$STORE"/*; do
        [ -d "$entry" ] || continue
        name=$(basename "$entry")
        [ -f "$entry/SKILL.md" ] || husks="$husks$name (store)"$'\n'
    done
fi

if [ -n "$husks" ]; then
    while IFS= read -r h; do
        [ -n "$h" ] && warn "no readable SKILL.md: $h"
    done <<< "$husks"
    echo "        the directory is there but the skill cannot load"
else
    note "every skill directory has a readable SKILL.md"
fi

# ------------------------------------------------------- plugin shadowing
#
# Only *enabled* plugins load skills, so a name sitting in a marketplace or
# cache directory for a disabled plugin is inert and must not be reported.

if command -v jq >/dev/null 2>&1 && [ -f "$REPO_DIR/settings.json" ]; then
    shadowed=""
    while IFS= read -r key; do
        [ -n "$key" ] || continue
        pdir="$HOME/.claude/plugins/marketplaces/${key#*@}/plugins/${key%@*}/skills"
        [ -d "$pdir" ] || continue
        for s in "$pdir"/*; do
            [ -d "$s" ] || continue
            n=$(basename "$s")
            [ -e "$SKILLS_DIR/$n" ] && shadowed="$shadowed$n (plugin $key)"$'\n'
        done
    done <<< "$(jq -r '.enabledPlugins // {} | to_entries[] | select(.value==true) | .key' "$REPO_DIR/settings.json" 2>/dev/null)"

    if [ -n "$shadowed" ]; then
        while IFS= read -r s; do
            [ -n "$s" ] && warn "name collision: $s also exists in skills/"
        done <<< "$shadowed"
        echo "        two skills share a name; drop one or disable the plugin"
    else
        note "no enabled plugin shadows a repo skill"
    fi
fi

# ------------------------------------------------ dangling links in the store
#
# The store can rot in the opposite direction. An older setup linked the other
# way too — ~/.agents/skills/<name> back into this repo — so deleting a skill
# here left a dangling link there. Those are safe to clear without asking: a
# dangling symlink holds no content, and when it points into this repo the repo
# has already answered the question by not having the name. A link dangling
# anywhere else might mean a sibling repo is merely uncloned, so that one is
# only reported.

if [ -d "$STORE" ]; then
    stale_here=0
    for e in "$STORE"/*; do
        [ -L "$e" ] && [ ! -e "$e" ] || continue
        t=$(readlink "$e")
        case "$t" in
            "$REPO_DIR"/*)
                rm "$e"
                stale_here=$((stale_here + 1))
                ;;
            *)
                warn "store link dangles outside the repo: $(basename "$e") -> $t"
                ;;
        esac
    done
    if [ "$stale_here" -gt 0 ]; then
        fixed "removed $stale_here dangling store link(s) pointing at deleted repo skills"
    else
        note "no dangling links in the skills.sh store"
    fi

    # Live back-links are NOT residue, however much they look like it. When a
    # skill that arrived via skills.sh is later adopted as a real directory in
    # this repo, the store entry becomes a link back to that directory. That
    # link is what keeps the skill registered: delete it and skills.sh sees the
    # skill as missing while its lockfile entry lingers. So this only counts
    # them — never offers to remove them.
    live=0
    for e in "$STORE"/*; do
        [ -L "$e" ] && [ -e "$e" ] || continue
        case "$(readlink "$e")" in
            "$REPO_DIR"/*) live=$((live + 1)) ;;
        esac
    done
    [ "$live" -gt 0 ] && note "$live skill(s) served from the repo via a store link"
fi

# --------------------------------------------------- installed but unlinked
#
# Informational. A skill in the store with no link here is one you installed
# and then unlinked, or one another agent installed. It is not broken, but it
# is invisible to Claude Code while still being update-checked, so it is worth
# surfacing periodically rather than never.

if [ -d "$STORE" ]; then
    orphans=0
    for s in "$STORE"/*; do
        [ -d "$s" ] || continue
        [ -e "$SKILLS_DIR/$(basename "$s")" ] || orphans=$((orphans + 1))
    done
    if [ "$orphans" -gt 0 ]; then
        note "$orphans skill(s) in the store are not linked into skills/ (run 'skill-doctor.sh' for the list)"
        if [ "$QUIET" = "0" ]; then
            for s in "$STORE"/*; do
                [ -d "$s" ] || continue
                [ -e "$SKILLS_DIR/$(basename "$s")" ] || printf '          %s\n' "$(basename "$s")"
            done
            echo "        link one with: ln -s \"\$HOME/.agents/skills/<name>\" skills/<name>"
        fi
    else
        note "every installed skill is linked into skills/"
    fi
fi

# -------------------------------------------------------- lockfile drift
#
# The skills.sh lockfile is not a passive record. `skills update -g` iterates
# its keys rather than scanning disk, and when a source's hash has moved it
# shells out to `skills add <url> --skill <name> -g -y` — a full install. So an
# entry left behind after its files were deleted does not sit there harmlessly;
# the next routine `skills update` reinstalls the skill. Thirty-one had
# accumulated before this check existed.
#
# `skills remove` cannot clear these: it only matches skills it can find on
# disk. The fix is to delete the key from the lockfile directly.

LOCK="$HOME/.agents/.skill-lock.json"
if [ -f "$LOCK" ] && command -v jq >/dev/null 2>&1; then
    drift=0
    for n in $(jq -r '.skills | keys[]' "$LOCK" 2>/dev/null); do
        [ -e "$STORE/$n" ] || drift=$((drift + 1))
    done
    if [ "$drift" -gt 0 ]; then
        warn "$drift lockfile entry(s) reference skills that are gone from disk"
        echo "        'skills update' would REINSTALL them. 'skills remove' cannot"
        echo "        clear them — they must be deleted from $LOCK"
    else
        note "lockfile matches what is on disk"
    fi
fi

# ------------------------------------------------------------- manifest
#
# SKILLS.md is generated, so regenerating it is always safe — no judgment call,
# no information lost. Do it silently unless it actually changed.

if [ -x "$SCRIPT_DIR/gen-skills-manifest.sh" ] && command -v jq >/dev/null 2>&1; then
    if "$SCRIPT_DIR/gen-skills-manifest.sh" --check >/dev/null 2>&1; then
        note "SKILLS.md is up to date"
    else
        if "$SCRIPT_DIR/gen-skills-manifest.sh" >/dev/null 2>&1; then
            fixed "SKILLS.md and skills/.gitignore regenerated (commit them)"
        else
            warn "SKILLS.md is stale and could not be regenerated"
        fi
    fi
fi

# -------------------------------------------------------- settings symlink
#
# Never repaired here. An atomic save (write-temp + rename) replaces the
# symlink with a real file that may hold edits the repo copy does not, so the
# two must be diffed by a human before either is overwritten.

if [ -e "$SETTINGS_LINK" ] && [ ! -L "$SETTINGS_LINK" ]; then
    warn "~/.claude/settings.json is a real file, not a symlink to the repo"
    echo "        some tool saved over the link. Diff before restoring:"
    echo "          diff ~/.claude/settings.json $REPO_DIR/settings.json"
    echo "        do NOT run ./setup.sh to fix this; it discards the live file"
else
    note "~/.claude/settings.json is still a symlink"
fi

# ---------------------------------------------------------------- summary

if [ "$QUIET" = "1" ]; then
    # Hook mode. Silence is the healthy state; anything printed above already
    # told the story, so only add a line when a decision is actually pending.
    [ "$problems" -gt 0 ] && echo "skill-doctor: $problems issue(s) need attention — run ./scripts/skill-doctor.sh"
    exit 0
fi

echo
if [ "$problems" -gt 0 ]; then
    echo "$problems issue(s) need a decision, $repairs repaired automatically."
    exit 1
fi
echo "Skills are healthy ($repairs repaired automatically)."
