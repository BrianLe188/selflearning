import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  url: string;
  posterUrl?: string | null;
  className?: string;
}

export function VideoPlayer({ url, posterUrl, className }: VideoPlayerProps) {
  return (
    <video
      data-slot="video-player"
      src={url}
      poster={posterUrl ?? undefined}
      controls
      className={cn(
        "aspect-video w-full rounded-md border border-border bg-black",
        className
      )}
    />
  );
}
