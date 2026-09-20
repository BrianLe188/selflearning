import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostsExplorer } from "@/components/posts-explorer";

export const metadata: Metadata = {
  title: "All posts",
  description: "Search and browse every post, filterable by tag.",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <section className="mx-auto w-full max-w-[760px] flex-grow px-6 pt-10">
      <h1 className="m-0 mb-2 text-[32px] leading-[38px] font-bold text-foreground">
        All posts
      </h1>
      <PostsExplorer posts={posts} />
    </section>
  );
}
