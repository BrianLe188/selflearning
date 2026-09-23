import { notFound } from "next/navigation";
import { getPostById } from "@/lib/admin-posts";
import { PostEditor } from "@/components/admin/post-editor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        tag: post.tag,
        coverImageUrl: post.coverImageUrl,
        contentJson: post.contentJson,
        status: post.status,
      }}
    />
  );
}
