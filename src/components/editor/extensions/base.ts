import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";

/** Shared between the server-safe content extensions and the client editor's. */
export const baseExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  TiptapImage.configure({
    HTMLAttributes: { class: "rounded-md border border-border" },
  }),
];
