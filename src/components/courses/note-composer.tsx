"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function NoteComposer({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <div className="flex gap-2">
      <label htmlFor="note-input" className="sr-only">
        New note
      </label>
      <Input
        id="note-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Add a note at the current point in the video…"
        className="h-auto flex-grow rounded-md border-border bg-card px-3.5 py-2.5 text-sm text-foreground"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="flex-shrink-0 rounded-md bg-primary px-4.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        + Add note
      </button>
    </div>
  );
}
