# Shared brief for the {{RUN}} run ({{DATE}})

You are one Opus agent with one worktree and one scratch folder. You do the code and the
verification for the items in `items/<name>.md`. Fable orchestrates; an integrator merges every
branch into `{{RUN}}/integration` afterwards; a reviewer reads the whole range. Pete tests the
result by hand. Nothing you build reaches him except through your
commits and your report.

Paths, with `<name>` your agent name:

- Worktree: `{{HOME}}/Code/vignette-todo/<name>` on branch `{{RUN}}/<name>` from `{{BASE}}` ({{BASE_SHA}}).
- App you build: `{{HOME}}/Code/vignette-todo/<name>/build/Build/Products/Debug/Vignette.app`.
- Test copy of it: `{{HOME}}/Code/vignette-todo/<name>-scratch/app/Vignette-<name>.app`, with bundle
  id `com.petepetrash.vignette.todo.<name>` and scheme `vignette-<name>://`.
  `{{HOME}}/Code/vignette-todo/test-copy.sh <name> <command>` installs it, launches it, and sends
  it URLs.
- Scratch settings: `{{HOME}}/Code/vignette-todo/<name>-scratch/settings.json`
  (seeded from Pete's real file: your own shots folder, `debug` on, Apple sync off, copy and
  annotate on capture off, launch at login off, the menu bar icon hidden, a shortcut that is not
  Pete's).
- Fixtures go in `{{HOME}}/Code/vignette-todo/<name>-scratch/shots` (the watch folder
  of your copy). Captures, recordings, and scripts go in
  `{{HOME}}/Code/vignette-todo/<name>-scratch/captures`, never in `shots`: the watcher
  would show them as screenshots. Never the other way round.
- Pete's build: `{{HOME}}/Code/vignette/build/Build/Products/Debug/Vignette.app`,
  running on `{{HOME}}/.config/vignette/settings.json`, watching `{{HOME}}/Dropbox/Screenshots`.
  Never launch it, quit it, or send it a URL.
- Log: your copy's is `~/Library/Logs/Vignette-<name>.log`. `~/Library/Logs/Vignette.log` is Pete's
  build's.

Read `AGENTS.md` in your worktree before anything else: the loop, steps 3 and 4 (several builds
on one Mac), the measuring paragraphs, and the rules. This brief adds the run's rules. AGENTS.md
is the authority on how the app works.

## Rules

- Work only in your worktree. Never edit `{{HOME}}/Code/vignette`, another agent's
  worktree or scratch folder, `~/.config/vignette/`, or `~/Dropbox/Screenshots`. Never read or
  write Pete's settings file or his screenshot folder.
- Never edit `docs/TODOS.md`. Fable removes the landed items.
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
- README.md, AGENTS.md, and `docs/editor.md` lines that your change makes false are rewritten in
  the same commit. Keep the existing voice: short sentences, the mechanism and the reason, no
  history.
- A design change (a new mechanism, a choreography, a heuristic, a layout rule) gets a dated
  doc under `docs/` named `<topic>-{{DATE}}.md`, or a dated section in the doc that already
  covers the topic.
- Tests: extend the tests the repository already keeps for that kind of change
  (`ZoomTests`, `StackLayoutTests`, `StackModelTests`, `AnnotatorTransitionTests`,
  `EditorCoreTests`, `MarkRenderingTests`, `CommandsTests`, `SettingsTests`, `StateReportTests`).
  Test observable behavior, not the formula. Do not add a test that only mirrors the
  implementation or exists only to prove your patch.
- Comments only for a constraint, contract, failure mode, or reason the code cannot show. No
  task history in code or comments.
- Language everywhere (identifiers, log lines, docs, the report): plain and precise, one name per
  concept, short sentences.

## Launching and driving

The hazards are real: agents hit every one of them in earlier runs.

Every worktree builds Pete's bundle id and `vignette://` scheme, and a second launch of a bundle
id quits the older instance. So you never launch your build itself: you run it as a test copy with
its own bundle id, scheme, log, and Application Support folder, through `test-copy.sh`. Never send
`vignette://`; it is Pete's.

- Build with `./scripts/build.sh` or `./scripts/build.sh --test`, before taking the lock. Never
  `./scripts/run.sh`: it kills every process named Vignette, Pete's included, and launches your
  build on his settings.
- After each build, `test-copy.sh <name> install` copies it, gives it its own bundle id and
  scheme, and removes the bundled agent skill, because a launch copies that skill over Pete's
  installed one. So your copy logs `[skill] error missing-file vignette is not in the bundle` at
  launch, as expected.
- The settings path is the same for every copy. A copy launched without `VIGNETTE_SETTINGS` runs
  on Pete's real file, and `Settings.bootstrap` rewrites it with your build's key set.
  `test-copy.sh <name> launch` kills the running copy first, since `open --env` is silently ignored
  while the bundle runs, then launches it on your scratch file and waits for `[app] ready`.
- `open -a` relaunches a copy that has quit, without the env. So `test-copy.sh <name> url …` and
  `state` refuse unless the running copy has your scratch path in its environment. Send every URL
  through them, never with `open` directly. Then read `[state]` and stop unless `app.bundle` is
  your copy and `app.settingsFile` is your scratch file.
- The copy is not trusted for Accessibility, so it takes the Dock to span the whole bottom edge
  and cannot use the double tap (AGENTS.md). Say so when an item depends on either; Pete checks
  those in his build.
- The lock: one driving round at a time, because the pointer, the keys, and the screen are
  shared. `mkdir {{HOME}}/Code/vignette-todo/launch.lock`; it fails when held. Poll every 30 s
  until it succeeds, then `echo <name> > {{HOME}}/Code/vignette-todo/launch.lock/owner`. Hold it
  from your launch until your copy has quit. `touch` the lock directory every five minutes while
  you hold it. A lock is stale only when it is older than 15 minutes (`stat -f %m`) and no other
  agent's copy is running (`pgrep -fl vignette-todo/` shows no other `<other>-scratch/app` path);
  then `rm -r` it and take it.
- After every round: `test-copy.sh <name> quit`, confirm `test-copy.sh <name> pid` prints
  nothing, then `rm -r {{HOME}}/Code/vignette-todo/launch.lock`.
- Record `stat -f %m {{HOME}}/.config/vignette/settings.json` before and after each
  round. It must not change.
- Pete may be at the Mac, and may even try your copy. Before any synthetic key or click, read
  `[state]` and confirm the stack (`stack.visible`, `stack.key`) or the annotator is up and key.
  Never post Escape or Cmd+Q: `test-copy.sh <name> url dismiss` closes the stack, `url cancel`
  the annotator. If the stack is dismissed, focus changes, or a capture shows something you did not
  do, treat it as interference and rerun; a single failed run proves nothing.
- Keys go to your copy's pid only (`CGEvent.postToPid`, with the pid from `test-copy.sh <name>
  pid`), so no key can reach another app, whatever is frontmost. System Events and
  `scripts/input.sh key` post to whatever is frontmost; do not use them for keys.
- Before every click and drag, ask the window server which window a press at that point hits
  (`NSWindow.windowNumber(at:belowWindowWithWindowNumber: 0)`, then its owner from
  `CGWindowListCopyWindowInfo`). Press only when the owner is your copy or your catcher. Check a
  drag's start and end.
- A catcher covers only where your presses can land. Before presses you time, such as a press
  during a flight, put up a window at level 1 that takes and logs presses, sized to the rect of
  those presses plus a margin, never the whole screen, and take it down right after. Level 1 keeps
  it above an app that takes focus back; a full-screen catcher took one of Pete's own clicks.
  Report any input that went astray, and any of Pete's that your catcher took.
- A single posted move does not fire hover. Walk the cursor in several steps and confirm
  `stack.hovered` (or the focus) in `[state]` and something that changes in the capture before
  trusting a hover.
- Fixtures: `screencapture -x -R 200,200,900,560 "<shots>/Screenshot test 1.png"` makes one.
  Vary the region for different aspects. Delete them when done. Their drawings are in your copy's
  `~/Library/Application Support/com.petepetrash.vignette.todo.<name>/drawings/`, and a relaunch
  sweeps the drawings of deleted files; confirm with `[drawings] <n>`.
- The general clipboard is Pete's. Done, Copy, Copy Drawing, and `stitch` write it. Drive them
  only when a check needs them, and list each run with its time in the report. Do not clear or
  restore the clipboard: Pete may have copied something since.
- Input: `scripts/input.sh` in your worktree posts clicks, drags, scrolls, and cursor moves
  (CGEvent; global Core Graphics points, top-left origin; the primary display is 1512 x 982 points,
  and a display above it has negative y). It checks nothing, so run the window-server check first.
  `[state]`'s `editor` section reads the editor: the tool, each mark's type and frame, the
  selection, typing, and undo and redo (`docs/editor.md`, "Inspecting and driving").
- Looking: `screencapture -x -R x,y,w,h <captures>/x.png` captures one region, such as a frame
  from `[state]`. Crop a full capture with Python, never `sips`, which ignores `--cropOffset` and
  crops from the centre. Read the PNG.
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

Then, once: incidents (any contact with Pete's settings, folder, or build; input that went
astray; interference; lock trouble; the settings mtime before and after each round and test run),
each clipboard write with its time, which README and AGENTS lines you rewrote, and the state of
the Mac when you left (your copy quit, lock released, no catcher up, fixtures and their drawings
deleted).

Do all your items, in the order the item file lists them. If one turns out to need a design
Pete has to decide, say so with what you found, and finish the others.
