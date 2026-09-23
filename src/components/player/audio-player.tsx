"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface AudioPlayerProps {
  url: string;
  title?: string;
  /** Duration in seconds, known ahead of time from the upload response. */
  duration?: number | null;
  className?: string;
}

export function AudioPlayer({
  url,
  title,
  duration,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration ?? 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) setTotalDuration(audio.duration);
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  return (
    <div
      data-slot="audio-player"
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3",
        className
      )}
    >
      <audio ref={audioRef} src={url} preload="metadata" />
      <Button
        type="button"
        size="icon"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
      </Button>

      <div className="flex min-w-0 flex-grow flex-col gap-1.5">
        {title && (
          <span className="truncate text-sm font-medium text-foreground">
            {title}
          </span>
        )}
        <div className="flex items-center gap-2.5">
          <Slider
            // Single-element array, not a bare number — the wrapper's thumb
            // count comes from `value`'s length when it's an array, and
            // falls back to a 2-thumb [min, max] range otherwise.
            value={[currentTime]}
            min={0}
            max={totalDuration || 1}
            step={0.1}
            onValueChange={(value) => seek((value as number[])[0])}
            className="flex-grow"
          />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
