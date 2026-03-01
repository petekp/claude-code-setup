#!/bin/bash
set -euo pipefail

# State Management Migration Guard Script
# Run this before and after every slice to verify invariants.
# Wire into CI or pre-commit hooks.

ERRORS=0
SRC_DIR="src"

# ============================================================
# RATCHET CHECKS
# Count anti-patterns and enforce budgets that can only decrease.
# ============================================================

check_ratchet() {
  local pattern="$1"
  local budget="$2"
  local label="$3"
  local file_types="${4:---include=*.ts --include=*.tsx}"
  local count
  count=$(grep -rE "$pattern" "$SRC_DIR" $file_types 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt "$budget" ]; then
    echo "FAIL: $label — found $count (budget: $budget)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — $count/$budget"
  fi
}

# --- Redux usage ratchets ---
# These budgets start at current counts and decrease as slices are completed.
# Update the budget number after each slice that reduces the count.

check_ratchet "from 'react-redux'"                12 "react-redux imports" "--include=*.ts --include=*.tsx"
check_ratchet "from '@reduxjs/toolkit'"            12 "@reduxjs/toolkit imports" "--include=*.ts --include=*.tsx"
check_ratchet "useSelector\("                      36 "useSelector calls (est. 3 per slice)" "--include=*.ts --include=*.tsx"
check_ratchet "useDispatch\("                      24 "useDispatch calls (est. 2 per slice)" "--include=*.ts --include=*.tsx"
check_ratchet "createSlice\("                      12 "createSlice definitions" "--include=*.ts"
check_ratchet "createAsyncThunk\("                  8 "createAsyncThunk definitions (est.)" "--include=*.ts"
check_ratchet "connect\("                           4 "connect() HOC usage (est. legacy components)" "--include=*.ts --include=*.tsx"

# --- Context API usage ratchets ---
check_ratchet "createContext\("                     6 "createContext calls" "--include=*.ts --include=*.tsx"
check_ratchet "useContext\("                       18 "useContext calls (est. 3 per provider)" "--include=*.ts --include=*.tsx"
check_ratchet "\.Provider value="                   6 "Context Provider JSX elements" "--include=*.tsx"

# ============================================================
# DENYLIST CHECKS
# Patterns that must NOT appear after their owning slice is complete.
# Uncomment as slices are completed.
# ============================================================

check_denylist() {
  local pattern="$1"
  local label="$2"
  local count
  count=$(grep -rE "$pattern" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "FAIL: $label — denylist pattern found ($count matches)"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $label — clean"
  fi
}

# Uncomment these as slices complete:
# --- After slice-004 (ThemeContext) ---
# check_denylist "import.*from.*contexts/ThemeContext" "ThemeContext imports"
# check_denylist "ThemeContext\.Provider" "ThemeContext.Provider usage"

# --- After slice-005 (LocaleContext) ---
# check_denylist "import.*from.*contexts/LocaleContext" "LocaleContext imports"
# check_denylist "LocaleContext\.Provider" "LocaleContext.Provider usage"

# --- After slice-006 (NotificationContext) ---
# check_denylist "import.*from.*contexts/NotificationContext" "NotificationContext imports"
# check_denylist "NotificationContext\.Provider" "NotificationContext.Provider usage"

# --- After slice-007 (ModalContext) ---
# check_denylist "import.*from.*contexts/ModalContext" "ModalContext imports"
# check_denylist "ModalContext\.Provider" "ModalContext.Provider usage"

# --- After slice-008 (AuthContext) ---
# check_denylist "import.*from.*contexts/AuthContext" "AuthContext imports"
# check_denylist "AuthContext\.Provider" "AuthContext.Provider usage"

# --- After slice-009 (FeatureFlagContext) ---
# check_denylist "import.*from.*contexts/FeatureFlagContext" "FeatureFlagContext imports"
# check_denylist "FeatureFlagContext\.Provider" "FeatureFlagContext.Provider usage"

# --- After slice-010 (Provider tree removal) ---
# check_denylist "import.*from.*contexts/index" "contexts barrel import"
# check_denylist "AppProviders" "AppProviders reference"

# --- After slice-011 (searchSlice) ---
# check_denylist "import.*from.*redux/slices/searchSlice" "searchSlice imports"

# --- After slice-012 (alertsSlice) ---
# check_denylist "import.*from.*redux/slices/alertsSlice" "alertsSlice imports"

# --- After slice-013 (uiSlice) ---
# check_denylist "import.*from.*redux/slices/uiSlice" "uiSlice imports"

# --- After slice-014 (settingsSlice) ---
# check_denylist "import.*from.*redux/slices/settingsSlice" "settingsSlice imports"

# --- After slice-015 (productsSlice) ---
# check_denylist "import.*from.*redux/slices/productsSlice" "productsSlice imports"

# --- After slice-016 (cartSlice) ---
# check_denylist "import.*from.*redux/slices/cartSlice" "cartSlice imports"

# --- After slice-017 (ordersSlice) ---
# check_denylist "import.*from.*redux/slices/ordersSlice" "ordersSlice imports"

# --- After slice-018 (userSlice) ---
# check_denylist "import.*from.*redux/slices/userSlice" "userSlice imports"

# --- After slice-019 (formsSlice) ---
# check_denylist "import.*from.*redux/slices/formsSlice" "formsSlice imports"

# --- After slice-020 (dashboardSlice) ---
# check_denylist "import.*from.*redux/slices/dashboardSlice" "dashboardSlice imports"

# --- After slice-021 (navigationSlice) ---
# check_denylist "import.*from.*redux/slices/navigationSlice" "navigationSlice imports"

# --- After slice-022 (Redux infrastructure removal) ---
# check_denylist "import.*from.*redux/" "any redux/ imports"
# check_denylist "from 'react-redux'" "react-redux package import"
# check_denylist "from '@reduxjs/toolkit'" "@reduxjs/toolkit package import"
# check_denylist "useSelector" "useSelector usage"
# check_denylist "useDispatch" "useDispatch usage"
# check_denylist "createSlice" "createSlice usage"
# check_denylist "configureStore" "configureStore usage"
# check_denylist "<Provider store=" "Redux Provider JSX"

# ============================================================
# DELETION TARGET CHECKS
# Files that must be physically gone after their owning slice completes.
# Uncomment as slices complete.
# ============================================================

check_deleted() {
  local filepath="$1"
  if [ -e "$filepath" ]; then
    echo "FAIL: $filepath should have been deleted"
    ERRORS=$((ERRORS + 1))
  else
    echo "OK:   $filepath — deleted"
  fi
}

# Uncomment as slices complete:
# --- After slice-004 ---
# check_deleted "src/contexts/ThemeContext.tsx"
# check_deleted "src/contexts/ThemeContext.test.tsx"

# --- After slice-005 ---
# check_deleted "src/contexts/LocaleContext.tsx"
# check_deleted "src/contexts/LocaleContext.test.tsx"

# --- After slice-006 ---
# check_deleted "src/contexts/NotificationContext.tsx"
# check_deleted "src/contexts/NotificationContext.test.tsx"

# --- After slice-007 ---
# check_deleted "src/contexts/ModalContext.tsx"
# check_deleted "src/contexts/ModalContext.test.tsx"

# --- After slice-008 ---
# check_deleted "src/contexts/AuthContext.tsx"
# check_deleted "src/contexts/AuthContext.test.tsx"

# --- After slice-009 ---
# check_deleted "src/contexts/FeatureFlagContext.tsx"
# check_deleted "src/contexts/FeatureFlagContext.test.tsx"

# --- After slice-010 ---
# check_deleted "src/contexts/index.ts"
# check_deleted "src/providers/AppProviders.tsx"

# --- After slice-022 ---
# check_deleted "src/redux/store.ts"
# check_deleted "src/redux/rootReducer.ts"
# check_deleted "src/redux/middleware/analytics.ts"
# check_deleted "src/redux/middleware/index.ts"
# check_deleted "src/redux/types.ts"
# check_deleted "src/redux/hooks.ts"
# check_deleted "src/redux/index.ts"
# check_deleted "src/test-utils/renderWithRedux.tsx"
# check_deleted "src/test-utils/mockStore.ts"

# ============================================================
# UNMAPPED FILE CHECK
# Every file in migration-relevant directories must appear in MAP.csv
# ============================================================

check_unmapped() {
  local dir="$1"
  local map_file="MAP.csv"

  if [ ! -d "$dir" ]; then
    return
  fi

  if [ ! -f "$map_file" ]; then
    echo "WARN: MAP.csv not found, skipping unmapped file check"
    return
  fi

  local unmapped=0
  while IFS= read -r -d '' file; do
    local relpath="${file#./}"
    if ! grep -q "$relpath" "$map_file" 2>/dev/null; then
      echo "WARN: Unmapped file: $relpath"
      unmapped=$((unmapped + 1))
    fi
  done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 2>/dev/null)

  if [ "$unmapped" -gt 0 ]; then
    echo "WARN: $unmapped files in $dir not listed in MAP.csv"
  fi
}

check_unmapped "src/redux"
check_unmapped "src/contexts"

# ============================================================
# SUMMARY
# ============================================================

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS guard violations"
  exit 1
else
  echo "All guards pass"
  exit 0
fi
