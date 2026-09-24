import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { lessonNotes, lessonProgress } from "@/db/schema-courses";

export interface LessonNote {
  id: string;
  timeSeconds: number;
  text: string;
}

/** Module ids this user has completed, scoped to the given module id list. */
export async function getCompletedModuleIds(
  userId: string,
  moduleIds: string[]
): Promise<Set<string>> {
  if (moduleIds.length === 0) return new Set();

  const rows = await db
    .select({ moduleId: lessonProgress.moduleId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.moduleId, moduleIds)
      )
    );

  return new Set(rows.map((row) => row.moduleId));
}

/** This user's notes for one module, ordered by video timestamp. */
export async function getLessonNotes(
  userId: string,
  moduleId: string
): Promise<LessonNote[]> {
  const rows = await db
    .select()
    .from(lessonNotes)
    .where(and(eq(lessonNotes.userId, userId), eq(lessonNotes.moduleId, moduleId)))
    .orderBy(asc(lessonNotes.timeSeconds));

  return rows.map((row) => ({
    id: row.id,
    timeSeconds: row.timeSeconds,
    text: row.text,
  }));
}
