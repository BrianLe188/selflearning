import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thumb } from "@/components/thumb";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/post-types";

/**
 * Post preview used on both Home and All Posts, built on the shadcn `Card`
 * primitive but stripped of its default rounded corners/ring — this design
 * uses a hairline bottom border instead of a card shadow/outline.
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="flex-row items-start gap-5 rounded-none border-0 border-b border-border bg-transparent py-6 ring-0">
      <div className="flex min-w-0 flex-grow flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="secondary"
            className="h-auto rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {post.tag}
          </Badge>
          <span className="text-[13px] text-muted-foreground">
            {formatDate(post.date)}
          </span>
        </div>
        <Link href={`/posts/${post.slug}`} className="block">
          <h3 className="m-0 text-[26px] leading-8 font-bold text-foreground hover:underline hover:decoration-[var(--border)]">
            {post.title}
          </h3>
        </Link>
        <p className="m-0 max-w-[560px] text-[15px] leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
      </div>
      <Thumb variant="card" src={post.coverImage} alt="" />
    </Card>
  );
}
