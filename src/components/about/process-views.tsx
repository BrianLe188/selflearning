"use client";

import { useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProcessPhase } from "@/lib/process-data";

/* `three` lives only in this chunk: it is requested the first time someone
   picks 3D, so it never lands in the initial /about bundle. `ssr: false` is
   why this component has to be a Client Component. */
const ProcessScene3D = dynamic(
  () => import("./process-scene/ProcessScene3D").then((m) => m.ProcessScene3D),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[520px] w-full rounded-xl md:h-[580px] lg:h-[620px]" />
    ),
  },
);

/** Warms the chunk on hover/focus so the switch feels instant. The bundler
 *  dedupes this against the `dynamic` import above. */
function prefetchScene() {
  void import("./process-scene/ProcessScene3D");
}

type Mode = "2d" | "3d";

export function ProcessViews({
  phases,
  children,
}: {
  phases: ProcessPhase[];
  /** The 2D diagram, passed in from the server so it stays server-rendered
   *  and its markup is unaffected by this client boundary. */
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("3d");
  const [unavailable, setUnavailable] = useState<string | null>(null);

  const handleUnavailable = useCallback((reason: string) => {
    setUnavailable(reason);
    setMode("2d");
  }, []);

  const show3d = mode === "3d" && !unavailable;

  return (
    <div>
      {/*<div className="mb-4 flex flex-wrap items-center gap-3">
        <ToggleGroup
          aria-label="Diagram view"
          value={[mode]}
          onValueChange={(value) => {
            const next = value[0];
            if (next === "2d" || next === "3d") setMode(next);
          }}
          onMouseEnter={prefetchScene}
          onFocus={prefetchScene}
        >
          <ToggleGroupItem value="2d" size="sm" variant="outline">
            2D
          </ToggleGroupItem>
          <ToggleGroupItem
            value="3d"
            size="sm"
            variant="outline"
            disabled={!!unavailable}
          >
            3D
          </ToggleGroupItem>
        </ToggleGroup>

        {unavailable ? (
          <p className="text-[13px] text-muted-foreground">
            The 3D view isn&apos;t available in this browser
            {unavailable === "WEBGL_UNAVAILABLE" ? " (no WebGL)" : ""} — showing
            the 2D diagram instead.
          </p>
        ) : null}
      </div>*/}

      {show3d ? (
        <ProcessScene3D phases={phases} onUnavailable={handleUnavailable} />
      ) : (
        children
      )}
    </div>
  );
}
