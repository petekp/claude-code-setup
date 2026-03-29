# Agent Feedback Loop

## Hook mapping
- **PostToolUse (Write/Edit):** Runs `verify.sh --layers 1` and caches the Layer 1 report. Violations are merged into the agent context before the next tool call.
- **Slice checkpoints:** Trigger `verify.sh --layers 1,2`, ensuring both structural facts and behavioral specs stay healthy before the next milestone.
- **Pre-commit:** Runs all three layers plus elegance grading. Cached results skip unchanged layers unless `--since-checkpoint` detects new file changes.

## Violation outputs
- **Agent-facing format:** Each violation includes:
  - `Counterexample`: module/file/line triggering the constraint.
  - `Diagnosis`: why the constraint fails.
  - `Fix suggestion`: targeted steps (e.g., “Move this call into `RuntimeClient` and add a test”).
- **Human-facing format:** Same counterexample + diagnosis but no fix suggestion, keeping the tone informative without instructing other engineers.

## Escalation policy
1. Agent receives violation, attempts fix, and reruns `verify.sh`.
2. If violation persists, agent retries up to three times, logging each attempt and what changed.
3. After three failed attempts, escalation message is composed:
   - Original violation + fixation attempts
   - Why each attempt failed (differences between expected vs actual results)
   - Hypothesized blockers (e.g., missing spec, conflicting rule)
   - Request for human review if architecture changed intentionally

Escalation intentionally restarts from the second failure so human context includes trending attempts.

## Hook configuration
- The PostToolUse hook emits `/verify --layers 1 --since-checkpoint` after edits.
- Slice and pre-commit hooks run `verify.sh` with the appropriate `--layers` flag and `--json` output to integrate with tooling.
- Hook scripts update `.verifier/reports/last-run.json` with timestamps, so `--since-checkpoint` can skip unchanged layers by comparing file mtimes.
