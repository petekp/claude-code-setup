# Current Circuit Surface Inventory

Use this inventory as the current baseline before running either host checklist.
Refresh it from source at the start of every serious surface test. Do not treat
this file as a product spec; it is a map to observable sources.

## Evidence Commands

Run these from `/Users/petepetrash/Code/circuit` and record the output in the
report:

```bash
git rev-parse HEAD
git status --short
node bin/circuit --help
node plugins/claude/scripts/circuit.ts version --json
node plugins/claude/scripts/circuit.ts doctor --json
node plugins/codex/scripts/circuit.ts version --json
node plugins/codex/scripts/circuit.ts doctor --json
npm run doctor:plugins:installed
find plugins/claude plugins/codex -maxdepth 4 -type f | sort
```

If any command fails, stop and report the failure before running the checklist.
The checklist depends on the generated package matching the source tree.

## Host Packages

Observed source map: `docs/generated-surfaces.md`.

- Claude package root: `plugins/claude/`.
- Codex package root: `plugins/codex/`.
- Claude manifest: `plugins/claude/.claude-plugin/plugin.json`.
- Codex manifest: `plugins/codex/.codex-plugin/plugin.json`.
- Claude generated commands: `handoff`, `run`. These are the only published
  Claude slash commands.
- Codex generated commands: `handoff`, `run`.
- Codex generated skills: `handoff`, `run`.
- Public generated flow packages: `review`, `fix`, `pursue`, `prototype`,
  `build`, `explore`. Each ships compiled-flow mirrors only, under
  `plugins/claude/skills/<flow>/*.json` and `plugins/codex/flows/<flow>/*.json`.
  None has a direct slash command or Codex skill.
- Internal generated flow packages: `goal`, `runtime-proof`. They emit only
  under `generated/flows/**` and must not appear in any host mirror.
- No flow has a direct host command or skill. Every flow is exercised through
  Run (host recommendation or the deterministic router) or an explicit CLI flow
  start (`run <flow>`). Mark that host limit plainly for each flow row.
- `create` is a CLI-only utility (`./bin/circuit create`) with no host command
  or skill surface.
- `goal` is an internal flow: no host surface, and the classifier never
  auto-selects it. It stays runnable as an explicit/internal CLI start
  (`run goal`) for reader-compat with old `goal.*@v1` run folders.
- Claude has bundled SessionStart hooks under `plugins/claude/hooks/`.
- Codex has `plugins/codex/hooks/session-start.mjs`. Use
  `bin/circuit handoff hooks install|doctor|uninstall --host codex` for
  temp-file hook coverage unless the operator explicitly asks to touch the real
  user hooks file.

## CLI Surface

Observed source: `src/cli/circuit.ts` and `node bin/circuit --help`.

Top-level commands:

- `run [flow-name] --goal "<goal>"`
- `resume --run-folder <path> --checkpoint-choice <choice>`
- `runs show --run-folder <path> --json`
- `handoff [save|resume|done|brief|hook|hooks] [options]`
- `memory [note|list|forget] [options]` (self-auditing project memory, PR #30).
  `note` files a cited `kind:"project"` fact against a run artifact (idempotent:
  re-filing an identical note upserts by `memory_id`, it does not duplicate);
  `list` shows stored facts (`--json`, `--flow`); `forget <memory-id>` removes by
  id (exit 1 on a miss). No subcommand prints
  `memory requires a subcommand: note, list, or forget` (exit 2).
- `history [rebuild|status|query|pull|memory-merge|memory-effect] [options]`
  (run-history index + earned-precision recall analytics, PR #30). Most
  read subcommands require `--json`; `pull` requires `--flow` and
  `--decision-point`.
- `create --description "<flow idea>" [--name <slug>] [--publish --yes]` (CLI-only utility)
- `version [--json]`
- plugin wrapper only: `doctor --json`
- Claude wrapper only: `present ...`

Run-axis flags:

- `--rigor <lite|standard|deep>`
- `--tournament`
- `--tournament-n <2|3|4>`; rejected unless `--tournament` is present
- `--autonomous` (auto-resolves supported checkpoints and drives Run's bounded,
  evidence-driven continuation loop; loop result written to
  `reports/autonomous-loop.json` and surfaced as `autonomous_loop`)
- `--include-untracked-content` for Review evidence only
- `--progress jsonl`
- `--run-folder <path>`
- `--fixture <path>`
- `--flow-root <path>`

Unsupported:

- `--mode`
- `--depth`
- `--dry-run`

## Flow Axis Allow-List

Observed sources: `src/flows/*/data.ts` (the `axes` block) and
`src/flows/axis-selections.ts`, generated `circuit.json` files under both host
packages, and `docs/operator-guide.md`.

| Flow | Visibility | Direct host command or skill | Generated host flow mirror | Allowed rigor | Tournament | Autonomous |
|---|---|---|---:|---|---|---|
| `review` | public | none; routed through Run | yes | `standard` | no | no |
| `fix` | public | none; routed through Run | yes | `lite`, `standard`, `deep` | no | yes |
| `build` | public | none; routed through Run | yes | `lite`, `standard`, `deep` | no | yes |
| `explore` | public | none; routed through Run | yes | `lite`, `standard`, `deep` | yes | yes |
| `prototype` | public | none; routed through Run | yes | `standard`, `deep` | yes | yes |
| `pursue` | public | none; routed through Run | yes | `standard` | no | yes |
| `goal` | internal | none; internal, never auto-selected | no host mirror | `lite`, `standard`, `deep` | no | yes |
| `runtime-proof` | internal | none; internal | no host mirror | `standard` | no | no |

Unsupported tuples must fail before worker execution and include the flow's
allow-list in the error. Test at least one unsupported tuple per host run.

## Operator Summary and Progress Surface

Observed sources: `docs/contracts/host-rendering.md`, generated command files,
and plugin wrappers.

- Progress events may carry both `presentation` and `display`.
- Host renderers should prefer `presentation.status_text`, suppress
  `presentation.line_mode === "suppress"`, and use `display.text` only as a
  fallback when `presentation` is absent and the display contract makes it
  visible.
- Final host answers must render `run_surface_markdown_path` verbatim when
  present, and fall back to `operator_summary_markdown_path` only when it is
  absent (host-rendering.md "Final Rendering"). The Claude present wrapper now
  prefers the run surface in its no-blocks/utility branches; a host that renders
  the verbose operator summary while a run surface exists is a finding.
- Final JSON may also include `operator_summary_path`,
  `operator_summary_status_text`, `run_surface_status_text`, and `resolved_axes`
  (the resolved `rigor`/`tournament`/`autonomous` selection that actually ran).
- Aborted runs carry `reason` on the final envelope (and in
  `reports/result.json` via `result_path`). The present wrapper renders the
  specific reason, and in streamed mode it does not also print a duplicate
  generic "Run aborted" line; a generic-only abort message is a finding.
- Some rich summary cases may include `operator_summary_html_path`. Validate
  that it is an absolute `.html` path before any host attempts to open it.
- Checkpoint results can include operator-summary paths even when `result_path`
  is absent.

## Runtime Bundle and Doctor Surface

Observed sources: plugin wrappers, `scripts/build-plugin-runtime.ts`,
`package.json`, `docs/release/0.1.0-alpha.6-notes.md`, wrapper
`doctor --json`, and `npm run doctor:plugins:installed`.

- Both host wrappers should resolve `runtime/circuit.js` and report
  `runtime_source: bundled` in `version --json` and doctor output.
- `npm run check-plugin-runtime` is the source-tree drift check, but a surface
  test should still run each wrapper's `doctor --json` because it checks the
  packaged runtime, generated command files, hook posture, and a temp-repo
  smoke.
- Doctor warnings are not automatically failures. Record warning names and
  decide from the checklist whether they are expected host limits or product
  regressions.
- Doctor is not a substitute for A0's real default-axis smoke matrix across
  public flows.
- Re-run each wrapper's `doctor --json` and `npm run doctor:plugins:installed`
  for current owned-file counts. The unified host command surface (run and
  handoff only) reduced the file counts from earlier alpha snapshots, so do not
  carry forward a fixed count as expected.

## Coverage Limits to State in Reports

- Cross-host execution cannot prove native rendering, native questions, native
  task surfaces, or default-prompt flow selection.
- Non-interactive runs cannot prove what the host visibly rendered; use
  `partial-skip` for file-only operator-summary checks.
- Public flows have no direct host command or skill; cover each as Run-routed
  surface (host recommendation or deterministic router) and as an explicit CLI
  flow start, not as a direct slash command or direct Codex skill.
- Local doctor and wrapper smokes do not prove real worker connector behavior
  for every flow.
