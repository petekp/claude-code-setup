# Adding a Search Bar to Filter a Dashboard Table

## Recommendation Overview

For a greenfield dashboard with a filterable table, I recommend a **controlled input with debounced client-side filtering** using React Server Components for the page shell and a `"use client"` boundary only around the interactive search + table region. This keeps the architecture simple, performant, and idiomatic for modern Next.js.

---

## Architecture

```
DashboardPage (Server Component)
  -> fetches initial data
  -> passes data to:
     SearchableTable (Client Component)
       -> SearchBar
       -> ResultsTable
```

The key decisions:

1. **Server Component fetches data.** The page itself is a server component that retrieves the full dataset (or paginated first page) and passes it as props.
2. **Client boundary is drawn tightly.** Only `SearchableTable` and its children need `"use client"` because they manage interactive state.
3. **Filtering happens client-side** for datasets under ~5,000 rows. For larger datasets, you'd debounce and hit an API endpoint instead.

---

## Implementation

### 1. The Server Component (Page)

```tsx
// app/dashboard/page.tsx

import { SearchableTable } from "./searchable-table";
import { fetchResults } from "@/lib/data";

export default async function DashboardPage() {
  const results = await fetchResults();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <SearchableTable data={results} />
    </main>
  );
}
```

### 2. The SearchableTable Client Component

```tsx
// app/dashboard/searchable-table.tsx
"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "./search-bar";
import { ResultsTable } from "./results-table";

type Result = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

type SearchableTableProps = {
  data: Result[];
  className?: string;
};

export function SearchableTable({ data, className }: SearchableTableProps) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;

    const normalizedQuery = query.toLowerCase().trim();

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data, query]);

  return (
    <div className={className}>
      <SearchBar value={query} onChange={setQuery} />
      <ResultsTable data={filteredData} />
    </div>
  );
}
```

### 3. The SearchBar Component

```tsx
// app/dashboard/search-bar.tsx

import { useRef } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search results...",
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("relative mb-4", className)}>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Search results"
      />
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

### 4. The ResultsTable Component

```tsx
// app/dashboard/results-table.tsx

type Result = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

type ResultsTableProps = {
  data: Result[];
  className?: string;
};

export function ResultsTable({ data, className }: ResultsTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No results found. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-md border", className)}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">{row.status}</td>
              <td className="px-4 py-3">{row.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Key Design Decisions and Rationale

### Why `useMemo` instead of `useEffect` + state for filtered data?

Filtered data is **derived state** -- it's a pure function of `data` and `query`. Using `useEffect` to sync filtered results into a separate state variable is a common anti-pattern that introduces unnecessary render cycles and potential bugs (stale state, race conditions). `useMemo` computes the filtered list synchronously during render, which is both simpler and more correct.

### Why a controlled input without debouncing (for now)?

For client-side filtering of a reasonably sized dataset (under a few thousand rows), `useMemo` with `Array.filter` is fast enough that debouncing adds complexity without meaningful benefit. The filter runs on every keystroke, but `useMemo` ensures it only recomputes when `query` or `data` actually changes.

**When to add debouncing:** If filtering triggers a network request (server-side search for large datasets), you should debounce. Here's how that would look:

```tsx
import { useDeferredValue } from "react";

// Inside the component:
const [query, setQuery] = useState("");
const deferredQuery = useDeferredValue(query);

const filteredData = useMemo(() => {
  // filter using deferredQuery instead of query
}, [data, deferredQuery]);
```

`useDeferredValue` is preferable to a manual `setTimeout`-based debounce because it integrates with React's concurrent rendering -- it keeps the UI responsive by letting React interrupt the filtering work if the user types again.

### Why filter across all columns with `Object.values`?

A global search (matching against any column) is the most intuitive UX for a general-purpose dashboard. Users don't need to know which column contains the data they're looking for. If you later need per-column filtering, you can add that as a separate feature on top.

### Why the `"use client"` boundary is on `SearchableTable` and not higher?

The `DashboardPage` server component can do its data fetching without shipping any JavaScript to the client. The client boundary is drawn at the smallest component that actually needs interactivity. This is a Next.js best practice -- push `"use client"` as deep as possible.

### Accessibility

- The input has `type="search"` which gives it native clear-button behavior in some browsers and signals intent to screen readers.
- `aria-label` provides a label even without a visible `<label>` element.
- The clear button has its own `aria-label`.
- The empty state is a visible, descriptive message rather than just an empty space.

---

## When to Reach for Server-Side Filtering Instead

Client-side filtering is great for small-to-medium datasets, but you should switch to server-side filtering when:

| Signal | Threshold |
|---|---|
| Row count | > 5,000 rows |
| Data size | > 1 MB payload |
| Sensitive data | Users shouldn't receive rows they can't see |
| Real-time data | Results change frequently server-side |

For server-side filtering, the pattern shifts:

1. Debounce the search input (or use `useDeferredValue`).
2. Use the query as a URL search param (`useSearchParams` or router push).
3. Fetch filtered data from an API route or server action.
4. Consider `React.useTransition` to show a loading state without blocking input.

---

## Enhancements to Consider Later

- **URL sync:** Persist the search query in the URL (`?q=search-term`) so the filter survives page refreshes and is shareable. Use `useSearchParams` from `next/navigation`.
- **Highlight matches:** Wrap matching substrings in a `<mark>` tag within table cells so users can see why a row matched.
- **Keyboard shortcut:** Bind `Cmd+K` or `/` to focus the search bar for power users.
- **Column-specific filters:** Dropdowns or filter chips for structured columns like `status`.
- **Sort integration:** Let column headers toggle sort direction, composing with the active filter.

---

## Summary

The recommended approach uses a simple, composable architecture:

- **Server component** handles data fetching (no JS shipped for the page shell).
- **Tight client boundary** around only the interactive parts.
- **`useMemo` for derived state** instead of `useEffect` (cleaner, no extra renders).
- **Global text search** across all columns for the best default UX.
- **Accessible markup** with proper ARIA attributes and empty states.

This gives you a clean starting point that's easy to extend with URL sync, server-side search, or column-specific filters as the product evolves.
