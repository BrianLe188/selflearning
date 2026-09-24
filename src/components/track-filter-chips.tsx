import Link from "next/link";
import { Button } from "@/components/ui/button";
import { courseTrack } from "@/lib/courses";
import { cn } from "@/lib/utils";

const TRACKS = ["All", ...courseTrack] as const;

/** Plain links (no client JS needed) — preserves whatever filters are set via `searchParams`. */
export function TrackFilterChips({
  activeTrack,
  searchParams,
  basePath,
}: {
  activeTrack: string;
  searchParams: Record<string, string | undefined>;
  basePath: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TRACKS.map((track) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
          if (value && key !== "track" && key !== "page") params.set(key, value);
        }
        if (track !== "All") params.set("track", track);
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;

        return (
          <Button
            key={track}
            nativeButton={false}
            render={<Link href={href} />}
            className={cn(
              "h-auto rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted",
              track === activeTrack &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {track}
          </Button>
        );
      })}
    </div>
  );
}
