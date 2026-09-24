"use server";

import { and, eq } from "drizzle-orm";
import { requireUserSession } from "@/lib/session";
import { db } from "@/db";
import { lessonNotes, lessonProgress } from "@/db/schema-courses";

export async function markModuleCompleteAction(moduleId: string) {
  const session = await requireUserSession();

  await db
    .insert(lessonProgress)
    .values({ userId: session.user.id, moduleId })
    .onConflictDoNothing();
}

export interface AddedNote {
  id: string;
  timeSeconds: number;
  text: string;
}

export async function addLessonNoteAction(
  moduleId: string,
  timeSeconds: number,
  text: string
): Promise<AddedNote> {
  const session = await requireUserSession();

  const [note] = await db
    .insert(lessonNotes)
    .values({ userId: session.user.id, moduleId, timeSeconds, text })
    .returning({
      id: lessonNotes.id,
      timeSeconds: lessonNotes.timeSeconds,
      text: lessonNotes.text,
    });

  return note;
}

export async function deleteLessonNoteAction(noteId: string) {
  const session = await requireUserSession();

  await db
    .delete(lessonNotes)
    .where(and(eq(lessonNotes.id, noteId), eq(lessonNotes.userId, session.user.id)));
}
