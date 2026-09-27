import Link from "next/link";
import { Thumb } from "@/components/thumb";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/courses";

/** Grid card used on /courses, grouped by track. */
export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col overflow-hidden rounded-md border border-border bg-card hover:border-muted-foreground/40"
    >
      <Thumb variant="course" src={course.coverImage} alt={course.title} />
      <div className="flex flex-grow flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-auto rounded-sm bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
          >
            {course.level}
          </Badge>
          <span className="text-[13px] text-muted-foreground">
            {course.duration}
          </span>
        </div>
        <div className="text-base leading-[22px] font-bold text-foreground">
          {course.title}
        </div>
      </div>
    </Link>
  );
}
