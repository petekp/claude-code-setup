# Current Circuit Surface Inventory

Use this inventory as the current baseline before running either host checklist.
Refresh it from source at the start of every serious surface test. Do not treat
this file as a product spec; it is a map to observable sources.

## Evidence Commands

Run these from `/Users/petepetrash/Code/circuit-next` and record the output in
the report:

```bash
git rev-parse HEAD
git status --short
node bin/circuit-next --help
node plugins/claude/scripts/circuit-next.mjs version --json
node plugins/claude/scripts/circuit-next.mjs doctor --json
node plugins/circuit/scripts/circuit-next.mjs version --json
node plugins/circuit/scripts/circuit-next.mjs doctor --json
find plugins/claude plugins/circuit -maxdepth 4 -type f | sort
```

If any command fails, stop and report the failure before running the checklist.
The checklist depends on the generated package matching the source tree.

## Host Packages

Observed source map: `docs/generated-surfaces.md`.

- Claude package root: `plugins/claude/`.
- Codex package root: `plugins/circuit/`.
- Claude manifest: `plugins/claude/.claude-plugin/plugin.json`.
- Codex manifest: `plugins/circuit/.codex-plugin/plugin.json`.
- Claude generated commands: `build`, `create`, `explore`, `fix`, `handoff`,
  `review`, `run`.
- Codex generated skills: `build`, `create`, `explore`, `fix`, `handoff`,
  `review`, `run`.
- Public generated flow packages: `review`, `fix`, `pursue`, `build`,
  `explore`.
- Internal generated flow package: `runtime-proof`; it must not appear in host
  mirrors.
- `pursue` has generated host flow JSON but no direct Claude command or Codex
  skill. Exercise it through the explicit CLI or deterministic router and mark
  the direct-host limit plainly.
- Claude has bundled SessionStart hooks under `plugins/claude/hooks/`.
- Codex has `plugins/circuit/hooks/session-start.mjs`, but Codex V1 does not
  register bundled hooks. Use `circuit-next handoff hooks install|doctor|uninstall
  --host codex` for user-level hook coverage.

The Claude manifest description may mention older command names that are not in
the generated command directory. Generated command files and
`docs/generated-surfaces.md` are the authority for checklist rows.

## CLI Surface

Observed source: `src/cli/circuit.ts` and `node bin/circuit-next --help`.

Top-level commands:

- `run [flow-name] --goal "<goal>"`
- `resume --run-folder <path> --checkpoint-choice <choice>`
- `runs show --run-folder <path> --json`
- `handoff [save|resume|done] [options]`
- `create --description "<flow idea>" [--name <slug>] [--publish --yes]`
- `version [--json]`
- plugin wrapper only: `doctor --json`
- Claude wrapper only: `present ...`

Run-axis flags:

- `--rigor <lite|standard|deep>`
- `--tournament`
- `--tournament-n <2|3|4>`; rejected unless `--tournament` is present
- `--autonomous`
- `--include-untracked-content` for Review evidence only
- `--progress jsonl`
- `--run-folder <path>`
- `--fixture <path>`
- `--flow-root <path>`

Removed or unsupported:

- `--mode` is stale.
- `--depth` is stale.
- `--dry-run` is intentionally rejected until real dry-run support exists.

## Flow Axis Allow-List

Observed sources: generated `circuit.json` files under both host packages and
`docs/specs/3-axis-rigor-tournament-autonomous-v1.md`.

| Flow | Direct host command or skill | Generated host flow JSON | Allowed rigor | Tournament | Autonomous |
|---|---|---:|---|---|---|
| `review` | yes | yes | `standard` | no | no |
| `fix` | yes | yes | `lite`, `standard`, `deep` | no | yes |
| `build` | yes | yes | `lite`, `standard`, `deep` | no | yes |
| `explore` | yes | yes | `lite`, `standard`, `deep` | yes | yes |
| `pursue` | no direct host command or skill | yes | `standard` | no | yes |
| `runtime-proof` | no, internal | no host mirror | `standard` | no | no |

Unsupported tuples must fail before worker execution and include the flow's
allow-list in the error. Test at least one unsupported tuple per host run.

## Operator Summary and Progress Surface

Observed sources: `docs/contracts/host-rendering.md`, generated command files,
and plugin wrappers.

- Progress events may carry both legacy `display` and current `presentation`.
- Host renderers should prefer `presentation.status_text`, suppress
  `presentation.line_mode === "suppress"`, and use legacy `display.text` only
  as fallback.
- Final host answers must render `operator_summary_markdown_path` verbatim when
  present.
- Final JSON may also include `operator_summary_path`,
  `operator_summary_status_text`, and `operator_summary_html_path`.
- `operator_summary_html_path` is expected for rich summary cases such as
  Explore tournament and some checkpoint summaries. Validate that it is an
  absolute `.html` path before any host attempts to open it.
- Checkpoint results can include operator-summary paths even when `result_path`
  is absent.

## Runtime Bundle and Doctor Surface

Observed sources: plugin wrappers, `scripts/build-plugin-runtime.ts`,
`package.json`, and wrapper `doctor --json`.

- Both host wrappers should resolve `runtime/circuit-next.js` and report
  `runtime_source: bundled` in `version --json` and doctor output.
- `npm run check-plugin-runtime` is the source-tree drift check, but a surface
  test should still run each wrapper's `doctor --json` because it checks the
  packaged runtime, generated command files, hook posture, and a temp-repo smoke.
- Doctor warnings are not automatically failures. Record warning names and
  decide from the checklist whether they are expected host limits or product
  regressions.
- Doctor currently proves a narrow temp-repo Review smoke. It is not a
  substitute for A0's real default-axis smoke matrix across public flows.
- Current doctor output checks packaged `build`, `explore`, `fix`, and `review`
  flow files. Still verify `pursue` from the file inventory because it is public
  packaged CLI surface without a direct host command/skill.

## Coverage Limits to State in Reports

- Cross-host execution cannot prove native rendering, native questions, native
  task surfaces, or default-prompt flow selection.
- Non-interactive runs cannot prove what the host visibly rendered; use
  `partial-skip` for file-only operator-summary checks.
- Public generated flow JSON without a direct host command, currently `pursue`,
  must be covered as packaged CLI surface and as deterministic router surface,
  not as a direct slash command or direct Codex skill.
- Local doctor and wrapper smokes do not prove real worker connector behavior
  for every flow.
