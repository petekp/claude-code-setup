---
name: method:autonomous-ratchet
description: >
  Autonomous-only artifact-centric method for overnight quality improvement
  runs on an existing codebase. 17 steps across 6 phases: Triage -> Stabilize
  -> Envision -> Plan -> Execute -> Finalize. Use when asked to run this
  overnight, improve while I sleep, ratchet quality autonomously, or do an
  autonomous quality pass. Do not use for interactive steering, greenfield
  feature work, architecture decisions, cleanup-only sweeps, one-off fixes, or
  repos without explicit build/test/verify commands.
---

# Autonomous Ratchet

Autonomous Ratchet is a bounded overnight improvement loop: freeze the mission,
restore baseline trust, generate better options, turn them into an executable
charter, deliver the work in batches, and publish a truthful closeout packet.
The artifact chain is the source of truth. Relay handoffs and child roots are
supporting evidence, not the workflow state.
This method exists to prevent a common unattended-run failure mode: ambitious
changes built on an untrusted baseline, vague quality bars, hidden reopen logic,
and stale downstream packets that still look current after a session dies. The
topology stays static, judgment becomes durable artifacts, and every reopen or
partial closeout is explicit.
## When to Use
- Existing codebase improvement work that should continue while the user is away
- Requests like "run this overnight", "improve while I sleep", "ratchet quality", or "autonomous quality pass"
- Multi-step polish, refinement, cleanup-plus-improvement, or reliability work that needs a truthful baseline first
- Repositories where build, test, and optional verify commands can be named concretely
- Cases where an evidence-backed closeout packet matters more than chat narration
Do NOT use for interactive steering, net-new feature delivery, architecture
decisions, cleanup-only sweeps, trivial fixes, or repos that cannot support
explicit verification. See the frontmatter for the full negative scope.
## Glossary
- **Artifact** - Canonical method output under `${RUN_ROOT}/artifacts/`.
- **Authoritative packet** - The ratchet artifact that supersedes an earlier
  draft or review artifact for downstream use.
- **Review coverage** - The explicit table proving which `RQ-*`, `MP-*`, batch,
  or baseline items were actually checked.
- **Governing issue** - The exact problem id and summary that justifies a reopen
  or an admitted additional step.
- **Injection ledger** - The durable record inside a ratchet packet showing
  what extra work was admitted, rejected, executed, or left unused.
- **Child root** - A parent-owned relay workspace used by `manage-codex`.
- **Command set** - A named build/test/verify bundle captured in `mission-brief.md`.
- **Reopen marker** - The root-level redirect artifact that tells a fresh
  session where to resume after downstream state has been archived.
## Principles
- **Artifacts, not chat.** Progress is the artifact chain on disk. Commentary is
  helpful, but it is never authoritative.
- **Stabilize before improve.** An overnight run that cannot trust its baseline
  should not design bigger changes on top of that uncertainty.
- **Calibration is an interface.** Stable ids in `quality-calibration.md` work
  like an internal API for taste, correctness, and severity.
- **Review diagnoses; ratchet decides.** Review steps gather evidence and route
  outcomes. Only the following ratchet step can admit extra work or publish the
  authoritative packet.
- **Static topology, dynamic judgment.** The step graph does not mutate at
  runtime. Extra work lives inside ratchet-step relay state and ledgers.
- **Reopen invalidates downstream state.** Once evidence disconfirms a later
  packet, that packet must be archived before resume can be honest.
- **Batch and verify.** Delivery happens in ordered, reversible units with
  explicit verification, janitor passes, and truthful dispositions.
## Setup
```bash
RUN_SLUG="<scope-slug>"
RUN_ROOT=".relay/method-runs/${RUN_SLUG}-autonomous-ratchet"
mkdir -p "${RUN_ROOT}/artifacts" "${RUN_ROOT}/phases"
```
Setup only defines `RUN_ROOT`. Step 1 captures every runtime input that varies
by run: scope, constraints, file boundaries, quality bar, and verification.
## Domain Skill Selection
Domain skills are chosen by rule, not by prompt-time improvisation:
1. `mission-brief.md` declares repo surfaces and allowed scope ids.
2. `quality-calibration.md` declares `## Domain Skill Hints`.
3. `execution-charter.md` freezes the actual per-batch domain skills.
4. Autonomous dispatches use at most 2 domain skills, and at most 3 total
   skills including `manage-codex`, unless the current artifact explicitly
   documents a justified exception.
Default mapping:
| Surface | Preferred skills |
|---|---|
| Rust, systems, persistence | `rust` |
| Swift, SwiftUI, Apple platforms | `swift-apps`, `swiftui` |
| React, Next, web UI | `next-best-practices`, `vercel-react-best-practices`, `frontend-design` |
| Architecture, seams, boundaries | `clean-architecture`, `seam-ripper` |
| Testing, regressions, bug proof | `tdd` |
| Cleanup residue sweeps | `dead-code-sweep` |
Selection rules:
- Pick one primary platform skill for the dominant files being changed.
- Optionally add one secondary skill for architecture, testing, or UI quality.
- Use zero domain skills rather than filler skills when the step is mostly
  orchestration or evidence review.
- Review-only steps usually use zero domain skills unless the domain semantics
  would otherwise be underspecified.
## Canonical Header Schema
Every dispatch header must include:
- `## Mission`
- `## Inputs`
- `## Output`
- `## Success Criteria`
- `## Handoff Instructions`
The `## Output` section names the exact artifact path and the required section
names, not a loose prose description. Diagnose-only review steps must say they
do not edit source code or authoritative artifacts.
Handoff instructions must include these exact relay headings:
- `### Files Changed`
- `### Tests Run`
- `### Verification`
- `### Verdict`
- `### Completion Claim`
- `### Issues Found`
- `### Next Steps`
### Shared Dispatch Recipe
All non-`manage-codex` dispatch steps use the same relay recipe:
```bash
STEP_ROOT="${RUN_ROOT}/phases/step-<n>"
mkdir -p "${STEP_ROOT}/handoffs" "${STEP_ROOT}/last-messages"
./scripts/relay/compose-prompt.sh \
  --header "${STEP_ROOT}/prompt-header.md" \
  --skills "<skills>" \
  --root "${STEP_ROOT}" \
  --out "${STEP_ROOT}/prompt.md"
cat "${STEP_ROOT}/prompt.md" | \
  codex exec --full-auto \
  -o "${STEP_ROOT}/last-messages/last-message.txt" -
```
Parallel steps use per-worker subdirectories to avoid file collisions:
```bash
WORKER_ROOT="${STEP_ROOT}/<worker-id>"
mkdir -p "${WORKER_ROOT}/handoffs" "${WORKER_ROOT}/last-messages"
```
Each worker's `--header`, `--root`, `--out`, and `-o` paths reference its own
`WORKER_ROOT`. The parent step reads all worker artifacts after all workers finish.
## Phase 1: Triage
### Step 1: Mission Freeze - `synthesis`
**Mission:** Turn the user's freeform overnight request into a falsifiable run
contract before any scanning or delivery begins.
**Consumes:** Invocation instructions, repo context, project rules.
**Writes:** `${RUN_ROOT}/artifacts/mission-brief.md`
**Schema:** `Mission`; `In Scope`; `Out Of Scope`; `Scope Ceiling`; `Allowed
File Scopes`; `Verification Command Sets`; `Quality Bar Translation`;
`Non Goals`; `Constraints`; `Success Definition`.
**Gate:** `outputs_present`
- Exact headings are present.
- `Allowed File Scopes` includes at least one named scope row.
- `Verification Command Sets` contains explicit commands or explicit `NOT AVAILABLE`.
- `Constraints` and `Success Definition` use stable `MB-*` ids.
- `Quality Bar Translation` and `Non Goals` are falsifiable bullets, not vague wishes.
### Step 2: Triage Probes - `dispatch`, parallel
**Mission:** Capture the starting state from 3 independent angles: baseline,
quality calibration, and improvement inventory.
**Consumes:** `mission-brief.md`
**Writes:**
- `${RUN_ROOT}/artifacts/baseline-audit.md`
- `${RUN_ROOT}/artifacts/quality-calibration.md`
- `${RUN_ROOT}/artifacts/improvement-backlog.md`
**Workers:**
- `baseline` -> system boundary, failing boundaries, residue/noise, verification baseline, evidence refs
- `quality` -> domain frame, reusable quality ids, severity rubric, review questions, domain skill hints
- `backlog` -> ranked opportunities, defers, and explicit scope rejections
**Schemas:**
- `baseline-audit.md`: `System Boundary`; `Failing Boundaries`; `Residue and Noise`; `Verification Baseline`; `Evidence References`
- `quality-calibration.md`: `Domain Frame`; `Quality Bar Translation`; `Positive Influences`; `Concrete Anti-Patterns`; `Must-Preserve Properties`; `Severity Rubric`; `Review Questions`; `Domain Skill Hints`
- `improvement-backlog.md`: `Backlog Ordering Rule`; `Ranked Opportunities`; `Deferred Opportunities`; `Scope Rejections`
**Dispatch:** Create `prompt-header-baseline.md`, `prompt-header-quality.md`,
and `prompt-header-backlog.md` under `${RUN_ROOT}/phases/step-2/`. Use the
shared dispatch recipe once per worker. Triage usually needs zero domain skills;
add one only if the repo's domain would otherwise make the output generic.
**Gate:** `outputs_present`
- All 3 artifacts contain the promised section names.
- Every failing boundary and residue item in `baseline-audit.md` has a `BA-*` id.
- `quality-calibration.md` assigns stable ids to every reusable bullet:
  `DF-*`, `QB-*`, `PI-*`, `AP-*`, `MP-*`, `SR-*`, `RQ-*`.
- The calibration bullets are concrete and domain-specific.
- Every backlog row is ranked and tagged exactly `BASELINE_RESTORE`,
  `IMPROVEMENT`, or `DEFER`, with at least one cited `BA-*` or `MB-*` id.
## Phase 2: Stabilize
### Step 3: Baseline Repair - `dispatch` via `manage-codex`
**Mission:** Restore trust in the baseline before broader improvement work
starts. Fix only what belongs to the baseline-restoration boundary.
**Consumes:** `mission-brief.md`, `baseline-audit.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/stabilization-report.md`
**Schema:** `Attempt Ledger`; `Issues Addressed`; `Files and Scope Used`;
`Verification Results`; `Deferred or Blocked Items`; `Revert or Escalation Record`.
**Adapter:** Use the shared `manage-codex` seam contract below. Step 3 uses
attempt roots under `${RUN_ROOT}/phases/step-3/attempts/<attempt-id>` and a
step-specific charter focused on unresolved `BA-*` issues and residue items.
**Retry budget:** Maximum 2 attempts. Retry only when convergence says the
remaining issue is a local, fixable baseline problem.
**Gate:** `outputs_present`
- Every addressed item cites a `BA-*` id.
- `Files and Scope Used` names only allowed scope ids from `mission-brief.md`.
- `Verification Results` records command-set ids and outcomes.
- `Deferred or Blocked Items` separates fixable residue from reopen candidates.
- `Revert or Escalation Record` makes any reverted attempt explicit.
### Step 4: Stability Audit - `dispatch`
**Mission:** Independently check whether the repaired baseline is trustworthy.
This step is diagnose-only and does not consume injections.
**Consumes:** `mission-brief.md`, `baseline-audit.md`, `stabilization-report.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/stability-findings.md`
**Schema:** `Scope Reviewed`; `Review Coverage`; `Findings By Severity`;
`Recommended Additional Steps`; `Verdict`; `Ready Means`; `Reopen Recommendation`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-4/prompt-header.md`, state
explicitly that no code may be changed, and use the shared dispatch recipe.
Review steps normally use zero domain skills.
**Gate:** `outputs_present`
- `Review Coverage` walks every `BA-*`, every `MP-*`, and every `RQ-*`.
- `Findings By Severity` cites exact `MB-*`, `BA-*`, `MP-*`, or `RQ-*` ids and
  exact `SR-*` clauses.
- `Recommended Additional Steps` uses the exact table or explicit `NONE`.
- `Verdict` is exactly one of `stable`, `repair_again`, `retriage`.
- `Ready Means` explains why the verdict is valid against the reviewed boundaries.
- `Reopen Recommendation` is explicit `NONE` or records a governing issue and target.
### Step 5: Stabilize Ratchet - `dispatch`
**Mission:** Consume the audit, admit or reject same-phase follow-up work, and
publish the authoritative Stabilize packet.
**Consumes:** `stability-findings.md`, `stabilization-report.md`, `mission-brief.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/stability-gate.md`
**Schema:** `Findings Consumed`; `Additional Step Decisions`; `Injection Ledger`
with `Budget Summary` and `Injection Entries`; `Restoration Summary`;
`Verification Summary`; `Remaining Risks`; `Verdict`; `Ready Means`;
`Reopen Decision`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-5/prompt-header.md`, reference the
shared injection protocol, and use the shared dispatch recipe. Any admitted
additional-step specs live under `${RUN_ROOT}/phases/step-5/injections/`.
**Gate:** `verdict-consistency`
- `stable` -> continue
- `repair_again` -> reopen `baseline-repair`
- `retriage` -> reopen `triage-probes`
`stable` means critical/high Stabilize findings are closed, admitted injections
are resolved or rejected, and verification supports a trustworthy baseline.
`repair_again` means the blocker is still inside the baseline-repair boundary.
`retriage` means Triage framing, backlog, or calibration has been invalidated.
Checks:
- `Findings Consumed` accounts for every finding and recommended step from `stability-findings.md`.
- `Injection Ledger` records admitted, rejected, remaining, and per-injection results.
- `Verdict`, `Ready Means`, and `Reopen Decision` agree with the evidence.
- Any reopen uses the shared reopen invalidation protocol and records archive details.
## Phase 3: Envision
### Step 6: Exploration Fanout - `dispatch`, parallel
**Mission:** Explore improvement directions from inside the codebase and from
outside exemplars without yet committing to a solution packet.
**Consumes:** `mission-brief.md`, `quality-calibration.md`, `stability-gate.md`, `improvement-backlog.md`
**Writes:**
- `${RUN_ROOT}/artifacts/inside-out-digest.md`
- `${RUN_ROOT}/artifacts/outside-in-digest.md`
**Workers:**
- `inside-out` -> current system shape, leverage points, constraints, local opportunities, evidence refs
- `outside-in` -> external exemplars, differentiators, anti-pattern matches, transferable moves, evidence refs
**Schemas:**
- `inside-out-digest.md`: `Current System Shape`; `Leverage Points`; `Constraints`; `Local Opportunities`; `Evidence References`
- `outside-in-digest.md`: `External Exemplars`; `Differentiators`; `Anti-Pattern Matches`; `Transferable Moves`; `Evidence References`
**Dispatch:** Create `prompt-header-inside-out.md` and
`prompt-header-outside-in.md` under `${RUN_ROOT}/phases/step-6/` and use the
shared dispatch recipe once per worker.
**Gate:** `outputs_present`
- Both digests contain the promised sections.
- `inside-out-digest.md` cites concrete backlog ids or baseline facts, not only generic ideas.
- `outside-in-digest.md` cites calibration ids for each influence or anti-pattern match.
- Both digests carry enough evidence to synthesize a proposal without guesswork.
### Step 7: Proposal Synthesis - `synthesis`
**Mission:** Collapse the exploration fanout into a bounded improvement proposal
that is specific enough to review but not yet authoritative.
**Consumes:** `inside-out-digest.md`, `outside-in-digest.md`, `mission-brief.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/improvement-proposal.md`
**Schema:** `Proposal Thesis`; `Opportunity Clusters`; `Ranked Slices`;
`Calibration Mapping`; `Deferred or Rejected Ideas`; `Open Questions`.
**Gate:** `outputs_present`
- Every ranked slice has a stable `IP-*` id.
- Every slice maps to at least one `MB-*` id and one calibration id.
- `Deferred or Rejected Ideas` is explicit rather than implied.
- `Open Questions` contains only bounded unknowns that still belong to Envision.
### Step 8: Design Review - `dispatch`
**Mission:** Stress-test the proposal without editing code or changing the
authoritative chain. This step is diagnose-only.
**Consumes:** `improvement-proposal.md`, `mission-brief.md`, `quality-calibration.md`, `stability-gate.md`
**Writes:** `${RUN_ROOT}/artifacts/design-review.md`
**Schema:** `Scope Reviewed`; `Review Coverage`; `Findings By Severity`;
`Recommended Additional Steps`; `Verdict`; `Ready Means`; `Reopen Recommendation`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-8/prompt-header.md`, state that the
worker may not modify source or authoritative artifacts, and use the shared
dispatch recipe.
**Gate:** `outputs_present`
- `Review Coverage` walks every `RQ-*` and every proposed `IP-*` slice.
- `Findings By Severity` cites exact `MB-*`, `QB-*`, `AP-*`, `MP-*`, or `RQ-*`
  ids and exact `SR-*` clauses.
- `Recommended Additional Steps` uses the exact table or explicit `NONE`.
- `Verdict` is exactly one of `ready`, `needs_more_exploration`, `retriage`.
- `Reopen Recommendation` is explicit `NONE` or records a governing issue and target.
### Step 9: Envision Ratchet - `dispatch`
**Mission:** Decide what survives Envision, admit or reject bounded extra work,
and publish the packet that downstream planning must obey.
**Consumes:** `improvement-proposal.md`, `design-review.md`, `mission-brief.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/envisioned-packet.md`
**Schema:** `Approved Direction`; `Slice Set`; `Calibration Mapping`;
`Rejected or Deferred Ideas`; `Injection Ledger` with `Budget Summary` and
`Injection Entries`; `Verdict`; `Ready Means`; `Reopen Decision`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-9/prompt-header.md`, reference the
shared injection protocol, and use the shared dispatch recipe. Any admitted
specs live under `${RUN_ROOT}/phases/step-9/injections/`.
**Gate:** `verdict-consistency`
- `ready` -> continue
- `needs_more_exploration` -> reopen `exploration-fanout`
- `retriage` -> reopen `triage-probes`
`ready` means the approved direction closes all critical/high design findings
and is concrete enough to plan without hidden assumptions.
`needs_more_exploration` means the blocker still belongs to Envision evidence
or comparison work. `retriage` means the blocker invalidates Triage assumptions
or calibration.
Checks:
- `Approved Direction` and `Slice Set` account for every `IP-*` item.
- `Injection Ledger` carries the full budget summary and per-injection rows.
- `Verdict`, `Ready Means`, and `Reopen Decision` agree with `design-review.md`.
- Any reopen uses the shared reopen invalidation protocol.
## Phase 4: Plan
### Step 10: Plan Synthesis - `synthesis`
**Mission:** Turn the approved direction into an executable batch plan with
verification, rollback, janitor, and risk boundaries made explicit.
**Consumes:** `envisioned-packet.md`, `mission-brief.md`, `quality-calibration.md`, `stability-gate.md`
**Writes:** `${RUN_ROOT}/artifacts/implementation-plan.md`
**Schema:** `Plan Thesis`; `Dependency Order`; `Candidate Batches`;
`Verification Strategy`; `Rollback Triggers`; `Janitor Checkpoints`;
`Calibration Mapping`; `Open Risks`.
**Gate:** `outputs_present`
- `Candidate Batches` assigns stable `PB-*` ids and clear boundaries.
- `Dependency Order` states real sequencing instead of implied prose.
- `Verification Strategy` and `Rollback Triggers` are per batch or by named shared command set.
- `Janitor Checkpoints` says when cleanup happens and what counts as residue.
### Step 11: Plan Review - `dispatch`
**Mission:** Audit the plan for execution safety, rollback honesty, and quality
alignment. This step is diagnose-only.
**Consumes:** `implementation-plan.md`, `mission-brief.md`, `quality-calibration.md`, `envisioned-packet.md`
**Writes:** `${RUN_ROOT}/artifacts/plan-review.md`
**Schema:** `Scope Reviewed`; `Review Coverage`; `Findings By Severity`;
`Recommended Additional Steps`; `Verdict`; `Ready Means`; `Reopen Recommendation`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-11/prompt-header.md`, state that
no code or authoritative artifact may be changed, and use the shared dispatch
recipe.
**Gate:** `outputs_present`
- `Review Coverage` walks every `RQ-*`, every `PB-*`, every rollback trigger,
  and every janitor checkpoint.
- `Findings By Severity` cites exact plan sections and exact `SR-*` clauses.
- `Recommended Additional Steps` uses the exact table or explicit `NONE`.
- `Verdict` is exactly one of `ready`, `re_envision`, `retriage`.
- `Reopen Recommendation` is explicit `NONE` or records a governing issue and target.
### Step 12: Plan Ratchet - `dispatch`
**Mission:** Freeze the executable charter that Execute must obey, including
batch order, domain skills, verification matrix, and reopen rules.
**Consumes:** `implementation-plan.md`, `plan-review.md`, `envisioned-packet.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/execution-charter.md`
**Schema:** `Charter Thesis`; `Ordered Batch Plan`; `Batch Definitions`;
`Verification Matrix`; `Janitor Integration`; `Rollback and Reopen Rules`;
`Domain Skills`; `Injection Ledger` with `Budget Summary` and `Injection Entries`;
`Verdict`; `Ready Means`; `Reopen Decision`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-12/prompt-header.md`, reference
the shared injection protocol, and use the shared dispatch recipe. Admitted
specs live under `${RUN_ROOT}/phases/step-12/injections/`.
**Gate:** `verdict-consistency`
- `ready` -> continue
- `re_envision` -> reopen `envision-ratchet`
- `retriage` -> reopen `triage-probes`
`ready` means the charter is ordered, scoped, verifiable, reversible, and
skill-bounded for unattended execution. `re_envision` means solution shape is
still wrong. `retriage` means mission framing or calibration has to be rebuilt.
Checks:
- `Ordered Batch Plan` uses these exact columns: `Order`, `Batch ID`,
  `Priority Tier`, `Goal`, `Depends On`, `Scope IDs`, `Verification Set IDs`,
  `Janitor Focus`, `Retry Budget`, `Rollback Trigger`, `Domain Skills`.
- `Batch Definitions` contains one subsection per named batch.
- `Domain Skills` obeys the autonomous skill ceiling.
- `Injection Ledger` records admitted, rejected, remaining, and per-injection results.
- `Verdict`, `Ready Means`, and `Reopen Decision` agree with `plan-review.md`.
## Phase 5: Execute
### Step 13: Execute Batches - `dispatch` via `manage-codex`
**Mission:** Execute the charter in deterministic batch order without
improvising a new sequence or silently expanding scope.
**Consumes:** `execution-charter.md`, `quality-calibration.md`, `stability-gate.md`, `mission-brief.md`
**Writes:** `${RUN_ROOT}/artifacts/execution-log.md`
**Schema:** `Charter Reference`; `Batch Order Applied`; `Batch Ledger`;
`Per-Batch Details`; `Janitor Passes`; `Scope Rejections`;
`Deferred or Reverted Batches`; `Aggregate Verification`.
**Adapter:** Use the shared `manage-codex` seam contract below. Step 13 derives
one batch root from each `Ordered Batch Plan` row, preserves charter order, and
runs janitor after each converged batch and before the next batch starts.
**Retry budget:** Per batch, use the charter's `Retry Budget` with a default
ceiling of 3. A batch retry is local to that batch, not permission to reorder
the rest of the plan.
**Gate:** `outputs_present`
- Every charter batch appears exactly once in `Batch Ledger`.
- Every per-batch detail names attempts, convergence verdict, janitor verdict,
  verification results, and final disposition.
- `Scope Rejections` explicitly lists any rejected scope expansion.
- `Deferred or Reverted Batches` separates intentional defers from revert-on-failure cases.
- `Aggregate Verification` summarizes command-set outcomes across the whole run.
### Step 14: Execution Audit - `dispatch`
**Mission:** Independently assess what Execute produced, including correctness,
residue, verification gaps, and slop. This step is diagnose-only.
**Consumes:** `execution-log.md`, `execution-charter.md`, `mission-brief.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/execution-audit.md`
**Schema:** `Scope Reviewed`; `Review Coverage`; `Findings By Severity`;
`Recommended Additional Steps`; `Verdict`; `Ready Means`; `Reopen Recommendation`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-14/prompt-header.md`, state that
the worker may not modify source or authoritative artifacts, and use the shared
dispatch recipe.
**Gate:** `outputs_present`
- `Review Coverage` walks every `RQ-*`, every batch goal, every must-preserve
  property, and every remaining execution obligation.
- `Findings By Severity` includes explicit sections for contract drift, residue,
  verification gaps, and slop audit.
- Every finding cites exact `MB-*`, `QB-*`, `AP-*`, `MP-*`, `RQ-*`, or batch ids
  plus exact `SR-*` clauses.
- `Recommended Additional Steps` uses the exact table or explicit `NONE`.
- `Verdict` is exactly one of `ready`, `partial`, `reopen_plan`.
- `Reopen Recommendation` is explicit `NONE` or records a governing issue and target.
### Step 15: Execution Ratchet - `dispatch` via `manage-codex`
**Mission:** Consume execution findings, repair only what belongs to Execute,
and publish the honest delivery packet for Finalize.
**Consumes:** `execution-log.md`, `execution-audit.md`, `execution-charter.md`, `quality-calibration.md`
**Writes:** `${RUN_ROOT}/artifacts/execution-report.md`
**Schema:** `Execution Summary`; `Findings Consumed`; `Repair Actions`;
`Injection Ledger` with `Budget Summary` and `Injection Entries`;
`Remaining Obligations`; `Verification Summary`; `Verdict`; `Ready Means`;
`Reopen Decision`.
**Adapter:** Use the shared `manage-codex` seam contract below. Step 15 derives
repair roots only from admitted repair batches or grouped execution findings.
It may not invent new product scope.
**Retry budget:** Maximum 2 repair attempts per child root.
**Gate:** `verdict-consistency`
- `ready` -> continue
- `partial` -> continue
- `reopen_plan` -> reopen `plan-ratchet`
`ready` means the charter converged without blocking execution findings and the
verification summary supports the delivered scope. `partial` means the mission
minimum shipped and every remaining obligation is non-blocking and explicit.
`reopen_plan` means execution evidence invalidated the charter's batch order,
scope boundaries, rollback model, or repair boundary.
Checks:
- `Findings Consumed` accounts for every audit finding and recommended step.
- `Repair Actions` names what changed or was explicitly refused.
- `Injection Ledger` carries the full budget summary and per-injection rows.
- `Remaining Obligations` is explicit; `partial` is invalid without it.
- Any reopen uses the shared reopen invalidation protocol and records archive details.
## Phase 6: Finalize
### Step 16: Final Review - `dispatch`
**Mission:** Decide whether the run is ship-ready, honestly partial, or still
blocked inside Execute. This step is diagnose-only and terminal.
**Consumes:** `mission-brief.md`, `quality-calibration.md`, `execution-report.md`, `execution-charter.md`
**Writes:** `${RUN_ROOT}/artifacts/final-review.md`
**Schema:** `Scope Reviewed`; `Review Coverage`; `Findings By Severity`;
`Deferred Debt`; `Blockers`; `Verdict`; `Ready Means`; `Reopen Decision`.
**Dispatch:** Write `${RUN_ROOT}/phases/step-16/prompt-header.md`, state that
no code or authoritative artifact may be changed, and use the shared dispatch
recipe. Finalize does not consume injections.
**Gate:** `verdict-reopen`
- `ship_ready` -> continue
- `partial` -> continue
- `reopen_execute` -> reopen `execution-ratchet`
`ship_ready` means no blocker remains, must-preserve properties still hold, and
the closeout packet can be published without misleading omission. `partial`
means the delivered scope is safe and truthful and only non-blocking debt
remains. `reopen_execute` means a named blocker still lives inside Execute or
its repair boundary.
Checks:
- `Review Coverage` walks every `RQ-*`, every `MP-*`, every batch goal, and every remaining obligation.
- `Findings By Severity`, `Deferred Debt`, and `Blockers` are separate sections.
- `Verdict` is exactly one of `ship_ready`, `partial`, `reopen_execute`.
- `Reopen Decision` records a governing issue and target when verdict is `reopen_execute`.
### Step 17: Closeout Packet - `synthesis`
**Mission:** Publish the truthful overnight handoff, the PR-ready summary, and
the deferred work surface without hiding partials or reopen state.
**Consumes:** `final-review.md`, `execution-report.md`, `mission-brief.md`, `quality-calibration.md`
**Writes:**
- `${RUN_ROOT}/artifacts/overnight-handoff.md`
- `${RUN_ROOT}/artifacts/pr-brief.md`
- `${RUN_ROOT}/artifacts/deferred-work.md`
**Schemas:**
- `overnight-handoff.md`: `Run Verdict`; `Scope Delivered`; `Verification Snapshot`; `Deferred or Reopened Work`; `Resume Notes`
- `pr-brief.md`: `Summary`; `Key Changes`; `Verification`; `Risks and Follow-Ups`
- `deferred-work.md`: `Deferred Items`; `Governing Issues`; `Recommended Next Method`
**Gate:** `outputs_present`
- All 3 closeout artifacts contain the promised section names.
- `Run Verdict` in `overnight-handoff.md` matches `final-review.md`.
- `deferred-work.md` includes every deferred item named by `final-review.md` or `execution-report.md`.
- `pr-brief.md` and `overnight-handoff.md` summarize the same delivered scope and verification snapshot.
## manage-codex Adapter Seam Contract
The method uses one shared `manage-codex` seam with step-specific charters.
Parent steps own the child roots and synthesize the canonical parent artifact.
### Common Child Root Layout
Use these parent-owned child roots:
- Step 3: `${RUN_ROOT}/phases/step-3/attempts/<attempt-id>`
- Step 13: `${RUN_ROOT}/phases/step-13/batches/<batch-id>`
- Step 15: `${RUN_ROOT}/phases/step-15/repairs/<repair-id>`
Every child root must contain:
- `CHARTER.md`
- `batch.json`
- `handoffs/handoff-converge.md`
- `handoffs/handoff-<last-slice-id>.md`
- `last-messages/last-message-manage-codex.txt`
And the parent creates:
- `archive/`
- `handoffs/`
- `last-messages/`
- `review-findings/`
### Shared Dispatch and Readback Contract
For every child root:
1. Write `CHARTER.md` from the authoritative parent packet.
2. Write `prompt-header.md` using the canonical header schema.
3. Derive `DOMAIN_SKILLS` from the child charter's `Domain Skills` section.
4. Dispatch from the child root with the shared dispatch recipe, replacing the
   skill string with `manage-codex` plus any domain skills, and writing the
   last message to `last-message-manage-codex.txt`.
5. Read back in this order:
   1. `handoffs/handoff-converge.md`
   2. `batch.json`
   3. `handoffs/handoff-<last-slice-id>.md`
If the last slice handoff is missing or clearly looks like review output, use
`batch.json` plus the convergence handoff to reconstruct the implementation
story instead of guessing from chat residue.
### Shared Failure Handling
- Missing `handoff-converge.md`: mark the child root `INVALID`, archive it, and
  retry only if budget remains.
- Malformed `batch.json`: mark the child root `INVALID`; if convergence is
  still enough for truthful synthesis, record the limitation, otherwise retry.
- Missing verification commands in `CHARTER.md`: treat this as a parent
  contract failure and reopen upstream instead of inventing commands.
- Out-of-scope edits: revert the whole attempt, record `SCOPE VIOLATION`, and
  reopen upstream if the problem repeats or invalidates the plan.
- Convergence verdict `ISSUES REMAIN`: retry locally only when the issue is
  narrow and fixable; reopen upstream when it invalidates scope, ordering, or mission framing.
- Inner `manage-codex` user escalation (slice attempt limit exceeded): treat as
  convergence `ISSUES REMAIN` for the parent step. The autonomous adapter must
  not pause for interactive input. Record the inner escalation in the parent
  artifact's `Deferred or Blocked Items` and apply the parent retry/reopen rule.
- Revert mechanism: every `manage-codex` dispatch must record the pre-dispatch
  commit SHA in the child `CHARTER.md` under `## Baseline Commit`. Revert means
  `git reset --hard <baseline-commit>` for the allowed file scope. The parent
  artifact records the reverted SHA and reason.
### Step 3 Additions
Each Step 3 `CHARTER.md` must contain:
- `Mission`
- `Baseline Issues`
- `Residue Items`
- `Allowed File Scope`
- `Verification Commands`
- `Domain Skills`
- `Baseline Restoration Rule`
- `Revert Rule`
Step 3 rules:
- Derive the attempt manifest from unresolved `BA-*` items in `baseline-audit.md`.
- Maximum 2 attempts total.
- Any verification failure reverts the entire attempt, never individual slices.
- Parent synthesis writes `stabilization-report.md` from all valid attempt roots.
### Step 13 Additions
Each row in `execution-charter.md` `Ordered Batch Plan` becomes exactly one
batch root. Execute batches in this order:
1. Ascending `Order`
2. Dependency-safe topological order from `Depends On`
3. Within the same dependency band: `FOUNDATION` before `STRUCTURAL` before `POLISH`
4. Remaining ties break lexically by `Batch ID`
Each Step 13 `CHARTER.md` must contain:
- `Mission`
- `Batch Identity`
- `Governing Charter References`
- `In-Scope Changes`
- `Out-Of-Scope Changes`
- `Allowed File Scope`
- `Verification Commands`
- `Domain Skills`
- `Janitor Rule`
- `Retry Trigger`
- `Revert Rule`
Step 13 rules:
- `Janitor Rule` says cleanup runs after a converged batch and before the next batch starts.
- Store janitor state under `${BATCH_ROOT}/janitor/`.
- Require a `Janitor Summary` with `Removed Residue`, `Verification`, `Remaining Concerns`, and `Verdict`.
- Retry a batch when convergence is locally fixable, janitor reports high-severity residue inside batch scope, or child output is invalid/incomplete.
- Revert the entire batch on verification failure or scope violation.
- After max attempts, mark the batch `REVERTED` and record the governing issue.
- Parent synthesis appends a normalized `Batch Ledger` row and a `Batch <id>`
  detail block into `execution-log.md`.
### Step 15 Additions
Each Step 15 `CHARTER.md` must contain:
- `Mission`
- `Governing Findings`
- `Allowed Repair Scope`
- `Verification Commands`
- `Domain Skills`
- `Remaining Obligations Boundary`
- `Revert Rule`
Step 15 rules:
- Derive one repair root per admitted repair batch or grouped execution finding.
- Maximum 2 attempts per repair root.
- Do not invent new product scope; only consume admitted execution findings.
- Parent synthesis writes `execution-report.md` from repair roots plus `execution-log.md`.
## Autonomous Step Injection Protocol
Injection is a ratchet-step-internal mechanism, not a topology mutation.
That means:
- Review steps may propose additional work.
- Only the immediately following ratchet step may admit or reject that work.
- No review step, external orchestrator, or hidden runtime loop may consume injections directly.
- Injected work never edits `method.yaml` and never creates new topology steps.
Triggering review artifacts:
- `stability-findings.md`
- `design-review.md`
- `plan-review.md`
- `execution-audit.md`
Required proposal table inside each triggering artifact:
- `Proposed ID`
- `Kind`
- `Governing Issue`
- `Why Direct Revision Is Insufficient`
- `Consumes`
- `Produces`
- `Expected Cost`
- `Severity`
Allowed `Kind` values:
- `evidence-probe`
- `comparison-pass`
- `repair-batch`
- `cleanup-pass`
- `retest-pass`
Admission rule inside a ratchet step:
- The governing issue is high or critical by `SR-*`.
- The proposed work stays inside the current phase boundary.
- The work needs fresh evidence or isolated execution, not editorial cleanup alone.
- The work has a named output artifact.
Materialization rule:
- Write admitted specs under `${RUN_ROOT}/phases/step-<ratchet-step>/injections/<nn>-<proposed-id>.md`.
- These files are relay state, not topology nodes.
- Execute them by highest severity first, then lower expected cost, then lexical `Proposed ID`.
Durable ledger contract inside every ratchet packet:
- `Injection Ledger`
- `Budget Summary` with `Admitted Count`, `Rejected Count`, `Remaining Budget`
- `Injection Entries` with `Injection ID`, `Governing Issue`, `Kind`, `Decision`, `Result`, `Evidence`
Ceilings:
- Hard ceiling: 3 admitted injections per phase
- Dispatch ceiling: at most 2 admitted dispatches per phase
- Injected work may not propose more injected work
Closure rule:
- Once the ratchet packet is written, injection closes for that phase.
- Unadmitted proposals become rejected ledger entries with result `not_admitted_before_phase_close`.
This is the key control mechanism that keeps the topology static while still
allowing bounded quality escalation.
## Reopen Invalidation Protocol
Any real reopen must invalidate downstream state before resume. This applies to
ratchet steps and to Step 16 when it emits `reopen_execute`.
### Archive Rule
When a step reopens upstream:
1. Compute an archive timestamp.
2. Create `${RUN_ROOT}/artifacts/archive/<timestamp>/`.
3. Move every non-archived downstream artifact produced after the reopen target into that archive directory.
4. Keep archived artifacts readable for audit, but never eligible for fresh-session resume.
### Marker Rule
Write `${RUN_ROOT}/artifacts/reopen-marker.md` with these exact sections:
- `Governing Issue`
- `Reopen Target`
- `Source Step`
- `Archived Artifacts`
- `Resume Instruction`
- `Marker Status`
Required content:
- `Governing Issue` names the issue id and summary.
- `Reopen Target` names the exact step id.
- `Source Step` names the step that emitted the reopen.
- `Archived Artifacts` lists every moved file.
- `Resume Instruction` says `resume from <step-id>`.
- `Marker Status` is `OPEN` until the target step produces a fresh passing artifact.
### Resume Rule
- A fresh session checks `reopen-marker.md` before any other artifact.
- If the marker exists and status is `OPEN`, resume from the marker target.
- Only non-archived artifacts count toward resume.
- When the reopened target completes successfully, archive the old marker beside
  the archived artifacts and clear the root marker.
The archive removes stale packets from the scan. The marker is the durable
pointer that keeps resume from drifting to a later but obsolete artifact.
## Artifact Chain Summary
```text
mission-brief.md
  -> baseline-audit.md
  -> quality-calibration.md
  -> improvement-backlog.md
  -> stabilization-report.md
  -> stability-findings.md
  -> stability-gate.md
  -> inside-out-digest.md
  -> outside-in-digest.md
  -> improvement-proposal.md
  -> design-review.md
  -> envisioned-packet.md
  -> implementation-plan.md
  -> plan-review.md
  -> execution-charter.md
  -> execution-log.md
  -> execution-audit.md
  -> execution-report.md
  -> final-review.md
  -> overnight-handoff.md
  -> pr-brief.md
  -> deferred-work.md
```
Promotion rules:
- `stability-gate.md` is the authoritative Stabilize packet.
- `envisioned-packet.md` supersedes `improvement-proposal.md`.
- `execution-charter.md` supersedes `implementation-plan.md`.
- `execution-report.md` supersedes `execution-log.md` for Finalize.
Supporting but non-canonical state:
- Relay handoffs under each step root
- `manage-codex` child roots and their `batch.json`
- Admitted injection specs under ratchet step relay directories
## Resume Awareness
Global order:
1. Check `${RUN_ROOT}/artifacts/reopen-marker.md`.
2. If it is `OPEN`, resume from the named target.
3. Otherwise scan non-archived artifacts in canonical chain order.
4. Resume from the first missing or gate-failing artifact.
5. For any `manage-codex` step, inspect child roots before deciding to rerun.
6. For any ratchet step, reconcile existing injection specs against the ledger before admitting more.
Phase notes:
- **Triage:** Step 2 is complete only when all 3 triage artifacts exist and
  pass gate. Missing workers rerun individually.
- **Stabilize:** Inspect `${RUN_ROOT}/phases/step-3/attempts/` before rerunning
  Step 3. If `stability-findings.md` exists but `stability-gate.md` does not,
  resume at Step 5 and reconcile any existing injections first.
- **Envision:** Treat `inside-out-digest.md` and `outside-in-digest.md` as a
  pair. If `design-review.md` exists but `envisioned-packet.md` does not,
  resume at Step 9 and reconcile its injection ledger before admitting more.
- **Plan:** If `implementation-plan.md` exists but `execution-charter.md` does
  not, continue at Step 11 or Step 12 based on the last valid artifact. Archived
  packets never satisfy resume.
- **Execute:** Reconcile batch roots into `execution-log.md` before rerunning
  Step 13. If `execution-audit.md` exists but `execution-report.md` does not,
  inspect `${RUN_ROOT}/phases/step-15/repairs/` before rerunning Step 15.
- **Finalize:** Never reuse an archived `final-review.md`. If any closeout
  artifact is missing, rerun Step 17 from the latest valid `final-review.md`
  and `execution-report.md`.
Fresh-session safety:
- Archived artifacts never satisfy resume.
- The reopen marker always outranks artifact order.
- Child-root state is inspected before a `manage-codex` rerun.
- Injection ledgers are reconciled before any new admissions.
## Circuit Breaker
Stop and redirect when:
- The same governing issue reopens the same upstream target twice.
- A phase exhausts its injection ceiling and a critical issue still cannot close.
- Execute exhausts retry budgets for multiple charter-critical batches.
- Build, test, or verify commands cannot be made explicit enough for honest verification.
- The request is really greenfield feature delivery, a major architecture
  choice, cleanup-only scope, or work that needs live user steering.
Redirects:
- Greenfield or substantial feature delivery -> `method:research-to-implementation`
- Architecture or protocol choice -> `method:decision-pressure-loop`
- Cleanup-only scope -> `method:janitor`
