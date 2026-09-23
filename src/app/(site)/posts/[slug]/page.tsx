import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { Thumb } from "@/components/thumb";
import { ContentBody } from "@/components/content-body";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/site.config";

export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="h-[3px] w-[3px] rounded-full bg-muted-foreground"
    />
  );
}

export default async function PostPage({
  params,
}: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, 2);

  return (
    <article className="mx-auto w-full max-w-[680px] flex-grow px-6 pt-10">
      <Link
        href="/posts"
        className="mb-6 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ← All posts
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] font-medium text-primary">
          {post.tag}
        </span>
        <Dot />
        <span className="text-[13px] text-muted-foreground">
          {formatDate(post.date)}
        </span>
        <Dot />
        <span className="text-[13px] text-muted-foreground">
          {post.readingTime}
        </span>
      </div>

      <h1 className="m-0 mb-6 text-[40px] leading-[46px] font-bold text-foreground">
        {post.title}
      </h1>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-muted" />
        <div>
          <div className="text-sm font-semibold text-foreground">
            {siteConfig.authorName}
          </div>
          <div className="text-[13px] text-muted-foreground">
            {siteConfig.authorBio}
          </div>
        </div>
      </div>

      <Thumb variant="cover" src={post.coverImage} alt="" className="mb-6" />

      <ContentBody html={post.contentHtml} className="post-content" />

      <div className="my-10 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="h-auto rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mb-10 border-t border-border" />

      <div className="mb-4">
        <span className="text-sm font-semibold text-foreground">
          More posts
        </span>
      </div>
      <div>
        {related.map((relatedPost) => (
          <Link
            key={relatedPost.slug}
            href={`/posts/${relatedPost.slug}`}
            className="block border-b border-border py-4"
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <Badge
                variant="secondary"
                className="h-auto rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {relatedPost.tag}
              </Badge>
              <span className="text-[13px] text-muted-foreground">
                {formatDate(relatedPost.date)}
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {relatedPost.title}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
