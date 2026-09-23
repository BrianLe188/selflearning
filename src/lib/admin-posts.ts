import "server-only";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { posts, postStatus, type PostStatus } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-auth";

export const ADMIN_POSTS_PAGE_SIZE = 10;

export interface AdminPostsFilter {
  q?: string;
  status?: PostStatus | "all";
  tag?: string;
  page?: number;
}

export async function getAdminPosts(filter: AdminPostsFilter = {}) {
  await requireAdminSession();

  const conditions = [];
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(posts.title, `%${q}%`));
  if (filter.status && filter.status !== "all" && postStatus.includes(filter.status)) {
    conditions.push(eq(posts.status, filter.status));
  }
  if (filter.tag && filter.tag !== "all") {
    conditions.push(eq(posts.tag, filter.tag));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * ADMIN_POSTS_PAGE_SIZE;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(where)
      .orderBy(desc(posts.updatedAt))
      .limit(ADMIN_POSTS_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(posts).where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_POSTS_PAGE_SIZE));

  return {
    posts: rows,
    total,
    page: Math.min(page, totalPages),
    totalPages,
  };
}

export async function getPostById(id: string) {
  await requireAdminSession();
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post;
}
