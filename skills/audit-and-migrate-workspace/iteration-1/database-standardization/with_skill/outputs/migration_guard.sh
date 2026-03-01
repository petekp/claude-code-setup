#!/bin/bash
set -euo pipefail

# Migration Guard Script — Django ORM Standardization
# Run this in CI and before closing any slice.
# Usage: ./scripts/migration_guard.sh [--status]
#
# --status: Show current counts without failing (progress tracking mode)

STATUS_ONLY=false
if [[ "${1:-}" == "--status" ]]; then
  STATUS_ONLY=true
fi

ERRORS=0
SRC_DIR="."  # Adjust to your project root

# --- Ratchet checks ---
# Each ratchet has a budget equal to the current count at audit time.
# Budgets can only decrease. When a budget hits 0, convert to a denylist.

check_ratchet() {
  local pattern="$1"
  local budget="$2"
  local label="$3"
  local include_pattern="${4:---include=*.py}"
  local count
  count=$(grep -rE "$pattern" "$SRC_DIR" $include_pattern \
    --exclude-dir='.venv' \
    --exclude-dir='__pycache__' \
    --exclude-dir='.git' \
    --exclude-dir='migrations' \
    --exclude='migration_guard.sh' \
    -l 2>/dev/null | wc -l | tr -d ' ')

  if [ "$STATUS_ONLY" = true ]; then
    echo "RATCHET: $label — $count/$budget"
  elif [ "$count" -gt "$budget" ]; then
    echo "FAIL: $label — found $count files (budget: $budget)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — $count/$budget"
  fi
}

echo "=== RATCHET CHECKS ==="
echo ""

# Raw SQL patterns — budgets set from initial audit
# These numbers are placeholders — S-001 audit will set exact values
check_ratchet 'cursor\.execute\s*\(' 32 "Files with cursor.execute()"
check_ratchet 'connection\.cursor\s*\(' 28 "Files with connection.cursor()"
check_ratchet '\.extra\s*\(' 5 "Files with .extra() calls"
check_ratchet '\.raw\s*\(' 3 "Files with .raw() calls (note: some may be intentional post-migration)"
check_ratchet 'RawSQL\s*\(' 2 "Files with RawSQL() expressions"

# SQLAlchemy patterns
check_ratchet 'from\s+sqlalchemy|import\s+sqlalchemy' 3 "Files importing SQLAlchemy"
check_ratchet 'session\.query\s*\(' 3 "Files with session.query()"
check_ratchet 'session\.execute\s*\(' 3 "Files with session.execute()"

echo ""
echo "=== DENYLIST CHECKS ==="
echo ""

# Denylist patterns — these must have ZERO matches.
# Add patterns here as slices complete.

check_denylist() {
  local pattern="$1"
  local label="$2"
  local count
  count=$(grep -rE "$pattern" "$SRC_DIR" --include="*.py" \
    --exclude-dir='.venv' \
    --exclude-dir='__pycache__' \
    --exclude-dir='.git' \
    --exclude-dir='migrations' \
    --exclude='migration_guard.sh' \
    2>/dev/null | wc -l | tr -d ' ')

  if [ "$STATUS_ONLY" = true ]; then
    if [ "$count" -gt 0 ]; then
      echo "DENYLIST: $label — $count matches (should be 0)"
    else
      echo "DENYLIST: $label — clean"
    fi
  elif [ "$count" -gt 0 ]; then
    echo "FAIL: $label — denylist pattern found ($count matches)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — clean"
  fi
}

# Add denylist patterns as slices complete:
# check_denylist 'from utils\.sql_helpers' "sql_helpers imports (removed in S-051)"
# check_denylist 'from api\.sa_models' "sa_models imports (removed in S-050)"
# check_denylist 'from api\.sa_session' "sa_session imports (removed in S-050)"
# check_denylist 'SQLALCHEMY_DATABASE_URI' "SQLAlchemy config (removed in S-050)"

echo ""
echo "=== DELETION TARGET CHECKS ==="
echo ""

# Deletion targets — files that should not exist after their owning slice completes.

check_deleted() {
  local filepath="$1"
  local label="$2"

  if [ "$STATUS_ONLY" = true ]; then
    if [ -e "$filepath" ]; then
      echo "DELETE TARGET: $label — still exists"
    else
      echo "DELETE TARGET: $label — deleted"
    fi
  elif [ -e "$filepath" ]; then
    echo "FAIL: $label should have been deleted"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — deleted"
  fi
}

# Add deletion targets as slices complete:
# check_deleted "api/sa_models.py" "SA models file (S-050)"
# check_deleted "api/sa_session.py" "SA session file (S-050)"
# check_deleted "utils/sql_helpers.py" "SQL helpers file (S-051)"

echo ""
echo "=== UNMAPPED FILE CHECK ==="
echo ""

# Check that all Python files containing database access patterns
# are listed in MAP.csv. This prevents files from slipping through.
# Uncomment and adapt once MAP.csv is populated by S-001.

# UNMAPPED=0
# while IFS= read -r file; do
#   if ! grep -q "$file" .claude/migration/MAP.csv 2>/dev/null; then
#     echo "FAIL: $file contains DB access but is not in MAP.csv"
#     UNMAPPED=$((UNMAPPED + 1))
#   fi
# done < <(grep -rlE 'cursor\.execute|connection\.cursor|\.raw\(|\.extra\(|RawSQL|from sqlalchemy|session\.query' \
#   "$SRC_DIR" --include="*.py" \
#   --exclude-dir='.venv' --exclude-dir='__pycache__' --exclude-dir='.git' --exclude-dir='migrations' \
#   2>/dev/null)
#
# if [ "$UNMAPPED" -gt 0 ]; then
#   ERRORS=$((ERRORS + "$UNMAPPED"))
# else
#   echo "OK:   All DB-access files are mapped"
# fi

echo "(Uncomment after S-001 audit populates MAP.csv)"

# --- Summary ---
echo ""
if [ "$STATUS_ONLY" = true ]; then
  echo "Status check complete (no pass/fail enforcement)"
  exit 0
elif [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS guard violations"
  exit 1
else
  echo "All guards pass"
  exit 0
fi
