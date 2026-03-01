# Migration Planning Transcript

**Task:** Plan a state management migration from Redux (12 slices) + Context API (6 providers) + Zustand (4 stores) to Zustand-only.
**Methodology:** audit-and-migrate skill (SKILL.md)
**Date:** 2026-03-01

---

## Step 1: Read and internalize the methodology

Read `SKILL.md` in full. Identified the two-phase structure (Audit then Migrate) and the five control plane artifacts required: CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv, and a guard script.

Key methodology principles I needed to apply:
- **Anti-vestigial discipline:** Every slice must define deletion targets before implementation and delete replaced code in the same change.
- **CI ratchets:** Measure anti-patterns, set budgets at current counts, enforce mechanically.
- **Vertical slices:** Each slice is a complete capability, not a horizontal sweep.
- **Evidence over intuition:** Deterministic checks, not "this should work."
- **Handoff contracts:** Every session boundary must be survivable.

## Step 2: Read all templates

Read the four templates (CHARTER.md, DECISIONS.md, SLICES.yaml, MAP.csv) and the guard script pattern reference to understand the exact expected formats and fields.

## Step 3: Analyze the problem space

Since I don't have the actual codebase, I needed to work from the description and build realistic artifacts based on typical React codebases with this profile:

**What I know:**
- 12 Redux feature slices with analytics middleware
- 6 Context API providers with nested composition (shared state through nesting)
- 4 Zustand stores in the newest features
- Target: everything on Zustand

**What I inferred from typical codebases of this shape:**
- The Redux slices likely live in `src/redux/slices/` with a central store config
- The Context providers likely have a composition tree in App.tsx or a dedicated AppProviders component
- The Zustand stores are in `src/stores/`
- The analytics middleware intercepts Redux dispatches globally
- The 12 Redux slices probably cover typical SaaS/e-commerce domains (auth, cart, products, search, settings, UI, etc.)
- The 6 Context providers probably cover cross-cutting concerns (theme, locale, auth, notifications, modals, feature flags)

**Key complexities I identified:**
1. **Analytics middleware parity** — Redux middleware intercepts all dispatched actions. Zustand has no global dispatch. This is the hardest technical challenge.
2. **Context nesting dependencies** — Nested composition creates implicit coupling where inner providers read from outer providers. These must become explicit cross-store reads.
3. **Cross-slice Redux selectors** — If selectors compose state from multiple slices, migration order is constrained.
4. **`connect()` HOC legacy** — Any class components using connect() need function component conversion before Zustand.
5. **Interop during migration** — During the multi-week migration, Redux and Zustand coexist. Components may need bridge adapters.

## Step 4: Create the Charter

Defined the mission, scope, invariants, non-goals, and guardrails.

**Key decisions in charter construction:**
- Non-goals are deliberately conservative: no business logic refactoring, no async pattern changes, no state shape redesign. The migration must be purely mechanical at the state management layer. This prevents scope creep, which is the most common failure mode in migrations this size.
- Invariants include analytics parity (same events, same payloads) and rendering performance (no new re-renders). These are the two most commonly broken things when swapping state management libraries.

## Step 5: Seed architecture decisions

Made 5 initial decisions:
1. **Zustand as target** — Rationale: team has already organically moved in this direction
2. **Zustand middleware for analytics** — Not event bus, not useEffect, not subscribe
3. **Individual stores, not monolith** — Each Context becomes its own store
4. **Migration order: Context first, then Redux leaf-to-root** — Context is simpler, fewer, and removes a variable before tackling Redux
5. **Temporary adapter pattern** — Bridge hooks for Redux-to-Zustand interop during migration, with mandatory expiry

## Step 6: Design the slice plan

This was the most complex step. I needed to design 23 slices that are:
- Vertical (each is a complete capability)
- Correctly ordered (dependencies respected)
- Independently verifiable (each has tests and guards)
- Bounded in blast radius

**Phase structure reasoning:**

Phase A (Infrastructure, slices 001-003) comes first because every subsequent slice needs analytics middleware, devtools, and test utilities. These are additive — no production code is deleted.

Phase B (Context, slices 004-010) comes before Phase C (Redux) because:
- Context providers are simpler (no middleware, no async thunks)
- There are fewer of them (6 vs 12)
- Completing them removes the Context variable before tackling Redux
- Some Redux code may depend on Context state — migrating Context first means Redux code can read from Zustand stores instead

Within Phase B, I ordered leaf contexts (theme, locale, notifications, modals) before root contexts (auth, feature flags). Auth is the outermost provider and likely a dependency for others.

Phase C (Redux, slices 011-021) orders from leaf slices (search, UI, forms) to root slices (user, orders, dashboard). The dependency chain roughly follows: products -> cart -> orders, and auth -> user/dashboard.

Phase D (Cleanup, slices 022-023) is only possible after all feature slices are done. Deleting Redux infrastructure and packages is the final step.

**Parallelization analysis:**
- Infrastructure slices (001-003) are independent
- Leaf context slices (004-007) are independent
- Leaf Redux slices (011, 013, 019) are likely independent
- This means multiple sessions can work in parallel on non-overlapping slices

## Step 7: Build the MAP.csv

Mapped every file I could anticipate: current path, target path (N/A if being deleted), owning slice, deletion status. Total: 85 file entries across 23 slices.

**A key insight here:** MAP.csv prevents the most common migration failure mode — files that nobody remembers exist. By exhaustively listing every file in the migration domain upfront, we ensure nothing is accidentally left behind as vestigial code.

## Step 8: Write the guard script

Built the guard script with four check types:
1. **Ratchets** — 10 anti-pattern ratchets with estimated budgets
2. **Denylists** — Pre-written for all slices, commented out until each slice completes
3. **Deletion targets** — Pre-written for all slices, commented out until each slice completes
4. **Unmapped files** — Checks src/redux/ and src/contexts/ for files not in MAP.csv

The budgets are estimates — the first real action when working with the codebase should be running the grep patterns and calibrating these numbers.

## Step 9: Write the audit document

Synthesized all findings into the audit doc: method, metrics, leverage assessment, hard conclusions, guardrails, proposed slices, risks, and next steps.

**The hard conclusions section is the most important part.** Five things I wanted to call out clearly:
1. Three-system state is actively harmful (not just suboptimal)
2. Context nesting hides a dependency graph that's invisible in imports
3. Analytics middleware is the hardest single piece
4. `connect()` is tech debt within tech debt
5. Cross-slice selectors constrain migration order

## Artifacts produced

| Artifact | Purpose | File |
|---|---|---|
| CHARTER.md | Mission, invariants, non-goals, guardrails | `outputs/CHARTER.md` |
| DECISIONS.md | 5 initial architecture decisions | `outputs/DECISIONS.md` |
| SLICES.yaml | 23 slices across 4 phases | `outputs/SLICES.yaml` |
| MAP.csv | 85 file entries with path mappings | `outputs/MAP.csv` |
| guard.sh | CI guard script with ratchets, denylists, deletion checks | `outputs/guard.sh` |
| AUDIT.md | Comprehensive audit document | `outputs/AUDIT.md` |

## What I would do differently with codebase access

1. **Run the actual grep patterns** to get real anti-pattern counts instead of estimates
2. **Read the provider tree** in App.tsx to map the exact nesting order and cross-provider dependencies
3. **Read the Redux analytics middleware** to extract the exact event catalog
4. **Identify every `connect()` call site** and assess conversion complexity
5. **Read the 4 existing Zustand stores** to understand the team's established patterns
6. **Check for `redux-persist` usage** which would add persistence migration complexity
7. **Trace cross-slice selectors** to validate the dependency ordering in SLICES.yaml
8. **Read package.json** to get the full list of Redux-related packages to remove

## Handoff: Exact next steps

1. Clone the control plane artifacts into the project's `.claude/migration/` directory
2. Run the calibration grep patterns from AUDIT.md against the real codebase
3. Update ratchet budgets in `guard.sh` with actual counts
4. Wire `guard.sh` into CI or pre-commit hooks
5. Run `guard.sh` to establish the green baseline
6. Begin slices 001, 002, and 003 (infrastructure — can be parallelized)
