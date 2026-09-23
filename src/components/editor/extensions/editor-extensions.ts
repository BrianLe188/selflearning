import { baseExtensions } from "./base";
import { AudioBlockWithView } from "./audio-block-view";
import { VideoBlockWithView } from "./video-block-view";

/** Client-only — used by the interactive Novel editor (post-editor.tsx). */
export const editorExtensions = [
  ...baseExtensions,
  AudioBlockWithView,
  VideoBlockWithView,
];
