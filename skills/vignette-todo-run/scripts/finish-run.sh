#!/bin/sh
# End a Vignette TODO run: unregister every worktree build from LaunchServices, confirm Pete's
# build answers vignette:// and is running on his real settings, and list what to prune.
#
# Usage: finish-run.sh <run> [--prune]
#   --prune  remove the run's worktrees and branches (only after Pete has merged)
set -eu
[ $# -ge 1 ] || { echo "usage: finish-run.sh <run> [--prune]" >&2; exit 2; }
run=$1; prune=${2:-}
repo=$HOME/Code/vignette
todo=$HOME/Code/vignette-todo
lsreg=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
mine=$repo/build/Build/Products/Debug/Vignette.app

for app in "$todo"/*/build/Build/Products/Debug/Vignette.app; do
    [ -d "$app" ] || continue
    "$lsreg" -u "$app" >/dev/null 2>&1 && echo "unregistered $app"
done
"$lsreg" -f "$mine" >/dev/null 2>&1 || true
answer=$(osascript -l JavaScript -e 'ObjC.import("AppKit"); var u=$.NSWorkspace.sharedWorkspace.URLForApplicationToOpenURL($.NSURL.URLWithString("vignette://state")); u ? ObjC.unwrap(u.path) : "none"' 2>/dev/null || echo unknown)
echo "vignette:// opens: $answer"
[ "$answer" = "$mine" ] || echo "warning: expected $mine" >&2
pid=$(pgrep -f "$mine/Contents/MacOS/Vignette" || true)
if [ -n "$pid" ]; then
    if ps -wwEp "$pid" | grep -q VIGNETTE_SETTINGS=; then
        echo "warning: Pete's build (pid $pid) runs with VIGNETTE_SETTINGS set" >&2
    else
        echo "Pete's build is running (pid $pid) on his real settings"
    fi
else
    echo "warning: Pete's build is not running; relaunch with: open -g $mine" >&2
fi
other=$(pgrep -fl "vignette-todo/.*/MacOS/Vignette" || true)
[ -z "$other" ] || echo "warning: a worktree instance is still running: $other" >&2
[ -e "$todo/launch.lock" ] && echo "warning: launch.lock still exists" >&2
echo "settings mtime: $(stat -f %m "$HOME/.config/vignette/settings.json")"

echo "worktrees and branches of $run:"
git -C "$repo" worktree list | grep "vignette-todo/" || true
git -C "$repo" branch --list "$run/*"
if [ "$prune" = "--prune" ]; then
    for wt in $(git -C "$repo" worktree list --porcelain | sed -n 's/^worktree //p' | grep "vignette-todo/"); do
        git -C "$repo" worktree remove --force "$wt"
    done
    git -C "$repo" branch --list "$run/*" | sed 's/^[* ]*//' | xargs -n1 git -C "$repo" branch -D
    git -C "$repo" worktree prune
    echo "pruned"
else
    echo "(rerun with --prune once Pete has merged)"
fi
