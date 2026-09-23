# Shared brief for the {{RUN}} run ({{DATE}})

You are one Opus agent with one worktree and one scratch folder. You do the code and the
verification for the items in `items/<name>.md`. Fable orchestrates; an integrator merges every
branch into `{{RUN}}/integration` afterwards; a reviewer reads the whole range. Pete tests the
result by hand. Nothing you build reaches him except through your
commits and your report.

Paths, with `<name>` your agent name:

- Worktree: `{{HOME}}/Code/vignette-todo/<name>` on branch `{{RUN}}/<name>` from `{{BASE}}` ({{BASE_SHA}}).
- App you build: `{{HOME}}/Code/vignette-todo/<name>/build/Build/Products/Debug/Vignette.app`.
- Scratch settings: `{{HOME}}/Code/vignette-todo/<name>-scratch/settings.json`
  (seeded from Pete's real file: your own shots folder, `debug` on, Apple sync off, copy and
  annotate on capture off, launch at login off).
- Fixtures go in `{{HOME}}/Code/vignette-todo/<name>-scratch/shots` (the watch folder
  of your instance). Captures, recordings, and scripts go in
  `{{HOME}}/Code/vignette-todo/<name>-scratch/captures`, never in `shots`: the watcher
  would show them as screenshots. Never the other way round.
- Pete's build: `{{HOME}}/Code/vignette/build/Build/Products/Debug/Vignette.app`,
  running on `{{HOME}}/.config/vignette/settings.json`, watching `{{HOME}}/Dropbox/Screenshots`.
- Log: `~/Library/Logs/Vignette.log`, shared by every instance. Filter by time and pid.

Read `AGENTS.md` in your worktree before anything else: the loop, steps 3 and 4 (several builds
on one Mac), the measuring paragraphs, and the rules. This brief adds the run's rules. AGENTS.md
is the authority on how the app works.

## Rules

- Work only in your worktree. Never edit `{{HOME}}/Code/vignette`, another agent's
  worktree or scratch folder, `~/.config/vignette/`, or `~/Dropbox/Screenshots`. Never read or
  write Pete's settings file or his screenshot folder.
- Never edit `docs/TODOS.md`. Fable marks the items landed.
- `./scripts/build.sh --test` passes before every commit. Run it from your worktree. Before and
  after every test run, record `stat -f %m {{HOME}}/.config/vignette/settings.json`;
  it must not change. If it does, stop, say so in the report with the times, and do not run the
  tests again until you have found which path reached the file.
- One commit per item. The message is one sentence saying what the change does, present tense,
  no prefix, no trailing period, in the style of `git log` (e.g. "Nothing takes a flight's place
  until it has arrived, and a card casts the same shadow in the stack as in flight"). A body may
  follow with the mechanism and the reasons. The message ends with a blank line and this line:
  `Claude-Session: {{SESSION_URL}}`
  Never amend, rebase, squash, cherry-pick, or push. Commit only on your branch.
- Numbers a user would tune go in `UITweaks` (`Settings.swift`) with bounds (`Bound`) and a
  slider in the tweak panel (`DebugPanel.swift`). Their defaults are the tuned UI, so a fresh
  install renders the same. A number that only a developer would change stays in code, as
  AGENTS.md says of the toolbar and card button sizes.
- Every animation goes through the motion scale (`Settings.motionUI`, `Anim.spring`, `Tween`).
  `"ui": {"motion": 0}` must make it instant. An interrupted motion keeps its velocity and
  blends into the new target; nothing jumps.
- README.md and AGENTS.md lines that your change makes false are rewritten in the same commit.
  Keep the existing voice: short sentences, the mechanism and the reason, no history.
- A design change (a new mechanism, a choreography, a heuristic, a layout rule) gets a dated
  doc under `docs/` named `<topic>-{{DATE}}.md`, or a dated section in the doc that already
  covers the topic.
- Tests: extend the tests the repository already keeps for that kind of change
  (`ZoomTests`, `StackLayoutTests`, `StackModelTests`, `AnnotatorTransitionTests`,
  `RenderTests`, `CommandsTests`, `SettingsTests`, `StateReportTests`). Test observable
  behavior, not the formula. Do not add a test that only mirrors the implementation or exists
  only to prove your patch.
- Comments only for a constraint, contract, failure mode, or reason the code cannot show. No
  task history in code or comments.
- Language everywhere (identifiers, log lines, docs, the report): plain and precise, one name per
  concept, short sentences.

## Launching and driving

The hazards are real: agents hit every one of them in the last three runs.

Every worktree builds the same bundle id. A bare `vignette://` URL goes to whichever build
LaunchServices registered last, and a launch that carries no `VIGNETTE_SETTINGS` runs on Pete's
real settings, which `Settings.bootstrap` then rewrites with your build's key set. So:

- Build with `./scripts/build.sh` or `./scripts/build.sh --test`. Never `./scripts/run.sh`.
  Build before taking the lock.
- The lock: `mkdir {{HOME}}/Code/vignette-todo/launch.lock`; it fails when held. Poll
  every 30 s until it succeeds, then
  `echo <name> > {{HOME}}/Code/vignette-todo/launch.lock/owner`. Hold it only around a
  launch and a look. `touch` the lock directory every five minutes while you hold it. A lock is
  stale only when it is older than 15 minutes (`stat -f %m`) and no other worktree's instance is
  running (`pgrep -fl Vignette.app` shows no `vignette-todo/<other>/build` path); then `rm -r`
  it and take it.
- Kill your own instance's pid before every launch: `open --env` is silently ignored when that
  bundle id is already running, and you would drive the old build. Pete's build must also be
  gone before yours can take the env: `kill <pid>` of the running Vignette (only while holding
  the lock).
- Launch only with
  `open -g --env VIGNETTE_SETTINGS={{HOME}}/Code/vignette-todo/<name>-scratch/settings.json {{HOME}}/Code/vignette-todo/<name>/build/Build/Products/Debug/Vignette.app`.
  Wait for `[app] launched … settings {{HOME}}/Code/vignette-todo/<name>-scratch/settings.json` and then `[app] ready pid=…`.
- Send every URL with `open -g -a {{HOME}}/Code/vignette-todo/<name>/build/Build/Products/Debug/Vignette.app "vignette://…"`.
  A bare `open -g vignette://…` is itself a launch of whichever copy LaunchServices registered
  last, on Pete's real settings. It is forbidden, even for a state probe.
- That `-a` form relaunches your build without the env when its instance is gone. So before
  every action URL, confirm the running instance is yours by its own environment:
  `pid=$(pgrep -f 'vignette-todo/<name>/build.*MacOS/Vignette'); ps -wwEp $pid | grep -c 'VIGNETTE_SETTINGS={{HOME}}/Code/vignette-todo/<name>-scratch/settings.json'`
  must print 1. The shared log rotates at 5 MB and can lose the launch line, so the log is not
  the check. Then send `vignette://state?tag=<unique>`, wait for the `[state]` line carrying your
  tag, and stop unless `app.settingsFile` is your scratch file. If the check fails: do not send
  the action. Kill the instance if it is yours and launch again properly. If it is Pete's build,
  it is running because someone put it back; take the lock before launching yours.
- Put a wrapper around that check and use it for every URL; a driving script that skips it has
  already written Pete's settings once.
- After every round: relaunch Pete's build with
  `open -g {{HOME}}/Code/vignette/build/Build/Products/Debug/Vignette.app` (no env),
  only while holding the lock, wait for its `[app] launched … settings
  {{HOME}}/.config/vignette/settings.json` and `[app] ready`, confirm your pid is
  gone (`pgrep -f vignette-todo/<name>/build` prints nothing), then
  `rm -r {{HOME}}/Code/vignette-todo/launch.lock`. Never leave the Mac without Pete's
  build running on his real settings.
- Record `stat -f %m {{HOME}}/.config/vignette/settings.json` before and after each
  round. It must not change.
- Pete may be at the Mac, and may even try your instance. Before any synthetic key or click, read
  `[state]` and confirm the stack (`stack.visible`, `stack.key`) or the annotator is up and key; a
  key reaches whatever is frontmost otherwise, and a click lands in whatever window is there.
  Never post Escape or Cmd+Q: `vignette://dismiss` closes the stack, `vignette://cancel` the
  annotator. If the stack is dismissed, focus changes, or a capture shows something you did not
  do, treat it as interference and rerun; a single failed run proves nothing.
- A posted cursor move can be dropped while another agent drives input. Walk the cursor in
  several steps and confirm `stack.hovered` (or the focus) in `[state]` and something that
  changes in the capture before trusting a hover.
- Fixtures: `screencapture -x -R 200,200,900,560 "<shots>/Screenshot test 1.png"` makes one.
  Vary the region for different aspects. Delete them when done, and delete their drafts and
  previews: drafts land in the shared `~/Library/Application Support/<bundle id>/drafts/` and
  previews in `~/Library/Caches/<bundle id>/drafts/`, keyed by your fixture's path. A relaunch
  sweeps drafts of deleted files; confirm with `[drafts] <n>`.
- The clipboard is Pete's. Copy, stitch, and Done put images on it; say in the report what you
  left there, or put an empty string on it at the end (`pbcopy < /dev/null`).
- Input: `scripts/input.sh` (CGEvent; hover needs the cursor walked in several steps; global
  Core Graphics points, top-left origin; the primary display is 1512 x 982 points, the Studio
  Display above it has negative y). Keys through System Events only while `[state]` says the
  target is key. Inside the editor page, `vignette://eval?<javascript>` runs code
  (`window.editor` is the tldraw editor) and logs the returned value.
- Looking: `screencapture -x <captures>/x.png`, crop with `sips` (`--cropOffset Y X
  --cropToHeightWidth H W`), enlarge with `sips --resampleWidth 1200`, and read the PNG.
- Measuring a motion: a 60 fps `screencapture -x -v` recording read back with AVFoundation, as
  AGENTS.md describes (per-frame position of an edge, or the mean brightness of a band). Compare
  before and after on the same driven sequence.

## Report

When every item is done (or you are stuck on one), report back in this shape, per item:

1. What was built: files, the mechanism, the numbers and their names.
2. Decisions and why, especially where the item left a choice open.
3. How it was verified: the driven sequence, the exact log lines, `[state]` values, crops or
   measurements, fixture names. Say what you saw, not what you expected.
4. What stayed unverified, and why.
5. Open questions for Pete.
6. The commit hash and its first line.

Then, once: incidents (any contact with Pete's settings, folder, or build; interference; lock
trouble; the settings mtime before and after each round and test run), what is on the
clipboard, which README and AGENTS lines you rewrote, and the state of the Mac when you left
(Pete's build running on his settings, lock released, fixtures and their drafts deleted, your
instance gone).

Do all your items, in the order the item file lists them. If one turns out to need a design
Pete has to decide, say so with what you found, and finish the others.
