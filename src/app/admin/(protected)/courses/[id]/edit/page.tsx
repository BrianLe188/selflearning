import { notFound } from "next/navigation";
import { getCourseForEdit } from "@/lib/admin-courses";
import { CourseEditor } from "@/components/admin/course-editor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCourseForEdit(id);
  if (!result) notFound();

  const { course, modules } = result;

  return (
    <CourseEditor
      course={{
        id: course.id,
        slug: course.slug,
        title: course.title,
        track: course.track,
        level: course.level,
        duration: course.durationLabel,
        description: course.description,
        coverImageUrl: course.coverImageUrl,
        modules: modules.map((mod) => ({
          id: mod.id,
          title: mod.title,
          description: mod.description,
          thumbnailUrl: mod.thumbnailUrl,
          videoUrl: mod.videoUrl,
        })),
      }}
    />
  );
}
