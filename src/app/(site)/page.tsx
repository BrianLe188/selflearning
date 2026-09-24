import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Thumb } from "@/components/thumb";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const posts = await getAllPosts();

  if (posts.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[860px] flex-grow px-6 py-20 text-center">
        <p className="text-[15px] text-muted-foreground">
          No posts published yet — check back soon.
        </p>
      </section>
    );
  }

  const featured = posts[0];
  const latest = posts.slice(1, 7);

  return (
    <>
      <section className="mx-auto w-full max-w-[860px] px-6 pt-14 pb-10">
        <Thumb
          variant="cover"
          src={featured.coverImage}
          alt=""
          className="mb-6"
        />
        <div className="mb-4 flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-primary">Featured</span>
          <span
            aria-hidden="true"
            className="h-[3px] w-[3px] rounded-full bg-muted-foreground"
          />
          <span className="text-[13px] text-muted-foreground">
            {formatDate(featured.date)}
          </span>
        </div>
        <Link href={`/posts/${featured.slug}`} className="block">
          <h1 className="m-0 mb-4 text-[40px] leading-[46px] font-bold text-foreground">
            {featured.title}
          </h1>
        </Link>
        <p className="m-0 mb-5 max-w-[620px] text-[15px] leading-6 text-muted-foreground">
          {featured.excerpt}
        </p>
        <Link
          href={`/posts/${featured.slug}`}
          className="text-[15px] font-semibold text-primary"
        >
          Read the post →
        </Link>
      </section>

      <div className="mx-auto w-full max-w-[860px] px-6">
        <div className="border-t border-border" />
      </div>

      <section className="mx-auto w-full max-w-[860px] flex-grow px-6 pt-4">
        <div>
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="py-6 pb-10 text-center">
          <Link
            href="/posts"
            className="text-[15px] font-semibold text-primary"
          >
            View all posts →
          </Link>
        </div>
      </section>
    </>
  );
}
