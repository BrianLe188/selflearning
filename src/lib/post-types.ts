/**
 * Shared types/constants with no server-only imports, safe to import from
 * Client Components.
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
  /** Shown on the post detail page; currently always a single-element array
   *  since the `posts` table stores one tag per post. */
  tags: string[];
  excerpt: string;
  /** Cloudinary URL, or undefined for the placeholder thumb. */
  coverImage?: string;
  readingTime: string;
}

export interface PostDetail extends Post {
  contentHtml: string;
}
