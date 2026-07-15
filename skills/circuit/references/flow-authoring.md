# Creating, Publishing, and Retiring Flows

Read this when the built-in five (Fix, Build, Explore, Review, Prototype)
genuinely do not fit a task, or the user asks for a custom flow.

## The judgment, in full

The scarce resource is not Circuit's ability to run flows; it is the user's
ability to know, instantly and without thinking, which flow a task belongs
to. Six well-separated flows fit in a head. Twelve overlapping ones do not,
and the moment a user has to deliberate "is this a `fix` or a
`hotfix-triage`?", every flow got more expensive — including the good ones.
New flows are also permanent maintenance: names to remember, boundaries to
document, behavior to keep coherent as built-ins evolve.

So treat "this deserves a new flow" as a claim requiring evidence, and climb
the ladder of lighter levers first:

1. **Dial and phrasing.** Most "the flow doesn't fit" feelings are really
   a power mismatch or a vague `--goal`. `fix --power low` is a different
   experience from `fix --power high`.
2. **Config on an existing flow.** A skill loaded via
   `circuits.<flow>.selection.skills`, a `skill_hooks` rule that fires on
   the right moment, or connector routing changes what a flow does without
   changing what the user has to remember.
3. **Memory note.** `circuit memory note --flow <id> "<guidance>"` codifies
   process learning with zero new surface. A note cites a real run
   artifact, so it can only be filed once the project has at least one run
   (it exits 2 in a fresh project).
4. **`circuit generate` for one-offs.** A bespoke composed flow for an
   unusual task shape. Run it, keep the evidence, feel no obligation to
   publish. Disposability is the feature.
5. **`circuit create` + publish, only for proven recurrences.** Same
   distinct shape, roughly three real occurrences, no built-in territory
   overlap, and a name that explains itself.

Gates before publishing (state them to the user and get a yes):

- **Territory test.** One sentence for the new flow next to one sentence for
  each built-in. Any pair that could claim the same task means the boundary
  is unclear. Sharpen or stop.
- **Name test.** From the name alone, will the user reach for it correctly
  six weeks from now?
- **Amplify test.** Harmonious flows compose: they reuse the built-in blocks
  and stage grammar (Frame, Analyze, Plan, Act, Verify, Review, Close),
  produce reports other flows can consume, and make the existing set
  stronger. If the proposal forks a parallel universe with its own
  vocabulary, decline it.
- **Simplicity test.** If explaining when to use it takes more than two
  sentences, it is not ready.

And retire: when a published custom flow stops earning its place, recommend
removing it. A small catalog is a feature, not a lack of ambition.

## create vs generate

Both turn a description into a runnable custom flow and publish through the
same package tail. They differ in the producer:

| | `circuit create` | `circuit generate` |
| --- | --- | --- |
| Producer | **Instantiates** a proven family template (fix, build, review, research, prototype, editorial), picked from signals in the description | **Composes** block by block: a model proposes the shape, offline validity/runnability checks gate it, verifier errors feed back for bounded repair rounds |
| Model call | None; offline and deterministic | Yes (pinned small model, reported in the result) |
| Fit | A recurring task that is a variant of a known shape | A task shape the families do not cover |
| Failure mode | Family mismatch (wrong template picked) | Honest parse/relay/wall failure after repair budget |

```bash
circuit create --name 'release-notes' --description 'draft release notes from merged PRs' --publish --yes
circuit generate --description 'triage a flaky test quarantine list and propose unquarantines' --max-repair 2
```

Useful flags on both: `--home <path>` (override the custom home), `--publish`
(promote the draft), `--yes` (skip confirmation), `--progress jsonl`.
`create` also takes `--decompose` to force the fully decomposed build spine
instead of the thin-conservative default.

## Where custom flows live and how they run

Home: `~/.config/circuit/custom/`

```text
drafts/<slug>/     draft package, validation results
flows/<slug>/      compiled flow (circuit.json + <mode>.json siblings)
skills/<slug>/     published SKILL.md surface
commands/<slug>/   command surface
```

Run a published custom flow by pointing the runtime at the custom flow root:

```bash
circuit run <slug> --flow-root "$HOME/.config/circuit/custom/flows" --goal '<task>' --progress jsonl
```

Custom flows compose built-in blocks and reuse registered contract families
(`build.*`, `fix.*`, `review.*`, ...), so they pass the same fail-closed
catalog and kind gates a built-in does. Custom slugs cannot shadow reserved
built-in flow ids. Validation runs at draft time; a draft that fails
validation reports exactly which gate refused it.

## Changing built-in flows (Circuit repo work)

If the right move is changing a *built-in* flow, that is repo work in the
Circuit checkout, not config. The playbook is
`docs/flows/authoring-model.md` there; the shape:

- A flow is a package under `src/flows/<id>/`: `data.ts` (canonical
  FlowData), `reports.ts` (Zod report schemas), `command.md` (if directly
  invocable), writers, relay hints.
- The catalog `src/flows/catalog.ts` is the single source of truth; the
  engine derives registries from it. Needing to edit `src/runtime/` to add a
  flow means the boundary is being violated.
- After authored changes: `npm run emit-flows`, then `npm run
  check-flow-drift`; never hand-edit generated host output
  (`plugins/claude/...`, `plugins/codex/...`, `generated/flows/...`).
- Steps declare typed inputs/outputs (contract fit is route-aware and fails
  early), named routes for real product outcomes, and optionally
  deterministic `acceptance_criteria` (`report_field` presence checks or a
  bounded `command`) with `hard-fail` or `retry-with-feedback`.
- `npm run verify` before calling it done.

Suggest this path only when the user owns the Circuit repo or wants to
contribute; otherwise stay on the custom-flow surface.
