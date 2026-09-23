"use client";

import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { X } from "lucide-react";
import { VideoPlayer } from "@/components/player/video-player";
import { VideoBlock, type VideoBlockAttrs } from "./video-block";

function VideoBlockView({ node, deleteNode, selected }: NodeViewProps) {
  const { url, posterUrl } = node.attrs as VideoBlockAttrs;

  return (
    <NodeViewWrapper
      data-type="video-block"
      className={`group relative my-4 rounded-md ${selected ? "ring-2 ring-ring" : ""}`}
    >
      <VideoPlayer url={url} posterUrl={posterUrl} />
      <button
        type="button"
        aria-label="Remove video"
        onClick={deleteNode}
        className="absolute -top-2 -right-2 hidden size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm group-hover:flex hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </NodeViewWrapper>
  );
}

/** The editor-only variant of VideoBlock, with its interactive NodeView attached. */
export const VideoBlockWithView = VideoBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockView);
  },
});
