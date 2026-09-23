import "server-only";
import type { JSONContent } from "@tiptap/react";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { media, type MediaType } from "@/db/schema";

interface MediaRef {
  type: MediaType;
  url: string;
  duration: number | null;
}

function extractMediaRefs(json: JSONContent): MediaRef[] {
  const refs: MediaRef[] = [];

  function walk(node: JSONContent) {
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      refs.push({ type: "image", url: node.attrs.src, duration: null });
    } else if (node.type === "audioBlock" && typeof node.attrs?.url === "string") {
      refs.push({
        type: "audio",
        url: node.attrs.url,
        duration: node.attrs.duration ?? null,
      });
    } else if (node.type === "videoBlock" && typeof node.attrs?.url === "string") {
      refs.push({
        type: "video",
        url: node.attrs.url,
        duration: node.attrs.duration ?? null,
      });
    }
    node.content?.forEach(walk);
  }

  walk(json);
  return refs;
}

/**
 * Reconciles the `media` table against the audio/video/image nodes actually
 * present in a post's document, so we keep a clean per-post attachment list
 * for later cleanup — run on every save (autosave and publish alike).
 */
export async function syncPostMedia(postId: string, json: JSONContent) {
  const refs = extractMediaRefs(json);
  const currentUrls = new Set(refs.map((r) => r.url));

  const existing = await db
    .select()
    .from(media)
    .where(eq(media.postId, postId));
  const existingUrls = new Set(existing.map((row) => row.url));

  const staleIds = existing
    .filter((row) => !currentUrls.has(row.url))
    .map((row) => row.id);
  const newRefs = refs.filter((r) => !existingUrls.has(r.url));

  if (staleIds.length) {
    await db.delete(media).where(inArray(media.id, staleIds));
  }
  if (newRefs.length) {
    await db.insert(media).values(
      newRefs.map((r) => ({
        postId,
        type: r.type,
        url: r.url,
        duration: r.duration,
      }))
    );
  }
}
