# Prototype Comparison: Dashboard Search/Filter

## Comparison criteria (defined before prototyping)

1. **Lines of code for a complete, production-quality implementation** -- measured by counting the prototype code including all features (search, highlight, URL sync, empty state, accessibility, clear button)
2. **Feature completeness out of the box** -- how many SHOULD/NICE criteria does each prototype satisfy without additional work?
3. **Extensibility to sort, paginate, and column-filter** -- how much rework is needed to add the next table feature?
4. **Dependency weight and supply chain risk** -- what packages are introduced, at what cost?
5. **Cognitive load for a self-taught engineer** -- how easy is this to understand, modify, and debug?
6. **Match quality** -- does the search find what the user is looking for, including near-misses?

## Results

### Prototype A: Vanilla React State + Array.filter()
- **Location:** `prototypes/a/SearchableTable.tsx`
- **Lines of code:** ~155 lines (single file, complete implementation)
- **Feature completeness:**
  - URL persistence: YES (useSearchParams + router.replace)
  - Debouncing: YES (useDeferredValue -- React 18+ built-in)
  - Match highlighting: YES (HighlightMatch component, ~15 lines)
  - Clear button: YES
  - Empty state: YES
  - Accessibility: YES (sr-only label, aria-live for count, aria-describedby)
  - Fuzzy matching: NO (exact substring only)
  - Keyboard shortcut: NO (easy to add, ~5 lines)
  - Sorting: NO (must build from scratch)
  - Score: 7 of 9 SHOULD/NICE criteria met
- **Extensibility:** LOW. Adding sort requires building comparison logic, state management, and UI indicators from scratch. Adding pagination requires splitting the filtered array and building page controls. Each new feature is a ground-up implementation. No shared abstractions.
- **Dependency weight:** 0KB added. Only uses React and Next.js built-ins.
- **Cognitive load:** VERY LOW. Every line is plain React. No abstractions to learn. A developer can read the entire component top-to-bottom in 5 minutes and understand exactly what happens. The `filterRows` function is a pure function that can be tested independently.
- **Match quality:** ADEQUATE. Exact substring match finds what you're looking for if you spell it correctly. Fails on typos ("acounts" does not find "accounts"), partial matches of non-contiguous characters, or semantic similarity.
- **Surprises:** `useDeferredValue` is a surprisingly elegant replacement for custom debounce hooks. It handles the "stale content" UX automatically -- the table renders at lower priority while the input stays responsive. The `isStale` flag enables opacity dimming during the deferred render, providing visual feedback that results are updating.

### Prototype B: TanStack Table with Global Filter
- **Location:** `prototypes/b/SearchableTable.tsx`
- **Lines of code:** ~180 lines (single file, but requires @tanstack/react-table and @tanstack/match-sorter-utils as dependencies)
- **Feature completeness:**
  - URL persistence: YES (manual useSearchParams sync)
  - Debouncing: YES (custom DebouncedInput component)
  - Match highlighting: NO out of the box (TanStack's headless approach means you build the cell renderer, but match-sorter doesn't expose which characters matched)
  - Clear button: YES
  - Empty state: YES
  - Accessibility: PARTIAL (must build aria attributes manually -- same effort as Prototype A)
  - Fuzzy matching: YES (`rankItem` from match-sorter-utils provides typo-tolerant matching with relevance scoring)
  - Keyboard shortcut: NO (easy to add)
  - Sorting: YES (built-in, ~5 lines to enable -- clicking column headers already works in the prototype)
  - Score: 7 of 9 SHOULD/NICE criteria met (different set than A -- has fuzzy + sort, lacks highlighting)
- **Extensibility:** HIGH. Adding pagination: `getPaginatedRowModel()` + page controls (~30 lines). Adding column filters: `getFilteredRowModel()` already supports it, add per-column inputs (~50 lines). Adding row selection: `getSelectionRowModel()` + checkboxes (~40 lines). Each feature is a composable plugin, not ground-up.
- **Dependency weight:** ~33KB gzipped (@tanstack/react-table ~24KB + match-sorter-utils ~9KB). Well-maintained, MIT licensed, huge community. Low supply chain risk.
- **Cognitive load:** MODERATE. The `useReactTable` hook takes a configuration object with many options. The headless model means you must understand how TanStack separates state/logic from rendering. `flexRender` is a concept that requires explanation. But once understood, the pattern is consistent and predictable.
- **Match quality:** GOOD. The `match-sorter` algorithm handles typos, word reordering, acronyms, and camelCase splitting. "acounts" finds "accounts" (edit distance). "eng" finds "Engineering" (prefix match). Results are ranked by match quality, so the best matches appear first.
- **Surprises:** The fuzzy matching is noticeably better than expected. Testing with typos, abbreviations, and partial strings, `match-sorter` found relevant results that substring matching missed entirely. However, implementing match highlighting with fuzzy matching is non-trivial -- you can't just find the substring position because the match might span non-contiguous characters.

### Prototype C: Next.js RSC + searchParams
- **Location:** `prototypes/c/page.tsx`
- **Lines of code:** ~140 lines total, split across a server page component (~80 lines) and a client search input (~60 lines). However, this is structurally more complex -- two files, two rendering contexts, data flows across the server/client boundary.
- **Feature completeness:**
  - URL persistence: YES -- by definition (URL IS the state)
  - Debouncing: PARTIAL (useTransition marks navigation as non-urgent, but every keystroke still triggers a server round-trip; true debouncing requires additional logic)
  - Match highlighting: NO (server-rendered HTML doesn't know what the client typed until the next render cycle; highlighting is possible but requires passing the query to the server component)
  - Clear button: YES (clear the input, remove the ?q param)
  - Empty state: YES
  - Accessibility: PARTIAL (must build manually)
  - Fuzzy matching: DEPENDS (whatever the server-side filter function does)
  - Keyboard shortcut: NO
  - Sorting: POSSIBLE (add sort param to URL, server sorts before returning)
  - Score: 5 of 9 SHOULD/NICE criteria met
- **Extensibility:** MODERATE with caveats. Adding features means adding more searchParams and more server-side logic. The server/client split adds cognitive overhead for each new feature. But the pattern is clean and predictable.
- **Dependency weight:** 0KB added (Next.js built-ins only).
- **Cognitive load:** MODERATE-HIGH. Requires understanding the RSC mental model: which components run on the server vs client, how data flows between them, when re-renders happen. The `useTransition` pattern for non-blocking navigation is subtle. The "URL as state" paradigm is elegant but unfamiliar to most React developers.
- **Match quality:** Same as Prototype A if using the same filter function. Could be upgraded to database full-text search if the data comes from a DB.
- **Surprises:** The biggest concern is **perceived latency**. Even with `useTransition` keeping the input responsive, there's a visible delay between typing and seeing the table update. On a local dev server, this was ~100-200ms. In production with a real database, this would be longer. The `isPending` state from `useTransition` enables showing a spinner, but the UX is distinctly different from the "instant" feeling of client-side filtering (Prototypes A and B). This approach also has a subtle issue: `router.replace` on every keystroke (even debounced) can overwhelm Next.js's router if the user types quickly. The `startTransition` wrapper helps but doesn't fully solve this.

## Verdict

The key differentiating question was: **Does the project need a table engine or is simple Array.filter sufficient?**

Prototyping answered this clearly:

1. **Match quality matters more than expected.** The difference between substring matching (Prototype A) and fuzzy matching (Prototype B) is substantial. Users frequently misspell, abbreviate, or partially remember terms. Fuzzy matching finds what they want; substring matching frustratingly doesn't. This tilts the balance toward Prototype B.

2. **Sorting came "for free" with TanStack.** The Prototype B implementation has clickable column sorting with zero extra effort. In Prototype A, this would be a separate feature build. This validates the "table engine" investment.

3. **The RSC approach (Prototype C) is architecturally beautiful but practically inferior for this use case.** The perceivable latency on every filter change undermines the core UX requirement (instant feedback). It's the right architecture when the data MUST be server-filtered (too large for client), but for a moderate-sized dashboard table, client-side filtering is simply faster.

4. **The 33KB cost of TanStack Table is well-justified** by the fuzzy matching, sorting, and extensibility it provides. This is roughly the size of a single medium icon set.

## Updated understanding

- **useDeferredValue is underrated.** For Prototype A, it elegantly replaces custom debounce hooks and provides the "stale content" UX pattern built in. Even if we go with Prototype B, this technique is worth knowing.

- **Fuzzy match highlighting is a hard subproblem.** Neither approach provides it trivially. With substring matching (A), highlighting is easy. With fuzzy matching (B), highlighting requires knowing which characters in the result matched which characters in the query -- information that match-sorter doesn't expose directly. This is a gap that could be addressed with a custom cell renderer, but it's non-trivial.

- **The "table features compound" insight is real.** Each subsequent feature (sort, paginate, select, group) is dramatically cheaper with TanStack Table than building from scratch. The ROI of the upfront investment increases with each feature added.

- **URL state sync is orthogonal to the filtering approach.** Both A and B need the same ~15 lines of useSearchParams code. This could be extracted to a shared hook regardless of which filtering approach is chosen.
