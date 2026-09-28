"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  Wind,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProcessPhase } from "@/lib/process-data";
import {
  createProcessScene,
  type ProcessSceneApi,
  type ProcessScenePhase,
  type ProcessSceneStatus,
} from "./createProcessScene";
import "./process-scene.css";

/**
 * Bridges the 2D diagram's data shape onto the one the scene factory wants,
 * so `lib/process-data.ts` stays the single source of truth and the 2D
 * component's field names never have to move.
 *
 * `shortDescription` is the one-line copy written for the 3D tooltip and
 * status card; it falls back to the long 2D paragraph when absent.
 */
function toScenePhases(phases: ProcessPhase[]): ProcessScenePhase[] {
  return phases.map((phase) => ({
    name: phase.name,
    top: phase.topLabel,
    description: phase.description,
    items: phase.items.map((item) =>
      item.failSafe
        ? {
            text: item.text,
            check: true,
            description: item.shortDescription ?? item.description,
          }
        : {
            text: item.text,
            num: item.step,
            description: item.shortDescription ?? item.description,
          },
    ),
  }));
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A small rotated square, matching the fail-safe marker in the 2D diagram. */
function CheckpointPip({ passed }: { passed: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2.5 shrink-0 rotate-45 border-2",
        passed ? "border-success bg-success" : "border-primary",
      )}
    />
  );
}

export interface ProcessScene3DProps {
  phases: ProcessPhase[];
  /** Called when the scene cannot start (no WebGL, context creation failed).
   *  The parent keeps the 2D diagram and shows an inline note. */
  onUnavailable?: (reason: string) => void;
  className?: string;
}

export function ProcessScene3D({
  phases,
  onUnavailable,
  className,
}: ProcessScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ProcessSceneApi | null>(null);

  const [status, setStatus] = useState<ProcessSceneStatus | null>(null);
  const [progress, setProgress] = useState({ passed: 0, total: 0 });
  const [playing, setPlaying] = useState(false);
  const [sway, setSway] = useState(() => !prefersReducedMotion());

  /* The scene is created once and never re-created on state changes, so the
     callbacks it holds have to stay referentially stable. React state lives
     behind these refs; the scene's own state machine stays in its closure. */
  const phasesRef = useRef(phases);
  const onUnavailableRef = useRef(onUnavailable);

  // Declared before the scene effect so it runs first on every commit: this
  // keeps the refs current without adding the props to the scene effect's
  // (empty) dependency list.
  useEffect(() => {
    phasesRef.current = phases;
    onUnavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let scene: ProcessSceneApi;
    try {
      scene = createProcessScene(el, {
        phases: toScenePhases(phasesRef.current),
        onStatus: setStatus,
        onProgress: setProgress,
        onPlayState: (s) => setPlaying(s.playing),
        autoplay: true,
      });
    } catch (err) {
      onUnavailableRef.current?.(
        err instanceof Error ? err.message : "UNKNOWN",
      );
      return;
    }

    sceneRef.current = scene;
    // StrictMode's double invoke runs this cleanup in between: destroy()
    // removes the canvas, labels and tooltip it appended and releases the
    // WebGL context, so the second pass starts from a clean container.
    return () => {
      sceneRef.current = null;
      scene.destroy();
    };
  }, []);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="sr-only">
        This is a decorative 3D view of the same pipeline. The 2D diagram, on
        the other tab, is the accessible equivalent and contains the same
        phases, steps and fail-safe checkpoints as text.
      </p>

      <div ref={containerRef} className="h-[320px] w-full" />
    </div>
  );
}

export default ProcessScene3D;
