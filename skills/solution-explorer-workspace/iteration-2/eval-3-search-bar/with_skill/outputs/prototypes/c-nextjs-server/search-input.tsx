// Client component: the search input that updates URL params
// This is the only "use client" component in the Next.js Server approach

"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useRef, useCallback } from "react";

type SearchInputProps = {
  defaultValue: string;
  className?: string;
};

export function SearchInput({ defaultValue, className }: SearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(
    (term: string) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
          params.set("q", term);
        } else {
          params.delete("q");
        }
        // replace (not push) to avoid polluting browser history with every keystroke
        router.replace(`${pathname}?${params.toString()}`);
      }, 300); // 300ms debounce for server-side (longer than client-side)
    },
    [searchParams, pathname, router]
  );

  return (
    <div className={className}>
      <label htmlFor="search-input" className="sr-only">
        Search results
      </label>
      <input
        id="search-input"
        type="search"
        placeholder="Search across all columns..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
      />
    </div>
  );
}
