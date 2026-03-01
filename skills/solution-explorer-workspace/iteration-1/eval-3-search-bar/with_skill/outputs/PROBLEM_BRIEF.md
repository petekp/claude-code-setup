# Problem Brief: Dashboard Search/Filter

## Problem statement

The dashboard displays a table of results, and users currently have no way to narrow down what they see without visually scanning every row. The underlying need is **rapid information retrieval** -- the user has a mental target (a specific record, a category of records, or a pattern) and needs the interface to reduce noise so the target becomes immediately visible.

This is not just "add an input box." The real problem is designing the filtering *system*: where the filtering logic runs, what data it operates on, how the filter state is managed and persisted, and what the UX model is (free-text? faceted? combined?). Each of these choices creates cascading consequences for performance, maintainability, shareability, and user experience.

## Dimensions

The following axes define the space in which solutions can vary:

1. **Where filtering executes** -- Client-side (in-browser), server-side (API), or a dedicated search service. This is the single highest-impact architectural decision.

2. **What gets matched** -- Exact substring match, fuzzy/typo-tolerant match, full-text ranked relevance, or structured/faceted filters. Each implies different data structures and algorithms.

3. **State management model** -- Local component state, global state (Zustand/Redux), URL search params, or a combination. Determines shareability, back-button behavior, and deep-linking.

4. **Responsiveness** -- Instant-as-you-type vs. submit-to-search vs. debounced. Affects perceived performance and server load.

5. **Scale of data** -- Whether the table has dozens, thousands, or hundreds of thousands of rows determines which approaches are viable. This is the constraint that eliminates certain paradigms entirely.

6. **Column specificity** -- Global search (one input, all columns) vs. per-column filters vs. a combination. Global is simpler to build and use; per-column is more precise.

7. **Integration surface** -- Does this need to compose with existing sort, pagination, or other filter controls? Or is it the first interactive feature on the table?

## Success criteria

### Must
- Users can type a query and see the table results narrow to matching rows within a perceived-instant timeframe (<200ms for client-side, <500ms for server-round-trip)
- Works correctly with all data types currently in the table (strings at minimum; numbers and dates ideally)
- Does not break existing table features (sorting, pagination if present)
- Accessible: keyboard navigable, screen-reader friendly, proper ARIA attributes
- Clear empty state when no results match (not a blank void)

### Should
- Filter state persists in the URL so filtered views are shareable and survive page refresh
- Debounced input to avoid excessive re-renders or API calls
- Works well on datasets up to 10,000 rows without degraded UX
- Visual indication of which columns/fields matched (highlight or similar)
- Clear/reset button to remove the filter in one action

### Nice
- Fuzzy matching / typo tolerance ("acounts" finds "accounts")
- Keyboard shortcut to focus the search bar (Cmd+K or /)
- Search history or recent searches
- Per-column filter controls in addition to global search
- Animated transitions when rows filter in/out

## Assumptions

1. **The dashboard is built with React (likely Next.js)** -- status: assumed-confirmed (the user's CLAUDE.md references React/Next.js conventions heavily, and this is a greenfield exercise where we choose the stack)

2. **The table is not yet using a table library like TanStack Table** -- status: assumed-unconfirmed (greenfield means we choose; this opens the question of whether to adopt a library that has filtering built in vs. building from scratch)

3. **Dataset size is moderate (hundreds to low thousands of rows)** -- status: assumed-unconfirmed (no information given; this assumption dramatically affects which paradigm is appropriate. We proceed with this assumption but flag it as a critical variable.)

4. **The data is already loaded client-side** -- status: assumed-unconfirmed (if the table is already rendering all rows, client-side filtering is trivially possible; if data is paginated from a server, filtering must also happen server-side or we need to fetch the full dataset)

5. **No existing search infrastructure (Algolia, Elasticsearch, etc.)** -- status: assumed-confirmed (greenfield project, no mention of search services)

6. **The search bar is the first filter mechanism** -- status: assumed-unconfirmed (there may be plans for additional filters; this affects whether we should build a filtering system or just a search input)

## Constraints

- **Greenfield project**: No legacy code to work around, but also no existing patterns to lean on. We need to establish conventions, not follow them.
- **React/Next.js ecosystem**: Solutions should use idiomatic React patterns. Server components vs. client components distinction matters.
- **No dedicated search backend**: Unless we introduce one, search must work with whatever data fetching the dashboard already uses.
- **Accessibility**: Not optional. The project's CLAUDE.md doesn't mention it, but this is a MUST for any professional dashboard.
- **Maintainability**: The user is a self-taught engineer. Solutions should be understandable, debuggable, and not require deep expertise to modify.
