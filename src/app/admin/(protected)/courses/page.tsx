import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCourses } from "@/lib/admin-courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { CoursesFilterBar } from "@/components/admin/courses-filter-bar";
import { PaginationBar } from "@/components/pagination-bar";
import type { CourseTrack } from "@/db/schema-courses";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; track?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { courses, total, totalPages } = await getAdminCourses({
    q: params.q,
    track: (params.track as CourseTrack | undefined) ?? "all",
    page,
  });

  const hasActiveFilters = Boolean(params.q || (params.track && params.track !== "all"));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/courses/new" />}
          className="h-auto gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New course
        </Button>
      </div>

      <CoursesFilterBar
        initialQuery={params.q ?? ""}
        initialTrack={params.track ?? "all"}
      />

      {total === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">
          {hasActiveFilters
            ? "No courses match these filters."
            : "No courses yet — create your first one."}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-foreground">
                    {course.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.track}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.level}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.durationLabel || "—"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/admin/courses/${course.id}/edit`} />}
                    >
                      Edit
                    </Button>
                    <DeleteCourseButton courseId={course.id} title={course.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            searchParams={params}
            basePath="/admin/courses"
          />
        </>
      )}
    </div>
  );
}
