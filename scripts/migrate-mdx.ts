/**
 * One-time migration: reads content/posts/*.mdx and inserts each one into
 * the `posts` table as a published post, converting the Markdown body into
 * a minimal Tiptap JSON doc (paragraphs/headings only).
 *
 * Run with: bun run migrate:mdx
 *
 * Note: this file must not import anything guarded by the `server-only`
 * package (e.g. src/lib/posts.ts, src/lib/editor-html.ts) — it runs as a
 * plain Bun script, not through Next.js's react-server bundler condition
 * that makes those guards a no-op. Use src/lib/tiptap-html.ts directly
 * instead of the server-only-wrapped src/lib/editor-html.ts.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { JSONContent } from "@tiptap/react";
import { db } from "../src/db";
import { posts } from "../src/db/schema";
import { renderContentJsonToHtml } from "../src/lib/tiptap-html";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function markdownToTiptapJson(markdown: string): JSONContent {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const content: JSONContent[] = blocks.map((block) => {
    const headingMatch = block.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(3, Math.max(2, headingMatch[1].length));
      return {
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text: headingMatch[2].trim() }],
      };
    }
    return {
      type: "paragraph",
      content: [{ type: "text", text: block.replace(/\n/g, " ") }],
    };
  });

  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}

async function main() {
  const filenames = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  let migrated = 0;
  for (const filename of filenames) {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data, content } = matter(raw);

    const contentJson = markdownToTiptapJson(content);
    const contentHtml = renderContentJsonToHtml(contentJson);

    const inserted = await db
      .insert(posts)
      .values({
        slug,
        title: data.title as string,
        excerpt: (data.excerpt as string) ?? "",
        tag: (data.tag as string) ?? "",
        coverImageUrl: (data.coverImage as string) ?? null,
        contentJson,
        contentHtml,
        status: "published",
        publishedAt: data.date ? new Date(data.date as string) : new Date(),
      })
      .onConflictDoNothing({ target: posts.slug })
      .returning({ slug: posts.slug });

    if (inserted.length) {
      migrated++;
      console.log(`migrated: ${slug}`);
    } else {
      console.log(`skipped (already exists): ${slug}`);
    }
  }

  console.log(`\nDone. ${migrated}/${filenames.length} posts inserted.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
