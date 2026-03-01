// Prototype A: Vanilla Array.filter with substring matching
// ~70 lines of implementation code
// Zero dependencies beyond React

"use client";

import { useState, useMemo } from "react";
import { type Result, SEARCHABLE_KEYS } from "../shared/data";
import { useDebouncedValue } from "../shared/use-debounce";

type SearchTableProps = {
  data: Result[];
  className?: string;
};

function filterRows(rows: Result[], query: string): Result[] {
  if (!query) return rows;
  const lower = query.toLowerCase();
  return rows.filter((row) =>
    SEARCHABLE_KEYS.some((key) =>
      String(row[key]).toLowerCase().includes(lower)
    )
  );
}

export function SearchTable({ data, className }: SearchTableProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);
  const filtered = useMemo(
    () => filterRows(data, debouncedQuery),
    [data, debouncedQuery]
  );

  return (
    <div className={className}>
      <div className="mb-4">
        <label htmlFor="search-input" className="sr-only">
          Search results
        </label>
        <input
          id="search-input"
          type="search"
          placeholder="Search across all columns..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
        <div aria-live="polite" className="mt-1 text-sm text-gray-500">
          {debouncedQuery
            ? `${filtered.length} of ${data.length} results`
            : `${data.length} results`}
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Department</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No results match &ldquo;{debouncedQuery}&rdquo;
              </td>
            </tr>
          ) : (
            filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.status}</td>
                <td>{row.department}</td>
                <td>${row.revenue.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---- Complexity metrics ----
// Lines of implementation: ~70
// Dependencies: react (already present)
// New concepts: none
// State: 1 useState (query)
// Derived: 1 useMemo (filtered rows)
// Adding a column filter later: must write ad-hoc filter logic, no shared infrastructure
// Adding URL persistence: must wire up nuqs or useSearchParams manually
// Adding fuzzy matching: must bring in a library or write custom logic
