import { createSuggestionItems, type SuggestionItem } from "novel";
import type { Editor, Range } from "@tiptap/core";
import {
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Music,
  Quote,
  Text,
  Video,
} from "lucide-react";

export interface UploadTrigger {
  (editor: Editor, range: Range): void;
}

export interface SlashCommandCallbacks {
  onInsertImage: UploadTrigger;
  onInsertAudio: UploadTrigger;
  onInsertVideo: UploadTrigger;
}

/**
 * Builds the "/" command list. Novel's exported `Command` extension ships
 * with no items of its own — everything here (including the plain-text and
 * heading defaults) has to be registered explicitly.
 */
export function buildSuggestionItems(
  callbacks: SlashCommandCallbacks
): SuggestionItem[] {
  return createSuggestionItems([
    {
      title: "Text",
      description: "Just start typing with plain text.",
      searchTerms: ["p", "paragraph"],
      icon: <Text className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      searchTerms: ["subtitle", "medium"],
      icon: <Heading2 className="size-4" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      searchTerms: ["subtitle", "small"],
      icon: <Heading3 className="size-4" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "Bullet list",
      description: "Create a simple bullet list.",
      searchTerms: ["unordered", "point"],
      icon: <List className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered list",
      description: "Create a list with numbering.",
      searchTerms: ["ordered"],
      icon: <ListOrdered className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote.",
      searchTerms: ["blockquote"],
      icon: <Quote className="size-4" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .toggleBlockquote()
          .run();
      },
    },
    {
      title: "Image",
      description: "Upload an image from your computer.",
      searchTerms: ["photo", "picture", "media"],
      icon: <ImageIcon className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        callbacks.onInsertImage(editor, range);
      },
    },
    {
      title: "Audio",
      description: "Upload an audio file.",
      searchTerms: ["mp3", "sound", "music", "podcast"],
      icon: <Music className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        callbacks.onInsertAudio(editor, range);
      },
    },
    {
      title: "Video",
      description: "Upload a video file.",
      searchTerms: ["mp4", "movie", "clip"],
      icon: <Video className="size-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        callbacks.onInsertVideo(editor, range);
      },
    },
  ]);
}
