import { createCourse } from "@/lib/admin-course-actions";

/**
 * A plain page component can't call revalidatePath/redirect during render —
 * that only works from a genuine request-handling context (Server Action or
 * Route Handler), which is why this is a route.ts rather than a page.tsx.
 */
export async function GET() {
  await createCourse();
}
