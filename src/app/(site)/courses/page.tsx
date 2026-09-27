import type { Metadata } from "next";
import Link from "next/link";
import { getCoursesByTrack } from "@/lib/courses";
import { CourseCard } from "@/components/courses/course-card";

export const metadata: Metadata = {
  title: "Courses",
  description: "Curated learning paths, grouped by track.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const tracks = await getCoursesByTrack();

  return (
    <section className="mx-auto w-full max-w-[960px] flex-grow px-6 pt-10 pb-10">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 mb-2 text-[32px] leading-[38px] font-bold text-foreground">
            Courses
          </h1>
          <p className="m-0 max-w-[520px] text-[15px] text-muted-foreground">
            Curated learning paths, grouped by track. Everything I&apos;ve put
            together while learning these topics myself.
          </p>
        </div>
        <Link
          href="/courses/search"
          className="text-[15px] font-semibold whitespace-nowrap text-primary"
        >
          View all courses →
        </Link>
      </div>

      {tracks.map(({ track, courses }) => {
        if (courses.length === 0) return null;
        return (
          <div key={track} className="mt-8">
            <div className="mb-4 flex items-baseline gap-2.5">
              <h2 className="m-0 text-[22px] leading-7 font-bold text-foreground">
                {track}
              </h2>
              <span className="text-[13px] text-muted-foreground">
                {courses.length} courses
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`/courses/search?track=${encodeURIComponent(track)}`}
                className="text-sm font-semibold text-primary"
              >
                View all {track} →
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
}
