// Server component: renders the filtered results table
// Receives already-filtered data from the parent server component

import { type Result } from "../shared/data";

type ResultsTableProps = {
  data: Result[];
  query: string;
  className?: string;
};

export function ResultsTable({ data, query, className }: ResultsTableProps) {
  return (
    <div className={className}>
      <div aria-live="polite" className="mb-2 text-sm text-gray-500">
        {query
          ? `${data.length} results matching "${query}"`
          : `${data.length} results`}
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No results match &ldquo;{query}&rdquo;
              </td>
            </tr>
          ) : (
            data.map((row) => (
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
