"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseModules, courseTrack, courseLevel } from "@/db/schema-courses";
import { requireAdminSession } from "@/lib/admin-auth";

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface CourseFormData {
  title: string;
  slug: string;
  track: (typeof courseTrack)[number];
  level: (typeof courseLevel)[number];
  duration: string;
  description: string;
  coverImageUrl: string | null;
}

export async function createCourse() {
  await requireAdminSession();

  const suffix = Math.random().toString(36).slice(2, 8);
  const [course] = await db
    .insert(courses)
    .values({
      slug: `untitled-${suffix}`,
      title: "Untitled course",
      track: courseTrack[0],
      level: courseLevel[0],
      durationLabel: "",
      description: "",
    })
    .returning({ id: courses.id });

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function saveCourse(
  courseId: string,
  data: CourseFormData
): Promise<ActionResult> {
  await requireAdminSession();

  try {
    await db
      .update(courses)
      .set({
        title: data.title,
        slug: data.slug,
        track: data.track,
        level: data.level,
        durationLabel: data.duration,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
      })
      .where(eq(courses.id, courseId));
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { ok: false, error: "That slug is already in use." };
    }
    throw error;
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${data.slug}`);
  return { ok: true };
}

export async function deleteCourse(courseId: string) {
  await requireAdminSession();

  // course_modules/enrollments cascade-delete via the course_id FK's onDelete: "cascade".
  await db.delete(courses).where(eq(courses.id, courseId));

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export interface ModuleFormData {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export async function addModule(courseId: string) {
  await requireAdminSession();

  const existing = await db
    .select({ position: courseModules.position })
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId));
  const nextPosition = existing.reduce((max, row) => Math.max(max, row.position), -1) + 1;

  const [module] = await db
    .insert(courseModules)
    .values({
      courseId,
      position: nextPosition,
      title: "New module",
      description: "",
    })
    .returning();

  return module;
}

export async function saveModule(moduleId: string, data: ModuleFormData) {
  await requireAdminSession();

  await db
    .update(courseModules)
    .set({
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      videoUrl: data.videoUrl,
    })
    .where(eq(courseModules.id, moduleId));
}

export async function deleteModule(moduleId: string) {
  await requireAdminSession();

  // lesson_progress/lesson_notes cascade-delete via the module_id FK's onDelete: "cascade".
  await db.delete(courseModules).where(eq(courseModules.id, moduleId));
}

/** Swaps this module's position with its immediate neighbor in the given direction. */
export async function moveModule(
  courseId: string,
  moduleId: string,
  direction: "up" | "down"
) {
  await requireAdminSession();

  const [current] = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.id, moduleId))
    .limit(1);
  if (!current) return;

  const [neighbor] = await db
    .select()
    .from(courseModules)
    .where(
      and(
        eq(courseModules.courseId, courseId),
        direction === "up"
          ? lt(courseModules.position, current.position)
          : gt(courseModules.position, current.position)
      )
    )
    .orderBy(direction === "up" ? desc(courseModules.position) : asc(courseModules.position))
    .limit(1);
  if (!neighbor) return;

  await db
    .update(courseModules)
    .set({ position: neighbor.position })
    .where(eq(courseModules.id, current.id));
  await db
    .update(courseModules)
    .set({ position: current.position })
    .where(eq(courseModules.id, neighbor.id));
}
