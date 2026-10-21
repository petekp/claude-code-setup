#!/bin/sh
#
# Runs a mod in a Claude Code session inside tmux, for checking its UI live.
#
# The session gets its own config folder (CLAUDE_CONFIG_DIR), so the mod's
# plugin store, your hooks and your settings stay out of it, and a placeholder
# API key: commands and panes work, but a prompt to the model fails. A mod's
# store is keyed by the mod's name, not its folder, so a session on your own
# config would write to the store your sessions use.
#
# Usage:
#   live.sh start <mod-dir> [name]   start a session with the mod (name: the mod's folder)
#   live.sh send <name> <text>       type text and press Enter, as in `/inbox demo`
#   live.sh key <name> <key>...      press tmux keys, such as j or Escape
#   live.sh wait <name> [seconds]    wait until the session is idle or shows a dialog
#   live.sh snap <name> [--bg]       print the screen, keeping trailing cells;
#                                    --bg adds each cell's background as a letter
#   live.sh click <name> <col> <row> click a cell, 1-based as `snap` numbers rows
#   live.sh scroll <name> <col> <row> [n]   turn the wheel n times, down (default 3),
#                                    or up when n is negative
#   live.sh stop <name>              end the session
#
# Environment:
#   LIVE_ENV   extra variables for the session, as "A=1 B=2"
#   LIVE_SIZE  terminal size, as "110x50" (default)
#   LIVE_CWD   the session's folder (default: the current folder)

set -eu

ROOT=${TMPDIR:-/tmp}/mod-live

die() { printf 'live.sh: %s\n' "$1" >&2; exit 1; }

cmd=${1:-}
[ -n "$cmd" ] || die "no command; see the usage at the top of $0"
shift

case $cmd in
start)
    src=${1:-}
    [ -d "$src" ] || die "no mod folder: $src"
    src=$(CDPATH='' cd "$src" && pwd -P)
    name=${2:-$(basename "$src")}
    cwd=$(CDPATH='' cd "${LIVE_CWD:-$PWD}" && pwd -P)
    config=$ROOT/$name/config
    key=sk-ant-live-test-00000000000000000000
    mkdir -p "$config"
    # Marks onboarding done, the placeholder key approved (by its last 20
    # characters), the folder trusted and its CLAUDE.md imports outside the
    # folder declined, so the session opens at the prompt.
    python3 -c '
import json, sys
path, key, cwd = sys.argv[1:]
try:
    with open(path) as f:
        state = json.load(f)
except (OSError, ValueError):
    state = {}
state.update({"hasCompletedOnboarding": True, "theme": "dark", "customApiKeyResponses": {"approved": [key[-20:]], "rejected": []}})
state.setdefault("projects", {}).setdefault(cwd, {}).update({"hasTrustDialogAccepted": True, "hasClaudeMdExternalIncludesWarningShown": True, "hasClaudeMdExternalIncludesApproved": False})
with open(path, "w") as f:
    json.dump(state, f)
' "$config/.claude.json" "$key" "$cwd"
    printf '{"env":{"CLAUDE_CODE_PLUGIN_DIRS":"%s"}}\n' "$src" > "$config/settings.json"
    size=${LIVE_SIZE:-110x50}
    tmux kill-session -t "$name" 2>/dev/null || true
    # Claude Code drops to 256 colors inside tmux unless told otherwise.
    tmux new-session -d -s "$name" -x "${size%x*}" -y "${size#*x}" -c "$cwd" \
        "env CLAUDE_CONFIG_DIR='$config' ANTHROPIC_API_KEY=$key COLORTERM=truecolor CLAUDE_CODE_TMUX_TRUECOLOR=1 ${LIVE_ENV:-} claude; sleep 600"
    "$0" wait "$name" 30
    ;;
send)
    [ $# -ge 2 ] || die "send needs a session and text"
    tmux send-keys -t "$1" -l "$2"
    tmux send-keys -t "$1" Enter
    ;;
key)
    [ $# -ge 2 ] || die "key needs a session and keys"
    name=$1
    shift
    tmux send-keys -t "$name" "$@"
    ;;
wait)
    name=${1:-}
    [ -n "$name" ] || die "wait needs a session"
    max=${2:-120}
    i=0
    quiet=0
    while [ "$i" -lt "$max" ]; do
        screen=$(tmux capture-pane -p -t "$name")
        if printf '%s' "$screen" | grep -q 'Do you want to proceed\|Enter to confirm\|Enter to select\|to navigate'; then
            echo "dialog after ${i}s"
            exit 0
        fi
        # The spinner line reads "… (12s ·", so its absence twice in a row means idle.
        if printf '%s' "$screen" | grep -q '… ([0-9]'; then
            quiet=0
        else
            quiet=$((quiet + 1))
            if [ "$quiet" -ge 2 ]; then
                echo "idle after ${i}s"
                exit 0
            fi
        fi
        sleep 2
        i=$((i + 2))
    done
    echo "still working after ${max}s"
    ;;
snap)
    name=${1:-}
    [ -n "$name" ] || die "snap needs a session"
    # -N keeps trailing cells. Without it, a row whose cells carry only a
    # background comes back blank, as if nothing painted it.
    if [ "${2:-}" = "--bg" ]; then
        tmux capture-pane -p -e -N -t "$name" | python3 -c '
import re, sys
legend = {}
for n, line in enumerate(sys.stdin.read().split("\n"), 1):
    line = re.sub(r"\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)", "", line)
    text, bgs, bg, i = [], [], None, 0
    while i < len(line):
        m = re.match(r"\x1b\[([0-9;]*)m", line[i:])
        if m:
            p, j = m.group(1).split(";"), 0
            while j < len(p):
                if p[j] in ("0", "", "49"):
                    bg = None
                elif p[j] in ("38", "48") and j + 1 < len(p) and p[j + 1] == "2":
                    if p[j] == "48":
                        bg = ",".join(p[j + 2:j + 5])
                    j += 4
                elif p[j] in ("38", "48") and j + 1 < len(p) and p[j + 1] == "5":
                    if p[j] == "48":
                        bg = "256:" + p[j + 2]
                    j += 2
                j += 1
            i += m.end()
            continue
        text.append(line[i])
        bgs.append(bg)
        i += 1
    if bg is None and not text:
        continue
    marks = "".join("." if b is None else legend.setdefault(b, chr(65 + len(legend))) for b in bgs)
    joined = "".join(text)
    print(f"{n:3} {joined}")
    print(f"    {marks}")
for b, c in legend.items():
    print(f"{c} = {b}")
'
    else
        tmux capture-pane -p -t "$name" | awk '{ printf "%3d %s\n", NR, $0 }'
    fi
    ;;
click)
    [ $# -eq 3 ] || die "click needs a session, a column and a row"
    # An SGR mouse press and release, as the terminal would send them.
    tmux send-keys -t "$1" -l "$(printf '\033[<0;%s;%sM\033[<0;%s;%sm' "$2" "$3" "$2" "$3")"
    ;;
scroll)
    [ $# -ge 3 ] || die "scroll needs a session, a column and a row"
    n=${4:-3}
    # SGR wheel buttons: 64 is up, 65 is down.
    wheel=65
    if [ "$n" -lt 0 ]; then
        wheel=64
        n=$((-n))
    fi
    while [ "$n" -gt 0 ]; do
        tmux send-keys -t "$1" -l "$(printf '\033[<%s;%s;%sM' "$wheel" "$2" "$3")"
        n=$((n - 1))
    done
    ;;
stop)
    [ -n "${1:-}" ] || die "stop needs a session"
    tmux kill-session -t "$1" 2>/dev/null || true
    ;;
*)
    die "unknown command: $cmd"
    ;;
esac
