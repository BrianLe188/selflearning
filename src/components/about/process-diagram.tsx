import { Fragment } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ProcessStep =
  | { step: string; text: string; description: string; failSafe?: false }
  | { text: string; description: string; failSafe: true };

export type ProcessPhase = {
  name: string;
  topLabel: string | null;
  items: ProcessStep[];
};

export const PROCESS_PHASES: ProcessPhase[] = [
  {
    name: "Discovery",
    topLabel: null,
    items: [
      {
        step: "1.1",
        text: "Intro call",
        description:
          "I open every engagement with a live call with the client's stakeholders to understand the business goal behind the request, not just the feature list — what problem it solves, who uses it, and what success looks like a few months after launch. I also surface constraints early, such as an existing stack, hosting setup, or compliance requirement, so scoping isn't done in a vacuum.",
      },
      {
        step: "1.2",
        text: "Define scope",
        description:
          "I turn the intro call into a written scope document: what ships in v1 versus what goes to the backlog, a rough timeline, and the stack I'll use and why. I share this back with the client before writing a line of code, so we're both working from the same definition of 'done' instead of discovering gaps mid-build.",
      },
      {
        failSafe: true,
        text: "Scope sign-off",
        description:
          "I don't start development until the client has explicitly signed off on the scope document in writing. This is the first checkpoint in the pipeline — it protects both sides from scope creep and gives the client a clear reference point to hold the delivery against.",
      },
    ],
  },
  {
    name: "Design",
    topLabel: '"FIGMA HANDOFF"',
    items: [
      {
        step: "2.1",
        text: "System architecture",
        description:
          "Before any UI work, I map out the system architecture — API boundaries, database schema, auth flow, and third-party integrations such as payments, email, or storage — and walk the client's technical contact through it, or explain it in plain terms when there isn't one.",
      },
      {
        step: "2.2",
        text: "UX review",
        description:
          "I review the Figma handoff — or wireframes I put together myself on smaller projects — against the agreed scope, flagging screens or flows that are missing, ambiguous, or expensive to build as designed, while changes are still cheap to make.",
      },
      {
        step: "2.3",
        text: "Repo setup",
        description:
          "I set up the repository with the conventions I hold the whole project to: branch strategy, environment variables, linting and formatting, and a README that lets the client's next developer, or a teammate I bring on, get productive without needing me to walk them through it.",
      },
    ],
  },
  {
    name: "Development",
    topLabel: '"GIT / CI PIPELINE"',
    items: [
      {
        step: "3.1",
        text: "Sprint builds",
        description:
          "I work in short, fixed-length sprints, usually a week, against a visible task board, so the client always knows what's in progress and what's next rather than getting a single black-box update at the end of the project.",
      },
      {
        step: "3.2",
        text: "Weekly demo",
        description:
          "At the end of each sprint I demo working software, not slides, over a short call or a recorded walkthrough when time zones don't line up. This surfaces misunderstandings while they're still a day's work to fix, not a week's.",
      },
      {
        step: "3.3",
        text: "Code review",
        description:
          "Every feature branch goes through review before merging, even on solo projects — I review my own pull requests the next day with fresh eyes, and on team projects I review teammates' code for correctness, security, and consistency with the codebase's conventions.",
      },
    ],
  },
  {
    name: "Testing & QA",
    topLabel: null,
    items: [
      {
        step: "4.1",
        text: "QA testing",
        description:
          "I write automated tests — Playwright for critical user flows, unit tests for business logic — and run manual QA against the original scope document before anything reaches the client, so the first build they see already meets the acceptance criteria we agreed on.",
      },
      {
        step: "4.2",
        text: "Client UAT",
        description:
          "I hand the client a staging environment with a short test script covering the key flows, then ask them to test against their own real-world scenarios — the edge cases only they know, like a specific customer type or an unusual data format they deal with daily.",
      },
      {
        failSafe: true,
        text: "Client sign-off",
        description:
          "I treat client UAT approval as a hard gate before production release. A verbal 'looks good' isn't enough — I ask for sign-off in writing against the specific build the client tested, so there's no ambiguity later about what was actually approved.",
      },
    ],
  },
  {
    name: "Deploy & Handoff",
    topLabel: '"PRODUCTION RELEASE"',
    items: [
      {
        step: "5.1",
        text: "Staging check",
        description:
          "I run a final check on staging with production-like data and configuration — environment variables, third-party API keys, and load behavior — since issues that never appear in local development often surface here.",
      },
      {
        failSafe: true,
        text: "Rollback ready",
        description:
          "Before every production release I confirm there's a tested rollback path — a previous deploy I can restore in minutes, or a database migration checked for reversibility — so a bad release costs five minutes, not a multi-hour incident.",
      },
      {
        step: "5.2",
        text: "Docs & handoff",
        description:
          "I hand off with documentation written for whoever inherits the project next: setup instructions, architecture notes, and a walkthrough of anything non-obvious, and I stay reachable for a short window after launch in case something needs my context specifically.",
      },
    ],
  },
];

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
