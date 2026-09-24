import { Thumb } from "@/components/thumb";
import type { CourseModule } from "@/lib/courses";

/** One step in the course detail page's vertical module roadmap. */
export function ModuleTimelineItem({
  module,
  index,
  isLast,
}: {
  module: CourseModule;
  index: number;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-shrink-0 flex-col items-center">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-[13px] font-bold text-muted-foreground">
          {index + 1}
        </div>
        {!isLast && <div className="w-px min-h-6 flex-grow bg-border" />}
      </div>
      <div className="flex flex-1 min-w-0 gap-4 pb-6">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 mb-1.5 text-xl leading-[26px] font-bold text-foreground">
            {module.title}
          </h3>
          <p className="m-0 text-[15px] leading-6 text-muted-foreground">
            {module.description}
          </p>
        </div>
        {module.thumbnailUrl && (
          <Thumb
            variant="roadmap"
            src={module.thumbnailUrl}
            alt=""
            className="flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}
