# Prototype Comparison: Dashboard Search Bar for Table Filtering

## Comparison criteria (defined before prototyping)

1. **Implementation size and cognitive complexity** -- How many lines of code? How many concepts does a developer need to understand to work on it? (Measured: line count, number of dependencies, number of new abstractions.)

2. **Composability for future filters** -- How hard is it to add a second filter (e.g., status dropdown) alongside the search bar? (Measured: describe the concrete steps needed, estimate the diff size.)

3. **UX responsiveness** -- How does the search feel when typing? Is there perceptible lag? (Assessed: analyze the debounce/render path for a 1K-row dataset.)

4. **URL state integration** -- How much additional work is needed to persist the search term in the URL? (Measured: describe the additional code needed.)

5. **Path to fuzzy matching** -- What does it take to upgrade from substring matching to fuzzy matching? (Measured: describe the code changes.)

## Results

### Prototype A: Vanilla Array.filter
- **Location:** `prototypes/a-vanilla/`
- **Implementation size:** ~70 lines in a single file. 1 useState, 1 useMemo, 1 helper function. Zero dependencies beyond React. A junior developer could understand and modify this in minutes.
- **Composability:** Low. Adding a status dropdown filter means adding another useState, another filter function, and composing them manually: `data.filter(matchesSearch).filter(matchesStatus)`. Each new filter adds ad-hoc logic. There's no shared abstraction for "a filter." At 3-4 filters, this becomes unwieldy.
- **UX responsiveness:** Excellent. For 1K rows, `Array.filter` with `String.includes` across 5 columns takes <1ms. With the 150ms debounce, the perceived response is essentially instant. Even at 10K rows, substring matching is fast enough (<5ms). Performance would degrade around 50K+ rows.
- **URL state integration:** Requires ~20 additional lines. Options: (a) Replace useState with nuqs's `useQueryState` (~5 lines change, adds dependency), or (b) manual useSearchParams wiring (~20 lines, no dependency). Either way, must handle the sync between controlled input value and URL state.
- **Path to fuzzy matching:** Significant rework. Must bring in Fuse.js or similar (~5KB), replace the `filterRows` function with index creation and querying, handle index rebuilds when data changes. The component's structure changes meaningfully.
- **Surprises:** The simplicity is genuinely appealing. For a team that values "boring technology," this is hard to argue against. The main concern is that every future enhancement (fuzzy, URL state, more filters) is incremental bolt-on work that gradually turns the simple component into a complex one.

### Prototype B: TanStack Table Global Filter
- **Location:** `prototypes/b-tanstack/`
- **Implementation size:** ~130 lines. 2 imports from external packages, column definitions, a custom filter function, and TanStack Table's `useReactTable` hook with multiple row model processors. A developer needs to understand TanStack Table's mental model: columns, row models, filter functions, and the headless rendering pattern. There's a learning curve, but it's a well-documented one.
- **Composability:** Excellent. Adding a status dropdown filter means: (1) add `enableColumnFilter: true` on the status column, (2) add a `<select>` that calls `column.setFilterValue()`. That's it -- ~15 lines. TanStack Table composes global filter + column filters + sorting + pagination automatically. The architecture handles the interaction between filters (e.g., column filter results are then globally filtered) without custom logic.
- **UX responsiveness:** Excellent. TanStack Table's `getFilteredRowModel` is memoized internally. The fuzzy filter via `rankItem` is slightly more expensive than substring matching (~3-5ms for 1K rows, ~20-30ms for 10K rows) but well within the <200ms threshold. The additional overhead of TanStack Table's row model pipeline is negligible.
- **URL state integration:** Requires ~15 additional lines to sync `globalFilter` state with URL params. Can use nuqs: `const [query, setQuery] = useQueryState('q')` and pass to `state.globalFilter`. The TanStack Table docs have examples of this pattern. Note: syncing column-level filters with URL params is more complex (each filter needs its own param).
- **Path to fuzzy matching:** Already implemented. The prototype includes `@tanstack/match-sorter-utils` and the fuzzy filter function. It works out of the box. Tuning the fuzziness threshold is possible via `rankItem` options.
- **Surprises:** Two surprises emerged:
  1. **Positive:** The column definition pattern (`createColumnHelper`) provides a natural place to configure per-column search behavior (e.g., `enableGlobalFilter: false` on the revenue column to exclude numbers from search). This is something you'd need to hardcode in the vanilla approach.
  2. **Negative:** Managing the filter state externally (useState + debounce) while TanStack Table also wants to manage it (via `onGlobalFilterChange`) creates a slightly awkward pattern. You either let TanStack own the state (and debounce at the input level) or own it externally (and suppress TanStack's state updates). Neither is terrible, but it's a source of confusion for developers new to the library.

### Prototype C: Next.js Server searchParams
- **Location:** `prototypes/c-nextjs-server/`
- **Implementation size:** ~150 lines across 3 files (page server component, search input client component, results table server component). Requires understanding the Next.js App Router's server/client component boundary, searchParams flow, and Suspense for loading states. More files, more concepts, but each file is straightforward.
- **Composability:** Good. Adding a status dropdown filter means: add another searchParam (`?q=term&status=active`), read it in the page's server component, pass it to the data fetching function. The URL is the natural composition point. However, every new filter adds a server round-trip dimension (the server must re-query for every filter change).
- **UX responsiveness:** Noticeably worse. Every search keystroke (after 300ms debounce) triggers: URL update -> Next.js router navigation -> server component re-execution -> data fetch -> response -> React reconciliation -> render. Even with local data simulation, this adds 50-200ms. With a real database, add network latency (50-200ms more). Total perceived latency: 300ms debounce + 100-400ms server round-trip = 400-700ms. This is above our 200ms MUST criterion for the common case. The Suspense fallback ("Searching...") helps communicate progress but doesn't mask the delay.
- **URL state integration:** Built-in. This is the one area where Prototype C excels by default -- the URL IS the state. No additional work needed. The search term is in the URL from the start, meaning it's shareable, bookmarkable, and survives refresh with zero extra code.
- **Path to fuzzy matching:** Requires server-side implementation. Options: (a) use a fuzzy library server-side (Fuse.js works in Node), (b) add PostgreSQL trigram similarity or full-text search. Either way, fuzzy matching is a server concern, not a client concern, which is architecturally clean but means you can't just swap in a client-side library.
- **Surprises:** One significant surprise:
  1. **The input control problem.** Because the search input uses `defaultValue` (uncontrolled) instead of `value` (controlled), the input's displayed text and the URL's `q` param can desync. If the user types "abc", the URL updates to `?q=abc`, the server re-renders, and the input gets a new `defaultValue="abc"` -- but the cursor position and input state are preserved by the browser. However, if the user navigates away and back, the input resets to whatever `defaultValue` the server provides. This is a known friction point in the Next.js App Router pattern for search inputs. The alternative (controlled input synced with URL params) requires more client-side state management, partially negating the benefit of the server-driven approach.

## Verdict

**Prototype B (TanStack Table) answered the key differentiating question most clearly.**

The key question was: **Does this feature need to establish a filtering architecture, or is it a one-off?**

Building the prototypes revealed that:

1. **Prototype A (Vanilla)** is the fastest to ship but creates a dead-end. Each future enhancement is bolt-on work, and the component gradually accumulates complexity without a unifying abstraction. It's the right choice only if you're confident the search bar is the last table feature you'll ever add.

2. **Prototype B (TanStack Table)** has higher upfront cost (~60 more lines, 2 new dependencies, a learning curve) but provides an architecture that makes the next 5 features nearly free. Column filters, sorting, pagination -- they're all already wired up, just needing UI controls. The fuzzy matching works out of the box. The overhead is ~20KB gzipped of dependencies, which is modest.

3. **Prototype C (Next.js Server)** has the best URL state story but the worst responsiveness. The 400-700ms perceived latency for every search action is a meaningful UX regression compared to <10ms client-side filtering. For a dashboard with a small dataset where data is already loaded, pushing search to the server adds latency without a corresponding benefit.

## Updated understanding

Three insights emerged from prototyping that weren't visible during analysis:

1. **The composability gap between A and B is larger than expected.** During analysis, I described Prototype A's composability as "Low" but it seemed manageable. In practice, writing the vanilla filter and then imagining adding 2 more filters made it clear that without a shared abstraction for "filter state + filter application + filter composition," you end up with a tangle of interacting useState + useMemo calls. TanStack Table isn't just a convenience; it's an architecture.

2. **The Next.js Server searchParams pattern has a fundamental UX tension for search inputs.** The pattern works beautifully for page-level navigation (clicking a link that includes query params) but fights against the typing-and-instant-feedback UX that users expect from search bars. The debounce must be longer (300ms+) to avoid hammering the server, and the round-trip adds delay on top of that. This doesn't mean the pattern is wrong -- it's ideal for server-side filtering at scale -- but for a client-loaded dashboard, it's the wrong tool.

3. **The "revenue column" problem is a useful litmus test.** Should searching "500" match rows where the revenue is $500.00? Prototype A includes the revenue column in the filter by default (it's just another string comparison after `String()`). Prototype B lets you explicitly opt out (`enableGlobalFilter: false` on the revenue column). Prototype C depends on the database query. This small decision highlights the value of explicit column-level search configuration, which TanStack Table provides naturally.
