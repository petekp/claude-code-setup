// Prototype A: Vanilla React State + Array.filter()
// Approach 1a -- simplest possible implementation

"use client";

import { useDeferredValue, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// -- Types --

type Row = Record<string, string | number | boolean | null>;

type SearchableTableProps = {
  data: Row[];
  columns: { key: string; label: string }[];
  className?: string;
};

// -- Filtering logic (pure function, easily testable) --

function filterRows(rows: Row[], query: string): Row[] {
  if (!query.trim()) return rows;

  const normalizedQuery = query.toLowerCase().trim();

  return rows.filter((row) =>
    Object.values(row).some((value) => {
      if (value == null) return false;
      return String(value).toLowerCase().includes(normalizedQuery);
    })
  );
}

// -- Highlight component --

function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

// -- Main component --

export function SearchableTable({
  data,
  columns,
  className,
}: SearchableTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is source of truth for search query
  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);

  // useDeferredValue provides built-in "debouncing" for the filter computation
  // without the complexity of a custom debounce hook
  const deferredQuery = useDeferredValue(inputValue);

  const filteredRows = useMemo(
    () => filterRows(data, deferredQuery),
    [data, deferredQuery]
  );

  const isStale = inputValue !== deferredQuery;

  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);

      // Update URL without adding history entries
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleClear = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  return (
    <div className={className}>
      {/* Search input */}
      <div className="relative mb-4">
        <label htmlFor="table-search" className="sr-only">
          Search results
        </label>
        <input
          id="table-search"
          type="search"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search across all columns..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Search table results"
          aria-describedby="search-result-count"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            x
          </button>
        )}
      </div>

      {/* Result count (announced to screen readers) */}
      <div
        id="search-result-count"
        className="mb-2 text-sm text-gray-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {inputValue
          ? `${filteredRows.length} of ${data.length} results`
          : `${data.length} results`}
      </div>

      {/* Table */}
      <div
        className={`transition-opacity ${isStale ? "opacity-70" : "opacity-100"}`}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-gray-700"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No results match "{inputValue}"
                </td>
              </tr>
            ) : (
              filteredRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <HighlightMatch
                        text={String(row[col.key] ?? "")}
                        query={deferredQuery}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
