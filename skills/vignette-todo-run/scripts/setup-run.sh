#!/bin/sh
# Create one worktree and one scratch folder per agent for a Vignette TODO run.
#
# Usage: setup-run.sh <run> <base> <name>...
#   run   the branch prefix, e.g. todo6 (branches are <run>/<name>)
#   base  the branch the worktrees start from, e.g. foundation
#   name  one per agent
#
# Archives a previous run's briefs, reports, items, and scratch folders under
# ~/Code/vignette-todo/<previous>-archive/ first, where <previous> is read from the archived
# BRIEF.md's title. Never reads or writes anything of Pete's except one jq read of his settings
# file to seed each scratch copy. Prints the settings mtime at the end; the run records it.
set -eu
[ $# -ge 3 ] || { echo "usage: setup-run.sh <run> <base> <name>..." >&2; exit 2; }
run=$1; base=$2; shift 2
repo=$HOME/Code/vignette
todo=$HOME/Code/vignette-todo
real=$HOME/.config/vignette/settings.json
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
[ -f "$real" ] || { echo "no settings file at $real" >&2; exit 1; }
git -C "$repo" rev-parse --verify -q "$base" >/dev/null || { echo "no branch $base" >&2; exit 1; }

mkdir -p "$todo"
if [ -f "$todo/BRIEF.md" ]; then
    prev=$(sed -n '1s/.*for the \([a-z0-9]*\) run.*/\1/p' "$todo/BRIEF.md")
    [ -n "$prev" ] || prev=previous
    arch=$todo/$prev-archive
    mkdir -p "$arch"
    for f in BRIEF.md INTEGRATOR.md REVIEWER.md ARCHITECTURE.md items reports; do
        [ -e "$todo/$f" ] && mv "$todo/$f" "$arch/"
    done
    for d in "$todo"/*-scratch; do [ -d "$d" ] && mv "$d" "$arch/"; done
    echo "archived the $prev run into $arch"
fi
[ -e "$todo/launch.lock" ] && echo "warning: $todo/launch.lock exists (owner: $(cat "$todo/launch.lock/owner" 2>/dev/null))" >&2
mkdir -p "$todo/items" "$todo/reports"

for name in "$@"; do
    wt=$todo/$name
    git -C "$repo" worktree add -b "$run/$name" "$wt" "$base" >/dev/null
    [ -f "$repo/scripts/signing.env" ] && cp "$repo/scripts/signing.env" "$wt/scripts/signing.env"
    s=$todo/$name-scratch
    mkdir -p "$s/shots" "$s/captures"
    jq --arg shots "$s/shots" '.screenshotsFolder=$shots | .syncAppleSaveLocation=false | .debug=true
        | .launchAtLogin=false | .copyOnCapture=false | .annotateOnCapture=false' "$real" > "$s/settings.json"
    (cd "$wt/web" && pnpm install --silent) &
    echo "$name: $wt on $run/$name, scratch $s"
done
wait
git -C "$repo" worktree list
echo "settings mtime: $(stat -f %m "$real")"
