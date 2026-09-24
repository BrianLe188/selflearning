"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, ChevronUp, ChevronDown, Trash2, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/player/video-player";
import { uploadMedia } from "@/lib/media-actions";
import { saveModule } from "@/lib/admin-course-actions";

const AUTOSAVE_DELAY_MS = 1200;

export interface ModuleRowData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export function ModuleRowEditor({
  module,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  module: ModuleRowData;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description);
  const [thumbnailUrl, setThumbnailUrl] = useState(module.thumbnailUrl);
  const [videoUrl, setVideoUrl] = useState(module.videoUrl);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function scheduleSave(next: {
    title?: string;
    description?: string;
    thumbnailUrl?: string | null;
    videoUrl?: string | null;
  }) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const nextTitle = next.title ?? title;
    const nextDescription = next.description ?? description;
    const nextThumbnailUrl =
      next.thumbnailUrl !== undefined ? next.thumbnailUrl : thumbnailUrl;
    const nextVideoUrl = next.videoUrl !== undefined ? next.videoUrl : videoUrl;
    saveTimerRef.current = setTimeout(() => {
      saveModule(module.id, {
        title: nextTitle,
        description: nextDescription,
        thumbnailUrl: nextThumbnailUrl,
        videoUrl: nextVideoUrl,
      });
    }, AUTOSAVE_DELAY_MS);
  }

  async function handleThumbnailFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setThumbUploading(true);
    try {
      const result = await uploadMedia(file, "image");
      setThumbnailUrl(result.url);
      await saveModule(module.id, {
        title,
        description,
        thumbnailUrl: result.url,
        videoUrl,
      });
      toast.success("Thumbnail updated");
    } catch {
      toast.error("Thumbnail upload failed");
    } finally {
      setThumbUploading(false);
    }
  }

  function handleRemoveThumbnail() {
    setThumbnailUrl(null);
    saveModule(module.id, { title, description, thumbnailUrl: null, videoUrl });
  }

  async function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setVideoUploading(true);
    try {
      const result = await uploadMedia(file, "video");
      // A module with no thumbnail yet gets the video's auto-generated
      // poster frame, same as the blog editor's video block does.
      const nextThumbnailUrl = thumbnailUrl ?? result.posterUrl ?? thumbnailUrl;
      setVideoUrl(result.url);
      if (nextThumbnailUrl !== thumbnailUrl) setThumbnailUrl(nextThumbnailUrl);
      await saveModule(module.id, {
        title,
        description,
        thumbnailUrl: nextThumbnailUrl,
        videoUrl: result.url,
      });
      toast.success("Video uploaded");
    } catch {
      toast.error("Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  }

  function handleRemoveVideo() {
    setVideoUrl(null);
    saveModule(module.id, { title, description, thumbnailUrl, videoUrl: null });
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {index + 1}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Move module up"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Move module down"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-grow flex-col gap-2">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleSave({ title: e.target.value });
            }}
            placeholder="Module title"
            className="h-auto rounded-md border-border bg-background px-3 py-2 text-sm font-semibold"
          />
          <Textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              scheduleSave({ description: e.target.value });
            }}
            placeholder="Module description"
            rows={2}
            className="rounded-md border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-shrink-0 flex-col items-center gap-2">
          <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={thumbUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-auto rounded-md border-border px-2 py-1 text-xs"
            >
              {thumbUploading ? "…" : thumbnailUrl ? "Replace" : "Upload"}
            </Button>
            {thumbnailUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveThumbnail}
                className="h-auto rounded-md px-2 py-1 text-xs text-muted-foreground"
              >
                Remove
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnailFileChange}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Delete module"
          className="self-start text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-4">
        {videoUrl ? (
          <VideoPlayer url={videoUrl} posterUrl={thumbnailUrl} className="aspect-video w-48" />
        ) : (
          <div className="flex h-24 w-48 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted">
            <VideoIcon className="size-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Lesson video (optional)
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={videoUploading}
              onClick={() => videoInputRef.current?.click()}
              className="h-auto rounded-md border-border px-2 py-1 text-xs"
            >
              {videoUploading ? "Uploading…" : videoUrl ? "Replace" : "Upload video"}
            </Button>
            {videoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveVideo}
                className="h-auto rounded-md px-2 py-1 text-xs text-muted-foreground"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoFileChange}
        />
      </div>
    </div>
  );
}
