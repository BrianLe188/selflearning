"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 400;

export function CoursesSearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-4">
      <label htmlFor="course-search-input" className="sr-only">
        Search courses
      </label>
      <Input
        id="course-search-input"
        type="text"
        placeholder="Search by course name…"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="h-auto min-w-[200px] flex-grow rounded-md border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground"
      />
    </div>
  );
}
