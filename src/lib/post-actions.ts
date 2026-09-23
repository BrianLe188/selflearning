"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/react";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdminSession } from "@/lib/admin-auth";
import { renderContentJsonToHtml } from "@/lib/editor-html";
import { syncPostMedia } from "@/lib/media-sync";

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  tag: string;
  coverImageUrl: string | null;
  contentJson: JSONContent;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function createPost() {
  await requireAdminSession();

  const suffix = Math.random().toString(36).slice(2, 8);
  const [post] = await db
    .insert(posts)
    .values({
      slug: `untitled-${suffix}`,
      title: "Untitled post",
      contentJson: EMPTY_DOC,
    })
    .returning({ id: posts.id });

  revalidatePath("/admin");
  redirect(`/admin/posts/${post.id}/edit`);
}

/** Debounced autosave — persists fields + content_json only, no HTML regen. */
export async function autosavePost(
  postId: string,
  data: PostFormData
): Promise<ActionResult> {
  await requireAdminSession();

  try {
    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        tag: data.tag,
        coverImageUrl: data.coverImageUrl,
        contentJson: data.contentJson,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { ok: false, error: "That slug is already in use." };
    }
    throw error;
  }

  await syncPostMedia(postId, data.contentJson);
  revalidatePath("/admin");
  return { ok: true };
}

export async function publishPost(
  postId: string,
  data: PostFormData
): Promise<ActionResult> {
  await requireAdminSession();

  const contentHtml = renderContentJsonToHtml(data.contentJson);

  try {
    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        tag: data.tag,
        coverImageUrl: data.coverImageUrl,
        contentJson: data.contentJson,
        contentHtml,
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { ok: false, error: "That slug is already in use." };
    }
    throw error;
  }

  await syncPostMedia(postId, data.contentJson);

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${data.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function unpublishPost(postId: string, slug: string) {
  await requireAdminSession();

  await db
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(posts.id, postId));

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin");
}

export async function deletePost(postId: string) {
  await requireAdminSession();

  // `media` rows cascade-delete via the post_id FK's onDelete: "cascade".
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/admin");
}
