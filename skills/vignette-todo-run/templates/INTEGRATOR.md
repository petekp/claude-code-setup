# Integrator brief ({{RUN}} run, {{DATE}})

You merge {{BRANCH_COUNT}} branches into one, prove the result builds and works, and write the run report.
The shared rules in `BRIEF.md` apply to you too (paths, commit style, the launch lock, the
identity check on the running pid, the scratch settings, the settings mtime check, putting
Pete's build back). Your name is `integration`: worktree
`{{HOME}}/Code/vignette-todo/integration` on branch `{{RUN}}/integration`, which you
create from `{{BASE}}` ({{BASE_SHA}}) with
`git -C {{HOME}}/Code/vignette worktree add -b {{RUN}}/integration {{HOME}}/Code/vignette-todo/integration foundation`,
then copy `scripts/signing.env` from `{{HOME}}/Code/vignette/scripts/` and run
`pnpm install` in its `web/`. Scratch: `{{HOME}}/Code/vignette-todo/integration-scratch`
(make it: `shots/`, `captures/`, and `settings.json` seeded with
`jq --arg shots "$S/shots" '.screenshotsFolder=$shots | .syncAppleSaveLocation=false | .debug=true | .launchAtLogin=false | .copyOnCapture=false | .annotateOnCapture=false' ~/.config/vignette/settings.json`,
the one read of Pete's file you make).

The agents' reports are in `{{HOME}}/Code/vignette-todo/reports/<name>.md`. Read
all of them before merging; they say what each branch changed, what was decided, and what was left
unverified.

## Merge

Order: {{MERGE_ORDER}}. For each:

1. `git merge --no-ff {{RUN}}/<name>` with the message
   `Merge {{RUN}}/<name>: <one sentence saying what the branch does>` and the Claude-Session line.
2. Resolve conflicts by intent: read both branches' commits and reports, keep both behaviors,
   and never drop one side to make the build pass.
3. Read by hand, in full, every file more than one branch changed, even when git auto-merged
   it. Expect at least `AGENTS.md` and `README.md`; check {{SHARED_FILES}} and the tests. Look for one
   branch's change undoing another's meaning: a label renamed in one place and drawn from
   another, a doc bullet stated twice, a `[state]` key reported once.
4. `./scripts/build.sh --test` after each merge, with the settings mtime recorded before and
   after. Fix what the merge broke in the merge commit; anything more than that is a separate
   commit with a message that says what and why.

## Smoke round

One launch round of the combined build (behind the lock, your scratch settings, the pid
identity check before every URL, Pete's build back afterwards). Drive the paths that cross
branches, not what each agent already proved:

{{CROSS_BRANCH_PATHS}}

Report what you saw, with the log lines and `[state]` values. Anything that fails is either a
merge defect (fix it) or an agent's defect (report it, do not paper over it).

## Report

Write `docs/run-{{DATE}}.md` on the branch, in the shape of
`docs/run-{{PREVIOUS_RUN}}.md`: the merge table; per item what landed, how it was verified
(condense the agents' evidence; keep the numbers), what stayed unverified; decisions made without
Pete and open questions for him, per branch and yours; how to take the branch; incidents (any
contact with Pete's settings, folder, build, or clipboard, interference, lock trouble, the mtime
checks); merge notes (every conflict and every hand-read file, and what you checked). Commit it.
Then write the same to `{{HOME}}/Code/vignette-todo/reports/integration.md` and
report back to the orchestrator with the branch tip, the test count, and the open questions in
short. You will be called again with review findings to fix as "Review fixes: …" commits and a
Review section in the report; keep your worktree as it is.

