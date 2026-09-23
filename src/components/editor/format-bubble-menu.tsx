"use client";

import { useEffect, useState } from "react";
import { EditorBubble, EditorBubbleItem, useEditor } from "novel";
import type { Editor } from "@tiptap/core";
import { Bold, Code, Italic, Strikethrough } from "lucide-react";
import { cn } from "@/lib/utils";

const items: {
  name: string;
  icon: typeof Bold;
  isActive: (editor: Editor) => boolean;
  command: (editor: Editor) => void;
}[] = [
  {
    name: "bold",
    icon: Bold,
    isActive: (editor) => editor.isActive("bold"),
    command: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    icon: Italic,
    isActive: (editor) => editor.isActive("italic"),
    command: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    name: "strike",
    icon: Strikethrough,
    isActive: (editor) => editor.isActive("strike"),
    command: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    name: "code",
    icon: Code,
    isActive: (editor) => editor.isActive("code"),
    command: (editor) => editor.chain().focus().toggleCode().run(),
  },
];

export function FormatBubbleMenu() {
  const { editor } = useEditor();
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceRender((n) => n + 1);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <EditorBubble className="flex items-center gap-0.5 rounded-md border border-border bg-popover p-1 shadow-md">
      {items.map((item) => (
        <EditorBubbleItem key={item.name} onSelect={item.command}>
          <button
            type="button"
            // Without this, the mousedown collapses the text selection
            // before onSelect's command runs, so bold/italic/etc. would
            // apply at a collapsed cursor instead of the selected range.
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              item.isActive(editor) && "bg-muted text-foreground"
            )}
          >
            <item.icon className="size-3.5" />
          </button>
        </EditorBubbleItem>
      ))}
    </EditorBubble>
  );
}
