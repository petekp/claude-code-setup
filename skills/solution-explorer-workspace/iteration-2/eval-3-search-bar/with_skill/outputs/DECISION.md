# Decision: Dashboard Search Bar for Table Filtering

## Selected approach

**TanStack Table with Global Filter + Fuzzy Matching (Approach 1b)** -- Client-side filtering using TanStack Table's built-in global filter with `@tanstack/match-sorter-utils` for fuzzy matching, paired with `nuqs` for URL state persistence.

## Evidence for this choice

### From prototyping (COMPARISON.md)
- **Composability was the decisive factor.** Prototyping revealed that the gap between vanilla filtering and TanStack Table's composability is larger than analysis suggested. Adding future filters (column-specific, sorting, pagination) is trivial with TanStack Table (~15 lines per filter) versus significant rework with vanilla Array.filter.
- **Fuzzy matching works out of the box.** The `rankItem` function from `@tanstack/match-sorter-utils` provides production-quality fuzzy matching with no additional configuration. Prototype B had fuzzy matching working immediately; Prototype A would need a new library and structural changes to add it.
- **Performance is equivalent to vanilla for expected data sizes.** At 1K rows, TanStack's fuzzy filter adds ~2-4ms overhead compared to substring matching. Both are well under the 200ms threshold.

### From research (SOLUTION_MAP.md)
- TanStack Table is the most widely adopted headless table library in the React ecosystem, used in production by thousands of apps. Well-documented, actively maintained, excellent TypeScript support.
- The `match-sorter-utils` package is purpose-built for TanStack Table's filter system and handles edge cases (Unicode, diacritics, multi-word matching) that a custom implementation would miss.
- `nuqs` is used by Sentry, Supabase, and Vercel for URL state management in Next.js. It's ~6KB gzipped, type-safe, and supports debouncing natively.

### From analysis (ANALYSIS.md)
- TanStack Table scored highest on the SHOULD criterion "Composable with future filters" -- the criterion most likely to matter as the dashboard evolves.
- It meets all MUST criteria (functional filtering, <200ms latency, cross-column search, clear empty state, accessible).
- The per-column search configuration (`enableGlobalFilter`) provides explicit control over which columns are searchable, preventing the "revenue column" problem identified in prototyping.

## Why not the alternatives

- **Vanilla Array.filter (Approach 1a):** Eliminated because of the composability gap. While 60 lines shorter and zero-dependency, every future table feature (column filters, sorting, pagination) must be built from scratch. The prototype demonstrated that the vanilla approach creates a maintenance trajectory where each new feature adds ad-hoc complexity. For a dashboard that will grow, starting with TanStack Table is cheaper long-term than gradually reimplementing its features piecemeal. The upfront cost (~20KB bundle, ~60 more lines, learning curve) is modest and one-time.

- **Next.js Server searchParams (Approach 2b):** Eliminated because it fails the responsiveness MUST criterion for client-loaded datasets. Prototyping revealed 400-700ms perceived latency per search action (300ms debounce + 100-400ms server round-trip), compared to <10ms for client-side. The URL state benefit is real but achievable in the client-side approach via nuqs. The server-side pattern would be reconsidered if the dataset grows past ~10K rows or requires server-side pagination.

- **Search Library (Approach 1c, Fuse.js/FlexSearch):** Not prototyped but eliminated during analysis because TanStack Table's `match-sorter-utils` provides equivalent fuzzy matching quality with better integration into the table's filter system. A standalone search library would be redundant if TanStack Table is already managing the table state.

- **Optimistic Client + Server Hybrid (Approach 3a):** Eliminated during analysis because the reconciliation complexity is disproportionate to the value for a small-to-medium dataset. Would reconsider at scale.

- **cmdk Command Palette (Approach 4a):** Eliminated because it doesn't satisfy the core requirement of an always-visible inline search bar. A command palette is a complementary feature, not a replacement. Worth adding later as a power-user enhancement.

- **Faceted Filters Only (Approach 5a):** Eliminated because it fails the cross-column free-text search MUST criterion. Faceted filters are complementary and would pair well with TanStack Table's column filter infrastructure in a future iteration.

## Implementation plan

### Step 1: Install dependencies
```bash
npm install @tanstack/react-table @tanstack/match-sorter-utils nuqs
```

### Step 2: Define the table columns
Create a column definition file using `createColumnHelper<T>()` typed to the data model. Configure `enableGlobalFilter` per column (disable for numeric/date columns that shouldn't be text-searched).

### Step 3: Build the SearchInput component
A `"use client"` component that:
- Renders a `<input type="search">` with proper labeling and a11y attributes
- Uses `nuqs`'s `useQueryState('q', { defaultValue: '', throttleMs: 150 })` for URL-persisted, debounced state
- Exposes the current search value for the parent to pass to the table

### Step 4: Build the DataTable component
A `"use client"` component that:
- Accepts `data` and `globalFilter` (search term) as props
- Uses `useReactTable` with `getCoreRowModel`, `getFilteredRowModel`, and the fuzzy filter function
- Renders the table with header groups, rows, and cells via `flexRender`
- Includes empty state with a "No results" message
- Includes an `aria-live` region announcing result count

### Step 5: Compose on the dashboard page
The dashboard page (server component) fetches data and renders:
```tsx
<NuqsAdapter>
  <SearchInput />
  <Suspense fallback={<TableSkeleton />}>
    <DataTable data={results} />
  </Suspense>
</NuqsAdapter>
```

### Step 6: Add keyboard shortcut
Wire "/" to focus the search input (a common pattern for search-heavy interfaces). Implement at the page level with a `useEffect` keydown listener, guarded to not trigger when already in an input/textarea.

### Step 7: Test and verify
- Test with 100, 1K, and 10K rows to confirm <200ms performance
- Test fuzzy matching: "alic" matches "Alice", "eng" matches "Engineering"
- Test empty state: search for something with no matches
- Test URL persistence: search, reload, verify term persists
- Test accessibility: keyboard navigation, screen reader announces result count
- Test composability: add a simple column filter to verify the architecture supports it

## Known risks and mitigations

- **Risk:** TanStack Table's learning curve for the team. Developers unfamiliar with the headless table pattern may find the `useReactTable` / `flexRender` / row model pipeline confusing initially.
  **Mitigation:** The implementation plan produces a working component that can be used as a reference. TanStack Table's documentation and examples are comprehensive. The team will learn the pattern once and reuse it for all future table features.

- **Risk:** nuqs has framework-specific setup (requires a `NuqsAdapter` component in the App Router). Misconfiguration causes the search to not persist.
  **Mitigation:** Follow the nuqs Next.js App Router setup guide. Add a smoke test that verifies URL param round-tripping.

- **Risk:** Fuzzy matching threshold may return too many or too few results for real data (the threshold is tuned for general-purpose text, not domain-specific data).
  **Mitigation:** Start with `match-sorter-utils` defaults. If search quality is unsatisfactory, tune the `threshold` option on `rankItem` based on user feedback. This is a configuration change, not a structural one.

- **Risk:** Dataset grows past the client-side comfort zone (>10K rows). Client-side filtering becomes sluggish.
  **Mitigation:** TanStack Table supports server-side filtering via `manualFiltering: true`. The migration path is: stop passing all data client-side, add an API endpoint, fetch filtered data server-side, pass results to the table. The table component's interface barely changes -- only the data source does. This migration is less painful than any other approach because TanStack Table abstracts the filtering strategy from the rendering.
