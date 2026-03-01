# State Management Migration Plan: Redux + Context API -> Zustand

## Executive Summary

This plan consolidates three generations of state management (12 Redux slices, 6 Context API providers, 4 existing Zustand stores) into a unified Zustand architecture. The migration is structured in 5 phases over an estimated 6-10 weeks, with each phase producing a working, deployable codebase.

---

## Current State Inventory

| Layer | Count | Key Characteristics |
|-------|-------|---------------------|
| Redux slices | 12 | Analytics-tracking middleware in dispatch pipeline |
| Context providers | 6 | Nested composition with shared state between providers |
| Zustand stores | 4 | Already on target architecture (reference implementations) |

## Target Architecture

### Store Topology

Each domain gets its own Zustand store. This maps naturally from Redux slices and replaces Context providers with direct store access.

```
src/stores/
  useAuthStore.ts
  useCartStore.ts
  useNotificationsStore.ts
  useAnalyticsStore.ts        (new -- for analytics middleware config)
  ... (one per domain)
  middleware/
    analytics.ts              (replaces Redux analytics middleware)
    devtools.ts               (wraps Zustand devtools middleware)
    logger.ts                 (optional, for development)
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Store granularity | One store per domain/feature | Matches Redux slice boundaries; Zustand is designed for many small stores |
| Analytics tracking | Custom Zustand middleware wrapping `set` | Replicates Redux middleware behavior without coupling to dispatch concept |
| Cross-store reads | Components select from multiple stores | Simpler than store subscriptions; avoids circular dependencies |
| Cross-store writes | Explicit orchestration functions | When one action updates multiple stores, a plain function calls `setState` on each |
| Selector pattern | Atomic selectors with `useShallow` for objects | Prevents unnecessary re-renders; familiar pattern from Redux `useSelector` |

---

## Phase 0: Foundation (Week 1)

**Goal:** Build the infrastructure that all subsequent migration depends on.

### 0.1 Build the Analytics Middleware

The Redux analytics middleware intercepts every dispatched action. In Zustand, there is no "action dispatch" concept -- state is set directly. We need a middleware that:

- Wraps every `set` call
- Captures what changed (previous state vs. next state)
- Fires analytics events based on configurable rules
- Supports the same event taxonomy the Redux middleware uses

```typescript
// stores/middleware/analytics.ts
import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

type AnalyticsConfig = {
  storeName: string
  trackActions?: Record<string, (prevState: unknown, nextState: unknown) => void>
}

type Analytics = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: AnalyticsConfig,
  initializer: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>

const analyticsImpl: Analytics = (config, initializer) => (set, get, store) => {
  const trackedSet: typeof set = (...args) => {
    const prevState = get()
    set(...(args as Parameters<typeof set>))
    const nextState = get()

    // Fire analytics based on what changed
    if (config.trackActions) {
      for (const [actionName, handler] of Object.entries(config.trackActions)) {
        handler(prevState, nextState)
      }
    }
  }

  return initializer(trackedSet, get, store)
}

export const analytics = analyticsImpl as Analytics
```

### 0.2 Establish Store Conventions

- Create a store template/generator so every new store follows the same pattern
- Set up Zustand devtools middleware on all stores (replaces Redux DevTools)
- Configure `immer` middleware if the team prefers immutable update patterns (familiar from Redux Toolkit)

### 0.3 Build Coexistence Bridges

During migration, components may need state from both Redux and Zustand. Create bridge utilities:

```typescript
// utils/migration-bridge.ts
// Hook that reads from Zustand if the feature is migrated, Redux if not
export function useMigratedSelector<T>(
  featureFlag: string,
  zustandHook: () => T,
  reduxSelector: (state: RootState) => T,
): T {
  const isMigrated = useFeatureFlag(featureFlag)
  const zustandValue = zustandHook()
  const reduxValue = useSelector(reduxSelector)
  return isMigrated ? zustandValue : reduxValue
}
```

### 0.4 Set Up Migration Tracking

Create a simple tracking document or dashboard showing:
- Which slices/providers are migrated
- Which are in progress
- Which are blocked

### Phase 0 Exit Criteria

- [ ] Analytics middleware works and fires the same events as Redux middleware (verified by test)
- [ ] Store template established with devtools, analytics, and optional immer
- [ ] Bridge utility tested and working
- [ ] Migration tracker created

---

## Phase 1: Simple Redux Slices (Weeks 2-3)

**Goal:** Migrate the easiest Redux slices to build confidence and validate patterns.

### Slice Selection Criteria for Phase 1

Pick slices that are:
- **Low fan-out:** Few components consume this slice (< 10 `useSelector` calls)
- **No middleware dependency:** Don't rely on analytics tracking (or rely minimally)
- **No cross-slice selectors:** Don't combine state with other slices via `createSelector`
- **Self-contained thunks:** Async operations don't coordinate with other slices

### Per-Slice Migration Process

For each slice, follow this sequence:

1. **Audit** (use audit-checklist.md)
   - Count all `useSelector` usages
   - Count all `useDispatch` + action usages
   - Identify thunks/sagas and their async patterns
   - Identify cross-slice selectors
   - Identify test files that mock this slice

2. **Create the Zustand store**
   - Map Redux state shape to Zustand state
   - Convert action creators to state methods
   - Convert thunks to async methods on the store
   - Apply analytics middleware if needed

3. **Write characterization tests**
   - Before changing any component, write tests that capture current behavior
   - These tests use the Redux store and assert on rendered output
   - They become the regression safety net

4. **Migrate components one at a time**
   - Replace `useSelector(selectFoo)` with `useFooStore(state => state.foo)`
   - Replace `dispatch(actionCreator())` with `useFooStore.getState().action()`
   - Use the bridge utility if this component also reads from unmigrated slices

5. **Update tests**
   - Replace Redux store mocks with Zustand store mocks
   - Verify characterization tests still pass

6. **Remove the Redux slice**
   - Delete the slice file
   - Remove from `combineReducers`
   - Remove associated types from `RootState`

### Estimated Slices for Phase 1: 4-5 of the simplest

### Phase 1 Exit Criteria

- [ ] 4-5 Redux slices fully migrated
- [ ] Zero regressions in affected features (all tests passing)
- [ ] Team is comfortable with the migration pattern
- [ ] Any pattern issues discovered are documented and addressed

---

## Phase 2: Redux Slices with Analytics Middleware (Weeks 3-5)

**Goal:** Migrate the remaining Redux slices, including those that depend on the analytics tracking middleware.

### Additional Complexity in This Phase

- **Analytics middleware mapping:** For each slice, identify which dispatched actions trigger analytics events. Map these to Zustand state transitions in the analytics middleware config.
- **Cross-slice selectors:** Some slices may have selectors that combine state from multiple Redux slices (e.g., `selectCartTotal` reads from both `cartSlice` and `promoSlice`). These selectors need to be rewritten to read from multiple Zustand stores.

### Cross-Slice Selector Migration Pattern

```typescript
// Before: Redux cross-slice selector
const selectCartTotal = createSelector(
  [selectCartItems, selectActivePromo],
  (items, promo) => calculateTotal(items, promo)
)

// After: Hook combining multiple Zustand stores
function useCartTotal() {
  const items = useCartStore(state => state.items)
  const promo = usePromoStore(state => state.activePromo)
  return useMemo(() => calculateTotal(items, promo), [items, promo])
}
```

### Handling Redux Sagas/Thunks with Cross-Slice Coordination

If a thunk dispatches actions to multiple slices:

```typescript
// Before: Redux thunk that updates multiple slices
const checkout = createAsyncThunk('cart/checkout', async (_, { dispatch }) => {
  const result = await api.checkout()
  dispatch(cartSlice.actions.clear())
  dispatch(orderSlice.actions.addOrder(result))
  dispatch(notificationSlice.actions.show('Order placed!'))
})

// After: Plain async function that updates multiple Zustand stores
async function checkout() {
  useCartStore.getState().setLoading(true)
  const result = await api.checkout()
  useCartStore.getState().clear()
  useOrderStore.getState().addOrder(result)
  useNotificationStore.getState().show('Order placed!')
}
```

### Estimated Slices for Phase 2: 7-8 remaining Redux slices

### Phase 2 Exit Criteria

- [ ] All 12 Redux slices migrated
- [ ] Analytics events verified (same events firing with same payloads)
- [ ] Redux store, middleware, and `configureStore` removed entirely
- [ ] `react-redux` removed from dependencies
- [ ] `redux`, `@reduxjs/toolkit` removed from dependencies

---

## Phase 3: Context API Providers (Weeks 5-7)

**Goal:** Replace all 6 Context providers with Zustand stores.

### Critical: Map the Provider Dependency Graph First

Before migrating any provider, draw the nesting/dependency graph:

```
<AppProvider>           // Provides: theme, locale
  <AuthProvider>        // Provides: user, permissions. Reads: nothing from above
    <FeatureFlagProvider>  // Provides: flags. Reads: user from AuthProvider
      <UIProvider>         // Provides: sidebar, modal state. Reads: theme from AppProvider
        <NotificationProvider>  // Provides: toast queue. Reads: nothing
          <DataProvider>       // Provides: shared data cache. Reads: user from AuthProvider
            {children}
```

**Migration order: outermost first, or leaf nodes first?**

Migrate **leaf nodes** (providers that nothing else depends on) first, then work inward:
1. NotificationProvider (leaf -- nothing reads from it via context)
2. DataProvider (leaf-ish -- only reads from Auth, doesn't provide to others)
3. UIProvider (reads from AppProvider but nothing else reads from it)
4. FeatureFlagProvider (reads from Auth)
5. AuthProvider (many things read from it)
6. AppProvider (root -- everything reads from it)

This way, when you migrate a provider, you never break a downstream provider that hasn't been migrated yet.

### Per-Provider Migration Process

1. **Audit the provider**
   - What state does it hold?
   - What does it read from other contexts?
   - What components consume it via `useContext`?
   - Does it have side effects in useEffect?
   - Does it manage subscriptions (WebSocket, event listeners)?

2. **Create the Zustand store**
   - Move state into a store
   - If the provider reads from other contexts, the store either:
     - Gets that data passed in during initialization
     - Reads from the other Zustand store directly (if already migrated)
     - Uses the bridge utility (if not yet migrated)

3. **Handle initialization/side effects**
   - Context providers often initialize in useEffect (fetch user, connect WebSocket)
   - Move these into store actions called from a thin initialization component
   - Or use Zustand's `subscribe` for reactive side effects

4. **Migrate consumers**
   - Replace `useContext(FooContext)` with `useFooStore(selector)`
   - Key improvement: consumers now re-render only when their selected slice changes, not when any context value changes

5. **Remove the provider from the component tree**
   - Delete the provider component
   - Remove it from the app's provider wrapper
   - Simplify the component tree

### Handling the "Nested Composition" Problem

If ProviderB's initial state depends on ProviderA's state (e.g., FeatureFlagProvider reads `user.id` from AuthProvider to fetch flags), the Zustand equivalent is:

```typescript
// In the feature flag store initialization
const useFeatureFlagStore = create<FeatureFlagState>()((set) => ({
  flags: {},
  initialized: false,
  async initialize() {
    // Read directly from auth store -- no nesting needed
    const userId = useAuthStore.getState().user?.id
    if (userId) {
      const flags = await fetchFlags(userId)
      set({ flags, initialized: true })
    }
  },
}))

// Subscribe to auth changes to re-fetch flags when user changes
useAuthStore.subscribe(
  (state) => state.user?.id,
  (userId) => {
    if (userId) {
      useFeatureFlagStore.getState().initialize()
    }
  },
  { equalityFn: Object.is }
)
```

This is actually a significant improvement over nested Context: the dependency is explicit and reactive, not implicit through component tree position.

### Phase 3 Exit Criteria

- [ ] All 6 Context providers replaced with Zustand stores
- [ ] Provider nesting removed from app component tree
- [ ] No `createContext` or `useContext` calls remaining for state management
- [ ] Components re-render correctly (no over-rendering or under-rendering)

---

## Phase 4: Cleanup and Optimization (Weeks 7-8)

**Goal:** Remove all migration scaffolding, optimize the final architecture, and verify everything.

### 4.1 Remove Migration Infrastructure

- Delete bridge utilities (`useMigratedSelector`, etc.)
- Remove any feature flags for migration
- Delete migration tracking document (or archive it)

### 4.2 Optimize Store Design

Now that everything is in Zustand, review the store topology:

- **Merge stores** that are always used together (if two stores are always selected in the same components, they might be one domain)
- **Split stores** that have grown too large (if a store has 20+ state fields, it might be multiple domains)
- **Standardize patterns** -- ensure all stores use the same middleware stack, naming conventions, and selector patterns

### 4.3 Performance Audit

- Use React DevTools Profiler to check for unnecessary re-renders
- Verify `useShallow` is used where components select objects/arrays
- Ensure no component subscribes to an entire store when it only needs one field

### 4.4 Final Test Suite Review

- Remove all Redux-related test utilities
- Ensure test helpers for Zustand stores are consistent
- Run the full test suite and fix any remaining issues

### 4.5 Dependency Cleanup

Remove from `package.json`:
- `redux`
- `react-redux`
- `@reduxjs/toolkit`
- `redux-thunk` (if standalone)
- `redux-saga` (if used)
- `reselect` (if standalone -- check if anything else uses it)
- Any Redux DevTools extension packages

Verify remaining:
- `zustand` (keep)
- `immer` (keep if using Zustand immer middleware)

### Phase 4 Exit Criteria

- [ ] No Redux or Context API state management code remains
- [ ] All migration scaffolding removed
- [ ] Bundle size reduced (measure before/after)
- [ ] All tests pass
- [ ] Performance profiling shows no regressions

---

## Phase 5: Documentation and Knowledge Transfer (Week 8+)

### 5.1 Document the Architecture

- Store catalog: what each store manages, its public API
- Middleware stack: what middleware is applied and why
- Patterns guide: how to create a new store, add analytics, handle async

### 5.2 Update Contributing Guide

- State management conventions
- When to create a new store vs. extend an existing one
- Selector best practices

---

## Timeline Summary

| Phase | Duration | What Gets Migrated |
|-------|----------|--------------------|
| 0: Foundation | Week 1 | Infrastructure, middleware, bridges |
| 1: Simple Redux | Weeks 2-3 | 4-5 simplest Redux slices |
| 2: Complex Redux | Weeks 3-5 | Remaining 7-8 Redux slices + analytics |
| 3: Context API | Weeks 5-7 | All 6 Context providers |
| 4: Cleanup | Weeks 7-8 | Remove scaffolding, optimize |
| 5: Documentation | Week 8+ | Docs and knowledge transfer |

## Rollback Strategy

Each phase is independently deployable. If a phase introduces regressions:

1. **Feature flags** gate migrated stores -- flip the flag to revert to Redux/Context
2. **Bridge utilities** mean both old and new implementations coexist
3. **Git tags** mark each phase completion for easy rollback

The bridge utility (`useMigratedSelector`) is the primary safety valve. It lets you toggle individual features between Redux and Zustand at runtime.
