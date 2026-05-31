# Codex Surface Checklist

Every item below is a discrete test. Run them in order. For each item, record:

- **Pass / pass-with-finding / fail / skipped / partial-skip** with a one-line
  rationale.
- **Run folder** path, or a transcript snippet when there is no run folder.
- **Notes** for progress rendering, missing summaries, warning doctor checks,
  or native Codex UI limits.

## Surface model (read first)

The Codex plugin publishes exactly two skills (and matching command mirrors):
`run` and `handoff`. There are no per-flow skills. Built-in flows (build,
explore, fix, prototype, pursue, review) are reached two ways:

- **Through Run** — "Use the Circuit run skill on <task>": the run skill
  recommends a flow from the task and invokes it. This is the normal user path.
- **Explicit CLI flow start** — `run <flow> --goal '<task>'` through the plugin
  wrapper: the deterministic way to exercise a specific flow and axis.

`create` is a CLI-only utility, not a skill. `goal` is an internal flow: no
skill, never auto-selected by the classifier, only reachable as an explicit
`run goal` start kept for reader-compat with old `goal.*@v1` run folders. Treat
any `@build`, `@goal`, `@create`, or `@Circuit` skill as a finding — those do
not exist; the skills are `run` and `handoff`.

## Conventions

- `$PLUGIN_ROOT` - the absolute directory containing
  `.codex-plugin/plugin.json`. Default development location:
  `/Users/petepetrash/Code/circuit/plugins/codex`.
- `$SCRATCH` - the scratch repo created in `SKILL.md`.
- `$REPORT_ROOT` - the durable report dir from `SKILL.md`. Pass
  `--run-folder "$REPORT_ROOT/<row-id>"` to every CLI invocation that accepts
  it.
- Every CLI fallback row uses `--progress jsonl` and runs with cwd at `$SCRATCH`.
- "Native" means invoking the Codex `run` or `handoff` skill.

## Pass Criteria for Every Flow Row

A row passes when all applicable criteria hold:

1. The CLI exits 0 or Codex reports success.
2. The final JSON has `outcome === "complete"` unless the row expects
   `checkpoint_waiting`, `aborted`, or rejected arguments.
3. Codex prefers `presentation.status_text`, suppresses
   `presentation.line_mode === "suppress"`, and only falls back to
   `display.text` when `presentation` is absent and the display contract makes
   the event visible.
4. Codex renders `operator_summary_markdown_path` verbatim. If native
   rendering is unavailable, do the file-only check and mark `partial-skip`.
5. The final JSON envelope surfaces `flow_id`, `outcome`, `run_folder`,
   `trace_entries_observed`, `operator_summary_path`, and
   `operator_summary_markdown_path`. Verify `operator_summary_status_text` and
   `operator_summary_html_path` when present. For Run, also verify
   `selected_flow`, `routed_by`, and `router_reason`.
6. Unsupported axis rows fail before worker execution and include the flow's
   allow-list in the error.

Use **pass-with-finding** when the user-observable edit or summary succeeded
but a downstream verify/review/checkpoint path aborted or degraded.

---

## Section A0 - Default-Axis Smoke Matrix

Run A0 first. Its job is to catch structural relay-shape regressions before the
full surface walk. If any row aborts with schema validation, missing required
fields, or unrecognized keys, stop, record a Critical finding, and ask the
operator before continuing.

No flow has a direct skill, so A0 drives each public flow at default axis through
the explicit CLI flow start, and proves the native run skill separately in A0.0.

**A0 pre-setup**:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

Do not commit.

| ID | Flow | Invocation |
|---|---|---|
| A0.0 | run (native) | Native: "Use the Circuit run skill - briefly explain the repo layout"; confirm `selected_flow`, `routed_by`, `router_reason` |
| A0.1 | explore | CLI: `run explore --goal 'briefly explain the repo layout' --run-folder "$REPORT_ROOT/A0.1-explore" --progress jsonl` |
| A0.2 | review | CLI: `run review --goal 'flag any safety problems in the staged evil.js' --run-folder "$REPORT_ROOT/A0.2-review" --progress jsonl` |
| A0.3 | fix | CLI: `run fix --goal 'bug.js subtracts instead of adding' --run-folder "$REPORT_ROOT/A0.3-fix" --progress jsonl` |
| A0.4 | build | CLI: `run build --goal 'add an exported double(n) function to add.js' --run-folder "$REPORT_ROOT/A0.4-build" --progress jsonl` |
| A0.5 | prototype | CLI: `run prototype --goal 'sketch a disposable README note for the fixture' --run-folder "$REPORT_ROOT/A0.5-prototype" --progress jsonl` |
| A0.6 | pursue | CLI: `run pursue --goal 'coordinate two tiny pursuits: document add.js; verify npm scripts' --run-folder "$REPORT_ROOT/A0.6-pursue" --progress jsonl` |

Pass: every row exits 0 with `complete` or is pass-with-finding eligible. All A0
flow rows are CLI flow starts because Codex has no direct per-flow skill; A0.0
proves the native run skill recommendation path.

**A0 cleanup**:

```bash
cd "$SCRATCH"
git reset HEAD .
rm -f evil.js
git checkout -- bug.js add.js README.md
```

---

## Section A - Flow and Axis Surface

All Section A flow rows use the explicit CLI flow start so the target flow and
axis are unambiguous. Run them through the wrapper with the cwd at `$SCRATCH`.

### A1. explore - default

CLI: `run explore --goal 'explain how the catalog wires flows into the engine'`

Pass: criteria above + summary names at least one source file. Working tree
stays unchanged.

### A2. explore - `--rigor lite`

CLI: `run explore --rigor lite --goal 'summarize the scratch repo structure'`

Pass: run completes and lite rigor is reflected.

### A3. explore - `--rigor deep`

CLI: `run explore --rigor deep --goal 'compare small vs broad investigation'`

Pass: run completes and deep rigor is reflected.

### A4. explore - tournament

```bash
run explore --tournament --tournament-n 2 \
  --goal 'decide: one file or two files for examples' \
  --run-folder "$REPORT_ROOT/A4-explore-tournament" --progress jsonl
```

Pass: run reaches a well-formed tournament outcome, emits tournament reports,
and includes `operator_summary_html_path` when emitted by the runtime.

### A5. explore - autonomous tournament

```bash
run explore --tournament --tournament-n 2 --autonomous \
  --goal 'decide: clearer README structure' \
  --run-folder "$REPORT_ROOT/A5-explore-autonomous-tournament" --progress jsonl
```

Pass: supported checkpoints auto-resolve without a Codex prompt; an
`autonomous_loop` field is present (see A-Loop).

### A6. review - staged change

Set up:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

CLI: `run review --goal 'flag any safety problems in the staged evil.js'`

Pass: Review surfaces the `eval()` use as a High or Critical finding. Working
tree is otherwise unchanged.

### A7. review - unsupported axes reject

```bash
run review --goal 'review the staged evil.js' --rigor deep \
  --run-folder "$REPORT_ROOT/A7-review-deep-reject" --progress jsonl
```

Repeat with `--tournament` and `--autonomous` if time allows.

Pass: rejected before worker execution with Review's allow-list.

### A8. review - untracked content flag

Set up: `cd "$SCRATCH" && echo "secret = 42" > untracked.txt`

```bash
run review --goal 'look at untracked.txt' \
  --run-folder "$REPORT_ROOT/A8-review-untracked-default" --progress jsonl

run review --goal 'look at untracked.txt' --include-untracked-content \
  --run-folder "$REPORT_ROOT/A8-review-untracked-included" --progress jsonl
```

Pass: default omits untracked contents and the flag changes behavior.

### A9. fix - default

CLI: `run fix --goal 'buggyAdd in bug.js subtracts instead of adds'`

Pass: criteria above + `bug.js` is corrected.

### A10. fix - `--rigor lite`

CLI: `run fix --rigor lite --goal 'a README typo - change "fixture" to "fixtures"'`

Pass: run completes and lite skips only flow-declared optional review.

### A11. fix - `--rigor deep`

Set up:

```bash
cd "$SCRATCH"
echo "README expects buggyAdd to add numbers." >> README.md
echo "function buggyAdd(a, b) { return a - b; }" > bug.js
```

CLI: `run fix --rigor deep --goal 'make buggyAdd match the README expectation that it adds numbers'`

Pass: run completes and deep rigor is reflected.

### A12. fix - unsupported tournament rejects

```bash
run fix --goal 'fix the buggyAdd implementation' --tournament \
  --run-folder "$REPORT_ROOT/A12-fix-tournament-reject" --progress jsonl
```

Pass: rejected before worker execution with Fix's allow-list.

### A13. build - default

CLI: `run build --goal 'add a multiply function to add.js'`

Pass: criteria above + the export exists.

### A14. build - `--rigor lite`

CLI: `run build --rigor lite --goal 'export TWO = 2 from add.js'`

Pass: run completes and lite rigor is reflected.

### A15. build - `--rigor deep`

CLI: `run build --rigor deep --goal 'add a small module-level comment and verify exported functions'`

Pass: run completes and deep rigor is reflected. If it waits for a checkpoint,
continue under C1.

### A16. build - unsupported tournament rejects

```bash
run build --goal 'add a subtract helper' --tournament \
  --run-folder "$REPORT_ROOT/A16-build-tournament-reject" --progress jsonl
```

Pass: rejected before worker execution with Build's allow-list.

### A17. prototype - default

CLI: `run prototype --goal 'sketch a disposable README note for the fixture'`

Pass: criteria above + prototype evidence is written under the run folder. If
the flow asks whether to keep, save, or discard the prototype, continue under
C1.

### A18. prototype - `--rigor deep`

CLI: `run prototype --rigor deep --goal 'compare two small README note variants'`

Pass: run completes and deep rigor is reflected.

### A19. prototype - tournament

```bash
run prototype --tournament --tournament-n 2 \
  --goal 'compare two disposable README note variants' \
  --run-folder "$REPORT_ROOT/A19-prototype-tournament" --progress jsonl
```

Pass: run reaches a well-formed variant comparison, emits variant reports, and
includes `operator_summary_html_path` when emitted by the runtime.

### A20. prototype - unsupported lite rejects

```bash
run prototype --goal 'sketch a disposable README note' --rigor lite \
  --run-folder "$REPORT_ROOT/A20-prototype-lite-reject" --progress jsonl
```

Pass: rejected before worker execution with Prototype's allow-list.

### A21. pursue - default

```bash
run pursue --goal 'coordinate two pursuits: inspect add.js; update README wording' \
  --run-folder "$REPORT_ROOT/A21-pursue-default" --progress jsonl
```

Pass: `pursue` runs or reaches a well-formed checkpoint/outcome.

### A22. pursue - autonomous

```bash
run pursue --autonomous \
  --goal 'coordinate two tiny pursuits in the scratch repo' \
  --run-folder "$REPORT_ROOT/A22-pursue-autonomous" --progress jsonl
```

Pass: supported checkpoints auto-resolve or the run fails closed with a clear
unsupported-policy reason; an `autonomous_loop` field is present (see A-Loop).

### A23. pursue - unsupported rigor/tournament rejects

```bash
run pursue --goal 'coordinate two tiny pursuits' --rigor deep \
  --run-folder "$REPORT_ROOT/A23-pursue-deep-reject" --progress jsonl
```

Repeat with `--tournament` if time allows.

Pass: rejected before worker execution with Pursue's allow-list.

---

## Section A-Loop - Autonomous Continuation Loop

`--autonomous` auto-resolves supported checkpoints AND drives Run's bounded,
evidence-driven continuation loop. Verify the loop surface.

### AL1. Loop fires and persists its result

```bash
run build --autonomous \
  --goal 'add an exported triple(n) function to add.js and verify it' \
  --run-folder "$REPORT_ROOT/AL1-build-autonomous" --progress jsonl
```

Pass: the final JSON includes an `autonomous_loop` object with `outcome`,
`attempts`, and `stop_reason`, and `reports/autonomous-loop.json` exists. The
loop never reports `complete` purely by exhausting attempts.

### AL2. Default path has no loop

```bash
run build \
  --goal 'add an exported triple(n) function to add.js and verify it' \
  --run-folder "$REPORT_ROOT/AL2-build-default" --progress jsonl
```

Pass: no `autonomous_loop` field and no `reports/autonomous-loop.json`. The
default path is single-shot.

---

## Section G - Internal Goal Flow

Goal was collapsed into an internal flow. Verify it is not a public surface and
that its reader-compat path still works.

### G1. No goal skill

Confirm there is no `goal` Codex skill and `plugins/codex/skills/goal/` does not
exist.

Pass: there is no goal skill. A goal skill would be a finding.

### G2. Classifier never auto-selects goal

```bash
run --goal 'finish this scoped objective: verify npm scripts and summarize the fixture' \
  --run-folder "$REPORT_ROOT/G2-router-not-goal" --progress jsonl
```

Pass: `selected_flow` is a public flow (never `goal`). Repeat with goal-flavored
phrasings; none route to `goal`.

### G3. Goal is not shipped to the host; explicit start lives only in the repo CLI

Through the installed host plugin, `goal` is not available: as an internal flow
its compiled JSON is not mirrored into the host package (no
`plugins/codex/flows/goal/`). Confirm the host wrapper cannot run it:

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" run goal --goal 'finish a tiny objective' \
  --run-folder "$REPORT_ROOT/G3-goal-host" --progress jsonl
```

Pass: this fails (exit non-zero) with `flow fixture not found:
.../flows/goal/circuit.json`, confirming goal ships no host surface. The
explicit internal start and old `goal.*@v1` run-folder reader-compat live only
in the repo CLI (`./bin/circuit run goal`, which resolves
`generated/flows/goal/circuit.json`), not the host plugin. A host that actually
ran goal would be a finding. (The generic fixture-not-found message for an
internal flow is worth noting as a low-severity UX finding.)

---

## Section B - Run and Utility Surface

### B1. run skill - Codex picks Fix

Native only: "Use the Circuit run skill - buggyAdd in bug.js subtracts instead
of adds, fix it"

Pass: Codex announces Fix and runs it; `selected_flow` is `fix`.

### B2. run skill - Codex picks Build

Native only: "Use the Circuit run skill to add a square function to add.js"

Pass: `selected_flow` is `build`.

### B3. run skill - Codex picks Review

Native only: "Use the Circuit run skill to review the current scratch diff for
safety problems"

Pass: Codex picks Review and does not implement changes.

### B4. run skill - Codex picks Explore

Native only: "Use the Circuit run skill to compare two implementation approaches
before editing"

Pass: Codex picks Explore and remains read-only.

### B5. run skill - Codex picks Prototype

Native only: "Use the Circuit run skill to sketch a disposable mockup before
implementation"

Pass: Codex picks Prototype before running.

### B6. Deterministic router picks Pursue

```bash
run --goal 'pursue: coordinate two tiny goals in this repo' \
  --run-folder "$REPORT_ROOT/B6-run-pursue-router" --progress jsonl
```

Pass: `selected_flow` or progress reports `pursue`. This covers the public
flow's router path, not a direct Codex skill.

### B7. `version --json`

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" version --json
```

Pass: JSON includes `version`, `runtime_source: "bundled"`, `runtime_path`, and
`plugin_root`.

### B8. `doctor --json`

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" doctor --json
```

Pass: doctor status is `ok`, bundled runtime executes, the published skills (run,
handoff) and their command mirrors are present, Codex hook posture is reported,
and temp-repo smoke checks pass. Record warnings such as hook feature
visibility.

### B9. `runs show --json`

After any completed run:

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" runs show --run-folder '<run_folder>' --json
```

Pass: output is parseable and points to the same run evidence.

### B10. `create` - draft (CLI-only)

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" create \
  --description 'a flow that runs a quick TypeScript type-check and reports errors' \
  --name 'typecheck-flow'
```

Pass: creates a draft and does not publish without `--publish --yes`. Confirm
there is no `create` Codex skill (CLI-only utility).

### B11. `create` - publish

Run `create ... --publish --yes` only when you intend to publish.

Pass: `--publish --yes` runs the publish step and the path the summary names
exists.

### B12. handoff skill - save

After a flow run, native:

"Use the Circuit handoff skill - context: in the middle of build flow testing"

Pass: continuity record exists at the path the summary names. Confirm
`--run-folder` was passed when there was an active run.

### B13. handoff skill - brief/resume/done

Run native:

```text
Use the Circuit handoff skill: brief
Use the Circuit handoff skill: resume
Use the Circuit handoff skill: done
```

Pass: brief is read-only context, resume restores the saved handoff, done clears
it, and a later brief reports empty.

### B14. handoff hooks install/doctor/uninstall

Native or CLI fallback:

```bash
HOOKS_FILE="$REPORT_ROOT/B14-codex-hooks.json"
node "$PLUGIN_ROOT/scripts/circuit.ts" handoff hooks install --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit.ts" handoff hooks doctor --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit.ts" handoff hooks uninstall --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit.ts" handoff hooks doctor --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
```

Pass: install writes the temp hook file, doctor reports it, uninstall removes
it, and final doctor explains the expected missing state. Only touch the real
user-level hooks file when the operator explicitly asks for that coverage.

### B15. Handoff wrapper accepts utility subcommand args

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" handoff save \
  --goal 'wrapper smoke' \
  --next 'verify wrapper does not over-inject' \
  --state-markdown 'scratch session' \
  --debt-markdown 'none' \
  --progress jsonl
```

Pass: exit code 0 and stderr does not contain `unknown flag`.

---

## Section C - Outcome Paths

### C1. `checkpoint_waiting` to resume

Trigger a checkpoint, commonly via Explore tournament or Build deep. When
`outcome === "checkpoint_waiting"`:

1. Confirm Codex does not claim `result_path` if absent.
2. Confirm it surfaces checkpoint step id, request path, allowed choices,
   `user_input.requested`, and the resume command.
3. Resume from a fresh shell:

   ```bash
   node "$PLUGIN_ROOT/scripts/circuit.ts" resume \
     --run-folder '<run_folder>' --checkpoint-choice '<choice>' --progress jsonl
   ```

Pass: the run continues from the checkpoint and reaches a well-formed outcome.

### C2. Aborted

Trigger an abort with an unsupported or impossible task that gets past argument
parsing.

Pass: final JSON has `outcome === "aborted"`, Codex reads
`reports/result.json` when `result_path` is present, and the summary makes the
abort reason obvious.

### C3. Invalid handoff

Manually corrupt a handoff record and run the handoff brief skill.

Pass: `status: invalid`, error details are surfaced, and resume is refused.

### C4. `--tournament-n` without `--tournament`

```bash
run explore --goal 'decide between two options' --tournament-n 2 \
  --run-folder "$REPORT_ROOT/C4-tournament-n-reject" --progress jsonl
```

Pass: rejected before worker execution with `--tournament-n requires
--tournament`.

### C5. `--dry-run` rejected

```bash
run explore --goal 'dry run should not call the connector' --dry-run \
  --run-folder "$REPORT_ROOT/C5-dry-run-reject" --progress jsonl
```

Pass: rejected before worker execution with the safety explanation.

---

## Section D - Security and Safety

### D1. Single-quote escape correctness

Native: "Use the Circuit run skill to add a comment 'don't break' to add.js"

Pass: Bash does not error, the task reaches the CLI literally, and the edit
preserves the apostrophe.

### D2. Backtick and `$()` literal handling

Native: "Use the Circuit run skill - explain $(uname -a) and what shell builtins
matter here"

Pass: `$(uname -a)` is treated as literal text and not executed.

### D3. Plugin root resolution

Inspect at least one generated skill transcript (run or handoff).

Pass: the wrapper path is absolute under the installed `.codex-plugin`
directory and is not derived from the user's project cwd.

### D4. Hook input identity

Using the launcher command from B14's temp install, or a fresh temp hook
install, trigger a SessionStart handoff event or run the hook with host stdin
JSON.

Pass: the hook uses the host-provided project root, not `process.cwd()`.

### D5. Generated-surface drift check is current

CLI fallback from the repo:

```bash
npm run check-flow-drift
```

Pass: generated surfaces and plugin runtime bundles are in sync. If this is too
expensive for the run, mark skipped with reason and cite the latest available
drift check instead.

---

## Section E - Host Integration Smoke

> Skip rule: Section E requires live Codex rendering. In a non-interactive
> context, mark rows as `skipped - interactive-only`, except E4 where the
> file-only fallback may be `partial-skip`.

### E1. Status block rendering

During any native run, confirm Codex renders Circuit status text from
`presentation.status_text`, suppresses `line_mode: "suppress"`, and does not
show raw JSON.

### E2. Codex task/plan surface

When a flow emits `task_list.updated`, confirm Codex's task or plan surface
reflects it.

### E3. Native checkpoint question

When a flow emits `user_input.requested`, confirm Codex uses a native question
surface rather than plain text. Plain text fallback is a Medium finding.

### E4. Final summary verbatim

Diff the rendered final answer against `operator_summary_markdown_path`.

Non-interactive fallback: confirm the file exists, is non-empty Markdown, and
contains the headings the flow contract promises. Mark `partial-skip`.

### E5. Defaults from interface block

Check the Codex manifest's `interface` block for any `defaultPrompt` entries and
try each verbatim, confirming Codex selects a sensible flow through Run.

### E6. Rich summary HTML handling

For Explore tournament or any run with `operator_summary_html_path`, verify the
path is absolute, ends in `.html`, and is surfaced safely. GUI-open failures
are not findings when the path remains visible and the environment blocks GUI
open.
