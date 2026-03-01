# State Management Migration Audit

**Date:** 2026-03-01
**Auditor:** Claude (audit-and-migrate skill)
**Scope:** All client-side state management — Redux, Context API, Zustand

---

## Method

This audit was conducted based on the described codebase topology rather than direct code analysis. The codebase reportedly contains:

- **12 Redux feature slices** — the oldest state management layer
- **6 Context API providers** — middle-era code with nested composition
- **4 Zustand stores** — the newest features, representing the target pattern

The audit inventories the known surface area, estimates anti-pattern counts based on typical Redux/Context codebases of this size, and proposes a migration plan. Once the actual codebase is available, the first action should be running the guard script to calibrate the ratchet budgets with real counts.

**Grep patterns to run on the actual codebase (calibration step):**

```bash
# Redux surface area
grep -rE "from 'react-redux'" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "from '@reduxjs/toolkit'" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "useSelector\(" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "useDispatch\(" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "createSlice\(" src/ --include="*.ts" -c
grep -rE "createAsyncThunk\(" src/ --include="*.ts" -c
grep -rE "connect\(" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "mapStateToProps" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "mapDispatchToProps" src/ --include="*.ts" --include="*.tsx" -c

# Context API surface area
grep -rE "createContext\(" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "useContext\(" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "\.Provider value=" src/ --include="*.tsx" -c

# Zustand surface area (reference — these grow, not shrink)
grep -rE "from 'zustand'" src/ --include="*.ts" -c
grep -rE "create\(" src/stores/ --include="*.ts" -c

# Cross-cutting concerns
grep -rE "redux-persist" src/ --include="*.ts" --include="*.tsx" -c
grep -rE "redux-thunk" src/ --include="*.ts" -c
grep -rE "middleware" src/redux/ --include="*.ts" -c
```

---

## Current Metrics (Estimated)

These are estimates based on 12 Redux slices, 6 Context providers, and typical usage patterns. **Replace with actual counts before beginning migration.**

| Anti-Pattern | Grep Pattern | Estimated Count | Problem |
|---|---|---|---|
| react-redux imports | `from 'react-redux'` | ~12 | Direct coupling to Redux ecosystem |
| @reduxjs/toolkit imports | `from '@reduxjs/toolkit'` | ~12 | RTK dependency in feature code |
| useSelector calls | `useSelector\(` | ~36 | Redux state subscription points |
| useDispatch calls | `useDispatch\(` | ~24 | Redux dispatch points |
| createSlice definitions | `createSlice\(` | 12 | Redux slice definitions |
| createAsyncThunk definitions | `createAsyncThunk\(` | ~8 | Async Redux actions |
| connect() HOC usage | `connect\(` | ~4 | Legacy class component connections |
| createContext calls | `createContext\(` | 6 | Context definitions to eliminate |
| useContext calls | `useContext\(` | ~18 | Context consumption points |
| Provider JSX elements | `\.Provider value=` | 6 | Provider tree nodes |

**Total estimated touch points: ~138**

---

## Leverage Assessment

### High Leverage (keep and expand)

- **4 existing Zustand stores** — These are the reference implementations. Study their patterns before migrating anything. They define the target architecture.
- **Existing test suites** — All existing tests are invariants. They must keep passing. They are the safety net.
- **Analytics event catalog** — The set of analytics events the Redux middleware fires is valuable domain knowledge. Extract it before touching the middleware.

### Medium Leverage (keep but refactor)

- **Redux selectors** — The selector logic (data derivations, memoization) is valuable. The `createSelector` calls need to become Zustand selectors, but the derivation logic itself is reusable.
- **Context consumer hooks** (e.g., `useAuth`, `useTheme`) — The hook interfaces are good API contracts. Keep the hook names and signatures; change the implementation from `useContext` to Zustand store subscription.
- **Redux async thunks** — The async logic (API calls, error handling) is valuable. It needs to move from thunks to Zustand actions, but the logic doesn't change.

### Low Leverage (replace)

- **Redux store configuration** (`configureStore`, `rootReducer`) — Infrastructure that's deleted once all slices are migrated.
- **Redux middleware stack** — Custom analytics middleware is replaced by Zustand middleware. Any logging/error middleware should be evaluated for elimination or Zustand equivalent.
- **Context Provider composition tree** — The nested `<AuthProvider><ThemeProvider><LocaleProvider>...</LocaleProvider></ThemeProvider></AuthProvider>` pattern is eliminated entirely. Zustand stores don't need provider wrapping.
- **Redux type infrastructure** (`RootState`, `AppDispatch`, typed hooks) — Replaced by individual Zustand store types.
- **`connect()` HOC usage** — Legacy pattern from class components. Any components using `connect()` need minimal conversion to hooks.
- **`renderWithRedux` test utility** — Replaced by the new `renderWithStores` utility.

---

## Hard Conclusions

1. **The three-system state is actively harmful.** Every new developer has to learn when to use Redux vs. Context vs. Zustand. There's no documented decision boundary. This consolidation is not premature optimization — it's overdue hygiene.

2. **The Context provider nesting is a hidden dependency graph.** Nested composition means provider order matters and inner providers can access outer providers' state. This is implicit coupling that's invisible in the import graph. When migrating to Zustand, these dependencies must become explicit cross-store reads. The risk here is higher than it looks on the surface.

3. **The Redux analytics middleware is the hardest single piece.** It intercepts action dispatch globally and maps action types to analytics events. Zustand doesn't have a global dispatch — each store is independent. The replacement must fire the exact same events with the exact same payloads, or analytics data continuity breaks. This needs a dedicated slice (slice-001) with replay testing.

4. **`connect()` usage is tech debt within the tech debt.** Any class components using `connect()` need at minimum a conversion to function components with hooks before they can use Zustand. This is a pre-requisite that could surprise you mid-slice. Audit these components early.

5. **Cross-slice Redux selectors are a hidden coupling risk.** If any Redux selectors compose state from multiple slices (e.g., a cart selector that reads product state to compute totals), the migration order matters. These selectors need to become cross-store Zustand subscriptions, and the source store must be migrated first.

6. **The Context-to-Redux bridge may already exist.** Some middle-era code may read from Context inside Redux thunks or vice versa. This cross-system coupling is the most fragile part of the migration. Grep for Context hook usage inside Redux files and Redux hook usage inside Context files.

---

## Guardrails Added

1. **Guard script** (`guard.sh`) — Checks ratchet budgets, denylist violations, deletion targets, and unmapped files. Run before and after every slice.

2. **Ratchet budgets** — 10 anti-pattern ratchets initialized at estimated counts. Budgets must be calibrated with real grep counts before starting migration.

3. **Denylist patterns** — Pre-written for all 23 slices. Uncommented in the guard script as each slice completes. Prevents reintroduction of migrated-away patterns.

4. **Deletion target registry** — Every file to be deleted is pre-registered in SLICES.yaml. The guard script verifies physical deletion after slice completion.

5. **MAP.csv file tracking** — Every file in the migration domain is tracked with its current path, target path, and owning slice.

---

## Proposed Slices

23 slices across 4 phases:

**Phase A: Infrastructure (slices 001-003)**
Build the Zustand middleware, devtools integration, and test utilities that all subsequent slices depend on. No production code deleted in this phase — it's all additive.

**Phase B: Context API (slices 004-010)**
Migrate all 6 Context providers to Zustand stores, then remove the provider composition tree. These are simpler (no middleware concerns) and fewer in number. Several can be parallelized (004, 005, 006, 007 are independent leaf contexts). Auth (008) and FeatureFlags (009) are riskier due to broad consumption.

**Phase C: Redux (slices 011-021)**
Migrate all 12 Redux feature slices to Zustand. Ordered leaf-to-root based on cross-slice dependencies. Each slice deletes the Redux slice file and its tests in the same change. Analytics middleware parity is verified per-slice where relevant.

**Phase D: Cleanup (slices 022-023)**
Delete Redux infrastructure (store config, middleware, types, test utils). Remove Redux packages from dependencies. Measure bundle size improvement.

**Estimated timeline:** At 1-2 slices per session, this is roughly 12-20 sessions. The first 3 infrastructure slices are quick. Context slices (004-009) can be partially parallelized. Redux slices (011-021) are the bulk of the work.

**Parallelization opportunities:**
- Slices 001, 002, 003 are independent (can be done in parallel)
- Slices 004, 005, 006, 007 are independent leaf contexts (can be parallelized)
- Slices 011, 013, 019 are likely independent leaf Redux slices (can be parallelized)

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Analytics event parity broken | Medium | High | Dedicated slice-001 with replay testing. Side-by-side comparison of Redux vs. Zustand analytics payloads before migrating any feature slice. |
| Hidden Context nesting dependencies | Medium | Medium | Grep for cross-context consumption. Map the dependency graph before migrating auth (slice-008). |
| `connect()` components block migration | Low | Medium | Audit early. Convert to function components as a pre-step within the owning slice. |
| Cross-slice Redux selectors | Medium | Medium | Grep for selectors that import from multiple slice files. Ensure source stores are migrated before consumer stores. |
| Third-party library depends on Redux | Low | High | Check `node_modules` for any library that imports from `react-redux`. If found, evaluate whether the library can be configured to use its own store or needs to be replaced. |
| Zustand store proliferation (22 stores total) | Low | Low | 22 stores is fine for Zustand — they're lightweight. But consider if any can be merged logically. Record merges as new decisions. |
| Migration fatigue over 20+ sessions | Medium | Medium | The ratchet budgets provide visible progress. Each session decreases the numbers. The guard script makes every improvement permanent. |

---

## Next Steps

1. **Calibrate ratchet budgets.** Run the grep patterns above against the actual codebase. Replace estimated counts in `guard.sh` with real numbers.
2. **Wire `guard.sh` into CI** (or pre-commit hooks at minimum).
3. **Audit for `connect()` usage.** Know exactly which components need function-component conversion.
4. **Map the Context nesting dependency graph.** Read the provider tree in `App.tsx` and trace cross-context reads.
5. **Begin slice-001, slice-002, and slice-003** in parallel.
