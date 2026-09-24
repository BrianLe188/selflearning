import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourseBySlug, isEnrolled } from "@/lib/courses";
import { getCompletedModuleIds, getLessonNotes, type LessonNote } from "@/lib/learn";
import { LearnClient, type LearnModule } from "./learn-client";

export default async function CourseLearnPage({
  params,
}: PageProps<"/courses/[slug]/learn">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/courses/${slug}`);

  const enrolled = await isEnrolled(session.user.id, course.id);
  if (!enrolled) redirect(`/courses/${slug}`);

  // The reference export falls back to a single placeholder module when a
  // course has no published breakdown yet — mirrored here so the learn
  // screen always has something to show.
  const modules =
    course.modules.length > 0
      ? course.modules
      : [
          {
            id: "placeholder",
            position: 0,
            title: "Introduction",
            description: "This course does not have a detailed module breakdown yet.",
            thumbnailUrl: null,
            videoUrl: null,
          },
        ];

  const [completedIds, notesByModule] = await Promise.all([
    getCompletedModuleIds(
      session.user.id,
      modules.map((mod) => mod.id)
    ),
    Promise.all(
      modules.map((mod) => getLessonNotes(session.user.id, mod.id))
    ).then((lists) =>
      modules.reduce<Record<string, LessonNote[]>>((acc, mod, i) => {
        acc[mod.id] = lists[i];
        return acc;
      }, {})
    ),
  ]);

  const learnModules: LearnModule[] = modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    thumbnailUrl: mod.thumbnailUrl,
    videoUrl: mod.videoUrl,
    isCompleted: completedIds.has(mod.id),
  }));

  return (
    <LearnClient
      courseSlug={course.slug}
      courseTitle={course.title}
      modules={learnModules}
      initialNotesByModule={notesByModule}
    />
  );
}
