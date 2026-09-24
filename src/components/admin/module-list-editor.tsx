"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addModule, deleteModule, moveModule } from "@/lib/admin-course-actions";
import { ModuleRowEditor, type ModuleRowData } from "@/components/admin/module-row-editor";

export function ModuleListEditor({
  courseId,
  initialModules,
}: {
  courseId: string;
  initialModules: ModuleRowData[];
}) {
  const [modules, setModules] = useState(initialModules);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const created = await addModule(courseId);
      setModules((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.title,
          description: created.description,
          thumbnailUrl: created.thumbnailUrl,
          videoUrl: created.videoUrl,
        },
      ]);
    });
  }

  function handleDelete(moduleId: string) {
    startTransition(async () => {
      await deleteModule(moduleId);
      setModules((prev) => prev.filter((mod) => mod.id !== moduleId));
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= modules.length) return;

    const movedModuleId = modules[index].id;
    setModules((prev) => {
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
    startTransition(async () => {
      await moveModule(courseId, movedModuleId, direction);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Modules</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleAdd}
          className="h-auto gap-1.5 rounded-md border-border px-3 py-1.5 text-sm"
        >
          <Plus className="size-3.5" />
          Add module
        </Button>
      </div>

      {modules.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No modules yet — this course shows as &quot;not published yet&quot;
          on the site.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {modules.map((mod, index) => (
            <ModuleRowEditor
              key={mod.id}
              module={mod}
              index={index}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              onDelete={() => handleDelete(mod.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
