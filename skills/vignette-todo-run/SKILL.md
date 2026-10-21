---
name: vignette-todo-run
description: Run a batch of Vignette TODO items as a multi-agent worktree run. Use when Pete asks to "run the TODOs", "run items N to M", "do a todo run", or hands over queued items from docs/TODOS.md in the Vignette repo. The orchestrator plans, briefs, and reviews; delegated coding agents do every code change and every verification, each in its own worktree with its own scratch settings; an integrator merges, a reviewer attacks the merge, and the branch is handed to Pete unmerged. Not for a single small fix in the checkout, and not for a repo other than Vignette.
---

# Vignette TODO run

One run takes a base branch and a list of items from `docs/TODOS.md`, and ends with one
integration branch Pete tests by hand, which also removes the landed items from `docs/TODOS.md`,
and a run report in `~/Code/vignette-todo/reports/`.
Read `AGENTS.md` in the Vignette checkout before planning: the loop, the rules for several
builds on one Mac, and the measuring paragraphs are what the templates enforce.

Roles. The orchestrator (you) plans, briefs, orchestrates, and reviews, and writes no product
code. Delegated agents do the code and the verification, one worktree each. One integrator, one
adversarial reviewer, and, when asked, one architecture sweep. `launchers/claude.md` says how
to spawn them in Claude Code; in Codex use its own delegation with the same prompts.

Inputs to settle before anything is spawned: the base branch (`main` unless said), the run tag,
the items in Pete's words, and whether Pete is at the Mac (the templates assume he may be). The
tag is `todoN`, one more than the highest in the base's commit subjects, since a finished run's
branches are pruned: `git log --format=%s <base> | grep -o 'todo[0-9]*' | sort -V | tail -1`.

## 1. Plan, and show it

Group the items by the files they touch so agents do not collide. Read the items, grep for the
files each names, and check for a shared file between groups (`Settings.swift` and
`DebugPanel.swift` are shared by any item that adds a tweak; `AGENTS.md` and `README.md` by
every item). Inside a group, order items so a measurement comes before the change that would
confound it. Show Pete the grouping (a table: agent, branch, items, files), the order inside
each group, the shared files, and the merge order. Wait for a yes unless he said to proceed.

## 2. Set up

`scripts/setup-run.sh <run> <base> <name>...` creates, for each agent name, the worktree
`~/Code/vignette-todo/<name>` on `<run>/<name>` from `<base>`, copies `scripts/signing.env`, and
makes `~/Code/vignette-todo/<name>-scratch` with `shots/`, `captures/`, and a `settings.json`
seeded from `~/.config/vignette/settings.json` with jq. The seed points it at the shots folder and
turns `debug` on. It turns off Apple sync, launch at login, and copy and annotate on capture, hides
the menu bar icon, marks setup and the skill offer done, and sets a shortcut that is not Pete's,
`ctrl+option+cmd+9`. It also copies `scripts/test-copy.sh` to `~/Code/vignette-todo/`. Agent names
are lowercase letters, digits, and hyphens, since each becomes a bundle id and a URL scheme. It
archives a previous run's briefs, reports, and scratch folders into
`~/Code/vignette-todo/<previous run>-archive/` first. It prints the settings mtime; record it.

## 3. Brief

Fill the templates into `~/Code/vignette-todo/`: `BRIEF.md`, one `items/<name>.md` per agent,
`INTEGRATOR.md`, `REVIEWER.md`, and `ARCHITECTURE.md` when a sweep is wanted. Placeholders:
`{{RUN}}`, `{{BASE}}`, `{{BASE_SHA}}`, `{{DATE}}`, `{{PREVIOUS_RUN}}` (the last run's tag;
its reports are in `~/Code/vignette-todo/<tag>-archive/reports/`), `{{SESSION_URL}}` (this
session's Claude-Session URL, or the equivalent), `{{HOME}}`, `{{BRANCH_COUNT}}`,
`{{MERGE_ORDER}}`, `{{SHARED_FILES}}`, `{{CROSS_BRANCH_PATHS}}` (the smoke round: paths that cross
branches, not what each agent proved), `{{ITEM_SPECIFIC_CHECKS}}` (what the reviewer should attack
for these items), `{{SWEEP_BASELINE}}`, `{{RUN_REPORTS}}` (the integration reports of the runs
since the baseline).
`templates/ITEM-example.md` is a filled item file: Pete's words quoted verbatim under the item
number, then notes (the files, the order, candidates named as candidates, what only Pete's hands
can check). The rules in `BRIEF.md` are the run's contract; add rules only from an incident.

## 4. Run

Spawn every coding agent in one message. Each returns a report; save it to
`~/Code/vignette-todo/reports/<name>.md` (the agents write it there too). Append the loose ends
from the reports to `INTEGRATOR.md` (an unverified path another branch can exercise, a comment
an agent could not touch, a shared-file hazard), then spawn the integrator: it creates
`<run>/integration` from the base, merges in order with build and tests after each, reads every
file two branches touched by hand, runs the smoke round, and writes the run report to
`reports/integration.md`. Then spawn the reviewer over `<base>..<run>/integration` with the
reports; and the architecture sweep, which can start as soon as the coding agents are done since it
reads the base checkout read-only. Route the reviewer's confirmed findings and the sweep's safe
cleanups (no behaviour change) back to the same integrator with a message: "Review fixes: …"
commits and a Review section in the report. Refactors and design questions go to Pete, not to the
integrator. Run `./scripts/build.sh --test` yourself in the integration worktree at the end.

## 5. Hand over

Do not merge into the base unless asked. Remove the landed items from `docs/TODOS.md` in one
commit on the integration branch, so they leave the list when Pete merges (the one place the
orchestrator commits). Then `scripts/finish-run.sh <run>`: it unregisters every worktree build
and test copy from LaunchServices, confirms Pete's build answers for `vignette://` and runs on his
real settings, and prints the worktrees and branches to prune once Pete has merged (it prunes only
with `--prune`). Report: the branch and its tip, what landed per item, the open questions, exactly
what only Pete's hands can check (a real pinch, smart zoom, the second display, the double tap, a
label's feel), incidents (settings mtime before and after, clipboard writes, input that went
astray), and the state of the Mac.

## Hazards the templates encode

Every worktree builds Pete's bundle id and `vignette://` scheme, and a second launch of a bundle id
quits the older instance. So agents run their builds through `test-copy.sh`, as copies with their
own bundle id, scheme, log, and Application Support folder, and without the bundled agent skill,
which a launch would copy over Pete's installed one. Pete's build is never launched, quit, or sent
a URL. A copy launched without `VIGNETTE_SETTINGS` runs on Pete's real settings file and
`Settings.bootstrap` rewrites it, so the script refuses a URL unless the running copy carries the
scratch path. The copy is not trusted for Accessibility: it takes the Dock to span the whole bottom
edge and cannot use the double tap. One driving round at a time behind
`~/Code/vignette-todo/launch.lock`, because the pointer, the keys, and the screen are shared.
Synthetic input reaches whatever is frontmost: `[state]` first, keys to the copy's pid, every press
checked against the window server, a level-1 catcher only over the rect of timed presses, and never
Escape or Cmd+Q. Done, Copy, Copy Drawing, and `stitch` write Pete's clipboard. The settings mtime
is recorded around every test run and round. `references/bootstrap-prompt-2026-09-17.md` is the
prompt this skill was written from.
