# Claude Code Surface Checklist

Every item below is a discrete test. Run them in order. For each item, record:

- **Pass / pass-with-finding / fail / skipped / partial-skip** with a one-line
  rationale.
- **Run folder** path, or a transcript snippet when there is no run folder.
- **Notes** for slow rendering, awkward progress, missing summaries, warning
  doctor checks, or surprising host behavior.

Native invocation means typing the slash command in a Claude Code conversation.
CLI fallback means invoking the plugin wrapper directly via Bash.

## Conventions

- `$PLUGIN_ROOT` - `${CLAUDE_PLUGIN_ROOT}` for native slash commands, or
  `/Users/petepetrash/Code/circuit-next/plugins/claude` for CLI fallback.
- `$SCRATCH` - the scratch repo created in `SKILL.md`.
- `$REPORT_ROOT` - the durable report dir from `SKILL.md`. Pass
  `--run-folder "$REPORT_ROOT/<row-id>"` to every CLI invocation that accepts
  it.
- Raw CLI fallback rows use `--progress jsonl`.
- Native slash commands use `present`, so they render status blocks instead of
  raw JSON.

## Pass Criteria for Every Flow Row

A row passes when all applicable criteria hold:

1. The CLI exits 0 or Claude Code reports success.
2. The final JSON has `outcome === "complete"` unless the row expects
   `checkpoint_waiting`, `aborted`, or rejected arguments.
3. Native rendering prefers `presentation.status_text`, suppresses
   `presentation.line_mode === "suppress"`, and only falls back to legacy
   `display.text` for major, warning, error, checkpoint, or success events.
4. The final answer renders `operator_summary_markdown_path` verbatim. If
   native rendering is unavailable, do the file-only check and mark
   `partial-skip`.
5. The final JSON envelope surfaces `flow_id`, `outcome`, `run_folder`,
   `trace_entries_observed`, `operator_summary_path`, and
   `operator_summary_markdown_path`. Verify `operator_summary_status_text` and
   `operator_summary_html_path` when present.
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
| A0.1 | explore | Native: `/circuit:explore briefly explain the repo layout` |
| A0.2 | review | Native: `/circuit:review flag any safety problems in the staged evil.js` |
| A0.3 | fix | Native: `/circuit:fix bug.js subtracts instead of adding` |
| A0.4 | build | Native: `/circuit:build add an exported double(n) function to add.js` |
| A0.5 | pursue | CLI fallback: `node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run pursue --goal 'coordinate two tiny pursuits: document add.js; verify npm scripts' --run-folder "$REPORT_ROOT/A0.5-pursue" --progress jsonl` |

Pass: every row exits 0 with `complete` or is pass-with-finding eligible. A0.5
is packaged CLI coverage because Claude has no direct `/circuit:pursue`
command.

**A0 cleanup**:

```bash
cd "$SCRATCH"
git reset HEAD .
rm -f evil.js
git checkout -- bug.js add.js README.md
```

---

## Section A - Flow and Axis Surface

### A1. `/circuit:explore` - default

Native: `/circuit:explore explain how the catalog wires flows into the engine`

Pass: criteria above + the summary names at least one source file considered.
Explore is read-only; the working tree stays unchanged.

### A2. `/circuit:explore` - `--rigor lite`

Native: `/circuit:explore --rigor lite summarize the scratch repo structure`

Pass: run completes and the trace or summary reflects lite rigor.

### A3. `/circuit:explore` - `--rigor deep`

Native: `/circuit:explore --rigor deep compare the tradeoffs of small vs broad investigation`

Pass: run completes and the trace or summary reflects deep rigor.

### A4. `/circuit:explore` - tournament

Native: `/circuit:explore --tournament --tournament-n 2 decide: should this fixture use one file or two files for examples`

Pass: run reaches a well-formed tournament outcome, emits tournament reports,
and includes `operator_summary_html_path` when the runtime emits the rich
summary. If it waits for a decision checkpoint, continue under C1.

### A5. `/circuit:explore` - autonomous tournament

Native: `/circuit:explore --tournament --tournament-n 2 --autonomous decide: choose the clearer README structure`

Pass: autonomous handling resolves supported checkpoints without asking the
operator. Record any prompt as a finding unless the flow reports an unsupported
tuple before worker execution.

### A6. `/circuit:review` - staged change

Set up:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

Native: `/circuit:review the new evil.js - flag any safety problems`

Pass: Review surfaces the `eval()` use as a High or Critical finding. Working
tree is otherwise unchanged.

### A7. `/circuit:review` - unsupported axes reject

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'review the staged evil.js' \
  --rigor deep \
  --run-folder "$REPORT_ROOT/A7-review-deep-reject" \
  --progress jsonl
```

Repeat with `--tournament` and `--autonomous` if time allows.

Pass: rejected before worker execution with an allow-list saying Review allows
only standard rigor and no tournament/autonomous.

### A8. `/circuit:review` - untracked content flag

Set up: `cd "$SCRATCH" && echo "secret = 42" > untracked.txt`

Default:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'look at untracked.txt' \
  --run-folder "$REPORT_ROOT/A8-review-untracked-default" \
  --progress jsonl
```

Included:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'look at untracked.txt' \
  --include-untracked-content \
  --run-folder "$REPORT_ROOT/A8-review-untracked-included" \
  --progress jsonl
```

Pass: default omits untracked file contents and the flag changes behavior.

### A9. `/circuit:fix` - default

Native: `/circuit:fix the buggyAdd in bug.js subtracts instead of adding`

Pass: criteria above + `bug.js` is corrected.

### A10. `/circuit:fix` - `--rigor lite`

Plant a README typo, then run:

`/circuit:fix --rigor lite typo in README - change "fixture" to "fixtures"`

Pass: run completes and the lite path skips only flow-declared optional review.

### A11. `/circuit:fix` - `--rigor deep`

Set up:

```bash
cd "$SCRATCH"
echo "README expects buggyAdd to add numbers." >> README.md
echo "function buggyAdd(a, b) { return a - b; }" > bug.js
```

Native: `/circuit:fix --rigor deep make buggyAdd match the README expectation that it adds numbers`

Pass: run completes and deep rigor is reflected in the trace or summary.

### A12. `/circuit:fix` - autonomous

Native: `/circuit:fix --autonomous fix a small README wording issue`

Pass: supported checkpoints auto-resolve. Document any host prompt.

### A13. `/circuit:fix` - unsupported tournament rejects

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run fix \
  --goal 'fix the buggyAdd implementation' \
  --tournament \
  --run-folder "$REPORT_ROOT/A13-fix-tournament-reject" \
  --progress jsonl
```

Pass: rejected before worker execution with Fix's allow-list.

### A14. `/circuit:build` - default

Native: `/circuit:build add a multiply function to add.js exporting it as multiply(a,b)`

Pass: criteria above + the export exists.

### A15. `/circuit:build` - `--rigor lite`

Native: `/circuit:build --rigor lite export a constant TWO = 2 from add.js`

Pass: run completes and lite rigor is reflected.

### A16. `/circuit:build` - `--rigor deep`

Native: `/circuit:build --rigor deep add a small module-level comment and verify the exported functions`

Pass: run completes and deep rigor is reflected. If it waits for a checkpoint,
continue under C1.

### A17. `/circuit:build` - autonomous

Native: `/circuit:build --autonomous make a tiny README wording change`

Pass: supported checkpoints auto-resolve. Document any host prompt.

### A18. `/circuit:build` - unsupported tournament rejects

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run build \
  --goal 'add a subtract helper' \
  --tournament \
  --run-folder "$REPORT_ROOT/A18-build-tournament-reject" \
  --progress jsonl
```

Pass: rejected before worker execution with Build's allow-list.

### A19. `pursue` - packaged CLI default

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run pursue \
  --goal 'coordinate two pursuits: inspect add.js; update README wording' \
  --run-folder "$REPORT_ROOT/A19-pursue-default" \
  --progress jsonl
```

Pass: packaged `pursue` flow runs or reaches a well-formed checkpoint/outcome.
Record plainly that Claude has no direct `/circuit:pursue` command.

### A20. `pursue` - autonomous

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run pursue \
  --goal 'coordinate two tiny pursuits in the scratch repo' \
  --autonomous \
  --run-folder "$REPORT_ROOT/A20-pursue-autonomous" \
  --progress jsonl
```

Pass: supported checkpoints auto-resolve or the run fails closed with a clear
unsupported-policy reason.

### A21. `pursue` - unsupported rigor/tournament rejects

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run pursue \
  --goal 'coordinate two tiny pursuits' \
  --rigor deep \
  --run-folder "$REPORT_ROOT/A21-pursue-deep-reject" \
  --progress jsonl
```

Repeat with `--tournament` if time allows.

Pass: rejected before worker execution with Pursue's allow-list.

---

## Section B - Utility Surface

### B1. `/circuit:run` - host model picks Fix

Native only: `/circuit:run my buggyAdd in bug.js subtracts instead of adds, fix it`

Pass: Claude announces Fix and invokes the explicit Fix flow.

### B2. `/circuit:run` - host model picks Build

Native only: `/circuit:run add a square function to add.js`

Pass: Claude announces Build and invokes the explicit Build flow.

### B3. `/circuit:run` - host model picks Review

Native only: `/circuit:run review the current scratch diff for safety problems`

Pass: Claude announces Review and does not implement changes.

### B4. `/circuit:run` - host model picks Explore

Native only: `/circuit:run compare two implementation approaches before editing`

Pass: Claude announces Explore and remains read-only.

### B5. Deterministic router picks Pursue

CLI only:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run \
  --goal 'pursue: coordinate two tiny goals in this repo' \
  --run-folder "$REPORT_ROOT/B5-run-pursue-router" \
  --progress jsonl
```

Pass: `selected_flow` or progress reports `pursue`. This covers the generated
public flow's router path; it is not a direct slash-command proof.

### B6. `version --json`

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" version --json
```

Pass: JSON includes `version`, `runtime_source: "bundled"`, `runtime_path`, and
`plugin_root`.

### B7. `doctor --json`

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" doctor --json
```

Pass: doctor status is `ok`, bundled runtime executes, command files use the
wrapper, and temp-repo smoke checks pass. Record warnings.

### B8. `runs show --json`

After any completed run:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" runs show \
  --run-folder '<run_folder>' \
  --json
```

Pass: output is parseable and points to the same run evidence.

### B9. `/circuit:create` - draft

Native: `/circuit:create a flow that runs a quick TypeScript type-check and reports errors`

Pass: creates a draft and does not publish without confirmation.

### B10. `/circuit:create` - publish

Native: confirm publication only after the host asks.

Pass: `--publish --yes` runs only after explicit confirmation, and the path the
summary names exists.

### B11. `/circuit:handoff` - save

After a flow run, native:

`/circuit:handoff context: in the middle of build flow testing`

Pass: continuity record exists at the path the summary names. Confirm
`--run-folder` was passed when there was an active run.

### B12. `/circuit:handoff` - brief/resume/done

Run native:

```text
/circuit:handoff brief
/circuit:handoff resume
/circuit:handoff done
```

Pass: brief is read-only context, resume restores the saved handoff, done clears
it, and a later brief reports empty.

### B13. `/circuit:handoff hooks doctor --host codex`

Native: `/circuit:handoff hooks doctor --host codex`

Pass: surfaces `status`, `hooks_path`, and `command`. Warnings about Codex V1
user-level hooks are expected only when the doctor says they are warnings.

### B14. Handoff wrapper accepts utility subcommand args

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" handoff save \
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
   node "$PLUGIN_ROOT/scripts/circuit-next.mjs" resume \
     --run-folder '<run_folder>' \
     --checkpoint-choice '<choice>' \
     --progress jsonl
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

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run explore \
  --goal 'decide between two options' \
  --tournament-n 2 \
  --run-folder "$REPORT_ROOT/C4-tournament-n-reject" \
  --progress jsonl
```

Pass: rejected before worker execution with `--tournament-n requires
--tournament`.

### C5. `--dry-run` rejected

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run explore \
  --goal 'dry run should not call the connector' \
  --dry-run \
  --run-folder "$REPORT_ROOT/C5-dry-run-reject" \
  --progress jsonl
```

Pass: rejected before worker execution with the safety explanation.

---

## Section D - Security and Safety

### D1. Single-quote escape correctness

Native: `/circuit:build add a comment "don't break" to add.js - keep the apostrophe`

Pass: Bash does not error, the task reaches the CLI literally, and the edit
preserves the apostrophe.

### D2. Backtick and `$()` literal handling

Native: `/circuit:explore explain $(uname -a) - what shell builtins matter here`

Pass: `$(uname -a)` is treated as literal text and not executed.

### D3. Claude plugin root integrity

Inspect at least one generated command transcript.

Pass: command uses `${CLAUDE_PLUGIN_ROOT}/scripts/circuit-next.mjs`, quoted, and
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

During any native flow, confirm Claude renders one Circuit block per
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
