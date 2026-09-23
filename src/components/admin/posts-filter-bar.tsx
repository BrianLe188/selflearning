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
import { TAGS } from "@/lib/post-types";

const POST_TAGS = TAGS.filter((tag) => tag !== "All");
const SEARCH_DEBOUNCE_MS = 400;

export function PostsFilterBar({
  initialQuery,
  initialStatus,
  initialTag,
}: {
  initialQuery: string;
  initialStatus: string;
  initialTag: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if the URL changes from elsewhere (back/forward
  // nav) — React's documented pattern for adjusting state from props: set
  // state directly during render rather than in an effect, guarded so it
  // only fires the one render where the prop actually changed.
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
    debounceRef.current = setTimeout(
      () => updateParams({ q: value }),
      SEARCH_DEBOUNCE_MS
    );
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
        value={initialStatus}
        onValueChange={(value) => value && updateParams({ status: value })}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={initialTag}
        onValueChange={(value) => value && updateParams({ tag: value })}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {POST_TAGS.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
