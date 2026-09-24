import "server-only";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseModules, type CourseTrack } from "@/db/schema-courses";
import { requireAdminSession } from "@/lib/admin-auth";

export const ADMIN_COURSES_PAGE_SIZE = 10;

export interface AdminCoursesFilter {
  q?: string;
  track?: CourseTrack | "all";
  page?: number;
}

export async function getAdminCourses(filter: AdminCoursesFilter = {}) {
  await requireAdminSession();

  const conditions = [];
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(courses.title, `%${q}%`));
  if (filter.track && filter.track !== "all") {
    conditions.push(eq(courses.track, filter.track));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * ADMIN_COURSES_PAGE_SIZE;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(ADMIN_COURSES_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(courses).where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_COURSES_PAGE_SIZE));

  return {
    courses: rows,
    total,
    page: Math.min(page, totalPages),
    totalPages,
  };
}

export async function getCourseForEdit(id: string) {
  await requireAdminSession();

  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!course) return undefined;

  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, id))
    .orderBy(asc(courseModules.position));

  return { course, modules };
}
