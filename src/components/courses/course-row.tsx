import Link from "next/link";
import { Thumb } from "@/components/thumb";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/courses";

/** List row used on /courses/search, where courses are mixed across tracks. */
export function CourseRow({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex items-start gap-5 border-b border-border py-5 hover:border-muted-foreground/40"
    >
      <Thumb variant="row" src={course.coverImage} alt="" />
      <div className="flex min-w-0 flex-grow flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="h-auto rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {course.track}
          </Badge>
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
        <div className="text-lg leading-6 font-bold text-foreground">
          {course.title}
        </div>
      </div>
    </Link>
  );
}
