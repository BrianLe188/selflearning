"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { uploadMedia } from "@/lib/media-actions";
import { saveCourse, type CourseFormData } from "@/lib/admin-course-actions";
import { courseTrack, courseLevel } from "@/db/schema-courses";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { ModuleListEditor } from "@/components/admin/module-list-editor";
import type { ModuleRowData } from "@/components/admin/module-row-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";

const AUTOSAVE_DELAY_MS = 1500;

export interface CourseForEdit {
  id: string;
  slug: string;
  title: string;
  track: (typeof courseTrack)[number];
  level: (typeof courseLevel)[number];
  duration: string;
  description: string;
  coverImageUrl: string | null;
  modules: ModuleRowData[];
}

export function CourseEditor({ course }: { course: CourseForEdit }) {
  const router = useRouter();
  const [track, setTrack] = useState(course.track);
  const [level, setLevel] = useState(course.level);
  const [coverImageUrl, setCoverImageUrl] = useState(course.coverImageUrl);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [coverUploading, setCoverUploading] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const slugTouchedRef = useRef(course.title !== "Untitled course");
  const trackRef = useRef(track);
  const levelRef = useRef(level);
  const coverImageUrlRef = useRef(coverImageUrl);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    coverImageUrlRef.current = coverImageUrl;
  }, [coverImageUrl]);

  function getFormData(): CourseFormData {
    return {
      title: titleRef.current?.value ?? "",
      slug: slugRef.current?.value ?? "",
      track: trackRef.current,
      level: levelRef.current,
      duration: durationRef.current?.value ?? "",
      description: descriptionRef.current?.value ?? "",
      coverImageUrl: coverImageUrlRef.current,
    };
  }

  function scheduleAutosave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(runAutosave, AUTOSAVE_DELAY_MS);
  }

  async function runAutosave() {
    setSaveState("saving");
    const result = await saveCourse(course.id, getFormData());
    if (!result.ok) {
      setSaveState("error");
      toast.error(result.error);
      return;
    }
    setSaveState("saved");
  }

  function handleTitleChange() {
    if (!slugTouchedRef.current && slugRef.current && titleRef.current) {
      slugRef.current.value = slugify(titleRef.current.value);
    }
    scheduleAutosave();
  }

  function handleSlugChange() {
    slugTouchedRef.current = true;
    scheduleAutosave();
  }

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setCoverUploading(true);
    try {
      const result = await uploadMedia(file, "image");
      setCoverImageUrl(result.url);
      coverImageUrlRef.current = result.url;
      await saveCourse(course.id, getFormData());
      toast.success("Cover image updated");
    } catch {
      toast.error("Cover image upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Couldn't save"}
          {saveState === "idle" && " "}
        </span>
        <DeleteCourseButton
          courseId={course.id}
          title={course.title}
          onDeleted={() => router.push("/admin/courses")}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="course-title" className="mb-1.5">
            Title
          </Label>
          <Input
            id="course-title"
            ref={titleRef}
            defaultValue={course.title}
            onChange={handleTitleChange}
            className="h-auto rounded-md border-border bg-card px-3.5 py-2.5 text-lg font-bold"
          />
        </div>

        <div>
          <Label htmlFor="course-slug" className="mb-1.5">
            Slug
          </Label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">/courses/</span>
            <Input
              id="course-slug"
              ref={slugRef}
              defaultValue={course.slug}
              onChange={handleSlugChange}
              className="h-auto flex-grow rounded-md border-border bg-card px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="course-description" className="mb-1.5">
            Description
          </Label>
          <Textarea
            id="course-description"
            ref={descriptionRef}
            defaultValue={course.description}
            onChange={scheduleAutosave}
            rows={3}
            className="rounded-md border-border bg-card px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="course-track" className="mb-1.5">
              Track
            </Label>
            <Select
              value={track}
              onValueChange={(value) => {
                if (!value) return;
                setTrack(value as (typeof courseTrack)[number]);
                scheduleAutosave();
              }}
            >
              <SelectTrigger id="course-track" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseTrack.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="course-level" className="mb-1.5">
              Level
            </Label>
            <Select
              value={level}
              onValueChange={(value) => {
                if (!value) return;
                setLevel(value as (typeof courseLevel)[number]);
                scheduleAutosave();
              }}
            >
              <SelectTrigger id="course-level" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseLevel.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="course-duration" className="mb-1.5">
              Duration
            </Label>
            <Input
              id="course-duration"
              ref={durationRef}
              defaultValue={course.duration}
              onChange={scheduleAutosave}
              placeholder="8h"
              className="h-auto w-24 rounded-md border-border bg-card px-3 py-2 text-sm"
            />
          </div>

          <div>
            <Label className="mb-1.5">Cover image</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={coverUploading}
                onClick={() => coverInputRef.current?.click()}
                className="h-auto rounded-md border-border px-3 py-1.5 text-sm"
              >
                {coverUploading ? "Uploading…" : "Upload"}
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <ModuleListEditor courseId={course.id} initialModules={course.modules} />
      </div>
    </div>
  );
}
