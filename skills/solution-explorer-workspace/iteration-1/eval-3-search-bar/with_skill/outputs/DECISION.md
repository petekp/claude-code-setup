# Decision: Dashboard Search/Filter

## Selected approach

**Approach 1b: TanStack Table with Built-in Global Filter** -- Adopt TanStack Table as the table engine and use its globalFilter API with match-sorter-utils for fuzzy, typo-tolerant search. URL state managed via useSearchParams with router.replace.

## Evidence for this choice

- **Prototyping showed fuzzy matching is significantly better than substring matching.** Users misspell, abbreviate, and partially recall terms. match-sorter handled all of these gracefully in testing while Array.filter() failed silently, returning zero results. This is the difference between a search that "works" and one that feels broken. (Source: COMPARISON.md, Match Quality observations)

- **Sorting was essentially free.** Clicking column headers to sort required ~5 additional lines with TanStack, versus building a complete sort system (~80-100 lines) with the vanilla approach. This validates the "invest in the engine" hypothesis. (Source: COMPARISON.md, Prototype B extensibility)

- **The extensibility gap widens over time.** Analysis showed that pagination, column filters, row selection, and grouping each take ~30-50 lines with TanStack vs. ground-up implementations of 100+ lines each with vanilla React. For a dashboard that will grow, this compounding advantage is decisive. (Source: ANALYSIS.md, Tradeoff Matrix)

- **The 33KB bundle cost is proportional to the value.** TanStack Table replaces custom code that would eventually approach or exceed that size while being less tested and less maintained. (Source: COMPARISON.md, Dependency weight analysis)

- **Client-side filtering provides the instant feedback UX that server-side cannot match.** Prototype C (RSC + searchParams) demonstrated perceivable latency (~100-200ms on localhost, worse in production) that undermines the core UX requirement. (Source: COMPARISON.md, Prototype C surprises)

## Why not the alternatives

- **Vanilla React State + Array.filter() (Approach 1a):** The simplest approach and genuinely viable for a search-only feature that never grows. Rejected because (1) substring matching is inadequate for real-world search -- users misspell and abbreviate, and the search silently returns nothing, which feels broken; (2) every subsequent table feature (sort, paginate, select) requires ground-up implementation with no shared abstractions, creating a compounding maintenance burden; (3) the ~33KB investment in TanStack Table avoids an eventual migration when these features are needed. If we were confident the table would never need sort or pagination, this would win on simplicity.

- **Next.js RSC + searchParams (Approach 3a):** Architecturally elegant -- zero client-side state, URL is the single source of truth by definition, and the pattern aligns with Next.js's vision. Rejected because (1) every search keystroke triggers a server round-trip, introducing perceivable latency that undermines the "instant filter" UX; (2) the server/client component split adds cognitive complexity for each new table feature (developer must reason about which context they're in); (3) the mental model ("filtering is navigation") is unfamiliar and harder to debug. This approach is correct when data must be server-filtered (datasets too large for client), but for a moderate dashboard table, client-side filtering is faster and simpler.

- **Web Worker Filtering (Approach 1c):** Over-engineered for the assumed dataset size (hundreds to low thousands of rows). Only warranted at 50K+ rows, which is not our scenario. Cross-thread debugging complexity is a poor tradeoff for negligible performance gain at this scale.

- **Dedicated Search Service (Approach 2b):** Massive infrastructure overkill for a single dashboard table. The operational burden of running and syncing a search index is disproportionate to the value. Only makes sense when search is a core product feature across multiple data sources.

- **Command Palette (Approach 4a):** Does not solve the stated problem. The requirement is "filter the table" (see all matching rows); a command palette is "find and navigate to one thing." Complementary feature, not a substitute.

- **Column Header Filters (Approach 5a):** The right solution for a different problem (precise multi-criteria filtering). Implementation effort (12-20 hours, N filter components) is disproportionate to "add a search bar." Can be added incrementally later on top of TanStack Table.

## Implementation plan

1. **Install dependencies:**
   ```bash
   npm install @tanstack/react-table @tanstack/match-sorter-utils
   ```

2. **Define column definitions.** Create a columns configuration array that maps each data field to a TanStack `ColumnDef`. Include accessor functions, header labels, and cell formatters.

3. **Build the SearchableTable component.** A single `"use client"` component containing:
   - `useReactTable` hook with `globalFilter`, `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel`
   - `fuzzyFilter` function using `rankItem` from match-sorter-utils
   - Debounced search input (either custom component or `useDeferredValue` pattern)
   - URL sync via `useSearchParams` and `router.replace`
   - Accessible search input with aria-live result count
   - Empty state for zero-match queries
   - Clear/reset button

4. **Add keyboard shortcut.** Register a global `keydown` listener for `/` or `Cmd+K` that focuses the search input. Respect focus state (don't capture the shortcut when the user is already in another input).

5. **Integrate into the dashboard page.** Replace the existing table rendering with the SearchableTable component. Pass data and column definitions as props. Ensure any existing page-level data fetching still works.

6. **Test the feature:**
   - Unit test: `fuzzyFilter` function with various inputs (exact match, typo, abbreviation, empty query, special characters, null values)
   - Integration test: Render SearchableTable with mock data, type a query, verify filtered rows appear, verify URL updates, verify clear button works
   - Manual test: Try real dashboard data, check sort interaction, check URL shareability (copy URL with ?q=..., paste in new tab, verify filter is applied)

7. **Future enhancements (not in initial scope but enabled by TanStack):**
   - Column-specific filters (TanStack's column filter API)
   - Pagination (add `getPaginatedRowModel`)
   - Row selection (add `getSelectionRowModel`)
   - Virtual scrolling for scale (add `@tanstack/react-virtual`)

## Known risks and mitigations

- **Risk:** Dataset grows beyond client-side filtering capacity (50K+ rows)
  **Mitigation:** TanStack Table supports `manualFiltering` mode where the server provides filtered data. The component API stays the same; only the data source changes. This migration is a configuration change, not a rewrite.

- **Risk:** TanStack Table learning curve slows initial development
  **Mitigation:** The prototype already demonstrates the core pattern. TanStack's documentation is extensive, and the headless approach means UI decisions remain in our control. Budget an extra 2-3 hours for the first developer to internalize the mental model.

- **Risk:** Fuzzy matching returns too many false positives, confusing users
  **Mitigation:** match-sorter's ranking algorithm puts the best matches first. If false positives are an issue, the threshold can be tuned by adjusting the `rankItem` configuration. Can also add a "strict mode" toggle that falls back to substring matching.

- **Risk:** URL state synchronization has edge cases (rapid typing, back button, direct URL editing)
  **Mitigation:** Use `router.replace` (not `push`) to avoid history pollution. Debounce the URL update separately from the filter update if needed. Test the back button explicitly. Consider using `nuqs` library if URL state management becomes more complex (multiple filters, pagination state, sort state in URL).

## Assumptions documented (test run)

Since this was a test run with no human to interact with, the following assumptions were made and would normally be confirmed with the user:

1. **React/Next.js stack** -- Assumed based on the user's CLAUDE.md preferences. A different framework would change the recommendation.
2. **Moderate dataset size (hundreds to low thousands of rows)** -- This is the most critical assumption. At 50K+ rows, the recommendation shifts to server-side filtering or Web Workers.
3. **The table will grow in interactivity** -- Assumed the dashboard will eventually need sort, pagination, and possibly selection. If the table truly stays static forever, Approach 1a (vanilla) would win on simplicity.
4. **No existing table library in use** -- Greenfield means we choose. If TanStack Table were already adopted, the recommendation would be trivially confirmed. If a different library were in use, migration cost would be a factor.
5. **Client-side rendering preferred for table** -- Assumed because instant feedback matters more than initial load time for this use case.
