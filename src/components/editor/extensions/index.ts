import { baseExtensions } from "./base";
import { AudioBlock } from "./audio-block";
import { VideoBlock } from "./video-block";

/**
 * Node/mark-defining extensions only, with zero `@tiptap/react` import in
 * their dependency chain — safe for the server-side `generateHTML` publish
 * step (src/lib/tiptap-html.ts), which runs in the RSC/Server Action module
 * graph where React's DOM/client APIs aren't available.
 *
 * The live editor uses editor-extensions.ts instead, which swaps in the
 * NodeView-enabled (client-only) variants of these same two nodes.
 */
export const contentExtensions = [...baseExtensions, AudioBlock, VideoBlock];

export { AudioBlock, VideoBlock };
export type { AudioBlockAttrs } from "./audio-block";
export type { VideoBlockAttrs } from "./video-block";
