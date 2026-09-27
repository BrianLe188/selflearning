import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { enrollUser, getCourseBySlug, isEnrolled } from "@/lib/courses";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ModuleTimelineItem } from "@/components/courses/module-timeline-item";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/site.config";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${slug}` },
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const { enroll } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const session = await auth();
  const enrolled = session?.user
    ? await isEnrolled(session.user.id, course.id)
    : false;

  // Returning from the sign-in redirect EnrollButton triggers for a signed-
  // out visitor — finish the enrollment now that a session exists, then
  // drop the query param.
  if (enroll === "1" && session?.user && !enrolled) {
    await enrollUser(session.user.id, course.id);
    redirect(`/courses/${course.slug}`);
  }

  const courseUrl = `${siteConfig.url}/courses/${course.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: course.title,
        description: course.description,
        url: courseUrl,
        provider: {
          "@type": "Person",
          name: siteConfig.authorName,
          url: siteConfig.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: `${siteConfig.url}/courses`,
          },
          { "@type": "ListItem", position: 3, name: course.title, item: courseUrl },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto w-full max-w-[680px] flex-grow px-6 pt-10">
      <JsonLd data={jsonLd} />
      <Link
        href="/courses"
        className="mb-6 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ← Courses
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Badge
          variant="secondary"
          className="h-auto rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {course.track}
        </Badge>
        <Badge
          variant="secondary"
          className="h-auto rounded-sm bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
        >
          {course.level}
        </Badge>
        <span className="text-[13px] text-muted-foreground">
          {course.duration}
          {course.modules.length > 0 && ` · ${course.modules.length} modules`}
        </span>
      </div>

      <h1 className="m-0 mb-3 text-[36px] leading-[42px] font-bold text-foreground">
        {course.title}
      </h1>
      <p className="m-0 mb-7 max-w-[560px] text-[15px] leading-6 text-muted-foreground">
        {course.description}
      </p>

      <div className="mb-12">
        <EnrollButton
          courseId={course.id}
          courseSlug={course.slug}
          isSignedIn={Boolean(session?.user)}
          initialEnrolled={enrolled}
        />
      </div>

      {course.modules.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          This course&apos;s detailed module breakdown isn&apos;t published yet.
        </p>
      ) : (
        <div>
          {course.modules.map((mod, index) => (
            <ModuleTimelineItem
              key={mod.id}
              module={mod}
              index={index}
              isLast={index === course.modules.length - 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}
