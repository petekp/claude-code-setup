# Solution Map: Dashboard Search Bar for Table Filtering

## Paradigm 1: Client-Side In-Memory Filtering
**Core bet:** The dataset fits comfortably in the browser and the fastest UX comes from eliminating network round-trips entirely.

This paradigm loads all data upfront and filters it locally using JavaScript. The entire dataset lives in memory, and the search bar operates directly on it. This is the most common pattern for dashboard tables and the one most LLMs would jump to immediately.

### Approach 1a: Vanilla Array.filter with Substring Matching
- **How it works:** The search input's value is stored in React state (useState or URL params via nuqs). On change (debounced ~150-300ms), rows are filtered using `Array.filter()` with `String.includes()` or `String.toLowerCase().includes()` across all searchable columns. The filtered array is passed to the table component. Memoize the filter computation with `useMemo` keyed on [data, searchTerm].
- **Gains:** Zero dependencies beyond React. Dead simple to understand, test, and debug. Works with any table component or even a plain `<table>`. Full control over matching logic. No build complexity.
- **Gives up:** No fuzzy matching (typos kill results). No relevance ranking (all matches are equal). Performance degrades linearly with dataset size. No search highlighting without additional code. Must hand-roll debouncing.
- **Shines when:** Dataset is under ~5K rows, team wants minimal dependencies, search requirements are simple (exact substring is fine), and the priority is shipping fast.
- **Risks:** Becomes a performance bottleneck if data grows past expectations. Substring matching frustrates users who make typos. Adding features (fuzzy, highlighting, column weighting) means gradually rebuilding a search library.
- **Complexity:** Simple

### Approach 1b: TanStack Table with Built-In Global Filter
- **How it works:** Use `@tanstack/react-table` with `getFilteredRowModel()` and `globalFilter` state. TanStack Table manages the filter state internally and provides `getFilteredRowModel` which applies the filter function to all rows. Can use the built-in `includesString` filter or a custom fuzzy filter via `@tanstack/match-sorter-utils`. The search input calls `table.setGlobalFilter(value)`. Debounce the input with a `DebouncedInput` component.
- **Gains:** Integrates filtering into the broader table state (sorting, pagination, column visibility). Supports custom filter functions out of the box. `match-sorter-utils` provides production-quality fuzzy matching with relevance ranking. Composable: adding column-specific filters later is trivial. Headless (no UI opinions). Excellent TypeScript support.
- **Gives up:** Takes on TanStack Table as a dependency (though it's well-maintained and headless). Requires learning TanStack Table's mental model if you're not already using it. The global filter API has some quirks (e.g., filter function must handle all column types). More boilerplate than vanilla filter for the initial implementation.
- **Shines when:** You're already using or planning to use TanStack Table. You need fuzzy matching. You anticipate adding column filters, sorting, or pagination. You want a composable filtering architecture.
- **Risks:** If the table component is custom or uses a different library, you'd be adding TanStack just for filtering (possible but unusual). `match-sorter-utils` adds another dependency. The fuzzy filter's `rankItem` can be slow on very large datasets (tested to ~100K rows but YMMV).
- **Complexity:** Moderate

### Approach 1c: Dedicated Search Library (Fuse.js / MiniSearch / FlexSearch)
- **How it works:** Build a search index from the table data using a library like Fuse.js (fuzzy), MiniSearch (full-text), or FlexSearch (high-performance full-text). On input change, query the index and use the returned item IDs/indices to filter the table. The index is rebuilt when data changes (or incrementally updated for MiniSearch/FlexSearch).
- **Gains:** Purpose-built search quality: fuzzy matching (Fuse.js), full-text with field boosting (MiniSearch), or blazing-fast tokenized search (FlexSearch). Relevance scoring and ranking built-in. Can handle much larger datasets than naive Array.filter. FlexSearch in particular can handle 100K+ records with sub-millisecond search times due to its pre-built index.
- **Gives up:** Additional dependency (3-15KB gzipped depending on library). Index build time on data load (one-time cost). Index must be synchronized when data changes. More conceptual overhead: the team needs to understand index configuration (fields, weights, tokenization). Overkill if substring matching is acceptable.
- **Shines when:** Search quality matters (typo tolerance, relevance ranking). Dataset is medium-large (10K-100K rows). Users search heterogeneous columns where simple substring falls short. You want the search to feel like a product search, not a text filter.
- **Risks:** Fuse.js performance degrades on datasets over ~10K items (it re-scans on every query). MiniSearch and FlexSearch are better at scale but have more complex APIs. Memory usage for the index (FlexSearch indexes can be large). Configuration choices (tokenization, fuzziness threshold) affect result quality in ways that are hard to tune without real user data.
- **Complexity:** Moderate

## Paradigm 2: Server-Side / API-Driven Filtering
**Core bet:** The data source is the source of truth, and pushing search to the server gives better performance at scale, fresher data, and leverages database-level search capabilities.

This paradigm sends the search term to an API, which queries the database (with WHERE ILIKE, full-text search, or an external search service) and returns only matching rows. The client only ever holds one page of results.

### Approach 2a: API Endpoint with Database LIKE/ILIKE Query
- **How it works:** The search input value is reflected in URL search params (e.g., `?q=search+term`). A server component or data-fetching hook reads the param and calls an API endpoint: `GET /api/results?q=search+term&page=1`. The backend constructs a SQL query with `WHERE column ILIKE '%search_term%'` across searchable columns (using OR). Results are paginated. The frontend renders whatever comes back. In Next.js App Router, this can be a server component that reads `searchParams` directly.
- **Gains:** Handles arbitrarily large datasets (filtering happens in the database, not the browser). Data is always fresh (no stale client-side cache). No client-side memory footprint for the full dataset. Naturally composable with pagination and other server-side filters. Leverages database indexing.
- **Gives up:** Network latency on every search (even with debouncing, there's a perceptible delay). Requires backend implementation (API route + database query). ILIKE with leading wildcards (`%term%`) can't use standard B-tree indexes and is slow on large tables without full-text indexes. More moving parts: loading states, error handling, race conditions (stale responses arriving after newer ones). The search input UX feels less snappy than client-side.
- **Shines when:** Dataset is large (10K+ rows), data changes frequently, you already have server-side pagination, or security requires that not all data be sent to the client.
- **Risks:** Leading-wildcard ILIKE is a performance trap that many teams don't discover until production scale. Network failures degrade the search experience completely. Race conditions between debounced requests (last request might not be last response) need handling (abort controllers). Building a good search API is more work than it appears.
- **Complexity:** Moderate-Complex

### Approach 2b: Next.js Server Component with searchParams (App Router Pattern)
- **How it works:** Following the Next.js App Router pattern (as documented in their official dashboard tutorial): the search input is a client component that updates URL search params using `useSearchParams()` + `useRouter().replace()` with debouncing. The parent page is a server component that reads `searchParams` and fetches filtered data directly in the component. This creates a URL-driven data flow: user types -> URL updates -> server component re-renders with new data -> table updates. Uses `usePathname` + `useSearchParams` for the input, and `searchParams` prop on the page component for the query.
- **Gains:** Aligns perfectly with Next.js App Router's mental model. URL state is the single source of truth (shareable, bookmarkable, survives refresh). Server components handle the data fetching (no client-side fetch logic). Streaming and Suspense for loading states. The pattern is well-documented by Vercel and widely adopted. Clean separation: client component owns the input, server component owns the data.
- **Gives up:** Tied to Next.js App Router. Every keystroke (after debounce) triggers a server round-trip and page re-render. Less snappy than pure client-side for small datasets. Requires a data source that supports server-side filtering (database query or API). The pattern is somewhat rigid -- extending it to complex multi-filter scenarios requires careful state coordination.
- **Shines when:** Using Next.js App Router (which we are, per project instructions). The dashboard page is already a server component that fetches data. You want URL-driven state as a first-class pattern. The dataset may grow large enough to warrant server-side filtering.
- **Risks:** The server round-trip adds latency that users notice compared to client-side instant filtering. If the database query is slow, the search feels sluggish. Overuse of URL state for complex filter combinations can make URLs unwieldy. Need to handle the "flash of unfiltered content" during loading.
- **Complexity:** Moderate

## Paradigm 3: Hybrid Client + Server
**Core bet:** The best UX comes from combining instant client-side feedback for the common case with server-side fallback for edge cases and scale.

### Approach 3a: Optimistic Client Filter with Server Reconciliation
- **How it works:** Load an initial page of data client-side (e.g., first 1000 rows). The search bar filters this local data instantly for immediate feedback. Meanwhile, a debounced request goes to the server with the search term. When the server response arrives, it replaces the client-filtered results with the authoritative server results. If the client had all relevant data, the transition is invisible. If the server finds additional matches beyond the local set, the results expand. Uses React Query or SWR for the server fetch with `keepPreviousData: true` for smooth transitions.
- **Gains:** Instant feedback in the common case (user sees results filtering immediately). Server authority for correctness and completeness. Graceful degradation: if the server is slow, the client-side results are still useful. Can handle datasets that grow beyond client capacity without redesigning.
- **Gives up:** Significant implementation complexity: you're maintaining two filtering paths (client and server) and reconciling them. Potential UX jank if server results differ significantly from client-filtered results (the table "jumps"). More state to manage (local filtered results, server results, loading state, reconciliation logic). Testing is harder because you need to test both paths and their interaction.
- **Shines when:** Dataset is in the "awkward middle" (5K-50K rows) where client-side is borderline and server-side feels sluggish. UX responsiveness is a top priority. The team has capacity for the additional complexity.
- **Risks:** The reconciliation UX is hard to get right. If client and server results frequently diverge, users see the table "flicker" which is worse than a consistent loading state. The complexity may not be justified for the improvement in UX. Two code paths means two places for bugs.
- **Complexity:** Complex

### Approach 3b: Client-Side with Progressive Enhancement to Server
- **How it works:** Start with pure client-side filtering (Approach 1a or 1b). Add instrumentation to measure filter performance (how long does filtering take? how many rows?). If/when data grows past a threshold, add a server-side endpoint and swap the implementation. The component interface stays the same (it takes data and a filter term), only the data source changes. Use a feature flag or environment check to switch between modes.
- **Gains:** Ships fast (start with the simple approach). Defers server-side complexity until it's actually needed. The interface design from Phase 1 still works. Evidence-based decision about when to migrate (measured, not speculated). Minimal upfront complexity.
- **Gives up:** You're knowingly building something that might be replaced. The "swap" is rarely as clean as planned (server-side pagination changes the component contract). Monitoring and threshold logic add their own complexity. If data grows quickly, you might hit the performance wall before the migration is ready.
- **Shines when:** You genuinely don't know if the dataset will grow. You want to ship fast and iterate. YAGNI is a core value. The team is comfortable with planned refactoring.
- **Risks:** "We'll migrate when we need to" often becomes "we'll migrate when it's an emergency." The migration path might be harder than building server-side from the start if the component contracts diverge.
- **Complexity:** Simple initially, Moderate over time

## Paradigm 4: Command Palette / Spotlight Search
**Core bet:** The search bar shouldn't just filter a table -- it should be a universal navigation and action surface, like Cmd+K in Linear, Raycast, or Spotlight.

### Approach 4a: cmdk-Based Command Palette with Table Filtering
- **How it works:** Instead of (or in addition to) an inline search bar above the table, implement a Cmd+K command palette using the `cmdk` library (or shadcn/ui's Command component which wraps it). The palette opens as a dialog overlay. It includes a "Filter results" action group that searches across table data. Selecting a result navigates to it or applies it as a filter. The palette can also include dashboard actions (change view, export data, navigate to pages) making it a power-user feature.
- **Gains:** Dramatically more capable than a single-purpose search bar. Power users love it (see Linear, Notion, GitHub). Can serve as both search and navigation. The cmdk library handles fuzzy matching, keyboard navigation, grouping, and accessibility out of the box. Establishes a pattern that scales to the entire app, not just one table.
- **Gives up:** Doesn't replace an inline search bar for table filtering (users still expect an always-visible filter input). Higher complexity for what was asked (a search bar, not a command palette). The palette UX requires curation of actions and groups. Non-power-users may not discover Cmd+K. Overkill if the dashboard has one table and one use case.
- **Shines when:** The dashboard is complex with multiple views, actions, and navigation targets. The team is building for power users. You want a feature that differentiates the product UX.
- **Risks:** Over-engineering for the stated requirement. Users who don't know the shortcut never benefit. The command palette might feel disconnected from the table (searching in a modal vs. seeing the table filter in real-time). Maintaining the action registry as the app grows requires discipline.
- **Complexity:** Moderate-Complex

## Paradigm 5: No Search Bar (Reframe the Problem)
**Core bet:** Maybe the real problem isn't "users need to search" but "users see too many rows." If so, there are solutions that don't involve a search bar at all.

### Approach 5a: Smart Defaults with Faceted Filters
- **How it works:** Instead of a free-text search bar, provide structured filters: status dropdowns, date range pickers, category selectors. These are pre-built from the data's schema. Users narrow results by combining facets rather than typing search terms. This is the pattern used by e-commerce sites (Amazon, Shopify admin), issue trackers (Jira), and most admin dashboards.
- **Gains:** Users don't need to know what to search for (they browse the available values). No typo problem. Filters directly map to data dimensions so the results are always meaningful. Works naturally with server-side filtering (each facet maps to a WHERE clause). Composable by nature. Analytics can show which filters are most used.
- **Gives up:** Doesn't address the "I know the name/ID and want to get to it fast" use case. More UI surface area (dropdowns, pickers take space). Requires understanding the data schema to design good facets. Slower than a search bar for users who know exactly what they want. Might not handle the long-tail of queries that don't map to a facet.
- **Shines when:** The data has clear categorical dimensions. Users browse more than they search. The team wants to guide users toward effective filtering patterns rather than leaving them with a blank text box.
- **Risks:** Users who want to search will be frustrated by having to click through dropdowns. Complementary to a search bar, not a replacement -- most production dashboards have both.
- **Complexity:** Moderate

## Non-obvious options

### Hybrid: Inline Search Bar + Cmd+K Power Access
Combine a simple inline search bar above the table (Approach 1a or 1b for immediate filtering) with a Cmd+K palette (Approach 4a) that provides the same search plus navigation and actions. The inline bar is the primary interface; the palette is the power-user accelerator. This mirrors what Linear and Notion do -- they have contextual search/filter inline plus a global palette.

### Browser-Native: CSS-Based Instant Highlight
Use the browser's Find (Cmd+F) behavior as inspiration: instead of filtering (hiding rows), highlight matching cells with a CSS class and scroll to the first match. This preserves context (the user can still see surrounding rows) and is trivial to implement. Add a custom search bar that applies `mark` tags or CSS highlights to matching text. This reframes "filtering" as "finding within the visible set."

### Virtual Scrolling + Search Index
For extremely large client-side datasets (50K+ rows), combine a search library (FlexSearch) with virtual scrolling (TanStack Virtual or react-window). The search index returns matching row indices; the virtual scroller only renders visible rows from the matched set. This gives O(1) render performance regardless of result count and instant search from the pre-built index.

### Lazy Search: Type-Ahead with Suggestion Dropdown
Instead of filtering the table in real-time, show a type-ahead dropdown above the search bar with the top 5-10 matches. Selecting a suggestion filters/navigates. This avoids the jarring table-reflow-on-every-keystroke problem and works naturally with server-side search (you're only fetching suggestions, not full results). Used by GitHub's search, Google Search, and most e-commerce sites.

## Eliminated early

- **Elasticsearch/Algolia/Typesense (managed search service):** Massively over-engineered for a dashboard table. These services shine at product search (millions of documents, complex ranking, analytics) but adding a search service dependency for filtering a dashboard table is like hiring a contractor to hang a picture frame. Eliminated on complexity/cost grounds.

- **SQLite in the browser (sql.js / wa-sqlite):** While technically fascinating (run SQL queries against a client-side SQLite database loaded into WASM), the setup complexity, WASM bundle size (~500KB), and data synchronization challenges make this impractical for the use case. Could be interesting for offline-first applications with complex query needs.

- **GraphQL with Filtering:** If the API were GraphQL, you could add filter arguments to the query. But this requires a GraphQL stack to already be in place. Adding GraphQL just for table filtering is a paradigm migration, not a feature.

- **Regex-Based Search:** Exposing regex search to end users (like grep) is powerful for developers but hostile to non-technical users. A search bar that doesn't match "John" when they type "john" (case-sensitive regex) or crashes on "john(" (invalid regex) is a support ticket generator.
