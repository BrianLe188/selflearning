import type { Metadata } from "next";
import { searchPosts } from "@/lib/posts";
import { TAGS } from "@/lib/post-types";
import { PostsSearchInput } from "@/components/posts-search-input";
import { TagChips } from "@/components/tag-chips";
import { PostCard } from "@/components/post-card";
import { PaginationBar } from "@/components/pagination-bar";

export const metadata: Metadata = {
  title: "All posts",
  description: "Search and browse every post, filterable by tag.",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tag = TAGS.includes(params.tag as (typeof TAGS)[number])
    ? (params.tag as (typeof TAGS)[number])
    : "All";
  const page = Number(params.page) || 1;

  const { posts, total, page: currentPage, totalPages } = await searchPosts({
    q: params.q,
    tag,
    page,
  });

  return (
    <section className="mx-auto w-full max-w-[760px] flex-grow px-6 pt-10">
      <h1 className="m-0 mb-2 text-[32px] leading-[38px] font-bold text-foreground">
        All posts
      </h1>

      <p className="mb-6 text-[15px] text-muted-foreground">{total} posts</p>

      <PostsSearchInput initialQuery={params.q ?? ""} />
      <TagChips activeTag={tag} searchParams={params} basePath="/posts" />
      <div className="border-t border-border" />

      <div className="mt-4">
        {posts.length === 0 ? (
          <p className="py-14 text-center text-[15px] text-muted-foreground">
            No posts match your search.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        searchParams={params}
        basePath="/posts"
      />
    </section>
  );
}
