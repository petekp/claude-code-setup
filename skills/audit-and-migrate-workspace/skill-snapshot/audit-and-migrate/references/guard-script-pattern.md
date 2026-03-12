# Guard Script Pattern

The guard script is a CI-enforced gate that mechanically checks migration invariants. Write it to fit your project's CI setup and language ecosystem.

## What It Must Check

### 1. Unmapped Files
Every file in the migration domain must appear in MAP.csv. If a file exists in the target directories but isn't in the map, the guard fails. This prevents files from slipping through the cracks during migration.

### 2. Denylist Violations
For each completed slice, check its `denylist_patterns` against the codebase. If any pattern matches, the guard fails. This catches reintroduction of removed code — a common failure mode where agents or developers accidentally re-create something that was deliberately eliminated.

### 3. Incomplete Deletions
For each slice marked `done`, check that all its `deletion_targets` are physically gone. Not commented out, not behind a feature flag — gone. If any target still exists, the guard fails.

### 4. Ratchet Budgets
For each anti-pattern ratchet, count current instances and compare against the budget. If count > budget, the guard fails.

## Example Structure

```bash
#!/bin/bash
set -euo pipefail

ERRORS=0

# --- Ratchet checks ---
check_ratchet() {
  local pattern="$1"
  local budget="$2"
  local label="$3"
  local count
  count=$(grep -rE "$pattern" src/ --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt "$budget" ]; then
    echo "FAIL: $label — found $count (budget: $budget)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — $count/$budget"
  fi
}

# Add one line per anti-pattern:
check_ratchet 'source\.contains\(' 43 "source.contains assertions"
check_ratchet 'Task\.sleep\('      17 "Task.sleep in tests"

# --- Denylist checks ---
check_denylist() {
  local pattern="$1"
  local label="$2"
  local count
  count=$(grep -rE "$pattern" src/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "FAIL: $label — denylist pattern found ($count matches)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — clean"
  fi
}

# Add one line per removed surface:
# check_denylist 'import.*from.*old-utils' "old-utils imports"

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

```bash
# At the top of the script, after set -euo pipefail:
STATUS_MODE=false
if [ "${1:-}" = "--status" ]; then
  STATUS_MODE=true
fi

# In check_ratchet, replace the failure branch:
if [ "$count" -gt "$budget" ]; then
  if [ "$STATUS_MODE" = true ]; then
    echo "OVER: $label — $count/$budget (+$((count - budget)))"
  else
    echo "FAIL: $label — found $count (budget: $budget)"
    ERRORS=$((ERRORS + 1))
  fi
```

Usage: `./guard.sh --status` at session start to see the lay of the land without failing.

## Implementation Notes

- Use grep/ripgrep for pattern matching — fast and available everywhere
- Store budgets directly in the script or in a config file (JSON, YAML, shell variables)
- Exit non-zero on any failure — CI systems interpret this as a failed check
- Print clear messages about what failed and why — agents use this output to understand what needs fixing
- The script must be idempotent — running it twice produces the same result
