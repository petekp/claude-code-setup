// Prototype C: Next.js App Router Server Component with searchParams
// Split into server component (data fetching) + client component (search input)
// This file is the server component (the page)

import { Suspense } from "react";
import { SearchInput } from "./search-input";
import { ResultsTable } from "./results-table";
import { type Result, SEARCHABLE_KEYS } from "../shared/data";

// Simulates a server-side data fetch with filtering
// In production, this would be a database query
async function fetchFilteredResults(query: string): Promise<Result[]> {
  // Simulate: SELECT * FROM results WHERE name ILIKE '%query%' OR email ILIKE ...
  // In a real app, this would be:
  //   const results = await db.query(
  //     `SELECT * FROM results WHERE ${SEARCHABLE_KEYS.map(k => `${k} ILIKE $1`).join(' OR ')}`,
  //     [`%${query}%`]
  //   );

  // For prototype: import data and filter server-side
  const { generateData } = await import("../shared/data");
  const allData = generateData(1000);

  if (!query) return allData;

  const lower = query.toLowerCase();
  return allData.filter((row) =>
    SEARCHABLE_KEYS.some((key) =>
      String(row[key]).toLowerCase().includes(lower)
    )
  );
}

// The page component: a SERVER component that reads searchParams
// This is the Next.js App Router pattern from their official dashboard tutorial
type PageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const results = await fetchFilteredResults(query);

  return (
    <div>
      <div className="mb-4">
        <SearchInput defaultValue={query} />
      </div>

      <Suspense
        key={query}
        fallback={
          <div className="py-8 text-center text-gray-500">Searching...</div>
        }
      >
        <ResultsTable data={results} query={query} />
      </Suspense>
    </div>
  );
}

// ---- Complexity metrics ----
// Lines of implementation: ~50 (page) + ~45 (search-input) + ~55 (results-table) = ~150 total
// Dependencies: next (already present), no additional libraries
// New concepts: searchParams flow, Suspense boundaries, client/server component split
// State: URL search params are the single source of truth (no useState for filter)
// Derived: server component re-executes on param change
// Adding a column filter later: add more searchParams (e.g., ?status=active&dept=engineering)
// Adding URL persistence: built-in (URL IS the state)
// Adding fuzzy matching: requires server-side fuzzy library or database full-text search
// Key tradeoff: every search triggers a server round-trip
