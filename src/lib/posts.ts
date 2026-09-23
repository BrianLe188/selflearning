import "server-only";
import { cache } from "react";
import { and, count, desc, eq, ilike, ne } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getReadingTime } from "@/lib/format";
import type { Post, PostDetail } from "@/lib/post-types";

export const POSTS_PAGE_SIZE = 5;

export type { Post, PostDetail, Tag } from "@/lib/post-types";
export { TAGS } from "@/lib/post-types";

type PostRow = typeof posts.$inferSelect;

function toPost(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    date: (row.publishedAt ?? row.createdAt).toISOString().slice(0, 10),
    tag: row.tag,
    tags: row.tag ? [row.tag] : [],
    excerpt: row.excerpt,
    coverImage: row.coverImageUrl ?? undefined,
    readingTime: getReadingTime(row.contentHtml),
  };
}

/**
 * Published posts, most recent first. Wrapped in React's `cache()` so
 * repeated calls within one render pass (layout + home + posts list, say)
 * only hit the database once.
 */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  return rows.map(toPost);
});

export const getPostBySlug = cache(
  async (slug: string): Promise<PostDetail | undefined> => {
    const [row] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
      .limit(1);

    if (!row) return undefined;
    return { ...toPost(row), contentHtml: row.contentHtml };
  }
);

export async function getAllSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, "published"));
  return rows.map((row) => row.slug);
}

export interface PostsSearchFilter {
  q?: string;
  /** "All" (or omitted) means no tag filter. */
  tag?: string;
  page?: number;
}

export interface PostsSearchResult {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

/** Published posts, filtered/paginated server-side for the /posts page. */
export async function searchPosts(
  filter: PostsSearchFilter = {}
): Promise<PostsSearchResult> {
  const conditions = [eq(posts.status, "published")];
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(posts.title, `%${q}%`));
  if (filter.tag && filter.tag !== "All") conditions.push(eq(posts.tag, filter.tag));
  const where = and(...conditions);

  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * POSTS_PAGE_SIZE;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(POSTS_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(posts).where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));

  return {
    posts: rows.map(toPost),
    total,
    page: Math.min(page, totalPages),
    totalPages,
  };
}

/** Other published posts, most recent first, excluding the current one. */
export async function getRelatedPosts(
  slug: string,
  count = 2
): Promise<Post[]> {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "published"), ne(posts.slug, slug)))
    .orderBy(desc(posts.publishedAt))
    .limit(count);

  return rows.map(toPost);
}
