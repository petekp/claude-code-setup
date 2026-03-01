# Migration Charter

## Mission

Consolidate all client-side state management onto Zustand, eliminating Redux (12 feature slices) and Context API (6 providers) to reduce bundle size, simplify mental model, and unblock consistent patterns for new features.

## Scope

All state management code across the application:
- **Redux domain:** 12 feature slices, their reducers, actions, selectors, middleware (analytics tracking), store configuration, and connected components
- **Context API domain:** 6 providers, their consumer hooks, and the nested composition tree
- **Zustand domain:** 4 existing stores (reference implementations for target patterns)
- **Shared concerns:** Analytics tracking middleware, cross-store state dependencies, component wiring

Directories likely in scope (to be confirmed during codebase audit):
- `src/store/` or `src/redux/` — Redux store, slices, middleware
- `src/contexts/` or `src/providers/` — Context API providers
- `src/stores/` — Zustand stores
- All components that `useSelector`, `useDispatch`, `useContext`, or import from the above

## Invariants

- All existing tests continue to pass at every slice boundary
- No user-facing behavior changes unless explicitly noted in a slice
- Analytics tracking events fire with identical payloads and timing as the Redux middleware currently produces
- State that is shared across providers via nested composition must remain accessible to the same consumer components
- No regressions in React rendering performance (no new unnecessary re-renders introduced by store subscription changes)
- TypeScript types remain at least as strict as current — no widening to `any` to paper over migration issues

## Non-Goals

- **Not refactoring business logic.** If a Redux reducer has messy logic, we migrate it as-is to Zustand. Logic cleanup is a separate effort.
- **Not migrating to a different async pattern.** If Redux thunks call APIs, the Zustand version calls APIs the same way. We are not introducing React Query, SWR, or TanStack Query as part of this.
- **Not redesigning the state shape.** The Zustand stores should mirror the current state shape initially. State normalization or restructuring is out of scope.
- **Not upgrading React version** or introducing concurrent features.
- **Not changing the testing framework** or test runner.
- **Not converting class components to function components** — only if a class component's only blocker for migration is `connect()`, do we convert it, and only the minimal conversion needed.

## Guardrails

- Delete replaced code in the same slice — no "I'll clean it up later"
- Every architecture decision recorded in DECISIONS.md
- Every touched file listed in MAP.csv
- CI ratchet budgets can only decrease, never increase
- No temporary adapters without an owning slice, expiry condition, and deletion target
- Each Zustand store must have a corresponding test file before the slice that creates it can be marked done
- Redux DevTools integration must be maintained via Zustand middleware until all Redux stores are eliminated (then it becomes optional)
- Analytics middleware behavior must have a dedicated integration test proving parity before the Redux analytics middleware file is deleted
