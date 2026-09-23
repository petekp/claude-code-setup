# The bootstrap prompt (Pete, 2026-09-17 night)

This is the prompt the skill was written from, verbatim. The skill's steps are its steps.

Run the remaining Vignette TODOs as orchestrator. You (Fable) plan, brief, orchestrate, and
review. Opus general-purpose subagents (Agent tool, model "opus") do every code change and every
verification. Do not write product code yourself; Fable usage limits are the reason. The one
exception is TODO 18, the skill for this process: it is instructions, not product code, and you
write it yourself as the last step.

Context to read first: docs/TODOS.md (items 19 to 22 under "Queued by Pete, 2026-09-17" are
queued and not started; item 18 is the skill; the "Ship the agent skill with the app" section is
a decided design that is NOT part of this run unless I say so), AGENTS.md (the loop, the rules for
several builds on one Mac in steps 3 and 4, the measuring paragraphs), and the last run's report
docs/run-2026-09-17-evening.md (how it was organized, what was verified, the open questions, the
incidents, and the review). Your memory note "Opus runs on Vignette" has the setup and the
hazards. If ~/Code/vignette-todo/ still exists, its BRIEF.md, INTEGRATOR.md, REVIEWER.md, and
items/*.md are the templates from the last run; start from them and fold in the rules below.

Process, the same as the last runs:
1. Plan. Group the items by the files they touch so agents do not collide. My expectation: items
   19 and 22 are one agent (the zoom: Zoom.swift, AnnotationController.swift, the zoom doc), items
   20 and 21 are one agent (the strip's reveal geometry in StackLayout/StackView, and "Draw" for
   "Annotate" in every user-facing string: the strip label, the settings window, the menu, the
   README, toasts; URL ids, log tags, and code identifiers stay). Show me the grouping before
   spawning anything.
2. Setup per agent, in a folder outside the checkout: `git worktree add -b todo5/<name>
   ~/Code/vignette-todo/<name> foundation`; copy scripts/signing.env into it; `pnpm install` in
   its web/; a scratch folder ~/Code/vignette-todo/<name>-scratch with shots/ and captures/, and a
   settings.json seeded from ~/.config/vignette/settings.json with jq: screenshotsFolder = that
   shots folder, syncAppleSaveLocation false, debug true, launchAtLogin false, copyOnCapture
   false, annotateOnCapture false. Agents never read or write the real settings file or
   ~/Dropbox/Screenshots. Fixtures go in shots/, captures in captures/, never the other way.
3. Write a shared brief and one item file per agent, with the item text in my words. Rules for
   the brief: work only in the worktree; ./scripts/build.sh --test passes before every commit; one
   commit per item, message in the style of git log, ending with this session's Claude-Session
   line; never amend, rebase, or push; never edit docs/TODOS.md; numbers a user would tune go in
   UITweaks with bounds and a slider; every animation goes through the motion scale; README and
   AGENTS lines that a change makes false are rewritten in the same commit; a design change gets a
   dated doc under docs/; tests extend the ones the repo keeps for that kind of change and test
   behavior, not the formula.
   Launching and driving: build first, then take the lock with `mkdir
   ~/Code/vignette-todo/launch.lock` (poll every 30 s while it is held; write your name into
   launch.lock/owner; touch it every five minutes while you hold it; stale only when older than
   15 minutes and no other worktree's instance is running). Kill your own instance's pid before
   every launch: `open --env` is silently ignored when that bundle is already running. Launch
   only with `open -g --env VIGNETTE_SETTINGS=<scratch>/settings.json
   <worktree>/build/Build/Products/Debug/Vignette.app`. Send every URL with `open -g -a <that
   app> "vignette://…"`; a bare `open -g vignette://…` is itself a launch of whichever copy
   LaunchServices registered last, on my real settings, and is forbidden even for a state probe.
   Before any action URL, confirm the running instance is yours by its own environment
   (`ps -wwEp <pid> | grep VIGNETTE_SETTINGS=<scratch>`; the shared log rotates at 5 MB and can
   lose the launch line). Confirm `[state]` shows the stack or annotator key before any synthetic
   key or click; a posted cursor move can be dropped while another agent drives input, so walk
   the cursor in steps and confirm `stack.hovered` and something that changes in the capture.
   Never post Escape or Cmd+Q; use vignette://dismiss and vignette://cancel. I may be at the Mac
   and may even try your instance, so treat a dismissal, a focus change, or input you did not
   send as interference and rerun. After every round: relaunch my build with `open -g
   ~/Code/vignette/build/Build/Products/Debug/Vignette.app` only while holding the lock, wait for
   its ready line naming my real settings, confirm your pid is gone, then release the lock.
   Delete your fixtures and their drafts and previews; drafts land in the shared Application
   Support folder. Say what you left on the clipboard, or clear it. Check
   `stat -f %m ~/.config/vignette/settings.json` before and after each round and each test run;
   it must not change. At the end of the run, unregister every worktree copy from LaunchServices
   (`lsregister -u <app>`) and confirm my build answers `NSWorkspace.urlForApplication(toOpen:)`
   for vignette://.
   Final report per item: what was built, decisions and why, how it was verified (the exact log
   lines, `[state]` values, crops or measurements), what stayed unverified, open questions,
   commit hash; then incidents, clipboard, rewritten doc lines, and the state of the Mac.
4. Run. Spawn the agents in one message. When their reports are in (save each to
   ~/Code/vignette-todo/reports/<name>.md), spawn an integrator that creates todo5/integration
   from foundation, merges in order with build and tests after each merge, resolves conflicts by
   intent and reads every overlapping file by hand, does a short smoke round on the paths that
   cross branches, and commits a run report under docs/ in the shape of
   docs/run-2026-09-17-evening.md (what landed, how verified, decisions and open questions for
   me, incidents, how to take it, merge notes). Then spawn an adversarial reviewer over
   foundation..todo5/integration with the reports pasted, whose job is what was missed and what
   the merge broke. Route confirmed findings back to the integrator as "Review fixes" commits with
   a Review section in the report. Run the final ./scripts/build.sh --test yourself.
5. Hand me the branch to test, with the open questions and exactly what only my hands can
   check (a real pinch, smart zoom, the second display). Do not merge into foundation unless I
   ask. Mark the items landed in docs/TODOS.md yourself.
6. Then write TODO 18 yourself: the skill that automates steps 1 to 5, in the setup repository's
   skills folder, shared with Codex through its manifest, with the Claude-only launcher scoped to
   Claude, its templates carrying the rules above, and this prompt as its first draft. Show me
   the skill's outline before writing it.

Start with the plan.

Follow-up, the same night: "after everything is done and tested, please make sure to do a
thorough review, particularly an architectural sweep, to ensure everything we've been adding
over the past couple days is not accreting a bunch of cruft and drift that could jeopardize the
quality of the codebase."
