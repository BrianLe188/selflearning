import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { getReadingTime } from "@/lib/format";
import type { Post } from "@/lib/post-types";

export type { Post, Tag } from "@/lib/post-types";
export { TAGS } from "@/lib/post-types";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

/**
 * Reads and parses every post in content/posts/*.mdx.
 * Wrapped in React's `cache()` so repeated calls within one render pass
 * (home + layout + posts list, say) only touch the filesystem once.
 */
export const getAllPosts = cache((): Post[] => {
  const filenames = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const posts = filenames.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      tag: data.tag as string,
      tags: (data.tags as string[] | undefined) ?? [data.tag as string],
      excerpt: data.excerpt as string,
      coverImage: data.coverImage as string | undefined,
      content,
      readingTime: getReadingTime(content),
    } satisfies Post;
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

/** Other posts, most recent first, excluding the current one. */
export function getRelatedPosts(slug: string, count = 2): Post[] {
  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .slice(0, count);
}
