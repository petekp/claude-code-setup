# Circuit Configuration Recipes

Two files, one schema, composed `defaults < user-global < project <
invocation`:

- `~/.config/circuit/config.yaml` — personal, cross-project.
- `./.circuit/config.yaml` — project overrides.

Always `schema_version: 1`. Edits take effect at run time; no rebuild.
Decide personal vs project first, preview with `circuit preview <flow>
--matrix` before running, and prefer `circuit config set` for one-key edits
(it validates before writing).

## Minimal

```yaml
schema_version: 1
```

## Connector routing

Flows do not hard-code connectors. Config chooses per relay step, first
match wins:

1. `relay.roles.<role>` (researcher / implementer / reviewer)
2. `relay.circuits.<flow_id>`
3. `relay.default`
4. `auto` — the connector matching the current host (Codex host → `codex`,
   Claude Code host → `claude-code`, generic shell → `claude-code`).

The common split — trusted writes on Claude Code, second-opinion review and
research on Codex:

```yaml
schema_version: 1

relay:
  default: claude-code
  roles:
    reviewer: { kind: builtin, name: codex }
    researcher: { kind: builtin, name: codex }
```

Built-in connectors:

| Connector | Use for | Models / effort |
| --- | --- | --- |
| `claude-code` | Trusted same-workspace writes | Anthropic; effort low→max |
| `codex` | Write-capable worker via `codex exec` (workspace-write boundary, ignores user config) | OpenAI; effort low→xhigh |
| `cursor-agent` | Cursor CLI implementer branches | Gemini; `effort: none` |

## Power dial

```yaml
defaults:
  power: medium        # or low / high / auto

power_auto:            # only meaningful with power: auto
  floor: low           # never below
  ceiling: medium      # never above, even if recommended
```

`auto` picks the tier once per run from the research read; the summary
reports why (`power medium (auto, capped)` etc.). Depth has no auto: depth
selects the flow shape before any model runs, so pick it yourself.

Remap what a tier means for one connector (shipped defaults fill the rest):

```yaml
power_tiers:
  claude-code:
    high: { model: { provider: anthropic, model: claude-opus-4-8 } }
  codex:
    low: { effort: medium }
```

Codex tiers move effort, not the model; the Codex model is the user's Codex
default, read from `~/.codex/models_cache.json`.

## Per-flow pins

Pin one flow to one model; the dial stops moving it (`pinned` in preview):

```yaml
circuits:
  fix:
    selection:
      model: { provider: anthropic, model: claude-opus-4-8 }
```

Avoid a flow-wide model pin on a flow that mixes connectors (e.g.
cross-tool flows): one model cannot satisfy both providers, and preview
flags the mismatch as a `problem`. Use `power_tiers.<connector>` there
instead, since tier tables are keyed by connector.

## Local skills

Circuit injects your own `SKILL.md` files into relay prompts. It scans flat
folders under `~/.agents/skills/<id>/SKILL.md` (host-neutral, wins ties)
then `~/.claude/skills/<id>/SKILL.md`. Plugin/marketplace skills with
namespaced ids (`vendor:skill`) are not discoverable here.

```yaml
schema_version: 1

skills:
  bindings:                      # bind a flow's optional skill slot globally
    review-assistant: my-review-skill

circuits:
  review:
    skill_bindings:              # or per flow
      review-assistant: my-review-skill
    selection:
      skills:                    # always load these for this flow's relays
        mode: append
        skills:
          - tdd
```

`selection.skills` must resolve before the worker starts; a missing skill is
an error. Unbound optional slots are ignored. Every loaded skill is recorded
in the trace (id, path, SHA-256, bytes).

## Skill hooks

Load a skill only when a moment fires, instead of always:

```yaml
skill_hooks:
  policy:
    after:edit-files:.tsx:        # a step touched a .tsx file (Fix)
      skills:
        - react-doctor
    before:edit-files:.ts:        # plan predicts .ts edits (Build)
      skills:
        - tdd
    after:verification-failed:    # observe only: record, inject nothing
      mode: mute
```

Modes: `auto` (default when omitted — inject into the **implementer** only,
never researcher/reviewer) and `mute` (record that it would have fired).
Hooks firing today: `after:edit-files[:.ext]` (Fix),
`before:edit-files[:.ext]` (Build), `after:verification-failed` and
`after:evidence-gap` (any flow with a verification step). The
`before:high-impact-alignment` / `before:implementation` / etc. family
parses but does not fire yet; do not rely on it. Project policy replaces
user-global policy per hook key. A skill the roots cannot resolve is
recorded as unavailable and injects nothing.

## Custom connectors

A wrapper executable Circuit calls with `PROMPT_FILE OUTPUT_FILE` appended;
it reads the prompt file and writes one JSON response object:

```yaml
relay:
  roles:
    reviewer: { kind: named, name: opencode-local }
  connectors:
    opencode-local:
      kind: custom
      name: opencode-local
      command: ["/path/to/opencode-reviewer.sh"]
      prompt_transport: prompt-file
      output: { kind: output-file }
      capabilities: { filesystem: read-only, structured_output: json }
```

Custom connectors are trusted local processes, not a sandbox;
`filesystem: read-only` only routes them to read-only roles. They inherit
Circuit's environment and cwd. Circuit passes the materialized tier via
`CIRCUIT_RELAY_MODEL`, `CIRCUIT_RELAY_MODEL_PROVIDER`, and
`CIRCUIT_RELAY_EFFORT`. Custom connectors are read-only in V1: route them to
review/research work, not implementation.

Pair with a tier table to drive local models (Ollama, OpenCode):

```yaml
power_tiers:
  opencode-local:
    low: { model: { provider: custom, model: local/qwen2.5-coder:3b } }
    medium: { model: { provider: custom, model: local/qwen2.5-coder:7b } }
    high: { model: { provider: custom, model: local/qwen2.5-coder:7b } }
```

A retry escalates one tier up within the connector's own table, so a flaky
small-model attempt gets one shot on the bigger local model before the run
surfaces the failure.

## Prototype tournament variants

`--tournament` on Prototype requires this; the run fails fast without it:

```yaml
circuits:
  prototype:
    variant_models:
      - id: codex-55-xhigh
        label: Codex 5.5 xhigh
        connector: { kind: builtin, name: codex }
        selection:
          model: { provider: openai, model: gpt-5.5 }
          effort: xhigh
      - id: opus-max
        label: Claude Opus max
        connector: { kind: builtin, name: claude-code }
        selection:
          model: { provider: anthropic, model: claude-opus-4-8 }
          effort: max
```

Circuit validates each connector/provider/effort pairing before any branch
starts.

## Checklist before writing config

1. Personal or project? Pick the file.
2. Keep `schema_version: 1`.
3. Preview the exact YAML with the user for anything non-obvious.
4. `circuit preview <flow> --matrix` to prove the effect.
5. Run the focused command that exercises the path you changed.
