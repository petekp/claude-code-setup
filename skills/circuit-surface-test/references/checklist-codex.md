# Codex Surface Checklist

Every item below is a discrete test. Run them in order. For each item, record:

- **Pass / pass-with-finding / fail / skipped / partial-skip** with a one-line
  rationale.
- **Run folder** path, or a transcript snippet when there is no run folder.
- **Notes** for progress rendering, missing summaries, warning doctor checks,
  or native Codex UI limits.

Native invocation means using the Codex Circuit skill surface. CLI fallback
means invoking the plugin wrapper directly via Bash.

## Conventions

- `$PLUGIN_ROOT` - the absolute directory containing
  `.codex-plugin/plugin.json`. Default development location:
  `/Users/petepetrash/Code/circuit-next/plugins/circuit`.
- `$SCRATCH` - the scratch repo created in `SKILL.md`.
- `$REPORT_ROOT` - the durable report dir from `SKILL.md`. Pass
  `--run-folder "$REPORT_ROOT/<row-id>"` to every CLI invocation that accepts
  it.
- Every CLI fallback row uses `--progress jsonl`.

## Pass Criteria for Every Flow Row

A row passes when all applicable criteria hold:

1. The CLI exits 0 or Codex reports success.
2. The final JSON has `outcome === "complete"` unless the row expects
   `checkpoint_waiting`, `aborted`, or rejected arguments.
3. Codex prefers `presentation.status_text`, suppresses
   `presentation.line_mode === "suppress"`, and only falls back to legacy
   `display.text` for major, warning, error, checkpoint, or success events.
4. Codex renders `operator_summary_markdown_path` verbatim. If native
   rendering is unavailable, do the file-only check and mark `partial-skip`.
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

Do not commit.

| ID | Flow | Invocation |
|---|---|---|
| A0.1 | explore | Native: "Use Circuit explore - briefly explain the repo layout" |
| A0.2 | review | Native: "Use Circuit review - flag any safety problems in the staged evil.js" |
| A0.3 | fix | Native: "Use Circuit fix - bug.js subtracts instead of adding" |
| A0.4 | build | Native: "Use Circuit build - add an exported double(n) function to add.js" |
| A0.5 | pursue | CLI fallback: `node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run pursue --goal 'coordinate two tiny pursuits: document add.js; verify npm scripts' --run-folder "$REPORT_ROOT/A0.5-pursue" --progress jsonl` |

Pass: every row exits 0 with `complete` or is pass-with-finding eligible. A0.5
is packaged CLI coverage because Codex has no direct `pursue` skill.

**A0 cleanup**:

```bash
cd "$SCRATCH"
git reset HEAD .
rm -f evil.js
git checkout -- bug.js add.js README.md
```

---

## Section A - Flow and Axis Surface

### A1. `@explore` - default

Native: "Use Circuit explore - explain how the catalog wires flows into the
engine"

Pass: criteria above + summary names at least one source file. Working tree
stays unchanged.

### A2. `@explore` - `--rigor lite`

Native: "Use Circuit explore with lite rigor - summarize the scratch repo
structure"

Pass: run completes and lite rigor is reflected.

### A3. `@explore` - `--rigor deep`

Native: "Use Circuit explore with deep rigor - compare small vs broad
investigation"

Pass: run completes and deep rigor is reflected.

### A4. `@explore` - tournament

Native: "Use Circuit explore tournament with two options - decide whether this
fixture should use one file or two files for examples"

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run explore \
  --goal 'decide: one file or two files for examples' \
  --tournament --tournament-n 2 \
  --run-folder "$REPORT_ROOT/A4-explore-tournament" \
  --progress jsonl
```

Pass: run reaches a well-formed tournament outcome, emits tournament reports,
and includes `operator_summary_html_path` when emitted by the runtime.

### A5. `@explore` - autonomous tournament

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run explore \
  --goal 'decide: clearer README structure' \
  --tournament --tournament-n 2 --autonomous \
  --run-folder "$REPORT_ROOT/A5-explore-autonomous-tournament" \
  --progress jsonl
```

Pass: supported checkpoints auto-resolve without a Codex prompt.

### A6. `@review` - staged change

Set up:

```bash
cd "$SCRATCH"
echo "function unsafe(s) { return eval(s); }" > evil.js
git add evil.js
```

Native: "Use Circuit review - flag any safety problems in the staged evil.js"

Pass: Review surfaces the `eval()` use as a High or Critical finding. Working
tree is otherwise unchanged.

### A7. `@review` - unsupported axes reject

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'review the staged evil.js' \
  --rigor deep \
  --run-folder "$REPORT_ROOT/A7-review-deep-reject" \
  --progress jsonl
```

Repeat with `--tournament` and `--autonomous` if time allows.

Pass: rejected before worker execution with Review's allow-list.

### A8. `@review` - untracked content flag

Set up: `cd "$SCRATCH" && echo "secret = 42" > untracked.txt`

Run default and included variants:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'look at untracked.txt' \
  --run-folder "$REPORT_ROOT/A8-review-untracked-default" \
  --progress jsonl

node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run review \
  --goal 'look at untracked.txt' \
  --include-untracked-content \
  --run-folder "$REPORT_ROOT/A8-review-untracked-included" \
  --progress jsonl
```

Pass: default omits untracked contents and the flag changes behavior.

### A9. `@fix` - default

Native: "Use Circuit fix - buggyAdd in bug.js subtracts instead of adds"

Pass: criteria above + `bug.js` is corrected.

### A10. `@fix` - `--rigor lite`

Native: "Use Circuit fix lite rigor for a README typo"

Pass: run completes and lite skips only flow-declared optional review.

### A11. `@fix` - `--rigor deep`

Set up:

```bash
cd "$SCRATCH"
echo "README expects buggyAdd to add numbers." >> README.md
echo "function buggyAdd(a, b) { return a - b; }" > bug.js
```

Native: "Use Circuit fix deep rigor to make buggyAdd match the README expectation that it adds numbers"

Pass: run completes and deep rigor is reflected.

### A12. `@fix` - autonomous

Native: "Use Circuit fix autonomous for a small README wording issue"

Pass: supported checkpoints auto-resolve. Document any Codex prompt.

### A13. `@fix` - unsupported tournament rejects

CLI fallback:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run fix \
  --goal 'fix the buggyAdd implementation' \
  --tournament \
  --run-folder "$REPORT_ROOT/A13-fix-tournament-reject" \
  --progress jsonl
```

Pass: rejected before worker execution with Fix's allow-list.

### A14. `@build` - default

Native: "Use Circuit build - add a multiply function to add.js"

Pass: criteria above + the export exists.

### A15. `@build` - `--rigor lite`

Native: "Use Circuit build lite rigor to export TWO = 2 from add.js"

Pass: run completes and lite rigor is reflected.

### A16. `@build` - `--rigor deep`

Native: "Use Circuit build deep rigor to add a small module-level comment and
verify exported functions"

Pass: run completes and deep rigor is reflected. If it waits for a checkpoint,
continue under C1.

### A17. `@build` - autonomous

Native: "Use Circuit build autonomous for a tiny README wording change"

Pass: supported checkpoints auto-resolve. Document any Codex prompt.

### A18. `@build` - unsupported tournament rejects

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
Record plainly that Codex has no direct `pursue` skill.

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

### B1. `@Circuit` - Codex model picks Fix

Native only: "Use Circuit on this - buggyAdd in bug.js subtracts instead of
adds, fix it"

Pass: Codex chooses Fix and announces it before running.

### B2. `@Circuit` - Codex model picks Build

Native only: "Use Circuit to add a square function to add.js"

Pass: Codex chooses Build.

### B3. `@Circuit` - Codex model picks Review

Native only: "Use Circuit to review the current scratch diff for safety
problems"

Pass: Codex chooses Review and does not implement changes.

### B4. `@Circuit` - Codex model picks Explore

Native only: "Use Circuit to compare two implementation approaches before
editing"

Pass: Codex chooses Explore and remains read-only.

### B5. Deterministic router picks Pursue

CLI only:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" run \
  --goal 'pursue: coordinate two tiny goals in this repo' \
  --run-folder "$REPORT_ROOT/B5-run-pursue-router" \
  --progress jsonl
```

Pass: `selected_flow` or progress reports `pursue`. This covers the generated
public flow's router path, not a direct Codex skill.

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

Pass: doctor status is `ok`, bundled runtime executes, generated skills are
present, command files use the wrapper, Codex hook posture is reported, and
temp-repo smoke checks pass. Record warnings such as hook feature visibility.

### B8. `runs show --json`

After any completed run:

```bash
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" runs show \
  --run-folder '<run_folder>' \
  --json
```

Pass: output is parseable and points to the same run evidence.

### B9. `@create` - draft

Native: "Use Circuit create - a flow that runs a quick TypeScript type-check
and reports errors"

Pass: creates a draft and does not publish without confirmation.

### B10. `@create` - publish

Native: confirm publication only after Codex asks.

Pass: `--publish --yes` runs only after explicit confirmation, and the path the
summary names exists.

### B11. `@handoff` - save

After a flow run, native:

"Use Circuit handoff - context: in the middle of build flow testing"

Pass: continuity record exists at the path the summary names. Confirm
`--run-folder` was passed when there was an active run.

### B12. `@handoff` - brief/resume/done

Run native:

```text
Use Circuit handoff brief
Use Circuit handoff resume
Use Circuit handoff done
```

Pass: brief is read-only additional context, resume restores the saved handoff,
done clears it, and a later brief reports empty.

### B13. `@handoff` - hooks install/doctor/uninstall

Native or CLI fallback:

```bash
HOOKS_FILE="$REPORT_ROOT/B13-codex-hooks.json"
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" handoff hooks install --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" handoff hooks doctor --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" handoff hooks uninstall --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
node "$PLUGIN_ROOT/scripts/circuit-next.mjs" handoff hooks doctor --host codex --hooks-file "$HOOKS_FILE" --progress jsonl
```

Pass: install writes the temp hook file, doctor reports it, uninstall removes
it, and final doctor explains the expected missing state. Only touch the real
user-level hooks file when the operator explicitly asks for that coverage.

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

1. Confirm Codex does not claim `result_path` if absent.
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

Pass: final JSON has `outcome === "aborted"`, Codex reads
`reports/result.json` when `result_path` is present, and the summary makes the
abort reason obvious.

### C3. Invalid handoff

Manually corrupt a handoff record and run `Use Circuit handoff brief`.

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

Native: "Use Circuit build to add a comment 'don't break' to add.js"

Pass: Bash does not error, the task reaches the CLI literally, and the edit
preserves the apostrophe.

### D2. Backtick and `$()` literal handling

Native: "Use Circuit explore - explain $(uname -a) and what shell builtins
matter here"

Pass: `$(uname -a)` is treated as literal text and not executed.

### D3. Plugin root resolution

Inspect at least one generated skill transcript.

Pass: the wrapper path is absolute under the installed `.codex-plugin`
directory and is not derived from the user's project cwd.

### D4. Hook input identity

Using the launcher command from B13's temp install, or a fresh temp hook
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

During any native flow, confirm Codex renders Circuit status text from
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

The Codex manifest has `defaultPrompt` entries:

- `Use Circuit on this task`
- `Use Circuit to fix this bug`
- `Use Circuit to review this change`

Try each verbatim and confirm Codex selects a sensible flow.

### E6. Rich summary HTML handling

For Explore tournament or any run with `operator_summary_html_path`, verify the
path is absolute, ends in `.html`, and is surfaced safely. GUI-open failures
are not findings when the path remains visible and the environment blocks GUI
open.
