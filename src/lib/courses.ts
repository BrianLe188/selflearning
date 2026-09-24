import "server-only";
import { cache } from "react";
import { and, asc, count, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  courseModules,
  courseTrack,
  enrollments,
  type CourseLevel,
  type CourseTrack,
} from "@/db/schema-courses";

export const COURSES_PAGE_SIZE = 6;
export { courseTrack } from "@/db/schema-courses";
export type { CourseTrack, CourseLevel } from "@/db/schema-courses";

export interface Course {
  id: string;
  slug: string;
  title: string;
  track: CourseTrack;
  level: CourseLevel;
  duration: string;
  description: string;
  coverImage?: string;
}

export interface CourseModule {
  id: string;
  position: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
}

type CourseRow = typeof courses.$inferSelect;

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    track: row.track,
    level: row.level,
    duration: row.durationLabel,
    description: row.description,
    coverImage: row.coverImageUrl ?? undefined,
  };
}

/** All courses grouped by track, in the fixed track order used across the UI. */
export const getCoursesByTrack = cache(
  async (): Promise<{ track: CourseTrack; courses: Course[] }[]> => {
    const rows = await db.select().from(courses).orderBy(asc(courses.title));
    return courseTrack.map((track) => ({
      track,
      courses: rows.filter((row) => row.track === track).map(toCourse),
    }));
  }
);

export interface CoursesSearchFilter {
  q?: string;
  /** "All" (or omitted) means no track filter. */
  track?: string;
  page?: number;
}

export interface CoursesSearchResult {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

/** All courses, filtered/paginated server-side for /courses/search. */
export async function searchCourses(
  filter: CoursesSearchFilter = {}
): Promise<CoursesSearchResult> {
  const conditions = [];
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(courses.title, `%${q}%`));
  if (filter.track && filter.track !== "All") {
    conditions.push(eq(courses.track, filter.track as CourseTrack));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * COURSES_PAGE_SIZE;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(where)
      .orderBy(asc(courses.title))
      .limit(COURSES_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(courses).where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / COURSES_PAGE_SIZE));

  return {
    courses: rows.map(toCourse),
    total,
    page: Math.min(page, totalPages),
    totalPages,
  };
}

export const getCourseBySlug = cache(
  async (slug: string): Promise<CourseDetail | undefined> => {
    const [row] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (!row) return undefined;

    const moduleRows = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, row.id))
      .orderBy(asc(courseModules.position));

    const modules: CourseModule[] = moduleRows.map((mod) => ({
      id: mod.id,
      position: mod.position,
      title: mod.title,
      description: mod.description,
      thumbnailUrl: mod.thumbnailUrl,
      videoUrl: mod.videoUrl,
    }));

    return { ...toCourse(row), modules };
  }
);

export async function isEnrolled(
  userId: string,
  courseId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    )
    .limit(1);
  return Boolean(row);
}

/**
 * Raw insert, no `revalidatePath` — callable during a page render (the
 * sign-in-then-enroll redirect on /courses/[slug]) where revalidatePath is
 * unsupported. The `enrollInCourseAction` Server Action wraps this and adds
 * revalidation for the normal button-click path.
 */
export async function enrollUser(userId: string, courseId: string) {
  await db.insert(enrollments).values({ userId, courseId }).onConflictDoNothing();
}
