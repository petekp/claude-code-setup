# Analysis: Dashboard Search/Filter

## Tradeoff Matrix

| Criterion | 1a: Vanilla filter() | 1b: TanStack Table | 1c: Web Worker | 2a: API LIKE | 2b: Search Service | 3a: RSC + searchParams | 3b: nuqs | 4a: cmdk Palette | 5a: Column Filters |
|---|---|---|---|---|---|---|---|---|---|
| **MUST: <200ms filter response** | ~5ms for <5K rows, ~50ms for 10K | ~5ms with match-sorter, <100ms for 50K | ~10ms perceived (off-thread) even for 100K+ | 100-400ms (network dependent) | 50-150ms (search service + network) | 200-600ms (server render + stream) | Same as underlying approach | ~5ms (client filtering within modal) | ~5ms per column (same as 1a per column) |
| **MUST: Works with all data types** | Manual: must write matchers per type | Built-in: string, number, date column types | Same as whatever filter logic runs in worker | DB handles type coercion naturally | Search engines handle all indexable types | Same as data source | Same as underlying approach | Text matching only (typically) | Best: each column gets type-appropriate filter |
| **MUST: Doesn't break sort/pagination** | Manual integration required | First-class integration | Depends on implementation | Natural: DB handles filter + sort + page | Separate from table state (needs sync) | Natural: searchParams include sort/page | Natural: all state in URL | Orthogonal (doesn't touch table) | Manual integration required |
| **MUST: Accessible** | Must build: aria-live, labels | Must build (headless = BYO a11y) | Same as surface approach | Same as surface approach | InstantSearch has good a11y | Must build | Same as surface approach | cmdk has good built-in a11y | Must build per filter control |
| **MUST: Clear empty state** | Must build | Must build | Must build | Must build | InstantSearch has built-in | Must build | Must build | Built into cmdk | Must build |
| **SHOULD: URL persistence** | ~30 lines with useSearchParams | Manual (TanStack doesn't manage URL) | Manual | Natural (query param on API call) | URL sync available in InstantSearch | Free (searchParams IS the state) | Free (this is what nuqs does) | Not applicable (modal, not persistent filter) | Possible but complex (N params) |
| **SHOULD: Debounced input** | ~10 lines with useDeferredValue or custom hook | Manual or use their DebouncedInput example | Natural (post message is async) | Essential (avoid API spam) | Built into InstantSearch | Essential (avoid nav spam, use router.replace) | Built in (throttleMs option) | cmdk debounces internally | Must build per input |
| **SHOULD: Works at 10K rows** | Acceptable (~50ms filter time) | Excellent (designed for this) | Excellent (off-thread) | Excellent (DB handles it) | Excellent | Depends on server/DB | Same as underlying | Not applicable (not a table filter) | Acceptable |
| **SHOULD: Match highlighting** | Must build (~20 lines) | Must build | Must build | Must build | Built into search services | Must build | Same as underlying | Built into cmdk results | Must build per column |
| **SHOULD: Clear/reset button** | Trivial | Trivial | Trivial | Trivial | Built in | Trivial (clear searchParam) | Trivial | Built in (Escape key) | More complex (reset N filters) |
| **NICE: Fuzzy matching** | Must add library (fuse.js ~25KB) | Built in via match-sorter-utils | Can run any algorithm | Requires DB extension (pg_trgm) | Built in (core feature) | Depends on filtering approach | Same as underlying | Built into cmdk (command-score) | Not typical for per-column filters |
| **NICE: Keyboard shortcut** | ~5 lines | ~5 lines | ~5 lines | ~5 lines | ~5 lines | ~5 lines | ~5 lines | Built in (Cmd+K) | ~5 lines per filter |
| **NICE: Per-column filters** | Major addition | Moderate (Column filter API exists) | Major addition | Moderate (add WHERE clauses) | Built in (faceted search) | Moderate | Moderate (add params) | Not applicable | This IS the approach |
| **Bundle size added** | ~0KB | ~30KB (table + utils) | ~0KB (worker is separate) | ~0KB client-side | ~50-80KB (InstantSearch) | ~0KB (server-rendered) | ~5KB | ~5KB (cmdk) | ~0KB (but lots of component code) |
| **Implementation effort** | ~2-4 hours | ~6-10 hours (adopt TanStack + build filters) | ~8-12 hours | ~4-6 hours (frontend + backend) | ~10-20 hours (setup + index + sync) | ~4-6 hours | ~3-5 hours | ~4-6 hours | ~12-20 hours |
| **Maintainability** | Excellent (simple code) | Good (community-maintained, well-documented) | Poor (niche pattern, hard to debug) | Good (standard pattern) | Fair (infra dependency) | Good (Next.js-idiomatic) | Good (thin abstraction) | Good (small surface area) | Poor (N filter components to maintain) |

## Eliminated

- **1c: Web Worker Filtering**: Eliminated because the assumed dataset size (hundreds to low thousands of rows) makes this over-engineered. The complexity of cross-thread communication, debugging difficulty, and niche-ness of the pattern violates the maintainability constraint. Only warranted at 50K+ rows, which is not our scenario.

- **2b: Dedicated Search Service (Algolia/Meilisearch/Typesense)**: Eliminated because introducing a new infrastructure dependency (search service, index syncing, operational monitoring) for a single dashboard table filter fails the proportionality test. Implementation effort (10-20 hours) is 5x the simplest approach. Only warranted if search is a core product feature spanning multiple data sources.

- **4a: cmdk Command Palette**: Eliminated because it fundamentally does not solve the stated problem. The requirement is "filter the table of results" -- the user needs to see all matching rows simultaneously in the table. A command palette is a "find and navigate" tool, not a "narrow the visible set" tool. It's complementary, not a substitute. The MUST criterion "users see the table results narrow to matching rows" is not met.

- **5a: Column Header Filters**: Eliminated because the implementation effort (12-20 hours) and maintenance burden (N filter components for N column types) is disproportionate to the stated requirement of "a search bar." This is the right approach when users need precise multi-criteria filtering, but it's a multi-sprint project, not a search bar feature.

## Finalists

1. **Approach 1a: Vanilla React State + Array.filter()** -- from Paradigm 1 (Client-Side). Selected because it's the simplest approach that meets all MUST criteria for the assumed dataset size. Fastest to implement (~2-4 hours). Zero dependencies. Easiest to understand and maintain. The question is whether its simplicity becomes a limitation too quickly.

2. **Approach 1b: TanStack Table with Global Filter** -- from Paradigm 1 (Client-Side). Selected because it meets all MUST criteria while also providing a clear upgrade path to advanced features (fuzzy matching, column filters, virtualization). If the table will grow in complexity, this investment pays off. The question is whether the upfront cost is justified for a search bar feature.

3. **Approach 3a: Next.js RSC + searchParams** (optionally enhanced with **3b: nuqs**) -- from Paradigm 3 (URL-Driven). Selected because it represents a fundamentally different architecture (server-rendered filtering with URL state) that has unique advantages: zero client-side state, built-in URL persistence, and alignment with Next.js best practices. The question is whether the server round-trip latency is acceptable for a type-to-filter UX.

## Key differentiator

**Does the project need a "table engine" (TanStack Table) or is the table simple enough that a plain `<table>` with `Array.filter()` will serve it for the foreseeable future?**

This is the question that separates Approach 1a from 1b. If the table is heading toward sort, paginate, select, group, and resize features, TanStack Table is the right foundation and the search bar should be built on top of it. If the table is and will remain a simple data display, TanStack Table is dead weight.

The secondary differentiator is: **Is the server-rendering latency of Approach 3a acceptable?** If the dashboard is already built on Next.js RSC patterns, 3a is architecturally elegant. If the table needs to feel instant-as-you-type, client-side filtering (1a or 1b) is the only way.

## Open risks

1. **Dataset size uncertainty**: Our assumption of "hundreds to low thousands" eliminates complex approaches. If the actual dataset is 50K+, Approach 1a fails and 1b needs virtualization. This assumption should be validated before implementation.

2. **Table feature trajectory**: If additional table interactivity is planned (sort, select, group), choosing 1a now means migrating to a table library later. Choosing 1b now means upfront investment but no migration cost. The risk is choosing wrong on this bet.

3. **Next.js version and patterns**: Approach 3a assumes the App Router and server components. If the project uses Pages Router or has a SPA architecture, 3a is not viable.

4. **Perceived performance with URL-driven approach**: The RSC approach (3a) may feel sluggish on slow connections. Without prototyping, we don't know if the latency is noticeable.
