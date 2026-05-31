# Claude Code Surface Checklist

Every item below is a discrete test. Run them in order. For each item, record:

- **Pass / pass-with-finding / fail / skipped / partial-skip** with a one-line
  rationale.
- **Run folder** path, or a transcript snippet when there is no run folder.
- **Notes** for slow rendering, awkward progress, missing summaries, warning
  doctor checks, or surprising host behavior.

## Surface model (read first)

The Claude plugin publishes exactly two slash commands: `/circuit:run` and
`/circuit:handoff`. There are no per-flow slash commands. Built-in flows
(build, explore, fix, prototype, pursue, review) are reached two ways:

- **Through Run** — `/circuit:run <task>`: the host recommends a flow from the
  task and invokes it. This is the normal user path.
- **Explicit CLI flow start** — `run <flow> --goal '<task>'` through the plugin
  wrapper: the deterministic way to exercise a specific flow and axis. Use this
  for axis and reject coverage so the target flow is unambiguous.

`create` is a CLI-only utility (`create ...`), not a slash command. `goal` is an
internal flow: it has no slash command, the classifier never auto-selects it,
and it is only reachable as an explicit `run goal` start kept for reader-compat
with old `goal.*@v1` run folders. Treat any `/circuit:build`, `/circuit:goal`,
`/circuit:create`, etc. as a finding — those commands do not exist.

## Conventions

- `$PLUGIN_ROOT` - `${CLAUDE_PLUGIN_ROOT}` for native slash commands, or
  `/Users/petepetrash/Code/circuit/plugins/claude` for CLI fallback.
- `$SCRATCH` - the scratch repo created in `SKILL.md`.
- `$REPORT_ROOT` - the durable report dir from `SKILL.md`. Pass
  `--run-folder "$REPORT_ROOT/<row-id>"` to every CLI invocation that accepts
  it.
- Raw CLI fallback rows use `--progress jsonl`.
- Native `/circuit:run` and `/circuit:handoff` use the wrapper's `present` path,
  so they render status blocks instead of raw JSON.
- "CLI" rows run the wrapper directly via Bash with the shell cwd at `$SCRATCH`.

## Pass Criteria for Every Flow Row

A row passes when all applicable criteria hold:

1. The CLI exits 0 or Claude Code reports success.
2. The final JSON has `outcome === "complete"` unless the row expects
   `checkpoint_waiting`, `aborted`, or rejected arguments.
3. Native rendering prefers `presentation.status_text`, suppresses
   `presentation.line_mode === "suppress"`, and only falls back to
   `display.text` when `presentation` is absent and the display contract makes
   the event visible.
4. The final answer renders `operator_summary_markdown_path` verbatim. If
   native rendering is unavailable, do the file-only check and mark
   `partial-skip`.
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

No flow has a direct slash command, so A0 drives each public flow at its default
axis through the explicit CLI flow start (deterministic), and proves the native
host path separately in A0.0.

**A0 pre-setup**:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

Do not commit. A0 wants the planted file visible to Review's staged-diff
intake, not baked into HEAD.

| ID | Flow | Invocation |
|---|---|---|
| A0.0 | run (native) | Native: `/circuit:run briefly explain the repo layout` - host recommends and runs a flow (expect explore); confirm `selected_flow`, `routed_by`, `router_reason` |
| A0.1 | explore | CLI: `run explore --goal 'briefly explain the repo layout' --run-folder "$REPORT_ROOT/A0.1-explore" --progress jsonl` |
| A0.2 | review | CLI: `run review --goal 'flag any safety problems in the staged evil.js' --run-folder "$REPORT_ROOT/A0.2-review" --progress jsonl` |
| A0.3 | fix | CLI: `run fix --goal 'bug.js subtracts instead of adding' --run-folder "$REPORT_ROOT/A0.3-fix" --progress jsonl` |
| A0.4 | build | CLI: `run build --goal 'add an exported double(n) function to add.js' --run-folder "$REPORT_ROOT/A0.4-build" --progress jsonl` |
| A0.5 | prototype | CLI: `run prototype --goal 'sketch a disposable README note for the fixture' --run-folder "$REPORT_ROOT/A0.5-prototype" --progress jsonl` |
| A0.6 | pursue | CLI: `run pursue --goal 'coordinate two tiny pursuits: document add.js; verify npm scripts' --run-folder "$REPORT_ROOT/A0.6-pursue" --progress jsonl` |

Pass: every row exits 0 with `complete` or is pass-with-finding eligible. All A0
flow rows are CLI flow starts because Claude has no direct per-flow command; A0.0
proves the native `/circuit:run` host-recommendation path.

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

Pass: criteria above + the summary names at least one source file considered.
Explore is read-only; the working tree stays unchanged.

### A2. explore - `--rigor lite`

CLI: `run explore --rigor lite --goal 'summarize the scratch repo structure'`

Pass: run completes and the trace or summary reflects lite rigor.

### A3. explore - `--rigor deep`

CLI: `run explore --rigor deep --goal 'compare the tradeoffs of small vs broad investigation'`

Pass: run completes and the trace or summary reflects deep rigor.

### A4. explore - tournament

CLI: `run explore --tournament --tournament-n 2 --goal 'decide: should this fixture use one file or two files for examples'`

Pass: run reaches a well-formed tournament outcome, emits tournament reports,
and includes `operator_summary_html_path` when the runtime emits the rich
summary. If it waits for a decision checkpoint, continue under C1.

### A5. explore - autonomous tournament

CLI: `run explore --tournament --tournament-n 2 --autonomous --goal 'decide: choose the clearer README structure'`

Pass: autonomous handling resolves supported checkpoints without asking the
operator, and the run surfaces an `autonomous_loop` field (see A-Loop). Record
any prompt as a finding unless the flow reports an unsupported tuple before
worker execution.

### A6. review - staged change

Set up:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

CLI: `run review --goal 'the new evil.js - flag any safety problems'`

Pass: Review surfaces the `eval()` use as a High or Critical finding. Working
tree is otherwise unchanged.

### A7. review - unsupported axes reject

```bash
run review --goal 'review the staged evil.js' --rigor deep \
  --run-folder "$REPORT_ROOT/A7-review-deep-reject" --progress jsonl
```

Repeat with `--tournament` and `--autonomous` if time allows.

Pass: rejected before worker execution with an allow-list saying Review allows
only standard rigor and no tournament/autonomous.

### A8. review - untracked content flag

Set up: `cd "$SCRATCH" && echo "secret = 42" > untracked.txt`

Default:

```bash
run review --goal 'look at untracked.txt' \
  --run-folder "$REPORT_ROOT/A8-review-untracked-default" --progress jsonl
```

Included:

```bash
run review --goal 'look at untracked.txt' --include-untracked-content \
  --run-folder "$REPORT_ROOT/A8-review-untracked-included" --progress jsonl
```

Pass: default omits untracked file contents and the flag changes behavior.

### A9. fix - default

CLI: `run fix --goal 'the buggyAdd in bug.js subtracts instead of adding'`

Pass: criteria above + `bug.js` is corrected.

### A10. fix - `--rigor lite`

Plant a README typo, then:

CLI: `run fix --rigor lite --goal 'typo in README - change "fixture" to "fixtures"'`

Pass: run completes and the lite path skips only flow-declared optional review.

### A11. fix - `--rigor deep`

Set up:

```bash
cd "$SCRATCH"
echo "README expects buggyAdd to add numbers." >> README.md
echo "function buggyAdd(a, b) { return a - b; }" > bug.js
```

CLI: `run fix --rigor deep --goal 'make buggyAdd match the README expectation that it adds numbers'`

Pass: run completes and deep rigor is reflected in the trace or summary.

### A12. fix - unsupported tournament rejects

```bash
run fix --goal 'fix the buggyAdd implementation' --tournament \
  --run-folder "$REPORT_ROOT/A12-fix-tournament-reject" --progress jsonl
```

Pass: rejected before worker execution with Fix's allow-list.

### A13. build - default

CLI: `run build --goal 'add a multiply function to add.js exporting it as multiply(a,b)'`

Pass: criteria above + the export exists.

### A14. build - `--rigor lite`

CLI: `run build --rigor lite --goal 'export a constant TWO = 2 from add.js'`

Pass: run completes and lite rigor is reflected.

### A15. build - `--rigor deep`

CLI: `run build --rigor deep --goal 'add a small module-level comment and verify the exported functions'`

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

CLI: `run prototype --tournament --tournament-n 2 --goal 'compare two disposable README note variants'`

Pass: run reaches a well-formed variant comparison, emits variant reports, and
includes `operator_summary_html_path` when the runtime emits the rich summary.

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

`--autonomous` does two things now: it auto-resolves supported checkpoints AND
drives Run's bounded, evidence-driven continuation loop. Verify the loop surface.

### AL1. Loop fires and persists its result

```bash
run build --autonomous \
  --goal 'add an exported triple(n) function to add.js and verify it' \
  --run-folder "$REPORT_ROOT/AL1-build-autonomous" --progress jsonl
```

Pass: the final JSON includes an `autonomous_loop` object with `outcome`,
`attempts`, and `stop_reason`, and `reports/autonomous-loop.json` exists in the
run folder. The loop never reports `complete` purely by exhausting attempts.

### AL2. Default path has no loop

```bash
run build \
  --goal 'add an exported triple(n) function to add.js and verify it' \
  --run-folder "$REPORT_ROOT/AL2-build-default" --progress jsonl
```

Pass: the final JSON has no `autonomous_loop` field and no
`reports/autonomous-loop.json` is written. The default path is single-shot.

### AL3. Loop failure degrades gracefully

If a recovery route cannot run (for example a missing recovery flow fixture),
confirm the run still returns the normal single-shot result with a recorded
`autonomous-loop` warning rather than crashing.

Pass: the run completes with the single-shot result and surfaces the warning.

---

## Section G - Internal Goal Flow

Goal was collapsed into an internal flow. Verify it is not a public surface and
that its reader-compat path still works.

### G1. No goal slash command

Confirm `/circuit:goal` is not a recognized command and
`plugins/claude/commands/goal.md` does not exist.

Pass: there is no goal slash command. A goal command would be a finding.

### G2. Classifier never auto-selects goal

```bash
run --goal 'finish this scoped objective: verify npm scripts and summarize the fixture' \
  --run-folder "$REPORT_ROOT/G2-router-not-goal" --progress jsonl
```

Pass: `selected_flow` is a public flow (never `goal`). Repeat with a couple of
goal-flavored phrasings; none route to `goal`.

### G3. Goal is not shipped to the host; explicit start lives only in the repo CLI

Through the installed host plugin, `goal` is not available: as an internal flow
its compiled JSON is not mirrored into the host package (no
`plugins/claude/skills/goal/`). Confirm the host wrapper cannot run it:

```bash
node "$PLUGIN_ROOT/scripts/circuit.ts" run goal --goal 'finish a tiny objective' \
  --run-folder "$REPORT_ROOT/G3-goal-host" --progress jsonl
```

Pass: this fails (exit 2) with `goal is an internal flow and is not available
through the host run surface`, confirming goal ships no host surface. The
explicit internal start and old `goal.*@v1` run-folder reader-compat live only
in the repo CLI (`./bin/circuit run goal`, which resolves
`generated/flows/goal/circuit.json`), not the host plugin. A host that actually
ran goal would be a finding. (Earlier alphas leaked the generic
`flow fixture not found` message here; the internal-flow message is the fixed
behavior as of the memory/history release.)

---

## Section M - Memory and History Surface

The self-auditing memory + history surface (PR #30). These are CLI-only
commands (no host slash command or skill); exercise them through
`./bin/circuit` against an isolated `--memory-dir`/`--runs-base` so the test
never writes the repo's real `.circuit/`. Memory is hint-only and cited: every
fact points at a real run artifact and is re-checked for staleness at injection.

### M1. memory note cites a real run artifact

Run any flow first (or pass `--run-folder <run>`), then:

```bash
memory note --flow explore --applies-to repo_convention \
  --run-folder "$REPORT_ROOT/A1-explore-default" \
  --memory-dir "$MEM_DIR" --json 'This repo verifies with npm run verify.'
```

Pass: exit 0; JSON `recorded: true` with a `memory_id`, `flow_id`, `project_id`,
and a `source_ref` naming the cited run artifact (run-envelope, result, or
trace). A note with no citable artifact, no run folder, empty text, an invalid
`--flow`, or an invalid `--applies-to` exits 2 with a clear error.

### M2. memory note is idempotent (no duplicate on re-file)

Re-run the exact M1 command, then `memory list --memory-dir "$MEM_DIR" --json`.

Pass: the second note returns the SAME `memory_id`, and `list` shows that id
exactly once with `count` unchanged. A re-filed identical note that inflates the
count or lists the id twice is a finding (regression of F-H-1); it would also
double-inject in run-start recall.

### M3. memory list and forget

```bash
memory list --memory-dir "$MEM_DIR" --json        # and: --flow explore
memory forget <memory-id> --memory-dir "$MEM_DIR" --json
```

Pass: `list` returns the stored facts (filterable by `--flow`); `forget` of a
present id removes every copy and exits 0; `forget` of an absent id reports a
no-op and exits 1.

### M4. memory with no subcommand

```bash
memory
```

Pass: exits 2 with `memory requires a subcommand: note, list, or forget`. The
raw commander token `(outputHelp)` leaking to stderr is a finding (regression of
F-L-1).

### H1. history rebuild / status / query

```bash
history rebuild --runs-base "$RUNS_BASE" --json
history status --runs-base "$RUNS_BASE" --json
history query --runs-base "$RUNS_BASE" --json --format memory-input --flow fix 'verify'
```

Pass: `rebuild` reports a run/document count and is idempotent (a second rebuild
returns the same counts); `status` reports freshness; `query` returns ranked
hits and, with `--format memory-input`, a projection carrying the
`authority_notice`. Read subcommands without `--json` fail with
`invalid_invocation`; `pull` without `--flow`/`--decision-point` fails the same
way.

### H2. history pull, memory-merge, memory-effect

Pass: `pull` writes a preview + `reports/history/pull-log.json` and fails open
(`effect_report_unavailable`) when no effect data exists; `memory-merge`
produces a report-only artifact and persists `memory-merge.v1.json` only under
`--write`; `memory-effect` produces an A/B earned-precision report and rejects
an out-of-range `--margin`.

### R1. earned-precision recall injects memory at run start

In a repo with prior runs plus a filed project note, start a fresh run and read
the run envelope.

Pass: `history_recall {status: "used", memory_input_count: N>0}` and
`memory_context {used: true, memory_input_ids: [...], hint_only}` with the prior
runs AND the operator note among the injected ids (each id appears once). An
empty-history repo fails open with
`history_recall {status: "unavailable", ...runs_base_not_found}`. The same
`memory_id` appearing twice in `memory_input_ids` is a finding (F-H-1 inject
path).

---

## Section B - Run and Utility Surface

### B1. `/circuit:run` - host picks Fix

Native: `/circuit:run my buggyAdd in bug.js subtracts instead of adds, fix it`

Pass: Claude announces Fix and runs the Fix flow; `selected_flow` is `fix`.

### B2. `/circuit:run` - host picks Build

Native: `/circuit:run add a square function to add.js`

Pass: Claude announces Build; `selected_flow` is `build`.

### B3. `/circuit:run` - host picks Review

Native: `/circuit:run review the current scratch diff for safety problems`

Pass: Claude announces Review and does not implement changes.

### B4. `/circuit:run` - host picks Explore

Native: `/circuit:run compare two implementation approaches before editing`

Pass: Claude announces Explore and remains read-only.

### B5. `/circuit:run` - host picks Prototype

Native: `/circuit:run sketch a disposable mockup before implementation`

Pass: Claude announces Prototype before running the Prototype flow.

### B6. Deterministic router picks Pursue

```bash
run --goal 'pursue: coordinate two tiny goals in this repo' \
  --run-folder "$REPORT_ROOT/B6-run-pursue-router" --progress jsonl
```

Pass: `selected_flow` or progress reports `pursue`. This covers the public
flow's router path; it is not a direct slash-command proof.

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

Pass: doctor status is `ok`, bundled runtime executes, the published command
files (run, handoff) use the wrapper, and temp-repo smoke checks pass. Record
warnings.

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
there is no `/circuit:create` slash command (CLI-only utility).

### B11. `create` - publish

Run `create ... --publish --yes` only when you intend to publish.

Pass: `--publish --yes` runs the publish step and the path the summary names
exists.

### B12. `/circuit:handoff` - save

After a flow run, native:

`/circuit:handoff context: in the middle of build flow testing`

Pass: continuity record exists at the path the summary names. Confirm
`--run-folder` was passed when there was an active run.

### B13. `/circuit:handoff` - brief/resume/done

Run native:

```text
/circuit:handoff brief
/circuit:handoff resume
/circuit:handoff done
```

Pass: brief is read-only context, resume restores the saved handoff, done clears
it, and a later brief reports empty.

### B14. `/circuit:handoff hooks doctor --host codex`

Native: `/circuit:handoff hooks doctor --host codex`

Pass: surfaces `status`, `hooks_path`, and `command`. Warnings about Codex V1
user-level hooks are expected only when the doctor says they are warnings.

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

1. Confirm the host does not claim `result_path` if absent.
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

Pass: final JSON has `outcome === "aborted"`, the host reads
`reports/result.json` when `result_path` is present, and the summary makes the
abort reason obvious.

### C3. Invalid handoff

Manually corrupt a handoff record and run `/circuit:handoff brief`.

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

Native: `/circuit:run add a comment "don't break" to add.js - keep the apostrophe`

Pass: Bash does not error, the task reaches the CLI literally, and the edit
preserves the apostrophe.

### D2. Backtick and `$()` literal handling

Native: `/circuit:run explain $(uname -a) - what shell builtins matter here`

Pass: `$(uname -a)` is treated as literal text and not executed.

### D3. Claude plugin root integrity

Inspect at least one generated command transcript (run or handoff).

Pass: command uses `${CLAUDE_PLUGIN_ROOT}/scripts/circuit.ts`, quoted, and
does not resolve the plugin root from the project cwd.

### D4. Generated-surface drift check is current

CLI fallback from the repo:

```bash
npm run check-flow-drift
```

Pass: generated surfaces and plugin runtime bundles are in sync. If this is too
expensive for the run, mark skipped with reason and cite the latest available
drift check instead.

---

## Section E - Host Integration Smoke

> Skip rule: Section E requires live Claude Code rendering. In a non-interactive
> context, mark rows as `skipped - interactive-only`, except E4 where the
> file-only fallback may be `partial-skip`.

### E1. Status block rendering

During any native `/circuit:run`, confirm Claude renders one Circuit block per
`presentation.block_id`, displays `⎿ <status>`, suppresses
`line_mode: "suppress"`, and does not show raw JSON.

### E2. TodoWrite integration

During any flow that emits `task_list.updated`, confirm Claude Code's task
surface updates.

### E3. Native checkpoint question

When a flow emits `user_input.requested`, confirm Claude uses a native question
surface rather than plain text. Plain text fallback is a Medium finding.

### E4. Final summary verbatim

Diff the rendered final answer against `operator_summary_markdown_path`.

Non-interactive fallback: confirm the file exists, is non-empty Markdown, and
contains the headings the flow contract promises. Mark `partial-skip`.

### E5. Rich summary HTML handling

For Explore tournament or any run with `operator_summary_html_path`, verify the
path is absolute, ends in `.html`, and is surfaced safely. Claude wrapper
auto-open failures are not findings when the path remains visible and the
environment blocks GUI open.
