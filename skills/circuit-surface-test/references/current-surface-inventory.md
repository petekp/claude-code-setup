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
  Run or an explicit CLI flow start (`run <flow>`). Run is **model-only routed**:
  the host model recommends and NAMES the flow, then passes it explicitly to the
  CLI. There is no deterministic/keyword classifier — `src/flows/router.ts` is
  deleted. A CLI `run --goal` with NO flow positional ERRORS with `a flow name is
  required: pass one of build|fix|review|explore|prototype|pursue as the first
  argument` (exit 2). Mark that host limit plainly for each flow row.
- `create` is a CLI-only utility (`./bin/circuit create`) with no host command
  or skill surface.
- `goal` is an internal flow: no host surface, and it is never auto-selected
  because NO classifier exists (not because a classifier avoids it). It stays
  runnable as an explicit/internal CLI start (`run goal`) for reader-compat with
  old `goal.*@v1` run folders. Through either host wrapper, `run goal` fails
  (exit 2) with `goal is an internal flow and is not available through the host
  run surface.` — identical message on Claude and Codex.
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

All three reject before worker execution (exit 2). `--mode` and `--depth` are
historical aliases that never shipped: by design Commander rejects them as
generic `unknown option '--mode'` / `'--depth'` errors (no bespoke message —
the generic rejection is intentional and test-locked). Only `--dry-run` gets a
specific safety explanation, because it once silently ran the real connector.

### Routing fields

Observed sources: `src/cli/circuit.ts` (route construction ~line 450-465, final
JSON ~line 875), `src/schemas/run-envelope.ts:137-141`.

- Routing is model-only; there is no deterministic router. `routed_by` is the
  literal `explicit` on the `route.selected` progress event for every real run,
  because the only way a flow gets chosen is an explicit positional argument
  (typed by a user or named by the host model).
- `router_reason` for the explicit path is the fixed string `explicit flow
  positional argument`.
- The route status text reads `Chose <flow>.` (presentation) /
  `Circuit: Chose <flow>.` (display).
- `selection_source` enum: `explicit_operator_request`, `goal_contract`,
  `completion_followup` (no `router` member).

### Help-text discovery limit

`node bin/circuit run --help` (and `handoff`/`memory`/`history`/`create --help`)
print only a generic `Usage: circuit <cmd> [options] [args...]` — per-flag help
is NOT discoverable from `--help`; the runtime forwards args. Help-text
regression checks must use real reject invocations, not `--help` output.

## Build Grounding and Slice Decomposition (PR #36)

Observed sources: `src/flows/build/data.ts` (engineFlags ~line 459-476),
`src/flows/build/writers/plan.ts`, `src/runtime/projections/progress.ts:381-397`.

- Build runs an analyze/gather-context researcher relay between Frame and Plan.
  It writes `reports/build/context.json` with `anticipated_file_extensions`
  (predicted touched file types) and `slices` (ordered work units
  `{id, intent, anticipated_file_extensions}`). The plan writer surfaces both
  onto `reports/build/plan.json` (top-level `anticipated_file_extensions`, a
  min-1 `slices` array) and rewrites `approach` to begin `Grounded in a codebase
  read (N sources): ...`. These are FILE-ONLY — not in the operator summary, the
  run-surface markdown, or the final JSON envelope.
- Under DEEP RIGOR ONLY, Build iterates a per-slice implement+verify loop via the
  `iteratesSliceLoop` `engineFlags` entry (`advanceRoute: 'advance'`, `slicesFrom`
  → `plan.json#slices`, `maxSlices: 8`, `activateWhenDepthAtLeast: 'deep'`). The
  verify-step carries an `advance` route back to act-step. Host mirrors carry the
  `advance` route but NOT the `engineFlags` block (the runtime resolves the flag
  from the catalog).
- Operator-visible slice surface (deep only): `step.started` progress events gain
  a 1-based `(slice N)` suffix in `presentation.status_text` and `display.text`;
  trace entries for loop-body steps carry a 0-based `slice_index`. Under
  standard/lite there is NO slice suffix and NO `slice_index` — single pass.

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
- Final host answers render `operator_summary_markdown_path` (the readable
  digest) VERBATIM when present, and fall back to `run_surface_markdown_path`
  (the compact `CIRCUIT` / `⎿ <status>` run surface) only when the digest is
  absent or missing on disk. Source:
  `plugins/claude/scripts/present-rendering.ts:16-25` (`finalAnswerMarkdownPath`
  — digest wins, run surface is the fallback), `host-rendering.md "Final
  Rendering"`, `src/commands/run.md` step 6. A host that shows only the
  run-surface status line while the digest exists on disk is the finding. (This
  inverts the pre-2026-06 contract — earlier inventories said the run surface
  won; that is now stale.)
- The reshaped digest (`reports/operator-summary.md`) renders via `brief_slots`:
  line 1 is a `Circuit · <FlowName>` headline, then a one-sentence assessment,
  `- ` key-point bullets, optional `- Caveat:` lines, a `Next: <action>` line,
  and optional `Auto-resolutions:` / `Skill hooks:` / `Rich summary:` trailers.
  Source: `src/shared/operator-summary-writer.ts:719-741`. No HUD / status
  indicator exists anymore (removed 2026-06-02).
- Final JSON may also include `operator_summary_path`,
  `operator_summary_status_text`, `run_surface_status_text`,
  `skill_hook_activations` (optional array; see Skill-Hooks Surface), and
  `resolved_axes` (the resolved `rigor`/`tournament`/`autonomous` selection that
  actually ran). Note the two status fields are different things:
  `operator_summary_status_text` is the bare flow display NAME (e.g. `Fix`,
  `Runtime Proof`), NOT an outcome; `run_surface_status_text` is the outcome
  line (e.g. `Failed: ...`, `Done: ...`). Treating the digest status text as an
  outcome, or finding the two identical, is a finding.
- Every non-complete closed run (`aborted`, `escalated`, `handoff`, `stopped`)
  carries `reason` on the final envelope (and in `reports/result.json` via
  `result_path`). The present wrapper renders the specific reason, and in
  streamed mode it does not also print a duplicate generic "Run aborted" line; a
  generic-only abort message is a finding.
- Some rich summary cases may include `operator_summary_html_path`. Validate
  that it is an absolute `.html` path before any host attempts to open it.
- Checkpoint results can include operator-summary paths even when `result_path`
  is absent.

## Outcome Taxonomy

Observed sources: `src/schemas/trace-entry.ts:396` (`RunClosedOutcome`),
`src/shared/outcome.ts` (`isFailureOutcome`),
`src/app/process-evidence/projection.ts`, `src/app/run-envelope/source-record.ts`.

- The final-envelope `outcome` is one of `complete`, `aborted`, `handoff`,
  `stopped`, `escalated` (plus the non-closed `checkpoint_waiting`).
- The failure set is `{aborted, escalated, failed, blocked}` — drawn across
  Circuit's two outcome vocabularies. The canonical mapping is `complete →
  complete`, `handoff → handoff` (neutral), `stopped → needs_attention`
  (neutral), `aborted → failed` (FAILURE), `escalated → blocked` (FAILURE). Any
  run landing in the failure set must read honestly — never as neutral or
  complete.
- Two vocabularies, two surfaces: the run SURFACE collapses `escalated`/`stopped`
  → `Blocked:` and `aborted` → `Failed:`, while the DIGEST and the final-envelope
  `outcome` keep all five distinct.
- `escalated` is emitted for `@escalate` terminals (`graph-runner.ts`). It used
  to render as a false success; the failure-legibility work (2026-05-31) gave it
  the honest assessment `The run escalated because Circuit could not close the
  flow safely.` with an `Escalation reason:` bullet.
- The only deterministic OFFLINE outcome the in-repo fixtures produce is
  `aborted` (the `runtime-proof` fixture). `escalated` / `handoff` / `stopped`
  are connector/flow-driven — partial-skip with a file-contract fallback.

## Skill-Hooks Surface

Config-gated and OPT-IN. Observed sources: `docs/configuration.md:116-177`,
`src/schemas/skill-hook.ts`, `src/skill-hooks/*.ts`,
`src/shared/operator-summary-writer.ts:604-683`,
`src/schemas/operator-summary.ts:74-92,113`,
`src/schemas/trace-entry.ts:531-547`.

- The `skill_hooks.policy` config lives at `~/.config/circuit/config.yaml`
  (user-global) or `./.circuit/config.yaml` (project root; project replaces
  user-global per hook key).
- Modes: `auto` (the default — omitting `mode` loads the listed skills; requires
  at least one skill) and `mute` (record-only; names no skill). There is NO
  `ask` mode.
- Four hooks fire today: `after:edit-files[:.ext]` (Fix, off `fix.change-set@v1`
  observed paths), `before:edit-files[:.ext]` (Build, off `build.plan@v1`
  `anticipated_file_extensions`), `after:verification-failed` and
  `after:evidence-gap` (any flow with a verification step). The seven `before:*`
  lifecycle hooks are reserved/inert.
- Detection is rule-based on literal trace signals — no model picks the skill.
- Actuator: an `auto` hook injects its resolved skills into subsequent
  IMPLEMENTER relays ONLY (role-gated at
  `src/runtime/run/relay-guidance.ts:377-403`); researcher/reviewer relays get
  nothing. Injection is blocked when a strict policy raises a
  `decision_packet_id` (the skill is then "withheld"). The injection channel is
  run-scoped, deduped, and never drains.
- Operator-visible section: `## Skill hooks` in `operator-summary.md` (a flatter
  `Skill hooks:` label in the brief-slots digest), byte-identical on both hosts
  (single shared renderer, no host branch). Per activation it discloses: hook,
  mode, source (`project-policy` / `user-global-policy` / `default-mapping`),
  `policy_ref`, injected/withheld/unavailable skills, and provenance.
- Trace kinds: `run.skill-hook` and `run.skill-hook-error`; a
  `run.skill-hook-error` entry surfaces a Warnings line
  `skill_hook_dispatch_failed: <message>` (a dispatch failure is non-fatal but
  never silent).
- Default-absent: a run with NO `skill_hooks` config records and injects
  nothing — the section is ABSENT by default. The checklist MUST write config to
  exercise it; the absent section on a default run is the opt-in gate, not a
  regression.
- Skill discovery is flat `<root>/<id>/SKILL.md` only (`~/.agents/skills` then
  `~/.claude/skills`) — namespaced plugin/marketplace skills are NOT
  discoverable.

## Runtime Bundle and Doctor Surface

Observed sources: plugin wrappers, `scripts/build-plugin-runtime.ts`,
`package.json`, `docs/release/0.1.0-alpha.6-notes.md`, wrapper
`doctor --json`, and `npm run doctor:plugins:installed`.

- Both host wrappers should resolve `runtime/circuit.js` and report
  `runtime_source: bundled` in `version --json` and doctor output.
- `doctor --json` top-level keys include `schema_version`, `host`, `status`,
  `plugin_root`, `flow_root`, `runtime_source`, `runtime_path`,
  `runtime_version`, `checks`. The `host` value is `claude-code` on the Claude
  wrapper and `codex` on the Codex wrapper. `version --json` carries NO `host`
  key — a host/connector key appearing in `version --json` would itself be a
  finding.

### Connector routing

Observed sources: `src/connectors/`, `src/cli/circuit.ts`
(`CIRCUIT_HOST_KIND`), `docs/contracts/connector.md`.

- The default relay connector is `auto`: it selects the worker matching the host
  — `codex` on Codex, `claude-code` on Claude (and `claude-code` for a generic
  shell). Host identity comes from the `CIRCUIT_HOST_KIND` env var (set by the
  wrappers) or runtime options, winning before any `config.host.kind`.
- Operator-visible: `doctor --json` `.host` reads `claude-code`/`codex` per
  wrapper; on a real relayed run the run-folder traces carry
  `resolved_from: { source: "auto" }`. Not surfaced in `version --json`.
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
- Public flows have no direct host command or skill; cover each as a Run-routed
  surface (host model recommendation — model-only routing, no deterministic
  router) and as an explicit CLI flow start, not as a direct slash command or
  direct Codex skill.
- Local doctor and wrapper smokes do not prove real worker connector behavior
  for every flow.
