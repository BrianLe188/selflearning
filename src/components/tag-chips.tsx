import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TAGS } from "@/lib/post-types";
import { cn } from "@/lib/utils";

/** Plain links (no client JS needed) — preserves whatever filters are set via `searchParams`. */
export function TagChips({
  activeTag,
  searchParams,
  basePath,
}: {
  activeTag: string;
  searchParams: Record<string, string | undefined>;
  basePath: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TAGS.map((tag) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
          if (value && key !== "tag" && key !== "page") params.set(key, value);
        }
        if (tag !== "All") params.set("tag", tag);
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;

        return (
          <Button
            key={tag}
            nativeButton={false}
            render={<Link href={href} />}
            className={cn(
              "h-auto rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted",
              tag === activeTag &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {tag}
          </Button>
        );
      })}
    </div>
  );
}
