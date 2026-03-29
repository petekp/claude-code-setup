# Review Worker

Diagnose only. Do not modify source.

Read `AGENTS.md`. Re-run verification yourself; do not trust prior reports.

Classify failures:
- real: assertion failures, logic bugs, lint or format drift
- `SANDBOX_LIMITED`: permission denied bind, `sandbox-exec`, manifest or file-access
  restrictions

Check:
- correctness, invalid input handling, empty states, and edge cases
- concurrency or shared-state risks
- operational boundaries, dependency direction, and API surface
- residue: dead code, stale docs, TODO, FIXME, HACK, or temporary scaffolding
- tests that miss behavior, error paths, or public-interface coverage
