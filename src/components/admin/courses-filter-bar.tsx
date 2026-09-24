"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courseTrack } from "@/db/schema-courses";

const SEARCH_DEBOUNCE_MS = 400;

export function CoursesFilterBar({
  initialQuery,
  initialTrack,
}: {
  initialQuery: string;
  initialTrack: string;
}) {
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

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ q: value }), SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search titles…"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        className="h-auto w-full max-w-[240px] rounded-md border-border bg-card px-3 py-2 text-sm"
      />

      <Select
        value={initialTrack}
        onValueChange={(value) => value && updateParams({ track: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tracks</SelectItem>
          {courseTrack.map((track) => (
            <SelectItem key={track} value={track}>
              {track}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
