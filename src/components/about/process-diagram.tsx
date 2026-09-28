import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { ProcessPhase, ProcessStep } from "@/lib/process-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ProcessStepItem({ item }: { item: ProcessStep }) {
  if (item.failSafe) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="relative cursor-help text-left outline-none" />
          }
        >
          <span className="absolute top-1.5 -left-[25px] h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="mb-1 flex items-center gap-2">
            <span className="h-3.5 w-3.5 shrink-0 rotate-45 border-2 border-primary" />
            <span className="text-[10px] font-bold tracking-[0.06em] whitespace-nowrap text-primary uppercase">
              Fail-safe
            </span>
          </div>
          <div className="text-xs leading-[18px] text-muted-foreground">
            {item.text}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[300px] text-[13px] leading-[19px] font-normal normal-case"
        >
          {item.description}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="relative cursor-help text-left outline-none" />}
      >
        <span className="absolute top-1.5 -left-[25px] h-1.5 w-1.5 rounded-full bg-line-dot" />
        <div className="mb-0.5 text-[10px] text-muted-foreground">
          {item.step}
        </div>
        <div className="text-[13px] leading-[19px] whitespace-nowrap text-foreground">
          {item.text}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[300px] text-[13px] leading-[19px] font-normal"
      >
        {item.description}
      </TooltipContent>
    </Tooltip>
  );
}

const ARROW_COLUMNS = [2, 4, 6, 8] as const;

/** 5-phase pipeline diagram. Scrolls horizontally on narrow viewports
 * instead of squeezing columns. */
export function ProcessDiagram({ phases }: { phases: ProcessPhase[] }) {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto px-[30px] pt-2 pb-6">
        <div className="grid min-w-[900px] grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr_32px_1fr]">
          {phases.map((phase, i) => {
            const col = i * 2 + 1;
            return (
              <Fragment key={phase.name}>
                <div
                  style={{ gridColumn: col, gridRow: 1 }}
                  className="pb-2 text-center font-mono text-[10px] tracking-[0.04em] whitespace-nowrap text-muted-foreground"
                >
                  {phase.topLabel ?? ""}
                </div>
                <div
                  style={{ gridColumn: col, gridRow: 2 }}
                  className="pb-5 text-center"
                >
                  <span className="inline-block rounded-full border border-border bg-muted px-[18px] py-2 text-[13px] font-semibold whitespace-nowrap text-foreground">
                    {phase.name}
                  </span>
                </div>
                <div
                  style={{ gridColumn: col, gridRow: 3 }}
                  className="flex flex-col gap-4 border-l border-border pl-5"
                >
                  {phase.items.map((item, idx) => (
                    <ProcessStepItem key={idx} item={item} />
                  ))}
                </div>
              </Fragment>
            );
          })}

          {ARROW_COLUMNS.map((col) => {
            const isLoop = col === 6;
            return (
              <div
                key={col}
                style={{ gridColumn: col, gridRow: 2 }}
                className={cn(
                  "flex items-center justify-center pb-5 text-base",
                  isLoop ? "text-primary" : "text-line-dot",
                )}
              >
                {isLoop ? "⟷" : "→"}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
