# Pre-Migration Audit Checklist

Use this checklist for every Redux slice and Context provider before beginning its migration. The audit produces the data you need to estimate effort, identify risks, and plan the migration sequence.

---

## Redux Slice Audit

### Slice: ________________

#### 1. State Shape

- [ ] Document the full TypeScript type/interface for this slice's state
- [ ] Count the number of state fields: ____
- [ ] Identify any nested objects or arrays that require immutable updates
- [ ] Note the initial state values
- [ ] Identify any state that is derived (computed from other state fields)

#### 2. Actions & Reducers

- [ ] List all synchronous actions (reducers):
  | Action Name | What It Does | Components That Dispatch It |
  |-------------|-------------|---------------------------|
  | | | |
- [ ] Count total synchronous actions: ____

#### 3. Async Operations (Thunks / Sagas)

- [ ] List all async operations:
  | Thunk/Saga Name | API Calls Made | Side Effects | Cross-Slice Dispatches |
  |-----------------|---------------|-------------|----------------------|
  | | | | |
- [ ] Count total async operations: ____
- [ ] Note any saga watchers/patterns (takeLatest, takeEvery, debounce)

#### 4. Selectors

- [ ] List all selectors:
  | Selector Name | Used In (Components) | Cross-Slice? | Memoized? |
  |---------------|---------------------|-------------|----------|
  | | | | |
- [ ] Count total selectors: ____
- [ ] Count cross-slice selectors (combine state from multiple slices): ____

#### 5. Component Connections

- [ ] List all components that use `useSelector` with this slice:
  | Component | Selectors Used | Actions Dispatched |
  |-----------|---------------|-------------------|
  | | | |
- [ ] Count total connected components: ____
- [ ] Note any class components using `connect()` HOC: ____

#### 6. Middleware Dependencies

- [ ] Does this slice's actions pass through analytics middleware? Y/N
- [ ] If yes, list analytics events triggered by this slice's actions:
  | Action | Analytics Event | Payload |
  |--------|----------------|---------|
  | | | |
- [ ] Are there other custom middleware that process this slice's actions? List:
- [ ] Does this slice use Redux DevTools time-travel debugging in development workflows?

#### 7. Test Coverage

- [ ] List test files that test this slice:
  | Test File | What It Tests | Uses Mock Store? |
  |-----------|--------------|-----------------|
  | | | |
- [ ] Count total test files: ____
- [ ] Note test utilities used (renderWithProviders, mockStore, etc.)

#### 8. External Integrations

- [ ] Does this slice persist to localStorage/sessionStorage?
- [ ] Does this slice sync with URL query parameters?
- [ ] Does this slice connect to WebSockets or SSE?
- [ ] Does this slice integrate with third-party libraries?
- [ ] Is this slice hydrated during SSR?

#### 9. Migration Complexity Score

Rate each dimension 1-3 (1=simple, 3=complex):

| Dimension | Score | Notes |
|-----------|-------|-------|
| State shape complexity | /3 | |
| Number of connected components | /3 | |
| Cross-slice dependencies | /3 | |
| Async operation complexity | /3 | |
| Middleware dependencies | /3 | |
| Test refactoring effort | /3 | |
| **Total** | **/18** | |

**Complexity tiers:**
- 6-9: Simple (Phase 1 candidate)
- 10-13: Moderate (Phase 2 candidate)
- 14-18: Complex (Phase 2, migrate last)

---

## Context Provider Audit

### Provider: ________________

#### 1. State & API Surface

- [ ] Document the context value type:
  ```typescript
  type ContextValue = {
    // paste type here
  }
  ```
- [ ] Count state fields: ____
- [ ] Count functions/methods exposed: ____
- [ ] Identify any `useReducer` usage within the provider

#### 2. Dependencies (What This Provider Reads)

- [ ] List other contexts this provider consumes:
  | Context Read | What It Reads | Why |
  |-------------|--------------|-----|
  | | | |
- [ ] Does this provider read from Redux? Y/N
- [ ] Does this provider read from Zustand? Y/N
- [ ] Does this provider read from props? Y/N

#### 3. Dependents (What Reads This Provider)

- [ ] List other providers that consume this context:
  | Provider | What It Reads | Why |
  |----------|--------------|-----|
  | | | |
- [ ] List components that consume this context:
  | Component | What It Reads | What It Calls |
  |-----------|--------------|--------------|
  | | | |
- [ ] Count total consumer components: ____

#### 4. Side Effects

- [ ] List all useEffect hooks in the provider:
  | Effect | Dependencies | What It Does | Cleanup? |
  |--------|-------------|-------------|---------|
  | | | | |
- [ ] Does the provider manage subscriptions (WebSocket, event listeners)?
- [ ] Does the provider run timers or intervals?
- [ ] Does the provider make API calls on mount?

#### 5. Re-render Characteristics

- [ ] Does the provider use `useMemo` to memoize its context value? Y/N
- [ ] If no, this is a performance improvement opportunity -- Zustand will automatically fix this
- [ ] Are there known performance issues from this provider causing cascading re-renders?

#### 6. Provider Tree Position

- [ ] Where in the provider tree does this sit?
  - Depth from root: ____
  - Providers above it: ____
  - Providers below it: ____
- [ ] Can this provider be removed from the tree without breaking other providers? Y/N
- [ ] If no, which providers break and why?

#### 7. Test Coverage

- [ ] List test files:
  | Test File | Uses Custom Wrapper? | Mocks Context? |
  |-----------|---------------------|---------------|
  | | | |
- [ ] Count total test files: ____

#### 8. Migration Complexity Score

Rate each dimension 1-3:

| Dimension | Score | Notes |
|-----------|-------|-------|
| State/API surface area | /3 | |
| Number of consumers | /3 | |
| Dependencies on other contexts | /3 | |
| Other providers depend on this | /3 | |
| Side effect complexity | /3 | |
| Test refactoring effort | /3 | |
| **Total** | **/18** | |

**Complexity tiers:**
- 6-9: Simple (migrate early)
- 10-13: Moderate (migrate mid-phase)
- 14-18: Complex (migrate last)

---

## Dependency Graph Template

After auditing all providers, fill in this dependency graph:

```
Provider A
  ├── reads from: [nothing]
  ├── consumed by providers: [B, C]
  └── consumed by components: [Header, Footer]

Provider B
  ├── reads from: [Provider A]
  ├── consumed by providers: [D]
  └── consumed by components: [Dashboard, Settings]

... (continue for all providers)
```

**Migration order (leaf-first):** ________________

---

## Summary Dashboard

After completing all audits, fill in:

### Redux Slices by Complexity

| Slice | Score | Phase | Status |
|-------|-------|-------|--------|
| | /18 | | Not started |
| | /18 | | Not started |
| ... | | | |

### Context Providers by Dependency Depth

| Provider | Depends On | Depended By | Score | Migration Order |
|----------|-----------|-------------|-------|----------------|
| | | | /18 | |
| ... | | | | |

### Migration Sequence (Final)

1. ________________ (simplest Redux slice)
2. ________________
3. ...
12. ________________ (last Redux slice)
13. ________________ (first Context provider -- leaf node)
14. ...
18. ________________ (last Context provider -- root)
