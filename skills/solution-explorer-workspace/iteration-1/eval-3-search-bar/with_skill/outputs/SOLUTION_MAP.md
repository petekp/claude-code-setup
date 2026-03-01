# Solution Map: Dashboard Search/Filter

## Paradigm 1: Client-Side In-Memory Filtering

**Core bet:** All data is already in the browser (or can be fetched in full upfront). Filtering is a pure UI concern -- iterate over the array, hide non-matching rows. No network round-trips after initial load.

This is the simplest paradigm and the most common for dashboards with moderate data volumes. Its advantage is zero latency on filter operations. Its risk is that it breaks down at scale.

### Approach 1a: Vanilla React State + Array.filter()

- **How it works:** A controlled `<input>` stores the search query in React state. On every change (debounced ~150-300ms), `Array.filter()` runs against the data array, checking if any column value includes the query string (case-insensitive). The filtered array is passed to the table component. URL sync via `useSearchParams` makes the filter shareable.

- **Gains:** Zero dependencies. Fully understood by any React developer. Total control over matching logic. ~50-100 lines of code for the entire feature. Easy to test -- it's just a pure function. Works with any table rendering approach.

- **Gives up:** No fuzzy matching (exact substring only). No relevance ranking. Performance degrades linearly with row count. No column-specific filtering without additional UI. Must manually implement debouncing, URL sync, and highlight logic.

- **Shines when:** Dataset is small (<5,000 rows), team is small, speed of delivery matters, the search requirements are simple (find rows containing X).

- **Risks:** If data grows beyond expectations, this approach becomes the bottleneck and requires a paradigm shift (not just a tweak). Naive string matching produces poor results for misspellings. No path to advanced features without significant rework.

- **Complexity:** Simple

### Approach 1b: TanStack Table with Built-in Global Filter

- **How it works:** Adopt TanStack Table (formerly React Table) as the table engine. Use its `globalFilter` API which provides built-in support for global text filtering across all columns. Optionally use its `fuzzyFilter` function (powered by `@tanstack/match-sorter-utils`) for typo-tolerant matching. The filter state integrates with TanStack's other features (sorting, pagination, column visibility).

- **Gains:** Filtering is a first-class feature, not bolted on. Fuzzy matching available out of the box. Integrates seamlessly with sorting and pagination. Column-specific filters can be added incrementally. Virtual scrolling support for large datasets. Massive community -- well-documented, battle-tested. The `match-sorter` algorithm provides relevance ranking.

- **Gives up:** Requires adopting TanStack Table for the entire table, not just search. Learning curve for TanStack's API (headless, verbose configuration). Adds ~30KB to bundle (table + utils). If the table is already built with a different approach, significant refactor required.

- **Shines when:** The dashboard table needs multiple interactive features (sort, filter, paginate, select, group). The team plans to invest in the table as a core component. Data is moderate-to-large (up to ~100K rows with virtualization).

- **Risks:** Over-engineering for a simple table. TanStack's headless approach means you still build all the UI yourself -- it's not a drop-in component. API surface is large and can be confusing.

- **Complexity:** Moderate

### Approach 1c: Web Worker-Based Filtering

- **How it works:** Move the filter computation off the main thread into a Web Worker. The main thread sends the query to the worker; the worker runs the filter against a copy of the data and returns matching row indices. The main thread then renders only those rows. Can use sophisticated algorithms (e.g., trigram indexing, pre-built suffix arrays) without blocking the UI.

- **Gains:** Main thread stays responsive even with 100K+ rows. Can run expensive matching algorithms (fuzzy, regex, relevance scoring) without UI jank. Enables "instant search" UX even on large datasets. Progressive enhancement -- works without the worker, just slower.

- **Gives up:** Added complexity: data serialization between threads, worker lifecycle management, potential stale state. Harder to debug (worker context is separate). Data must be transferred or shared (SharedArrayBuffer has security constraints). Overkill for small datasets.

- **Shines when:** Dataset is large (50K-500K rows) but must remain client-side (e.g., offline-capable app, sensitive data that shouldn't hit a search API). UI responsiveness is critical (financial dashboard, real-time monitoring).

- **Risks:** SharedArrayBuffer requires specific CORS headers (COEP/COOP). Worker startup has latency on first use. Debugging across thread boundaries is painful. Few React developers have experience with this pattern.

- **Complexity:** Complex

---

## Paradigm 2: Server-Side Filtering

**Core bet:** The server is the source of truth for filtered results. The client sends a query, the server returns matching rows. This is the correct paradigm when data is too large to load fully, changes frequently, or when sophisticated search features (full-text, relevance ranking, faceted navigation) are needed.

### Approach 2a: API Endpoint with SQL LIKE / ILIKE

- **How it works:** Add a `?search=query` parameter to the existing data-fetching API. The backend adds a `WHERE column ILIKE '%query%'` clause (or equivalent) to the database query. Results are returned paginated. The frontend sends the search query on input change (debounced ~300ms) and replaces the table data with the response.

- **Gains:** Works with any dataset size -- the database handles the heavy lifting. No additional infrastructure. Simple to implement if you control the API. Consistent with how other filters (date range, status) would work. Data is always fresh.

- **Gives up:** Network latency on every keystroke (even debounced). No fuzzy matching unless the DB supports it (PostgreSQL `pg_trgm` extension can help). `LIKE '%query%'` cannot use standard B-tree indexes -- performance degrades on large tables without full-text indexes. Requires backend changes, not just frontend.

- **Shines when:** Data is large (>10K rows), already server-paginated, or changes frequently. The team has backend engineering capacity. The same filtering needs to work across multiple clients (web, mobile, API consumers).

- **Risks:** The search feels sluggish if the API is slow. `LIKE '%query%'` on a million-row table without proper indexing can be devastating for DB performance. Frontend and backend must agree on the search contract, adding coordination overhead.

- **Complexity:** Moderate

### Approach 2b: Dedicated Search Service (Meilisearch / Typesense / Algolia)

- **How it works:** Index the table data into a dedicated search engine. The frontend queries the search service directly (or through a thin API proxy). The search engine handles tokenization, fuzzy matching, typo tolerance, relevance ranking, and faceted filtering. Results are returned in milliseconds regardless of dataset size.

- **Gains:** Best-in-class search UX: typo tolerance, instant results, relevance ranking. Handles any scale. Faceted search capabilities built in. Algolia InstantSearch and Typesense Instantsearch provide ready-made React components. Search analytics available. Offloads search work from the primary database.

- **Gives up:** New infrastructure dependency. Data must be synced from the primary store to the search index (eventual consistency). Cost: Algolia is expensive at scale; Meilisearch/Typesense are self-hosted (ops burden) or have cloud offerings. Significant over-engineering for a simple dashboard table. Additional attack surface to secure.

- **Shines when:** Search is a core product feature (not just a nice-to-have). Dataset is large and diverse. Users expect Google-quality search (typo tolerance, "did you mean?"). Multiple data types need to be searched across (not just one table).

- **Risks:** Index staleness -- if data changes and the index isn't updated, users see stale results. Operational complexity of running a search service. Vendor lock-in (Algolia) or ops burden (self-hosted). Massive over-investment for a dashboard filter.

- **Complexity:** Complex

---

## Paradigm 3: URL-Driven Filtering (Filter-as-Navigation)

**Core bet:** The URL IS the filter state. This isn't about where the filtering computation happens (it can be client or server), but about the source of truth for filter state being the URL itself. Every filter change is a navigation event. This paradigm treats search as a form of navigation, not application state.

### Approach 3a: Next.js Server Components + searchParams

- **How it works:** The search input is a client component that updates URL search params on change (debounced). The table is a server component that reads `searchParams` from the page props. On each search param change, Next.js re-renders the server component with the new params, fetching filtered data server-side. The page itself is the "API" -- no separate endpoint needed.

- **Gains:** Zero client-side state management. URL is always in sync by definition. Back/forward button works perfectly. Shareable filtered views for free. Server components keep the bundle small. Streaming/Suspense can show loading states during filter transitions. Leverages Next.js's strengths (RSC, streaming, caching).

- **Gives up:** Every keystroke (even debounced) triggers a server round-trip and page re-render. Not suitable for large datasets without server-side pagination. Requires Next.js App Router. The mental model (filtering = navigation) is unfamiliar to many developers. The debounce-to-navigate pattern needs careful implementation to avoid URL history pollution (use `router.replace`, not `router.push`).

- **Shines when:** The dashboard is built with Next.js App Router. Filtered views need to be bookmarkable and shareable. The data is fetched server-side anyway. The team wants to minimize client-side JavaScript.

- **Risks:** Perceived latency if server rendering is slow. History pollution if debounce isn't handled correctly (every keystroke could be a history entry). Over-reliance on Next.js-specific patterns reduces portability.

- **Complexity:** Moderate

### Approach 3b: nuqs (Type-Safe URL State Library)

- **How it works:** Use the `nuqs` library (formerly `next-usequerystate`) which provides React hooks for type-safe URL search parameter state. The search query, active filters, sort order, and pagination are all stored as URL params with type-safe serialization/deserialization. Supports both client-side and server-side filtering by providing the parsed params to either.

- **Gains:** Type-safe URL state without manual parsing. Built-in debouncing with `throttleMs` option. History management (push vs. replace) is configurable. Works with both client and server components. Supports complex state shapes (arrays, objects) serialized to URL params. Composable with any filtering computation approach.

- **Gives up:** Additional dependency (~5KB). Specific to Next.js (though the concept is portable). The library is the state management layer, not the filtering layer -- you still need to implement the actual filtering. Learning the library's API.

- **Shines when:** The dashboard has multiple filter controls (search, date range, status dropdowns) that all need URL persistence. Type safety is valued. The team wants a clean abstraction over `useSearchParams`.

- **Risks:** Library maintenance and longevity. Another abstraction to learn. If you only need a single search param, it's overkill.

- **Complexity:** Simple to Moderate

---

## Paradigm 4: Command Palette / Overlay Search

**Core bet:** Search isn't an always-visible input field -- it's a modal overlay triggered by a keyboard shortcut (Cmd+K). This reframes the UX from "filter this table" to "find anything in the dashboard." The search is a first-class navigation and action tool, not just a table filter.

### Approach 4a: cmdk-based Command Palette

- **How it works:** Integrate the `cmdk` library (used by Vercel, Linear, Raycast). Pressing Cmd+K opens a modal with a search input. Results show matching table rows, but can also include navigation actions ("Go to Settings"), commands ("Export CSV"), and recently visited items. Selecting a row navigates to it or highlights it in the table.

- **Gains:** Powerful UX pattern that users of modern tools (VS Code, Notion, Linear) already understand. Extends naturally beyond table filtering to dashboard-wide search and commands. Keyboard-first design is inherently accessible. The `cmdk` library is well-maintained, unstyled (Tailwind-friendly), ~5KB. Can include action shortcuts, not just search.

- **Gives up:** Doesn't filter the table in place -- it's a "find and go to" model, not a "narrow the list" model. If the user wants to see all matching rows simultaneously (the typical table filter use case), this doesn't solve it. Requires additional work to also filter the table. The overlay blocks the table view while searching. Unfamiliar UX for users who expect a simple text input above the table.

- **Shines when:** The dashboard is complex with multiple pages/sections. Search needs to span more than just the table. The team values keyboard-driven workflows. The product aspires to a Linear/Notion-quality experience.

- **Risks:** Users don't discover the Cmd+K shortcut without onboarding. Doesn't replace the need for visible table filtering -- it's complementary, not a substitute. Over-engineered for a "filter this table" requirement.

- **Complexity:** Moderate

---

## Paradigm 5: Faceted/Structured Filtering

**Core bet:** Free-text search is the wrong model for tabular data. Users know what columns they care about. Instead of a single search box, provide structured filter controls (dropdowns, range sliders, checkboxes) that map directly to table columns. The search bar becomes one of several filter inputs, not THE filter input.

### Approach 5a: Column Header Filters

- **How it works:** Each column header gets a small filter control appropriate to its data type: text columns get a search input, enum columns get a dropdown/multi-select, date columns get a date range picker, numeric columns get a range slider. Filters compose with AND logic. A global search bar is optional, sitting above the table as a "search all columns" shortcut.

- **Gains:** More precise filtering -- users target exactly the column they care about. Data type-appropriate controls (you don't search a date column with text). Composable -- users can combine multiple filters for complex queries. Familiar pattern from Excel/Google Sheets. Each filter is simple in isolation.

- **Gives up:** Significantly more UI to build and maintain. More visual clutter in the table header. Requires knowledge of column data types at build time. Harder to make responsive (filter controls in narrow columns). Not suitable for many-column tables where headers would be overwhelmed.

- **Shines when:** Users frequently filter by specific known columns. The table has diverse data types. The search requirement is really a "filter by criteria" requirement, not "find text anywhere."

- **Risks:** Scope creep -- each column type needs its own filter control. Interaction complexity increases with the number of columns. Testing surface area is large (N columns x M data types x edge cases).

- **Complexity:** Complex

---

## Non-obvious options

### Hybrid: Search Bar + Progressive Disclosure of Faceted Filters

Start with a simple global search bar. When the user types a query, show inline "filter chips" that suggest structured alternatives: typing "status:active" or "date:2024" triggers structured filters. This combines the simplicity of a text input with the precision of faceted search, without showing all controls upfront. Similar to GitHub's issue search or Gmail's search operators.

**Why this is interesting:** It starts simple and scales to complex filtering without redesigning the UI. Power users discover the structured syntax naturally. Casual users just type text and it works.

### Reframe: Don't Filter -- Highlight and Sort by Relevance

Instead of hiding non-matching rows, keep all rows visible but highlight matching ones and sort them to the top. This preserves context (the user can still see the full dataset) while drawing attention to matches. A "relevance score" column could be shown temporarily during search.

**Why this is interesting:** Filtering can be disorienting -- the table "jumps" as rows disappear. Highlighting maintains spatial stability while still solving the "find the thing" problem. This is how some code editors handle search (highlight all matches, scroll to first).

### Simplification: Browser's Built-in Find (Cmd+F)

If the table is fully rendered in the DOM, the browser's native Find feature already works. The "feature" becomes: ensure the table renders all rows (not virtualized or paginated) so Cmd+F works. Add a small hint text: "Tip: Press Cmd+F to search this table."

**Why this is interesting:** It's zero code. It's universally understood. It works today. The question is whether it's sufficient for the user's needs or if they need filtered views, shareability, and programmatic integration.

## Eliminated early

- **Elasticsearch/OpenSearch:** Full search cluster for a dashboard table filter is orders of magnitude more infrastructure than warranted. Only makes sense if search is the core product (it's not -- it's a table filter).

- **SQLite in WASM (sql.js):** Load the data into an in-browser SQLite instance and run SQL queries for filtering. Technically fascinating, adds ~1MB to bundle, and solves the same problem as `Array.filter()` with far more complexity. The SQL query expressiveness is wasted on simple text search.

- **GraphQL filter arguments:** If the API is GraphQL, filtering can be expressed as query arguments. This is really just Approach 2a (server-side filtering) with a different API style. Not a distinct paradigm.

- **Redux/Zustand-driven filtering:** Using a global state library for filter state. This is a state management choice, not a filtering paradigm. Any approach can use Redux or Zustand. It doesn't change the fundamental filtering strategy.
