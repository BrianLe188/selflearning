"use client";

import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { X } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { AudioBlock, type AudioBlockAttrs } from "./audio-block";

function AudioBlockView({ node, deleteNode, selected }: NodeViewProps) {
  const { url, duration, title } = node.attrs as AudioBlockAttrs;

  return (
    <NodeViewWrapper
      data-type="audio-block"
      className={`group relative my-4 rounded-md ${selected ? "ring-2 ring-ring" : ""}`}
    >
      <AudioPlayer url={url} duration={duration} title={title ?? undefined} />
      <button
        type="button"
        aria-label="Remove audio"
        onClick={deleteNode}
        className="absolute -top-2 -right-2 hidden size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm group-hover:flex hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </NodeViewWrapper>
  );
}

/** The editor-only variant of AudioBlock, with its interactive NodeView attached. */
export const AudioBlockWithView = AudioBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(AudioBlockView);
  },
});
