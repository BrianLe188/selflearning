import { mergeAttributes, Node, type CommandProps } from "@tiptap/core";

/**
 * Schema-only definition — no `@tiptap/react` import, so this stays safe to
 * pull into the server-side `generateHTML` publish step (see
 * src/lib/tiptap-html.ts). The NodeView (audio-block-view.tsx) that renders
 * the live editor's interactive player is a separate, client-only extend()
 * of this node, used only by the editor's own extensions list.
 */

export interface AudioBlockAttrs {
  url: string;
  duration: number | null;
  title: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioBlock: {
      setAudioBlock: (attrs: AudioBlockAttrs) => ReturnType;
    };
  }
}

export const AudioBlock = Node.create({
  name: "audioBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      duration: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-media-block="audio"]',
        getAttrs: (el) => ({
          url: (el as HTMLElement).getAttribute("data-url"),
          duration: Number((el as HTMLElement).getAttribute("data-duration")) || null,
          title: (el as HTMLElement).getAttribute("data-title"),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const { url, duration, title } = node.attrs as AudioBlockAttrs;
    return [
      "div",
      mergeAttributes({
        "data-media-block": "audio",
        "data-url": url,
        "data-duration": duration ?? "",
        "data-title": title ?? "",
      }),
    ];
  },

  addCommands() {
    return {
      setAudioBlock:
        (attrs: AudioBlockAttrs) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
