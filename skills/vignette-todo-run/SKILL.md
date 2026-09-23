---
name: vignette-todo-run
description: Run a batch of Vignette TODO items as a multi-agent worktree run. Use when Pete asks to "run the TODOs", "run items N to M", "do a todo run", or hands over queued items from docs/TODOS.md in the Vignette repo. The orchestrator plans, briefs, and reviews; delegated coding agents do every code change and every verification, each in its own worktree with its own scratch settings; an integrator merges, a reviewer attacks the merge, and the branch is handed to Pete unmerged. Not for a single small fix in the checkout, and not for a repo other than Vignette.
---

# Vignette TODO run

One run takes a base branch and a list of items from `docs/TODOS.md`, and ends with one
integration branch Pete tests by hand, a run report under `docs/`, and the items marked landed.
Read `AGENTS.md` in the Vignette checkout before planning: the loop, the rules for several
builds on one Mac, and the measuring paragraphs are what the templates enforce.

Roles. The orchestrator (you) plans, briefs, orchestrates, and reviews, and writes no product
code. Delegated agents do the code and the verification, one worktree each. One integrator, one
adversarial reviewer, and, when asked, one architecture sweep. `launchers/claude.md` says how
to spawn them in Claude Code; in Codex use its own delegation with the same prompts.

Inputs to settle before anything is spawned: the base branch (`foundation` unless said), the run
tag (`todoN`, one more than the last `todoN/*` branch in `git branch -a`), the items in Pete's
words, and whether Pete is at the Mac (the templates assume he may be).

## 1. Plan, and show it

Group the items by the files they touch so agents do not collide. Read the items, grep for the
files each names, and check for a shared file between groups (`Settings.swift` and
`DebugPanel.swift` are shared by any item that adds a tweak; `AGENTS.md` and `README.md` by
every item). Inside a group, order items so a measurement comes before the change that would
confound it. Show Pete the grouping (a table: agent, branch, items, files), the order inside
each group, the shared files, and the merge order. Wait for a yes unless he said to proceed.

## 2. Set up

`scripts/setup-run.sh <run> <base> <name>...` creates, for each agent name, the worktree
`~/Code/vignette-todo/<name>` on `<run>/<name>` from `<base>`, copies `scripts/signing.env`, runs
`pnpm install` in `web/`, and makes `~/Code/vignette-todo/<name>-scratch` with `shots/`,
`captures/`, and a `settings.json` seeded from `~/.config/vignette/settings.json` with jq
(screenshotsFolder = the shots folder, `syncAppleSaveLocation` false, `debug` true,
`launchAtLogin` false, `copyOnCapture` false, `annotateOnCapture` false). It archives a previous
run's briefs, reports, and scratch folders into `~/Code/vignette-todo/<previous run>-archive/`
first. It prints the settings mtime; record it.

## 3. Brief

Fill the templates into `~/Code/vignette-todo/`: `BRIEF.md`, one `items/<name>.md` per agent,
`INTEGRATOR.md`, `REVIEWER.md`, and `ARCHITECTURE.md` when a sweep is wanted. Placeholders:
`{{RUN}}`, `{{BASE}}`, `{{BASE_SHA}}`, `{{DATE}}`, `{{PREVIOUS_RUN}}` (the last run report's
date suffix), `{{SESSION_URL}}` (this session's Claude-Session URL, or the equivalent),
`{{HOME}}`, `{{BRANCH_COUNT}}`, `{{MERGE_ORDER}}`, `{{SHARED_FILES}}`, `{{CROSS_BRANCH_PATHS}}`
(the smoke round: paths that cross branches, not what each agent proved), `{{ITEM_SPECIFIC_CHECKS}}`
(what the reviewer should attack for these items), `{{SWEEP_BASELINE}}`, `{{RUN_DOCS}}`.
`templates/ITEM-example.md` is a filled item file: Pete's words quoted verbatim under the item
number, then notes (the files, the order, candidates named as candidates, what only Pete's hands
can check). The rules in `BRIEF.md` are the run's contract; add rules only from an incident.

## 4. Run

Spawn every coding agent in one message. Each returns a report; save it to
`~/Code/vignette-todo/reports/<name>.md` (the agents write it there too). Append the loose ends
from the reports to `INTEGRATOR.md` (an unverified path another branch can exercise, a comment
an agent could not touch, a shared-file hazard), then spawn the integrator: it creates
`<run>/integration` from the base, merges in order with build and tests after each, reads every
file two branches touched by hand, runs the smoke round, and commits `docs/run-<date>.md`. Then
spawn the reviewer over `<base>..<run>/integration` with the reports; and the architecture
sweep, which can start as soon as the coding agents are done since it reads the base checkout
read-only. Route the reviewer's confirmed findings and the sweep's safe cleanups (no behaviour
change) back to the same integrator with a message: "Review fixes: …" commits and a Review
section in the report. Refactors and design questions go to Pete, not to the integrator. Run
`./scripts/build.sh --test` yourself in the integration worktree at the end.

## 5. Hand over

Do not merge into the base unless asked. Mark the items landed in `docs/TODOS.md` on the base
branch (the one place the orchestrator commits). Then `scripts/finish-run.sh <run>`: it
unregisters every worktree's app from LaunchServices, confirms Pete's build answers for
`vignette://`, checks his build is running on his real settings, and prints the worktrees and
branches to prune once Pete has merged (it prunes only with `--prune`). Report: the branch and
its tip, what landed per item, the open questions, exactly what only Pete's hands can check (a
real pinch, smart zoom, the second display, a label's feel), incidents (settings mtime before
and after, clipboard, drafts), and the state of the Mac.

## Hazards the templates encode

Every worktree builds the same bundle id. A bare `open -g vignette://…` launches whichever
copy LaunchServices registered last, on Pete's real settings, and `Settings.bootstrap` rewrites
that file with the build's key set; so every URL goes through `open -g -a <own app>`, every
launch carries `VIGNETTE_SETTINGS=<scratch>`, the running pid is checked by its own environment
(`ps -wwEp`) before every action, one launch at a time behind `~/Code/vignette-todo/launch.lock`,
own pid killed before every launch (`open --env` is ignored while the bundle runs), and Pete's
build is put back after every round. A unit test that reaches `Settings.shared` outside the
scheme's env writes the real file; the settings mtime is recorded around every test run and
round. Synthetic input reaches whatever is frontmost: `[state]` first, never Escape or Cmd+Q.
`references/bootstrap-prompt-2026-09-17.md` is the prompt this skill was written from.
