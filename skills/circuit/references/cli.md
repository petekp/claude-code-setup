# Circuit CLI Reference

Every command, with the flags that matter. The binary is `circuit` (global
install), `./bin/circuit` (checkout), or
`node "${CLAUDE_PLUGIN_ROOT}/scripts/circuit.js"` (Claude Code plugin
wrapper; add `present` before the subcommand to get rendered progress
instead of machine output).

## circuit run

```bash
circuit run <flow> --goal '<task>' [flags]
```

The flow name is required; the CLI rejects a run without one. Public flows:
`fix`, `build`, `explore`, `review`, `prototype`.

| Flag | Meaning |
| --- | --- |
| `--goal <text>` | The task, single-quoted. Required in practice. |
| `--why <text>` | The user's stated stakes. Only when the user actually said why. |
| `--power <auto\|low\|medium\|high>` | The one dial, default medium. Sets the model tier AND derives process thoroughness (low/medium/high map across; `auto` = medium process, run picks its own model tier once from the research read). The derived thoroughness clamps to the flow: Build/Explore/Fix full ladder, Prototype floors at medium, Review always medium. |
| `--process <low\|medium\|high>` | Advanced override: sets process thoroughness independently of the dial and beats the derivation. Values outside the flow's set fail before the run starts. `--depth` is retired (unknown option). |
| `--tournament [2\|3\|4]` | Fan out and select; optional inline count, default 3 (e.g. `--tournament 3`). Explore: decision options. Prototype: implementation variants (requires `circuits.prototype.variant_models` in config; fails fast without it). |
| `--autonomous` | Build/Explore/Fix/Prototype. Auto-resolves supported checkpoints and drives a bounded continuation loop; frames required evidence at intake and never reports complete by exhausting attempts. Loop result: `reports/autonomous-loop.json`. |
| `--include-untracked-content` | Review only sends untracked file *contents* with this flag; paths and sizes are always collected. Confirm safety first. |
| `--flow-root <path>` | Load compiled flows from elsewhere (custom flows, running outside a checkout). |
| `--progress <format>` | `jsonl` streams machine-readable progress events. Use when driving the CLI programmatically without the `present` wrapper. |
| `--reuse-children-from <path>` | Fresh run reuses finished fanout branches from a prior crashed run's folder. Fresh-run only; rejected on resume. |
| `--fixture <path>` | Test/replay input. Rarely needed in normal operation. |

Exit codes: `0` complete or parked at a checkpoint; `1` any close short of
complete (aborted, stopped, escalated, handoff); `2` usage error. The JSON
`outcome` field carries the specific ending.

## circuit resume

```bash
circuit resume --run-folder '<path>' --checkpoint-choice '<choice>'
```

Answers a parked run's checkpoint and continues it. The allowed choices are
in the checkpoint question (see `circuit checkpoints`).

## circuit checkpoints

Read-only list of every run parked at an operator checkpoint: the question,
the choices, staleness, and the exact resume command for each. Never resumes
anything itself.

## circuit preview

```bash
circuit preview [flow] [--power <tier>] [--matrix] [--json]
```

Spawn-free readout of what every relay step would resolve to: connector,
model, effort, and the SOURCE of each value (`power-tier`, `codex-default`,
`pinned`, `codex-default-unresolved`). No flow named = survey every public
flow. `--matrix` = high/medium/low side by side for one flow. Reads the same
config and selection code as a real run; costs nothing. Config problems
(e.g. a flow-wide model pin colliding with a pinned connector) surface here
as `problem` rows before you pay for a run.

## circuit doctor

```bash
circuit doctor [--json]
```

A readiness report. Grades only the connectors your flows would actually
use under the effective config and host (fresh machine: claude-code
only): a verdict line first (`Ready.` / `Not ready: ...`), then one table
of every connector. The CHOSEN BY column names the config decision behind
each chosen connector (`auto`, `default`, `role: reviewer`, `flow: fix`);
connectors no flow chooses show `-` and a fix per problem appears under
its row. Exits 0 when every chosen connector is healthy; problems on
unchosen connectors never fail the check. A footer shows the exact
`circuit config set` command to change the choice. `--json` carries
`ready`, `chosen_connectors`, and per-connector `chosen` + `chosen_by`
(schema_version 2). Run it before the first run in a new environment or
whenever relays fail mysteriously.

## circuit create (experimental, CLI-only)

```bash
circuit create --name '<slug>' --description '<flow idea>' [--publish --yes] [--decompose]
```

Drafts a custom flow by **instantiating a proven family template** chosen
from the description (fix, build, review, research, prototype, editorial).
Offline and deterministic; no model call. `--decompose` forces the fully
decomposed build spine. `--home <path>` overrides the custom-flow home
(default `~/.config/circuit/custom`). See `references/flow-authoring.md`.

## circuit generate (experimental, CLI-only)

```bash
circuit generate --description '<task>' [--name '<slug>'] [--publish --yes] [--max-repair <n>]
```

**Composes** a bespoke flow block by block: a model proposes the shape, an
offline validity/runnability floor checks it, and verifier errors feed back
for bounded repair rounds. Output is a runnable composed flow or an honest
failure. Use for one-off task shapes the built-ins do not fit.

## circuit runs / circuit history

```bash
circuit runs show --run-folder '<path>' --json   # recorded result of one run
circuit history rebuild|query|status --json      # local run-history index
```

## circuit memory

```bash
circuit memory note --flow <id> "<text>"   # file a flow-scoped guidance note
circuit memory list
circuit memory forget <id>
```

Notes are operator-authored, hint-only facts stored in
`.circuit/memory/project.v1.jsonl`. The lightest way to codify "next time,
do it this way" without touching flows or config.

## circuit handoff

```bash
circuit handoff save            # record a continuity record for the next session
circuit handoff resume          # restore it
circuit handoff brief           # summarize where things stand
circuit handoff done            # clear it
circuit handoff hooks install|uninstall|doctor   # Codex host hook support
```

## circuit config

```bash
circuit config show [--global]
circuit config set <dotted.key> <value> [--global]
circuit config unset <dotted.key> [--global]
```

Edits `./.circuit/config.yaml` (default) or `~/.config/circuit/config.yaml`
(`--global`). Validates the whole document against the strict schema before
writing; preserves YAML comments and formatting. An invalid edit cannot
corrupt a working config.

## circuit reclaim

Removes orphaned per-branch git worktrees under `.circuit/worktrees/` left
by a process killed mid-fanout. Leaves live runs' worktrees alone. Safe to
run any time. `--project-root <path>` targets another project.

## circuit uninstall

Strips the marker-delimited Circuit block from the project's agent
instructions file (AGENTS.md / CLAUDE.md) and prints host-side plugin
removal commands.

## circuit version

```bash
circuit version [--json]
```

## Environment notes

- Plugin runs ignore ambient `PATH` binaries. `CIRCUIT_CLI=/abs/path/bin/circuit`
  forces a development override; `CIRCUIT_DEV=1` allows repo-local fallbacks.
- Node 22.18.0+ required.
- The `codex` worker connector is optional (`npm install -g @openai/codex`);
  `claude-code` works without it.
