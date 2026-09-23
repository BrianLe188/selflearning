import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminPosts } from "@/lib/admin-posts";
import { createPost } from "@/lib/post-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { PostsFilterBar } from "@/components/admin/posts-filter-bar";
import { PaginationBar } from "@/components/pagination-bar";
import { formatDate } from "@/lib/format";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tag?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status =
    params.status === "draft" || params.status === "published"
      ? params.status
      : "all";
  const page = Number(params.page) || 1;

  const { posts, total, totalPages } = await getAdminPosts({
    q: params.q,
    status,
    tag: params.tag,
    page,
  });

  const hasActiveFilters = Boolean(params.q || params.tag || (params.status && params.status !== "all"));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Posts</h1>
        <form action={createPost}>
          <Button
            type="submit"
            className="h-auto gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New post
          </Button>
        </form>
      </div>

      <PostsFilterBar
        initialQuery={params.q ?? ""}
        initialStatus={status}
        initialTag={params.tag ?? "all"}
      />

      {total === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">
          {hasActiveFilters
            ? "No posts match these filters."
            : "No posts yet — create your first one."}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium text-foreground">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.status === "published" ? "default" : "outline"}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.tag || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(post.updatedAt.toISOString().slice(0, 10))}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/admin/posts/${post.id}/edit`} />}
                    >
                      Edit
                    </Button>
                    <DeletePostButton postId={post.id} title={post.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            searchParams={params}
            basePath="/admin"
          />
        </>
      )}
    </div>
  );
}
