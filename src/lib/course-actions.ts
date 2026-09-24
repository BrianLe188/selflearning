"use server";

import { revalidatePath } from "next/cache";
import { requireUserSession } from "@/lib/session";
import { enrollUser } from "@/lib/courses";

export async function enrollInCourseAction(courseId: string, courseSlug: string) {
  const session = await requireUserSession();
  await enrollUser(session.user.id, courseId);
  revalidatePath(`/courses/${courseSlug}`);
}
