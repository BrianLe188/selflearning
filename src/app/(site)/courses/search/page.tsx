import type { Metadata } from "next";
import Link from "next/link";
import { searchCourses, courseTrack } from "@/lib/courses";
import { CoursesSearchInput } from "@/components/courses-search-input";
import { TrackFilterChips } from "@/components/track-filter-chips";
import { CourseRow } from "@/components/courses/course-row";
import { PaginationBar } from "@/components/pagination-bar";

export const metadata: Metadata = {
  title: "All courses",
  description: "Search and browse every course, filterable by track.",
};

export default async function CoursesSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; track?: string; page?: string }>;
}) {
  const params = await searchParams;
  const track = courseTrack.includes(
    params.track as (typeof courseTrack)[number],
  )
    ? (params.track as (typeof courseTrack)[number])
    : "All";
  const page = Number(params.page) || 1;

  const {
    courses,
    total,
    page: currentPage,
    totalPages,
  } = await searchCourses({ q: params.q, track, page });

  return (
    <section className="mx-auto w-full max-w-[860px] flex-grow px-6 pt-10">
      <Link
        href="/courses"
        className="mb-6 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ← Courses by track
      </Link>
      <h1 className="m-0 mb-2 text-[32px] leading-[38px] font-bold text-foreground">
        All courses
      </h1>

      <p className="mb-6 text-[15px] text-muted-foreground">{total} courses</p>

      <CoursesSearchInput initialQuery={params.q ?? ""} />
      <TrackFilterChips
        activeTrack={track}
        searchParams={params}
        basePath="/courses/search"
      />
      <div className="border-t border-border" />

      <div className="mt-4">
        {courses.length === 0 ? (
          <p className="py-14 text-center text-[15px] text-muted-foreground">
            No courses match your search.
          </p>
        ) : (
          courses.map((course) => (
            <CourseRow key={course.slug} course={course} />
          ))
        )}
      </div>

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        searchParams={params}
        basePath="/courses/search"
      />
    </section>
  );
}
