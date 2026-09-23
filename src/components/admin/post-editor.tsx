"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Command,
  EditorRoot,
  EditorContent,
  Placeholder,
  renderItems,
  type JSONContent,
} from "novel";
import type { Editor, Range } from "@tiptap/core";
import { ImageIcon } from "lucide-react";
import { editorExtensions } from "@/components/editor/extensions/editor-extensions";
import { buildSuggestionItems } from "@/components/editor/slash-command";
import { SlashCommandMenu } from "@/components/editor/command-menu";
import { FormatBubbleMenu } from "@/components/editor/format-bubble-menu";
import { uploadMedia, type UploadKind } from "@/lib/media-actions";
import {
  autosavePost,
  publishPost,
  unpublishPost,
  type PostFormData,
} from "@/lib/post-actions";
import { DeletePostButton } from "@/components/admin/delete-post-button";
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
import { TAGS } from "@/lib/post-types";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

const POST_TAGS = TAGS.filter((tag) => tag !== "All");

const AUTOSAVE_DELAY_MS = 2500;

export interface PostForEdit {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  coverImageUrl: string | null;
  contentJson: JSONContent;
  status: "draft" | "published";
}

type PendingUpload = { editor: Editor; range: Range; kind: UploadKind };

export function PostEditor({ post }: { post: PostForEdit }) {
  const router = useRouter();
  const [status, setStatus] = useState(post.status);
  const [coverImageUrl, setCoverImageUrl] = useState(post.coverImageUrl);
  const [tag, setTag] = useState(post.tag || POST_TAGS[0]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [publishPending, startPublishTransition] = useTransition();
  const [coverUploading, setCoverUploading] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  // createPost() always seeds a non-empty placeholder slug ("untitled-xxxxx"),
  // so "untouched" can't be detected from slug emptiness — instead treat a
  // still-default title as the signal that this is a fresh draft where the
  // slug should keep following the title until the user edits either field.
  const slugTouchedRef = useRef(post.title !== "Untitled post");
  const contentJsonRef = useRef<JSONContent>(post.contentJson);
  const tagRef = useRef(tag);
  const coverImageUrlRef = useRef(coverImageUrl);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tagRef.current = tag;
  }, [tag]);

  useEffect(() => {
    coverImageUrlRef.current = coverImageUrl;
  }, [coverImageUrl]);

  // Slash-command image/audio/video items request an upload via state
  // (never a ref — a ref read from inside the suggestion-item closures
  // built below would be flagged as an unsafe render-time ref access);
  // this effect is what actually opens the file picker once requested.
  useEffect(() => {
    if (!pendingUpload) return;
    const input = fileInputRef.current;
    if (!input) return;
    input.accept =
      pendingUpload.kind === "image"
        ? "image/*"
        : pendingUpload.kind === "audio"
          ? "audio/*"
          : "video/*";
    input.click();
  }, [pendingUpload]);

  function getFormData(): PostFormData {
    return {
      title: titleRef.current?.value ?? "",
      slug: slugRef.current?.value ?? "",
      excerpt: excerptRef.current?.value ?? "",
      tag: tagRef.current,
      coverImageUrl: coverImageUrlRef.current,
      contentJson: contentJsonRef.current,
    };
  }

  function scheduleAutosave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(runAutosave, AUTOSAVE_DELAY_MS);
  }

  async function runAutosave() {
    setSaveState("saving");
    const result = await autosavePost(post.id, getFormData());
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

  function handleTagChange(value: string | null) {
    if (!value) return;
    setTag(value);
    scheduleAutosave();
  }

  // Stable for the component's lifetime (lazy useState initializer, so this
  // only runs once). setPendingUpload is a stable setter, not a ref, so
  // closing over it here during construction is safe.
  const [suggestionItems] = useState(() =>
    buildSuggestionItems({
      onInsertImage: (editor, range) =>
        setPendingUpload({ editor, range, kind: "image" }),
      onInsertAudio: (editor, range) =>
        setPendingUpload({ editor, range, kind: "audio" }),
      onInsertVideo: (editor, range) =>
        setPendingUpload({ editor, range, kind: "video" }),
    })
  );

  const [extensions] = useState(() => [
    ...editorExtensions,
    Placeholder,
    Command.configure({
      suggestion: {
        items: () => suggestionItems,
        render: renderItems,
      },
    }),
  ]);

  async function handleUploadFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pending = pendingUpload;
    e.target.value = "";
    setPendingUpload(null);
    if (!file || !pending) return;

    const { editor, kind } = pending;
    const toastId = toast.loading(`Uploading ${kind}…`);
    try {
      const result = await uploadMedia(file, kind);
      if (kind === "image") {
        editor.chain().focus().setImage({ src: result.url }).run();
      } else if (kind === "audio") {
        editor
          .chain()
          .focus()
          .setAudioBlock({
            url: result.url,
            duration: result.duration,
            title: file.name,
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setVideoBlock({
            url: result.url,
            posterUrl: result.posterUrl,
            duration: result.duration,
          })
          .run();
      }
      toast.success("Uploaded", { id: toastId });
      scheduleAutosave();
    } catch {
      toast.error("Upload failed", { id: toastId });
    }
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
      await autosavePost(post.id, getFormData());
      toast.success("Cover image updated");
    } catch {
      toast.error("Cover image upload failed");
    } finally {
      setCoverUploading(false);
    }
  }

  function handlePublish() {
    startPublishTransition(async () => {
      const result = await publishPost(post.id, getFormData());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStatus("published");
      toast.success("Published");
    });
  }

  function handleUnpublish() {
    startPublishTransition(async () => {
      await unpublishPost(post.id, getFormData().slug);
      setStatus("draft");
      toast.success("Unpublished");
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Couldn't save"}
          {saveState === "idle" && " "}
        </span>
        <div className="flex items-center gap-2">
          <DeletePostButton
            postId={post.id}
            title={post.title}
            onDeleted={() => router.push("/admin")}
          />
          {status === "published" ? (
            <Button
              variant="outline"
              disabled={publishPending}
              onClick={handleUnpublish}
              className="h-auto rounded-md border-border px-4 py-2 text-sm font-semibold"
            >
              Unpublish
            </Button>
          ) : (
            <Button
              disabled={publishPending}
              onClick={handlePublish}
              className="h-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="post-title" className="mb-1.5">
            Title
          </Label>
          <Input
            id="post-title"
            ref={titleRef}
            defaultValue={post.title}
            onChange={handleTitleChange}
            className="h-auto rounded-md border-border bg-card px-3.5 py-2.5 text-lg font-bold"
          />
        </div>

        <div>
          <Label htmlFor="post-slug" className="mb-1.5">
            Slug
          </Label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">/posts/</span>
            <Input
              id="post-slug"
              ref={slugRef}
              defaultValue={post.slug}
              onChange={handleSlugChange}
              className="h-auto flex-grow rounded-md border-border bg-card px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="post-excerpt" className="mb-1.5">
            Excerpt
          </Label>
          <Textarea
            id="post-excerpt"
            ref={excerptRef}
            defaultValue={post.excerpt}
            onChange={scheduleAutosave}
            rows={2}
            className="rounded-md border-border bg-card px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="post-tag" className="mb-1.5">
              Tag
            </Label>
            <Select value={tag} onValueChange={handleTagChange}>
              <SelectTrigger id="post-tag" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <div className={cn("min-h-[400px]")}>
        <EditorRoot>
          <EditorContent
            key={post.id}
            initialContent={post.contentJson}
            extensions={extensions}
            immediatelyRender={false}
            editorProps={{
              attributes: {
                class:
                  "post-content focus:outline-none min-h-[400px] rounded-md border border-border bg-card px-6 py-6",
              },
            }}
            onUpdate={({ editor }) => {
              // ProseMirror's node.attrs objects are created with
              // Object.create(null) (no prototype) internally, including a
              // shared empty-attrs sentinel reused by reference across
              // nodes. React's Server Action argument serializer doesn't
              // recognize those as plain objects and swaps them for opaque
              // "temporary reference" placeholders that throw when read on
              // the server — round-tripping through JSON forces everything
              // back to ordinary Object.prototype-based plain objects.
              contentJsonRef.current = JSON.parse(
                JSON.stringify(editor.getJSON())
              );
              scheduleAutosave();
            }}
          >
            <SlashCommandMenu items={suggestionItems} />
            <FormatBubbleMenu />
          </EditorContent>
        </EditorRoot>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUploadFileChange}
      />
    </div>
  );
}
