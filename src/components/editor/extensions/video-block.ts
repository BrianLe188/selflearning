import { mergeAttributes, Node, type CommandProps } from "@tiptap/core";

/**
 * Schema-only definition — see audio-block.ts for why this stays free of
 * `@tiptap/react` imports. The NodeView lives in video-block-view.tsx.
 */

export interface VideoBlockAttrs {
  url: string;
  posterUrl: string | null;
  duration: number | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoBlock: {
      setVideoBlock: (attrs: VideoBlockAttrs) => ReturnType;
    };
  }
}

export const VideoBlock = Node.create({
  name: "videoBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      posterUrl: { default: null },
      duration: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-media-block="video"]',
        getAttrs: (el) => ({
          url: (el as HTMLElement).getAttribute("data-url"),
          posterUrl: (el as HTMLElement).getAttribute("data-poster-url"),
          duration: Number((el as HTMLElement).getAttribute("data-duration")) || null,
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const { url, posterUrl, duration } = node.attrs as VideoBlockAttrs;
    return [
      "div",
      mergeAttributes({
        "data-media-block": "video",
        "data-url": url,
        "data-poster-url": posterUrl ?? "",
        "data-duration": duration ?? "",
      }),
    ];
  },

  addCommands() {
    return {
      setVideoBlock:
        (attrs: VideoBlockAttrs) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
