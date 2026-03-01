# Architecture Decisions

Append-only. Never edit or delete past entries. To reverse a decision, add a new entry that supersedes it.

---

## Decision 1: Zustand as the sole state management target
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The codebase has three state management approaches (Redux, Context API, Zustand). We need to pick one as the canonical target. Zustand is already used in the 4 newest features, meaning the team has recent experience with it and has implicitly chosen it as the direction.
- **Decision:** All state management will be migrated to Zustand. Redux and Context API will be fully removed.
- **Alternatives considered:**
  - **Redux Toolkit (modernize Redux):** Would reduce boilerplate but keeps the Redux ecosystem dependency. The team has already moved away from it organically. Migrating Context providers to Redux would also feel regressive.
  - **Context API (simplify to built-in):** No dependencies, but Context has known performance issues with frequent updates and lacks built-in middleware patterns. Migrating 12 Redux slices with middleware to Context would require significant custom infrastructure.
  - **Jotai/Recoil (atomic state):** Different mental model from what the team currently uses. Would require migrating all three current approaches instead of extending one.
- **Consequences:** Redux and all its dependencies (`redux`, `react-redux`, `@reduxjs/toolkit`, `redux-thunk`, etc.) can be removed from package.json after migration. Context providers are deleted. Bundle size decreases. New developers learn one state management pattern.
- **Supersedes:** None

---

## Decision 2: Zustand middleware for analytics instead of custom event system
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** Redux currently has custom middleware that intercepts dispatched actions and fires analytics events. We need to preserve this behavior in Zustand.
- **Decision:** Use Zustand's built-in middleware pattern to create a `trackAnalytics` middleware that wraps stores needing analytics. The middleware will intercept `set` calls, compare prev/next state, and fire the same analytics events the Redux middleware currently fires.
- **Alternatives considered:**
  - **Zustand `subscribe` listeners:** Could subscribe to state changes externally. Less coupled to the store definition, but harder to access the "action name" concept that Redux middleware uses for event labeling. Would require a naming convention for every state mutation.
  - **Event bus / custom pub-sub:** Decouple analytics from state management entirely. Clean separation, but a bigger change than the charter allows (we'd be redesigning the analytics integration, not just migrating state management).
  - **React useEffect in components:** Fire analytics from the consuming component. Spreads analytics concerns across the UI layer and makes them fragile to component refactors.
- **Consequences:** Each Zustand store that needs analytics wraps itself with the `trackAnalytics` middleware. Action names are derived from the function name on the store (e.g., `addItem`, `removeItem` become analytics event names). A mapping config handles cases where the Redux action name differs from the Zustand function name.
- **Supersedes:** None

---

## Decision 3: Migrate Context providers to individual Zustand stores, not one monolithic store
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** The 6 Context providers share state through nested composition (provider A wraps provider B, which consumes A's state). We need to decide whether to consolidate these into one large Zustand store or keep them as separate stores with explicit dependencies.
- **Decision:** Each Context provider becomes its own Zustand store. Cross-store dependencies are handled by Zustand's ability to subscribe to external stores within actions/selectors (using `getState()` from another store, or the `combine` pattern).
- **Alternatives considered:**
  - **Single monolithic store:** Simpler cross-state access, but creates a god-object. Defeats Zustand's strength of lightweight, focused stores. Also makes code splitting harder.
  - **Merge related contexts into 2-3 stores:** Compromise approach. But deciding what's "related" introduces arbitrary groupings that will need to be re-evaluated as features evolve.
- **Consequences:** We get 6 new Zustand stores from the Context migration (adding to the existing 4). The nested provider tree in the component tree is eliminated entirely. Components that consumed multiple contexts will import from multiple Zustand stores instead — this is actually simpler because there's no ordering dependency. Cross-store subscriptions need integration tests to verify they work correctly.
- **Supersedes:** None

---

## Decision 4: Migration order — Context providers first, then Redux slices from leaf to root
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** We need to decide the order of migration to minimize risk and avoid blocking dependencies.
- **Decision:** Migrate Context providers first (they are simpler, fewer in number, and have no middleware concerns). Then migrate Redux slices starting from "leaf" slices (those with no cross-slice dependencies) and working toward "root" slices (those that other slices depend on, like auth or user). The Redux store configuration and middleware are the final deletion targets.
- **Alternatives considered:**
  - **Redux first (bigger impact sooner):** Gets the largest dependency removed first. But Redux slices are more complex due to middleware, and some Redux selectors may depend on Context state — doing Context first removes that variable.
  - **Interleaved (alternate between Redux and Context):** Spreads risk across both systems. But increases the mental overhead of tracking two parallel migration fronts.
- **Consequences:** The first ~6 slices of work will target Context providers. Then ~12 slices for Redux features. Final 2-3 slices handle shared infrastructure (store config, middleware, package cleanup). Total estimated: ~20-22 slices.
- **Supersedes:** None

---

## Decision 5: Temporary adapter pattern for Redux-to-Zustand interop during migration
- **Date:** 2026-03-01
- **Status:** Active
- **Context:** During the migration period, some components will use Zustand while others still use Redux. Components that currently read from both Redux and Context will need a bridge pattern while we're mid-migration.
- **Decision:** Where a Redux-connected component needs to read from a newly-created Zustand store (because a Context provider it used was already migrated), we create a thin adapter hook (e.g., `useAuthBridge`) that reads from the Zustand store and exposes the same interface the Context hook did. Each adapter has a mandatory owning slice, expiry condition, and deletion target recorded in SLICES.yaml.
- **Alternatives considered:**
  - **No adapters (big bang per provider):** Migrate the provider and all consumers in the same slice. Clean, but makes slices very large with huge blast radius.
  - **Sync Zustand state back into Context during transition:** Keep the Context provider alive but have it read from Zustand. Adds complexity and defeats the purpose of migration.
- **Consequences:** Some slices will have temporary adapter hooks. These MUST have deletion targets in their owning slice or a dependent slice. The guard script will enforce that adapters are cleaned up.
- **Supersedes:** None
