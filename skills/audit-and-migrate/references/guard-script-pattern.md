# Guard Script Pattern

The guard script is a CI-enforced gate that mechanically checks migration invariants. Write it to fit your project's CI setup and language ecosystem.

Treat the guard as an execution layer for the control plane, not a separate handwritten checklist. When possible, derive denylist patterns, deletion targets, residue queries, and ratchet budgets from versioned migration artifacts instead of maintaining duplicate lists by hand. In particular, `RATCHETS.yaml` should be the source of truth for anti-pattern budgets and scopes.

## What It Must Check

### 1. Unmapped Files
Every file in the migration domain must appear in MAP.csv. If a file exists in the target directories but isn't in the map, the guard fails. This prevents files from slipping through the cracks during migration.

### 2. Denylist Violations
For each completed slice, check its `denylist_patterns` against the codebase. If any pattern matches, the guard fails. This catches reintroduction of removed code — a common failure mode where agents or developers accidentally re-create something that was deliberately eliminated.

### 3. Incomplete Deletions
For each slice marked `done`, check that all its `deletion_targets` are physically gone. Not commented out, not behind a feature flag — gone. If any target still exists, the guard fails.

### 4. Ratchet Budgets
For each anti-pattern ratchet, count current instances and compare against the budget. If count > budget, the guard fails.

### 5. Residue Queries
For each completed slice, run its `residue_queries`. These are targeted searches for stale names, temporary flags, migration TODO markers, debug logs, or other residue that should be at zero after the slice is complete.

### 6. Temporary Artifact Sweep
Check for migration-only scratch files and helpers that should not survive to ship: backup files, `old/new/final` copies, temporary adapters, or one-off scripts with an expiry that has passed.

## Example Structure

```bash
#!/bin/bash
set -euo pipefail

STATUS_MODE=false
if [ "${1:-}" = "--status" ]; then
  STATUS_MODE=true
fi

ERRORS=0
SEARCH_ROOTS=(src test docs scripts config)

count_matches() {
  local pattern="$1"
  rg -n --hidden \
    --glob '!node_modules' \
    --glob '!dist' \
    --glob '!build' \
    "$pattern" "${SEARCH_ROOTS[@]}" 2>/dev/null | wc -l | tr -d ' '
}

# --- Ratchet checks ---
check_ratchet() {
  local pattern="$1"
  local budget="$2"
  local label="$3"
  local count
  count=$(count_matches "$pattern")
  if [ "$count" -gt "$budget" ]; then
    if [ "$STATUS_MODE" = true ]; then
      echo "OVER: $label — $count/$budget (+$((count - budget)))"
    else
      echo "FAIL: $label — found $count (budget: $budget)"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "OK:   $label — $count/$budget"
  fi
}

# Add one line per anti-pattern. In real projects, generate or source these
# from RATCHETS.yaml rather than hardcoding them inline:
check_ratchet 'source\.contains\(' 43 "source.contains assertions"
check_ratchet 'Task\.sleep\('      17 "Task.sleep in tests"

# --- Zero-match checks (denylist + residue) ---
check_zero_matches() {
  local pattern="$1"
  local label="$2"
  local count
  count=$(count_matches "$pattern")
  if [ "$count" -gt 0 ]; then
    if [ "$STATUS_MODE" = true ]; then
      echo "FOUND: $label — $count matches"
    else
      echo "FAIL: $label — found $count matches"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo "OK:   $label — clean"
  fi
}

# Add one line per removed surface or residue query. In real projects, derive
# these from completed slices in SLICES.yaml or generated shell vars:
# check_zero_matches 'import.*from.*old-utils' "old-utils imports"
# check_zero_matches 'TODO\(migration\)' "migration TODO markers"

# --- Deletion target checks ---
check_deleted() {
  local filepath="$1"
  if [ -e "$filepath" ]; then
    echo "FAIL: $filepath should have been deleted"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $filepath — deleted"
  fi
}

# Add one line per deletion target:
# check_deleted "src/old-auth/middleware.ts"

# --- Temporary artifact checks ---
# check_zero_matches '(^|/).*(old|new|final|backup)\.(ts|js|py|md)$' "backup or scratch files"

# --- Summary ---
if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "FAILED: $ERRORS guard violations"
  exit 1
else
  echo ""
  echo "All guards pass"
  exit 0
fi
```

## Status Mode

Add a `--status` flag that shows current counts vs budgets without failing. This is invaluable for tracking progress and calibrating budgets at the start of Phase 2.

Usage: `./guard.sh --status` at session start to see the lay of the land without failing.

## Implementation Notes

- Use ripgrep with explicit search roots and ignored directories
- Store budgets and zero-match patterns in a single versioned source of truth when possible
- Prefer `RATCHETS.yaml` for budgets/scopes and `SLICES.yaml` for denylist/deletion/residue checks
- Count exact matches, not matching files
- Search the actual migration scope; don't hard-code `src/*.ts` unless that is truly the full scope
- Exit non-zero on any failure — CI systems interpret this as a failed check
- Print clear messages about what failed and why — agents use this output to understand what needs fixing
- The script must be idempotent — running it twice produces the same result
