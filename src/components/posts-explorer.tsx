"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { PostCard } from "@/components/post-card";
import { TAGS, type Post } from "@/lib/post-types";
import { cn } from "@/lib/utils";

const PER_PAGE = 5;

export function PostsExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<(typeof TAGS)[number]>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (activeTag === "All" || post.tag === activeTag) &&
        (!q || post.title.toLowerCase().includes(q))
    );
  }, [posts, activeTag, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pagePosts = filtered.slice(start, start + PER_PAGE);

  function selectTag(tag: (typeof TAGS)[number]) {
    setActiveTag(tag);
    setPage(1);
  }

  function selectQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <>
      <p className="mb-6 text-[15px] text-muted-foreground">
        {filtered.length} posts
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-4">
        <label htmlFor="search-input" className="sr-only">
          Search posts
        </label>
        <Input
          id="search-input"
          type="text"
          placeholder="Search posts…"
          value={query}
          onChange={(e) => selectQuery(e.target.value)}
          className="h-auto min-w-[200px] flex-grow rounded-md border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <Button
            key={tag}
            type="button"
            onClick={() => selectTag(tag)}
            className={cn(
              "h-auto rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted",
              tag === activeTag &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {tag}
          </Button>
        ))}
      </div>
      <div className="border-t border-border" />

      <div className="mt-4">
        {pagePosts.length === 0 ? (
          <p className="py-14 text-center text-[15px] text-muted-foreground">
            No posts match your search.
          </p>
        ) : (
          pagePosts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>

      <Pagination className="justify-center gap-2 py-6 pb-14">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <Button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className="h-auto rounded-[8px] border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              Prev
            </Button>
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <PaginationItem key={n}>
              <Button
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={cn(
                  "h-[34px] w-[34px] rounded-[8px] border border-border bg-card p-0 text-sm font-semibold text-foreground hover:bg-muted",
                  n === currentPage &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {n}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className="h-auto rounded-[8px] border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}
