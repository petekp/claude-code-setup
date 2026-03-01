# Assumptions Log

Since this is a test run with no human-in-the-loop, the following assumptions were made where the skill would normally ask the user for confirmation.

## Assumptions made during Phase 1 (Problem Framing)

1. **React/Next.js + TypeScript stack** -- Confirmed from project CLAUDE.md which references React components, Next.js conventions, and TypeScript rules.

2. **Data is already loaded client-side** -- Assumed. The prompt says "table of results" on a "dashboard," implying data is fetched and rendered, not server-paginated. This assumption was critical: it made client-side filtering viable and server-side filtering unnecessary at current scale.

3. **Dataset is small-to-medium (<10K rows)** -- Assumed. Dashboard tables typically show operational data. This assumption drove the elimination of server-side approaches on latency grounds.

4. **No existing filtering infrastructure** -- Confirmed by "greenfield design exercise" framing in the task.

5. **Multiple columns with mixed data types** -- Assumed. Prototypes were built with ID, name, email, status, department, and revenue columns to test realistic heterogeneity.

6. **The dashboard will grow (more features coming)** -- Assumed. This was the pivotal assumption: if the search bar is truly the last feature, Vanilla Array.filter wins on simplicity. Because I assumed growth, TanStack Table's composability tipped the decision.

## Assumptions made during Phase 2 (Solution Exploration)

7. **No existing TanStack Table usage** -- Assumed. The task is greenfield, so I treated adopting TanStack Table as a new dependency decision rather than an integration into existing infrastructure.

8. **Bundle size budget is reasonable** -- Assumed that ~20KB gzipped of additional dependencies (TanStack Table + match-sorter-utils) is acceptable. Did not assume aggressive bundle optimization constraints.

## Assumptions made during Phase 3 (Analysis)

9. **UX responsiveness is weighted higher than URL state** -- When ranking SHOULD criteria, I gave more weight to "feels instant" than "URL-persisted" because the MUST criterion already requires <200ms latency, signaling that responsiveness is a core priority.

## Assumptions made during Phase 4 (Prototyping)

10. **Prototype evaluation via code analysis, not runtime benchmarks** -- Since this is a greenfield exercise without an actual running app, I assessed performance based on known characteristics of the libraries (documented benchmarks, algorithmic complexity) rather than runtime measurements. In a real project, I would run actual benchmarks.

## Which assumptions, if wrong, would change the decision?

- **If the dataset is >10K rows:** Server-side filtering (Approach 2b or 2a) becomes necessary. The decision would shift to Next.js Server searchParams or a hybrid approach.
- **If the dashboard won't grow:** Vanilla Array.filter (Approach 1a) wins on simplicity. TanStack Table's overhead isn't justified for a one-off feature.
- **If bundle size is severely constrained:** Vanilla Array.filter (0KB added) beats TanStack Table (~20KB added). Consider a custom lightweight solution.
- **If the team already uses a different table library:** TanStack Table adoption would be in tension with the existing library. Would need to evaluate integration or migration cost.
