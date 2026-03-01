// Prototype B: TanStack Table with Built-in Global Filter
// Approach 1b -- structured table engine with filtering as first-class feature

"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

// -- Types --

type DataRow = Record<string, unknown>;

type TanStackSearchTableProps<T extends DataRow> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  className?: string;
};

// -- Fuzzy filter function --

const fuzzyFilter: FilterFn<DataRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// -- Debounced input component --

function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 200,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  // Sync external changes
  useMemo(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce the onChange callback
  const timeoutRef = useMemo(() => ({ current: null as ReturnType<typeof setTimeout> | null }), []);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(newValue), debounceMs);
    },
    [onChange, debounceMs, timeoutRef]
  );

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}

// -- Main component --

export function TanStackSearchTable<T extends DataRow>({
  data,
  columns,
  className,
}: TanStackSearchTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [globalFilter, setGlobalFilter] = useState(
    searchParams.get("q") ?? ""
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleFilterChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);

      // Sync to URL
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
    handleFilterChange("");
  }, [handleFilterChange]);

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;

  return (
    <div className={className}>
      {/* Search input */}
      <div className="relative mb-4">
        <label htmlFor="table-search" className="sr-only">
          Search results
        </label>
        <DebouncedInput
          id="table-search"
          type="search"
          value={globalFilter}
          onChange={handleFilterChange}
          debounceMs={200}
          placeholder="Search across all columns (fuzzy matching)..."
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
        {globalFilter && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            x
          </button>
        )}
      </div>

      {/* Result count */}
      <div
        id="search-result-count"
        className="mb-2 text-sm text-gray-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {globalFilter
          ? `${filteredCount} of ${totalCount} results`
          : `${totalCount} results`}
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="cursor-pointer select-none px-4 py-3 text-left font-medium text-gray-700 hover:text-gray-900"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: " ^",
                      desc: " v",
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-500"
              >
                No results match "{globalFilter}"
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
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
