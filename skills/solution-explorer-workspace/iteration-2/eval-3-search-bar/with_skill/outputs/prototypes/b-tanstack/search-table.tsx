// Prototype B: TanStack Table with Global Filter + Fuzzy Matching
// ~130 lines of implementation code
// Dependencies: @tanstack/react-table, @tanstack/match-sorter-utils

"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type FilterFn,
  type ColumnDef,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { type Result } from "../shared/data";
import { useDebouncedValue } from "../shared/use-debounce";

// Fuzzy filter function that integrates with TanStack's filter system
const fuzzyFilter: FilterFn<Result> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper<Result>();

const columns = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("department", { header: "Department" }),
  columnHelper.accessor("revenue", {
    header: "Revenue",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
    enableGlobalFilter: false, // Don't search numeric columns
  }),
];

type SearchTableProps = {
  data: Result[];
  className?: string;
};

export function SearchTable({ data, className }: SearchTableProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: debouncedQuery,
    },
    onGlobalFilterChange: () => {
      // State managed externally via useState + debounce
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rowCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;

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
            ? `${rowCount} of ${totalCount} results`
            : `${totalCount} results`}
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowCount === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-gray-500"
              >
                No results match &ldquo;{debouncedQuery}&rdquo;
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---- Complexity metrics ----
// Lines of implementation: ~130
// Dependencies: @tanstack/react-table (~15KB gzip), @tanstack/match-sorter-utils (~5KB gzip)
// New concepts: TanStack Table's mental model (columns, row models, filter functions)
// State: 1 useState (query), TanStack manages internal table state
// Derived: TanStack handles memoization internally
// Adding a column filter later: trivial -- add column.filterFn and a filter input per column
// Adding URL persistence: wire globalFilter state to nuqs or useSearchParams
// Adding sorting: already enabled (getSortedRowModel imported), just add click handlers
// Adding pagination: already enabled (getPaginationRowModel imported), just add controls
// Fuzzy matching: already implemented via match-sorter-utils
