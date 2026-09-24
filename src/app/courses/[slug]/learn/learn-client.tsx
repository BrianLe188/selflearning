"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ModuleSidebarItem } from "@/components/courses/module-sidebar-item";
import { LessonTabs, type LessonTab } from "@/components/courses/lesson-tabs";
import { NoteItem } from "@/components/courses/note-item";
import { NoteComposer } from "@/components/courses/note-composer";
import {
  markModuleCompleteAction,
  addLessonNoteAction,
  deleteLessonNoteAction,
} from "@/lib/learn-actions";
import type { LessonNote } from "@/lib/learn";

export interface LearnModule {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  isCompleted: boolean;
}

const RESOURCES = [
  { name: "Starter project", ext: ".zip" },
  { name: "Slides", ext: ".pdf" },
  { name: "Cheat sheet", ext: ".pdf" },
];

export function LearnClient({
  courseSlug,
  courseTitle,
  modules,
  initialNotesByModule,
}: {
  courseSlug: string;
  courseTitle: string;
  modules: LearnModule[];
  initialNotesByModule: Record<string, LessonNote[]>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<LessonTab>("overview");
  const [completed, setCompleted] = useState(
    () => new Set(modules.filter((mod) => mod.isCompleted).map((mod) => mod.id))
  );
  const [notesByModule, setNotesByModule] = useState(initialNotesByModule);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentModule = modules[currentIndex];
  const notes = notesByModule[currentModule.id] ?? [];

  function goToModule(index: number) {
    setCurrentIndex(index);
    setActiveTab("overview");
  }

  function handleMarkComplete() {
    startTransition(async () => {
      await markModuleCompleteAction(currentModule.id);
      setCompleted((prev) => new Set(prev).add(currentModule.id));
      setCurrentIndex((i) => Math.min(i + 1, modules.length - 1));
      setActiveTab("overview");
    });
  }

  function handleAddNote(text: string) {
    const moduleId = currentModule.id;
    const timeSeconds = Math.floor(videoRef.current?.currentTime ?? 0);
    startTransition(async () => {
      const note = await addLessonNoteAction(moduleId, timeSeconds, text);
      setNotesByModule((prev) => ({
        ...prev,
        [moduleId]: [...(prev[moduleId] ?? []), note].sort(
          (a, b) => a.timeSeconds - b.timeSeconds
        ),
      }));
    });
  }

  function handleRemoveNote(noteId: string) {
    const moduleId = currentModule.id;
    startTransition(async () => {
      await deleteLessonNoteAction(noteId);
      setNotesByModule((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] ?? []).filter((note) => note.id !== noteId),
      }));
    });
  }

  function handleJumpToNote(timeSeconds: number) {
    if (videoRef.current) videoRef.current.currentTime = timeSeconds;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="flex w-[280px] flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card py-6">
        <div className="mb-2 border-b border-border px-5 pb-4">
          <Link
            href={`/courses/${courseSlug}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Course overview
          </Link>
          <div className="mt-2 text-sm font-bold text-foreground">
            {courseTitle}
          </div>
        </div>
        <div>
          {modules.map((mod, index) => (
            <ModuleSidebarItem
              key={mod.id}
              index={index}
              title={mod.title}
              isCurrent={index === currentIndex}
              isDone={completed.has(mod.id)}
              onClick={() => goToModule(index)}
            />
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-10 py-12">
        <div className="mx-auto max-w-[840px]">
          <span className="text-[13px] font-medium text-muted-foreground">
            Module {currentIndex + 1} of {modules.length}
          </span>
          <h1 className="m-0 mt-2 mb-5 text-[32px] leading-[38px] font-bold text-foreground">
            {currentModule.title}
          </h1>

          <video
            key={currentModule.id}
            ref={videoRef}
            controls
            src={currentModule.videoUrl ?? undefined}
            poster={currentModule.thumbnailUrl ?? undefined}
            className="mb-4 aspect-video w-full rounded-md border border-border bg-black"
          />

          <LessonTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "overview" && (
            <div>
              <p className="m-0 mb-5 text-[17px] leading-7 text-foreground">
                {currentModule.description}
              </p>
              <p className="m-0 mb-8 text-[17px] leading-7 text-foreground">
                By the end of this module, you&apos;ll have this step working
                locally and understand exactly what you built and why.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={isPending}
                  className="rounded-md bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  Mark complete & continue →
                </button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="mb-5 flex flex-col gap-3">
                {notes.length === 0 ? (
                  <p className="m-0 text-sm text-muted-foreground">
                    No notes yet for this lesson. Add one at the point in the
                    video you want to remember.
                  </p>
                ) : (
                  notes.map((note) => (
                    <NoteItem
                      key={note.id}
                      timeSeconds={note.timeSeconds}
                      text={note.text}
                      onJump={() => handleJumpToNote(note.timeSeconds)}
                      onRemove={() => handleRemoveNote(note.id)}
                    />
                  ))
                )}
              </div>
              <NoteComposer onAdd={handleAddNote} />
            </div>
          )}

          {activeTab === "resources" && (
            <div className="flex flex-col gap-2">
              {RESOURCES.map((resource) => (
                <a
                  key={resource.name}
                  href="#"
                  className="flex items-center gap-2.5 rounded-md border border-border p-3"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {resource.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {resource.ext}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
