# Risk Register: State Management Migration

Each risk is rated on **Likelihood** (L) and **Impact** (I) from 1-5, producing a **Risk Score** (L x I, max 25).

---

## Critical Risks (Score >= 15)

### R1: Analytics Event Parity Loss

| Field | Value |
|-------|-------|
| Likelihood | 4 |
| Impact | 5 |
| Score | **20** |
| Phase | 0, 2 |

**Description:** The Redux analytics middleware fires events on every dispatched action. When migrating to Zustand, the mapping from "actions" to "state transitions" is fundamentally different. It's easy to miss events, fire duplicate events, or send incorrect payloads.

**Mitigation:**
1. Before migration, create a comprehensive inventory of every analytics event the Redux middleware fires, including action type, event name, and payload shape
2. Write integration tests that assert specific analytics events fire for specific user interactions (test at the UI level, not the middleware level)
3. Run both old and new analytics in parallel for 1-2 weeks using the bridge utility -- compare event counts in your analytics dashboard
4. Use the subscribe-based approach (Pattern Guide section 4) which is more explicit about what triggers events

**Contingency:** If events diverge, the bridge utility allows instant rollback to Redux for affected slices.

**Owner:** ________________

---

### R2: Nested Context Provider Dependency Chain Breaks

| Field | Value |
|-------|-------|
| Likelihood | 4 |
| Impact | 4 |
| Score | **16** |
| Phase | 3 |

**Description:** Context providers that read from other providers via `useContext` create an implicit dependency chain enforced by component tree nesting order. If ProviderB depends on ProviderA and we migrate ProviderA to Zustand first, ProviderB's `useContext(ContextA)` returns null/undefined and crashes.

**Mitigation:**
1. Map the complete provider dependency graph before migrating any provider (see audit checklist)
2. Migrate leaf-first: providers that nothing else depends on get migrated first
3. When migrating a provider that others depend on, temporarily keep both the Context provider AND the Zustand store alive. The Context provider becomes a thin wrapper that reads from the Zustand store and provides to the context
4. Only remove the Context provider wrapper after all its dependents are migrated

**Contingency:** The thin wrapper approach means we can always restore the Context layer without reverting the Zustand store.

**Owner:** ________________

---

### R3: Race Conditions During Coexistence Period

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 5 |
| Score | **15** |
| Phase | 1-3 |

**Description:** During migration, some state lives in Redux and some in Zustand. If a user interaction needs to update state in both systems (e.g., an action that previously updated two Redux slices, one of which is now in Zustand), the updates happen in different event loops, potentially causing inconsistent UI.

**Mitigation:**
1. The bridge utility (`useMigratedSelector`) reads from whichever system currently owns the state, preventing split reads
2. For cross-system writes, create explicit orchestration functions that update both systems synchronously
3. Migrate tightly coupled slices together -- if slice A and slice B have cross-slice selectors or coordinated thunks, migrate them in the same phase
4. Feature-flag the migration per-slice so you can toggle individual slices back to Redux

**Contingency:** If a specific interaction is broken by the split, temporarily revert that slice's migration flag.

**Owner:** ________________

---

## High Risks (Score 10-14)

### R4: Test Suite Becomes Unreliable During Migration

| Field | Value |
|-------|-------|
| Likelihood | 4 |
| Impact | 3 |
| Score | **12** |
| Phase | 1-3 |

**Description:** Tests that use `renderWithProviders` (Redux store wrapper), mock the Redux store, or assert on dispatched actions will break as slices move to Zustand. If tests are updated piecemeal, the test suite becomes a patchwork of old and new patterns, making it unreliable as a regression signal.

**Mitigation:**
1. Write characterization tests (UI-level, testing user-visible behavior) BEFORE migrating each slice -- these tests don't depend on the state management implementation
2. Update tests in the same PR as the slice migration -- never merge a slice migration without updated tests
3. Create a Zustand test utility that mirrors the ergonomics of `renderWithProviders`:
   ```typescript
   function setupStores(overrides: Partial<StoreOverrides>) {
     // setState on each store with provided overrides
   }
   ```
4. Ban `renderWithProviders` in new test code from day one -- all new tests should use the Zustand pattern

**Owner:** ________________

---

### R5: Performance Regression from Selector Migration

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 4 |
| Score | **12** |
| Phase | 1-3 |

**Description:** Redux + Reselect provides automatic memoization. Zustand's default equality check is `Object.is`, which means selecting derived objects/arrays creates new references every render, causing excessive re-renders.

**Mitigation:**
1. Enforce `useShallow` for all selectors that return objects or arrays (add to linting rules if possible)
2. Use `useMemo` for expensive derived computations in components
3. Profile with React DevTools after each phase -- compare render counts before and after
4. For critical paths, consider extracting selectors as stable functions outside the component

**Owner:** ________________

---

### R6: Bundle Size Temporarily Increases

| Field | Value |
|-------|-------|
| Likelihood | 5 |
| Impact | 2 |
| Score | **10** |
| Phase | 1-3 |

**Description:** During migration, both Redux and Zustand are in the bundle. Redux + RTK + react-redux is ~30-40KB gzipped. Zustand is ~1-2KB gzipped. During coexistence, the bundle carries both.

**Mitigation:**
1. Accept this as temporary (it's only during migration phases)
2. Track bundle size in CI to ensure it drops after Phase 2 when Redux is fully removed
3. Use dynamic imports if any slice's UI is lazy-loaded -- the Redux code for that slice leaves the critical bundle

**Contingency:** This is cosmetic during migration and self-resolves when Redux is removed.

**Owner:** ________________

---

### R7: Redux DevTools Workflow Disruption

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 3 |
| Score | **9** |
| Phase | 0 |

**Description:** Developers who rely on Redux DevTools for time-travel debugging and action logging will lose that workflow. Zustand's devtools middleware provides a similar but not identical experience.

**Mitigation:**
1. Configure Zustand devtools middleware on all stores from day one (Phase 0)
2. Document the new debugging workflow -- Zustand shows state snapshots and named actions in the Redux DevTools extension
3. Note that Zustand devtools doesn't support time-travel as robustly -- for complex debugging, `console.log` in the analytics middleware or use the logger middleware
4. Brief the team on the change before Phase 1 starts

**Owner:** ________________

---

## Medium Risks (Score 5-9)

### R8: SSR/Hydration Mismatches (if using Next.js)

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 3 |
| Score | **9** |
| Phase | 1-3 |

**Description:** If the app uses server-side rendering, Zustand stores with `persist` middleware will have different state on server (default) vs. client (persisted), causing React hydration warnings.

**Mitigation:**
1. Audit which Redux slices currently use SSR hydration
2. For those slices, use Zustand's `skipHydration` option and hydrate manually after mount
3. Alternatively, use the `onRehydrateStorage` callback to suppress specific hydration warnings
4. Test SSR pages after each migration phase

**Owner:** ________________

---

### R9: Team Knowledge Gap

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 2 |
| Score | **6** |
| Phase | 0 |

**Description:** Team members familiar with Redux but not Zustand may write suboptimal store code, recreate Redux patterns unnecessarily (e.g., separate action creators), or introduce anti-patterns.

**Mitigation:**
1. Run a 1-hour Zustand workshop before Phase 1 (cover the patterns guide)
2. Assign Zustand-experienced developers as reviewers for all migration PRs
3. Create a store template that enforces conventions
4. Pair junior developers with senior ones for the first 2-3 slice migrations

**Owner:** ________________

---

### R10: Stale Closure Bugs in Event Handlers

| Field | Value |
|-------|-------|
| Likelihood | 3 |
| Impact | 2 |
| Score | **6** |
| Phase | 1-3 |

**Description:** Developers migrating from Redux (where `dispatch` is stable and actions carry their own data) to Zustand (where hooks return values that can become stale in closures) may introduce subtle bugs where event handlers read stale state.

**Mitigation:**
1. Document the stale closure gotcha in the patterns guide (see section 10)
2. Prefer `useStore.getState()` in long-lived callbacks (event listeners, timers, WebSocket handlers)
3. Add this to the PR review checklist for migration PRs

**Owner:** ________________

---

### R11: Circular Store Dependencies

| Field | Value |
|-------|-------|
| Likelihood | 2 |
| Impact | 3 |
| Score | **6** |
| Phase | 2-3 |

**Description:** If Store A subscribes to Store B and Store B subscribes to Store A, you get an infinite loop. This can happen when converting nested Context providers that have bidirectional communication.

**Mitigation:**
1. When mapping context dependencies, explicitly check for cycles
2. If a cycle exists, merge the two stores into one (they're clearly the same domain)
3. Zustand's `subscribe` has a built-in equality check that prevents infinite loops IF the state doesn't actually change, but relying on this is fragile

**Owner:** ________________

---

## Risk Summary Matrix

| Risk | Score | Phase | Status |
|------|-------|-------|--------|
| R1: Analytics parity loss | 20 | 0, 2 | Open |
| R2: Context dependency chain breaks | 16 | 3 | Open |
| R3: Coexistence race conditions | 15 | 1-3 | Open |
| R4: Test suite reliability | 12 | 1-3 | Open |
| R5: Performance regression | 12 | 1-3 | Open |
| R6: Bundle size increase | 10 | 1-3 | Open |
| R7: DevTools workflow disruption | 9 | 0 | Open |
| R8: SSR hydration mismatches | 9 | 1-3 | Open |
| R9: Team knowledge gap | 6 | 0 | Open |
| R10: Stale closure bugs | 6 | 1-3 | Open |
| R11: Circular store dependencies | 6 | 2-3 | Open |

---

## Review Schedule

- Review this register at the start of each phase
- Close risks as mitigations are implemented and verified
- Add new risks as they're discovered during migration
