// Shared test data for all prototypes
// Represents a typical dashboard table: heterogeneous columns, mixed types

export type Result = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  department: string;
  revenue: number;
  lastActive: string; // ISO date string
};

// Generate N rows of realistic-looking data
export function generateData(count: number): Result[] {
  const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George",
    "Hannah", "Ivan", "Julia", "Kevin", "Laura", "Michael", "Nina",
    "Oscar", "Patricia", "Quincy", "Rachel", "Samuel", "Tina",
  ];
  const lastNames = [
    "Anderson", "Brown", "Chen", "Davis", "Evans", "Fischer", "Garcia",
    "Hughes", "Ibrahim", "Johnson", "Kim", "Lopez", "Martinez", "Nelson",
    "O'Brien", "Patel", "Quinn", "Rodriguez", "Smith", "Thompson",
  ];
  const departments = [
    "Engineering", "Marketing", "Sales", "Support", "Design",
    "Finance", "Legal", "Operations", "Product", "HR",
  ];
  const statuses: Result["status"][] = ["active", "inactive", "pending"];

  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    return {
      id: `USR-${String(i + 1).padStart(5, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      status: statuses[i % statuses.length],
      department: departments[i % departments.length],
      revenue: Math.round(Math.random() * 100000) / 100,
      lastActive: new Date(
        Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
      ).toISOString(),
    };
  });
}

// Searchable columns (used consistently across prototypes)
export const SEARCHABLE_KEYS: (keyof Result)[] = [
  "id", "name", "email", "status", "department",
];
