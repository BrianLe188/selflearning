/**
 * Shared types/constants with no Node APIs, safe to import from Client
 * Components. Kept separate from posts.ts (which reads the filesystem)
 * so bundling a Client Component never drags `node:fs` into the browser.
 */

/** Tag filter order as shown in the UI — matches the original mockup's fixed list. */
export const TAGS = ["All", "Tips", "Life", "Project"] as const;
export type Tag = (typeof TAGS)[number];

export interface Post {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-09-19" */
  date: string;
  tag: string;
  /** Extra tags shown on the post detail page; defaults to [tag]. */
  tags: string[];
  excerpt: string;
  /** Path under /public, e.g. "/images/posts/foo.jpg". Undefined = placeholder thumb. */
  coverImage?: string;
  content: string;
  readingTime: string;
}
