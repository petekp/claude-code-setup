#!/bin/zsh
# Runs one agent's worktree build as a test copy, so driving it never touches Pete's Vignette. The
# copy has its own bundle id (com.petepetrash.vignette.todo.<name>), URL scheme (vignette-<name>://),
# log (~/Library/Logs/Vignette-<name>.log) and Application Support folder, and runs on the agent's
# scratch settings. The bundled agent skill is removed from the copy, because a launch rewrites the
# installed copies of it in ~/.claude and ~/.codex.
#
# Usage: test-copy.sh <name> <command>
#   install              copy ~/Code/vignette-todo/<name>'s Debug build, rename it, re-sign it
#   launch               quit the running copy, launch it on the scratch settings, wait for [app] ready
#   url <command?query>  send vignette-<name>://<command?query> to the running copy
#   state [tag]          print the [state] JSON for a fresh tag
#   pid                  print the running copy's pid
#   log [n]              the last n lines of the copy's log (default 40)
#   quit                 quit the running copy
# url and state refuse unless the running copy has VIGNETTE_SETTINGS=<scratch>/settings.json in its
# environment: `open -a` relaunches a copy that has quit without it, on Pete's real settings.
set -eu
name=${1:-}; cmd=${2:-}
case $name in ""|[![:lower:]]*|*[![:lower:][:digit:]-]*) sed -n '2,17p' $0; exit 2 ;; esac
[[ -n $cmd ]] || { sed -n '2,17p' $0; exit 2; }
todo=$HOME/Code/vignette-todo
worktree=$todo/$name
scratch=$todo/$name-scratch
app=$scratch/app/Vignette-$name.app
log=$HOME/Library/Logs/Vignette-$name.log
bundle_id=com.petepetrash.vignette.todo.$name
scheme=vignette-$name
lsregister=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister

running_pid() { pgrep -f "$app/Contents/MacOS/" || true; }
stop() {
  local pid=$(running_pid)
  [[ -z $pid ]] || { kill $pid; while kill -0 $pid 2>/dev/null; do sleep 0.2; done; }
}
require_scratch() {
  local pid=$(running_pid)
  [[ -n $pid ]] || { echo "no copy running; run: test-copy.sh $name launch" >&2; exit 1; }
  ps -wwEp $pid | grep -qF "VIGNETTE_SETTINGS=$scratch/settings.json" \
    || { echo "the running copy (pid $pid) is not on $scratch/settings.json; quit it and launch again" >&2; exit 1; }
}

case $cmd in
install)
  built=$worktree/build/Build/Products/Debug/Vignette.app
  [[ -d $built ]] || { echo "no build at $built; run ./scripts/build.sh in $worktree" >&2; exit 1; }
  identity=-
  if [[ -f $worktree/scripts/signing.env ]]; then source $worktree/scripts/signing.env; identity=$CODE_SIGN_IDENTITY; fi
  stop
  mkdir -p $scratch/app
  rsync -a --delete $built/ $app/
  rm -rf $app/Contents/Resources/vignette
  plist=$app/Contents/Info.plist
  /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $bundle_id" \
    -c "Set :CFBundleName Vignette-$name" -c "Set :CFBundleDisplayName Vignette-$name" \
    -c "Set :CFBundleURLTypes:0:CFBundleURLName $bundle_id" \
    -c "Set :CFBundleURLTypes:0:CFBundleURLSchemes:0 $scheme" $plist
  out=$(codesign --force --options runtime --preserve-metadata=entitlements -s "$identity" $app 2>&1) \
    || { print -r -- $out >&2; exit 1; }
  $lsregister -f $app
  echo "installed $app ($(/usr/libexec/PlistBuddy -c 'Print :VignetteBuild' $plist)) as $bundle_id, $scheme://"
  ;;
launch)
  [[ -d $app ]] || { echo "no copy at $app; run: test-copy.sh $name install" >&2; exit 1; }
  [[ -f $scratch/settings.json ]] || { echo "no scratch settings at $scratch/settings.json" >&2; exit 1; }
  stop
  before=$([[ -f $log ]] && wc -l < $log || echo 0)
  open -g -a $app --env VIGNETTE_SETTINGS=$scratch/settings.json
  for _ in {1..100}; do
    if [[ -f $log ]] && tail -n +$((before + 1)) $log | grep -q '\[app\] ready'; then
      tail -n +$((before + 1)) $log | grep '\[app\] ready'
      require_scratch
      exit 0
    fi
    sleep 0.2
  done
  echo "no [app] ready within 20 s" >&2; exit 1
  ;;
url)
  query=${3:?usage: test-copy.sh <name> url <command?query>}
  require_scratch
  open -g -a $app "$scheme://$query"
  ;;
state)
  require_scratch
  tag=${3:-s$RANDOM$RANDOM}
  open -g -a $app "$scheme://state?tag=$tag"
  for _ in {1..50}; do
    line=$(grep '\[state\]' $log 2>/dev/null | grep -F "\"$tag\"" | tail -1 || true)
    [[ -n $line ]] && { print -r -- "${line#*\[state\] }"; exit 0; }
    sleep 0.1
  done
  echo "no [state] line for $tag" >&2; exit 1
  ;;
pid) running_pid ;;
log) tail -n ${3:-40} $log ;;
quit) stop; echo quit ;;
*) sed -n '2,17p' $0; exit 2 ;;
esac
