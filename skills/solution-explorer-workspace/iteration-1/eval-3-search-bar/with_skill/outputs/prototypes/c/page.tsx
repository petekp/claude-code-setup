// Prototype C: Next.js RSC + searchParams (URL-Driven Server Filtering)
// Approach 3a -- the table is a server component, search state lives in the URL

// This file represents a Next.js App Router page component.
// The key architectural difference: NO client-side state for the filtered data.
// The URL is the single source of truth. The server re-renders on each search change.

import { Suspense } from "react";

// -- Types --

type Row = Record<string, string | number | boolean | null>;

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

// -- Server-side data fetching + filtering --

async function getFilteredData(query?: string): Promise<{
  rows: Row[];
  totalCount: number;
}> {
  // In a real app, this would be a database query with a WHERE clause.
  // For this prototype, we simulate with in-memory data.
  const allData = await fetchDashboardData();
  const totalCount = allData.length;

  if (!query?.trim()) {
    return { rows: allData, totalCount };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const filtered = allData.filter((row) =>
    Object.values(row).some((value) => {
      if (value == null) return false;
      return String(value).toLowerCase().includes(normalizedQuery);
    })
  );

  return { rows: filtered, totalCount };
}

async function fetchDashboardData(): Promise<Row[]> {
  // Simulated data source -- replace with actual DB/API call
  return [
    { id: 1, name: "Alice Johnson", department: "Engineering", status: "Active" },
    { id: 2, name: "Bob Smith", department: "Marketing", status: "Active" },
    // ... more rows
  ];
}

// -- Client component: Search input (this is the only client-side piece) --

// In a real implementation, this would be in a separate file with "use client"
// SearchInput.tsx:
//
// "use client";
//
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useCallback, useTransition } from "react";
//
// export function SearchInput() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();
//   const [value, setValue] = useState(searchParams.get("q") ?? "");
//
//   const handleChange = useCallback(
//     (newValue: string) => {
//       setValue(newValue);
//
//       // Use startTransition to mark the navigation as non-urgent
//       // This keeps the input responsive while the server re-renders
//       startTransition(() => {
//         const params = new URLSearchParams(searchParams.toString());
//         if (newValue) {
//           params.set("q", newValue);
//         } else {
//           params.delete("q");
//         }
//         router.replace(`?${params.toString()}`, { scroll: false });
//       });
//     },
//     [router, searchParams, startTransition]
//   );
//
//   return (
//     <div className="relative mb-4">
//       <label htmlFor="table-search" className="sr-only">
//         Search results
//       </label>
//       <input
//         id="table-search"
//         type="search"
//         value={value}
//         onChange={(e) => handleChange(e.target.value)}
//         placeholder="Search across all columns..."
//         className={cn(
//           "w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm",
//           "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
//           isPending && "opacity-70"
//         )}
//         aria-label="Search table results"
//       />
//       {isPending && (
//         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//           <Spinner className="h-4 w-4" />
//         </div>
//       )}
//     </div>
//   );
// }

// -- Server component: Results table --

function ResultsTable({
  rows,
  totalCount,
  query,
  columns,
}: {
  rows: Row[];
  totalCount: number;
  query?: string;
  columns: { key: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-2 text-sm text-gray-500" aria-live="polite">
        {query
          ? `${rows.length} of ${totalCount} results`
          : `${totalCount} results`}
      </div>

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
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-500"
              >
                No results match "{query}"
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {String(row[col.key] ?? "")}
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

// -- Page component (server component, the orchestrator) --

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const { rows, totalCount } = await getFilteredData(q);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {/* SearchInput would be imported as a client component */}
      {/* <SearchInput /> */}

      <Suspense
        fallback={
          <div className="py-12 text-center text-gray-400">Loading...</div>
        }
      >
        <ResultsTable
          rows={rows}
          totalCount={totalCount}
          query={q}
          columns={COLUMNS}
        />
      </Suspense>
    </div>
  );
}
