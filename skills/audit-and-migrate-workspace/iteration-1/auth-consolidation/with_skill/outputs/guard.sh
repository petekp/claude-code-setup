#!/bin/bash
set -euo pipefail

# Migration Guard Script — Auth Consolidation & Test Migration
# Run this before and after every slice to verify invariants.
# Wire into CI: `npm run guard` or add as a pre-commit hook.

ERRORS=0

echo "=== Auth Consolidation Migration Guard ==="
echo ""

# --- Ratchet checks ---
# These budgets start at the current count and decrease as slices are completed.
# IMPORTANT: Only decrease budgets, never increase them.

check_ratchet() {
  local pattern="$1"
  local budget="$2"
  local label="$3"
  local include="$4"
  local count
  count=$(grep -rE "$pattern" src/ --include="$include" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt "$budget" ]; then
    echo "FAIL: $label — found $count (budget: $budget)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — $count/$budget"
  fi
}

echo "--- Ratchet Checks ---"

# Anti-pattern: inline jwt.verify in route files (initial budget: 8, one per route file)
check_ratchet 'jwt\.verify\(' 8 "Inline jwt.verify in API routes" "*.ts"

# Anti-pattern: snapshot assertions in test files (initial budget: estimated from 8 test files)
check_ratchet 'toMatchSnapshot\(\)' 24 "toMatchSnapshot assertions" "*.ts"
check_ratchet 'toMatchInlineSnapshot\(' 6 "toMatchInlineSnapshot assertions" "*.ts"

# Anti-pattern: direct jsonwebtoken import in route files (should only be in middleware)
check_ratchet "from ['\"]jsonwebtoken['\"]" 8 "Direct jsonwebtoken imports in routes" "*.ts"

# Anti-pattern: manual Authorization header parsing in routes (should be in middleware)
check_ratchet "req\.headers\[.authorization.\]" 8 "Manual Authorization header access in routes" "*.ts"
check_ratchet "req\.headers\.authorization" 8 "Manual Authorization header access (dot notation) in routes" "*.ts"

echo ""

# --- Denylist checks ---
# After a slice is completed, add patterns here to prevent reintroduction.
# Uncomment as slices are completed.

check_denylist() {
  local pattern="$1"
  local label="$2"
  local dir="$3"
  local count
  count=$(grep -rE "$pattern" "$dir" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "FAIL: $label — denylist pattern found ($count matches)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — clean"
  fi
}

echo "--- Denylist Checks ---"

# Uncomment after slice-002:
# check_denylist 'jwt\.verify' "jwt.verify in user routes" "src/api/users.ts"
# check_denylist 'jwt\.verify' "jwt.verify in profile route" "src/api/profile.ts"
# check_denylist 'jwt\.verify' "jwt.verify in settings route" "src/api/settings.ts"
# check_denylist 'toMatchSnapshot' "snapshots in user tests" "__tests__/api/users.test.ts"
# check_denylist 'toMatchSnapshot' "snapshots in profile tests" "__tests__/api/profile.test.ts"
# check_denylist 'toMatchSnapshot' "snapshots in settings tests" "__tests__/api/settings.test.ts"

# Uncomment after slice-003:
# check_denylist 'jwt\.verify' "jwt.verify in posts route" "src/api/posts.ts"
# check_denylist 'jwt\.verify' "jwt.verify in comments route" "src/api/comments.ts"
# check_denylist 'jwt\.verify' "jwt.verify in uploads route" "src/api/uploads.ts"
# check_denylist 'toMatchSnapshot' "snapshots in posts tests" "__tests__/api/posts.test.ts"
# check_denylist 'toMatchSnapshot' "snapshots in comments tests" "__tests__/api/comments.test.ts"
# check_denylist 'toMatchSnapshot' "snapshots in uploads tests" "__tests__/api/uploads.test.ts"

# Uncomment after slice-004:
# check_denylist 'jwt\.verify' "jwt.verify in admin route" "src/api/admin.ts"
# check_denylist 'jwt\.verify' "jwt.verify in webhooks route" "src/api/webhooks.ts"
# check_denylist 'toMatchSnapshot' "snapshots in admin tests" "__tests__/api/admin.test.ts"
# check_denylist 'toMatchSnapshot' "snapshots in webhooks tests" "__tests__/api/webhooks.test.ts"

# Uncomment after slice-005 (permanent guards):
# check_denylist 'jwt\.verify' "jwt.verify anywhere in src/api/" "src/api/"
# check_denylist 'toMatchSnapshot' "toMatchSnapshot anywhere in __tests__/" "__tests__/"
# check_denylist 'toMatchInlineSnapshot' "toMatchInlineSnapshot anywhere in __tests__/" "__tests__/"

echo "(denylist checks activate as slices complete — see comments in script)"
echo ""

# --- Deletion target checks ---
# Uncomment as slices complete and targets should be gone.

check_deleted() {
  local filepath="$1"
  if [ -e "$filepath" ]; then
    echo "FAIL: $filepath should have been deleted"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $filepath — confirmed deleted"
  fi
}

echo "--- Deletion Checks ---"

# Uncomment after slice-002:
# check_deleted "__tests__/__snapshots__/users.test.ts.snap"
# check_deleted "__tests__/__snapshots__/profile.test.ts.snap"
# check_deleted "__tests__/__snapshots__/settings.test.ts.snap"

# Uncomment after slice-003:
# check_deleted "__tests__/__snapshots__/posts.test.ts.snap"
# check_deleted "__tests__/__snapshots__/comments.test.ts.snap"
# check_deleted "__tests__/__snapshots__/uploads.test.ts.snap"

# Uncomment after slice-004:
# check_deleted "__tests__/__snapshots__/admin.test.ts.snap"
# check_deleted "__tests__/__snapshots__/webhooks.test.ts.snap"

# Uncomment after slice-005:
# check_deleted "__tests__/__snapshots__"

echo "(deletion checks activate as slices complete — see comments in script)"
echo ""

# --- Summary ---
if [ "$ERRORS" -gt 0 ]; then
  echo "=============================="
  echo "FAILED: $ERRORS guard violations"
  echo "=============================="
  exit 1
else
  echo "=============================="
  echo "All guards pass"
  echo "=============================="
  exit 0
fi
