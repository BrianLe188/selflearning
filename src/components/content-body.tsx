"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AudioPlayer } from "@/components/player/audio-player";
import { VideoPlayer } from "@/components/player/video-player";

interface MediaPortal {
  key: string;
  container: HTMLElement;
  node: ReactNode;
}

/**
 * Renders published post HTML directly (fast paint, no client JS needed for
 * text), then hydrates the audio/video marker divs left by AudioBlock /
 * VideoBlock's renderHTML into the same interactive player components used
 * in the editor, via portals.
 */
export function ContentBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [portals, setPortals] = useState<MediaPortal[]>([]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const found: MediaPortal[] = [];
    root.querySelectorAll<HTMLElement>("[data-media-block]").forEach((el, i) => {
      const type = el.getAttribute("data-media-block");
      const url = el.getAttribute("data-url") ?? "";

      if (type === "audio") {
        const duration = Number(el.getAttribute("data-duration")) || null;
        const title = el.getAttribute("data-title") || undefined;
        found.push({
          key: `audio-${i}`,
          container: el,
          node: <AudioPlayer url={url} duration={duration} title={title} />,
        });
      } else if (type === "video") {
        const posterUrl = el.getAttribute("data-poster-url") || null;
        found.push({
          key: `video-${i}`,
          container: el,
          node: <VideoPlayer url={url} posterUrl={posterUrl} />,
        });
      }
    });

    setPortals(found);
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {portals.map((p) => createPortal(p.node, p.container, p.key))}
    </>
  );
}
