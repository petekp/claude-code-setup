# Analysis: Dashboard Search Bar for Table Filtering

## Tradeoff Matrix

All 9 approaches evaluated against every success criterion from the Problem Brief.

| Criterion | 1a: Vanilla Array.filter | 1b: TanStack Global Filter | 1c: Search Library (Fuse/FlexSearch) | 2a: API + ILIKE | 2b: Next.js Server searchParams | 3a: Optimistic Client + Server | 3b: Progressive Enhancement | 4a: cmdk Command Palette | 5a: Faceted Filters Only |
|---|---|---|---|---|---|---|---|---|---|
| **MUST: Functional filtering** | Yes, substring matching across columns | Yes, with configurable filter functions | Yes, with fuzzy/full-text matching | Yes, database-powered | Yes, server-side query | Yes, both paths | Yes (starts client-side) | Yes, but in a modal overlay not inline | Partial -- structured filters, not free-text search |
| **MUST: <200ms perceived latency** | <10ms for <5K rows; degrades linearly | <10ms for <5K rows; <50ms with fuzzy for <100K | FlexSearch: <1ms indexed. Fuse.js: <50ms for <5K, degrades past 10K | 200-500ms (network + DB); fails this criterion without optimization | 200-500ms (server round-trip); needs Suspense/streaming to mask | <10ms client, 200-500ms server reconciliation | <10ms initially | ~instant (cmdk filters pre-loaded items) | N/A (click-based, not typing-based) |
| **MUST: Searches across relevant columns** | Yes, loop over columns in filter fn | Yes, `globalFilter` searches all columns by default | Yes, configure indexed fields | Yes, OR across columns in SQL | Yes, same as 2a at the DB level | Yes | Yes | Yes, searches across configured fields | No -- filters individual dimensions, not cross-column |
| **MUST: Clear empty state** | Manual: render "No results" when filtered array is empty | Manual: check `table.getRowModel().rows.length === 0` | Manual: check search results length | Manual: render based on empty API response | Manual: same as 2a | Manual: check both client and server results | Manual | Built-in: cmdk has empty state support | Manual: render "No results match filters" |
| **MUST: Accessible** | Manual: must add label, aria-live, etc. | Manual: TanStack is headless, no built-in a11y for filter input | Manual: library handles search, you handle UI | Manual: standard form input a11y | Manual: standard form input a11y | Manual: complex -- two result sources, one screen reader announcement | Manual | Strong: cmdk has built-in ARIA roles, keyboard nav, focus management | Manual: standard form controls |
| **SHOULD: Debounced input** | Must implement (useDebouncedCallback or custom) | Must implement (DebouncedInput pattern is documented) | Must implement | Must implement (critical for network calls) | Must implement (useSearchParams + debounce) | Must implement for server path; client can be instant | Must implement | Built-in: cmdk debounces internally | N/A (click-based) |
| **SHOULD: URL-persisted state** | Must add manually (nuqs or useSearchParams) | Must add manually (sync globalFilter with URL params) | Must add manually | Natural: query params drive API call | Built-in: URL params are the primary state mechanism | Complex: URL drives server path, client path is ephemeral | Must add manually | Not natural (palette is ephemeral overlay) | Natural: each facet maps to a URL param |
| **SHOULD: Composable with future filters** | Low: ad-hoc filter logic doesn't scale | High: TanStack Table's filter architecture supports column filters, facets, combined filters | Medium: search library handles search, but column filters need separate logic | High: API can add more WHERE clauses | High: more searchParams, more server queries | Medium-High: server path composes well, client path needs separate logic | Depends on final architecture | Medium: palette is separate from table filters | High: facets are inherently composable |
| **SHOULD: Graceful degradation** | Good: works without JS if SSR'd (but filtering needs JS) | Same as 1a | Same as 1a | Good: server handles filtering regardless of client state | Best: server component renders filtered results even without JS hydration | Good: fallback to server-only if client fails | Good: client-side works offline | Poor: modal requires JS, keyboard shortcut requires JS | Good: form-based facets can work without JS |
| **NICE: Fuzzy matching** | No (requires custom implementation) | Yes with @tanstack/match-sorter-utils | Yes (core feature of Fuse.js, good in MiniSearch/FlexSearch) | Limited (PostgreSQL trigram similarity, but complex to set up) | Limited (same as 2a) | Depends on which client library is used | Depends on implementation | Yes (cmdk has built-in fuzzy matching) | No |
| **NICE: Search highlighting** | Must implement manually | Must implement manually (access matched cell data) | Fuse.js provides match indices; others vary | Must implement manually (mark matched text in response) | Must implement manually | Must implement manually | Must implement manually | Not applicable (results shown in palette, not table) | Not applicable |
| **NICE: Cmd+K shortcut** | Must implement manually | Must implement manually | Must implement manually | Must implement manually | Must implement manually | Must implement manually | Must implement manually | Built-in (core feature) | N/A |

## Eliminated

### Eliminated on MUST Failures

- **5a: Faceted Filters Only** -- Eliminated because it fails **MUST: Searches across relevant columns**. Faceted filters let users narrow by individual dimensions but don't support the core use case of "I know roughly what I'm looking for, let me type it." Faceted filters are an excellent complement to a search bar, not a replacement for one.

- **2a: API + Database ILIKE** -- Eliminated because it marginally fails **MUST: <200ms perceived latency** for the assumed dataset size. For a greenfield dashboard with <10K rows, the network round-trip adds 200-500ms of latency that is unnecessary when the data is already client-side. The UX cost of server round-trips outweighs the benefits at this scale. (Would be reconsidered if dataset grows past 10K rows.)

- **3a: Optimistic Client + Server Reconciliation** -- Eliminated because the complexity is disproportionate to the problem. While it technically meets all MUST criteria, the reconciliation logic, dual code paths, and potential for UX jank (table "jumping" when server results differ from client results) represent unjustifiable complexity for a greenfield dashboard with a small-to-medium dataset. This approach makes sense for products at scale (think Figma's search), not for an initial implementation.

### Eliminated on Complexity/Fit

- **4a: cmdk Command Palette** -- Not eliminated as a concept (it's a great future enhancement), but eliminated as the primary solution to "add a search bar that filters the table." A command palette is a supplementary power-user feature, not a replacement for an always-visible filter input above a table. The user asked for a search bar, and a modal overlay accessed via keyboard shortcut doesn't satisfy that expectation. Furthermore, cmdk doesn't filter the table in real-time -- it shows results in its own overlay.

## Survivors Ranked

After eliminating 4 approaches, 5 survive: 1a, 1b, 1c, 2b, 3b.

### Ranking on SHOULD + NICE criteria

| Approach | Composability | URL State | Fuzzy | Highlighting | Overall |
|----------|--------------|-----------|-------|-------------|---------|
| **1b: TanStack Global Filter** | Excellent (built-in column filters, sorting, pagination) | Requires integration (nuqs or manual) | Yes via match-sorter-utils | Manual but feasible (access to filter metadata) | Strongest all-around |
| **2b: Next.js Server searchParams** | Excellent (more params = more filters) | Built-in (URL is the state) | Limited (DB-dependent) | Manual | Best for URL-driven, server-side architecture |
| **1c: Search Library (FlexSearch)** | Medium (search is separate from table state) | Requires integration | Excellent | Library-dependent | Best search quality |
| **1a: Vanilla Array.filter** | Low (ad-hoc logic) | Requires integration | No | Manual | Simplest, but doesn't scale |
| **3b: Progressive Enhancement** | Depends on final form | Requires integration | Depends | Depends | Good strategy, but "approach" is deferred |

### Selecting Finalists

I'm selecting 3 finalists that represent genuinely different paradigms:

## Finalists

1. **1b: TanStack Table Global Filter** -- from Paradigm 1 (Client-Side). Selected because it scores highest on composability (the SHOULD criterion most likely to matter long-term) and has a clear path to fuzzy matching. It's the approach that best establishes a filtering architecture that grows with the product. Represents the "invest in infrastructure" bet.

2. **2b: Next.js Server searchParams** -- from Paradigm 2 (Server-Side). Selected because it represents a fundamentally different architecture (URL-driven server rendering vs. client-side state) and aligns with Next.js's recommended patterns. Represents the "align with the framework" bet.

3. **1a: Vanilla Array.filter** -- from Paradigm 1 (Client-Side). Selected because it's the simplest possible solution and serves as a baseline. If it meets all requirements, the additional complexity of the other approaches needs justification. Represents the "simplest thing that works" bet.

Note: 1a and 1b are both client-side, but they represent different bets -- minimal dependency vs. architectural investment. Including both ensures we test whether the added complexity of TanStack Table is justified.

## Key differentiator

**Does this feature need to establish a filtering architecture, or is it a one-off addition?**

If the dashboard will grow to have more filters, column-specific filtering, sorting, and pagination, then TanStack Table (1b) pays for its complexity immediately. If the search bar is likely to remain the only filter for a long time, vanilla Array.filter (1a) is sufficient and the simplest. If the team is committed to Next.js App Router patterns and may need server-side filtering eventually, 2b is the most natural fit.

The prototype should answer: **How much additional complexity does TanStack Table add compared to vanilla filtering, and does the composability it provides justify that cost for the expected feature trajectory?** And separately: **Does the server round-trip latency of the Next.js searchParams approach produce a noticeably worse UX than client-side filtering for a dataset of the expected size?**

## Open risks

1. **Dataset size uncertainty.** All analysis assumes <10K rows. If the dataset is or grows to be larger, the ranking shifts significantly toward server-side approaches.

2. **TanStack Table buy-in.** If the table isn't already using TanStack Table, adopting it just for global filtering is a bigger decision than it appears -- it reshapes the entire table component.

3. **URL state complexity.** Both 1b and 2b benefit from URL-persisted search state, but synchronizing TanStack Table's internal state with URL params (via nuqs or manual wiring) has known pain points (see TanStack/table Discussion #5002).

4. **Fuzzy matching tuning.** Fuzzy search sounds great in theory but the threshold between "helpfully forgiving" and "returns random noise" requires real user data to calibrate.
