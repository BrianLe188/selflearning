/**
 * Single source of truth for the "My Process" pipeline shown on /about.
 *
 * Both renderers read from here:
 *   - `components/about/process-diagram.tsx`   (2D, the accessible default)
 *   - `components/about/process-scene/`        (3D, lazy-loaded on demand)
 *
 * Two levels of copy per item, because the two views have very different
 * room for it:
 *   `description`       the long form, shown in the 2D diagram's tooltips
 *   `shortDescription`  one line, shown in the 3D hover tooltip and status
 *                       card — placeholder copy, edit it here
 *
 * `description` on a phase is 3D-only (the 2D diagram has no phase tooltip).
 */

export type ProcessStep =
  | {
      step: string;
      text: string;
      description: string;
      shortDescription?: string;
      failSafe?: false;
    }
  | {
      text: string;
      description: string;
      shortDescription?: string;
      failSafe: true;
    };

export type ProcessPhase = {
  name: string;
  topLabel: string | null;
  /** 3D only — the 2D diagram renders no phase-level tooltip. */
  description?: string;
  items: ProcessStep[];
};

export const PROCESS_PHASES: ProcessPhase[] = [
  {
    name: "Discovery",
    topLabel: null,
    description: "Understand the problem before proposing a solution.",
    items: [
      {
        step: "1.1",
        text: "Intro call",
        description:
          "I open every engagement with a live call with the client's stakeholders to understand the business goal behind the request, not just the feature list — what problem it solves, who uses it, and what success looks like a few months after launch. I also surface constraints early, such as an existing stack, hosting setup, or compliance requirement, so scoping isn't done in a vacuum.",
        shortDescription:
          "Understand goals, users and constraints before anything else.",
      },
      {
        step: "1.2",
        text: "Define scope",
        description:
          "I turn the intro call into a written scope document: what ships in v1 versus what goes to the backlog, a rough timeline, and the stack I'll use and why. I share this back with the client before writing a line of code, so we're both working from the same definition of 'done' instead of discovering gaps mid-build.",
        shortDescription:
          "Turn the brief into user stories and a clear, agreed scope.",
      },
      {
        failSafe: true,
        text: "Scope sign-off",
        description:
          "I don't start development until the client has explicitly signed off on the scope document in writing. This is the first checkpoint in the pipeline — it protects both sides from scope creep and gives the client a clear reference point to hold the delivery against.",
        shortDescription:
          "Nothing gets built until the scope is agreed in writing.",
      },
    ],
  },
  {
    name: "Design",
    topLabel: '"FIGMA HANDOFF"',
    description: "Architecture and UX, settled before the first sprint.",
    items: [
      {
        step: "2.1",
        text: "System architecture",
        description:
          "Before any UI work, I map out the system architecture — API boundaries, database schema, auth flow, and third-party integrations such as payments, email, or storage — and walk the client's technical contact through it, or explain it in plain terms when there isn't one.",
        shortDescription:
          "System design and database schema, chosen for the product's real needs.",
      },
      {
        step: "2.2",
        text: "UX review",
        description:
          "I review the Figma handoff — or wireframes I put together myself on smaller projects — against the agreed scope, flagging screens or flows that are missing, ambiguous, or expensive to build as designed, while changes are still cheap to make.",
        shortDescription: "Wireframes and Figma handoff reviewed with the client.",
      },
      {
        step: "2.3",
        text: "Repo setup",
        description:
          "I set up the repository with the conventions I hold the whole project to: branch strategy, environment variables, linting and formatting, and a README that lets the client's next developer, or a teammate I bring on, get productive without needing me to walk them through it.",
        shortDescription:
          "Repository, environments and CI ready before development starts.",
      },
    ],
  },
  {
    name: "Development",
    topLabel: '"GIT / CI PIPELINE"',
    description: "Short sprints with weekly visibility for the client.",
    items: [
      {
        step: "3.1",
        text: "Sprint builds",
        description:
          "I work in short, fixed-length sprints, usually a week, against a visible task board, so the client always knows what's in progress and what's next rather than getting a single black-box update at the end of the project.",
        shortDescription:
          "Frontend and backend built in parallel, in short sprints.",
      },
      {
        step: "3.2",
        text: "Weekly demo",
        description:
          "At the end of each sprint I demo working software, not slides, over a short call or a recorded walkthrough when time zones don't line up. This surfaces misunderstandings while they're still a day's work to fix, not a week's.",
        shortDescription:
          "The client sees real progress every week, not just at the end.",
      },
      {
        step: "3.3",
        text: "Code review",
        description:
          "Every feature branch goes through review before merging, even on solo projects — I review my own pull requests the next day with fresh eyes, and on team projects I review teammates' code for correctness, security, and consistency with the codebase's conventions.",
        shortDescription:
          "Every pull request is reviewed and checked in CI before it merges.",
      },
    ],
  },
  {
    name: "Testing & QA",
    topLabel: null,
    description:
      "Verify with tests, then with the client. Loops back to Development when needed.",
    items: [
      {
        step: "4.1",
        text: "QA testing",
        description:
          "I write automated tests — Playwright for critical user flows, unit tests for business logic — and run manual QA against the original scope document before anything reaches the client, so the first build they see already meets the acceptance criteria we agreed on.",
        shortDescription:
          "Unit and integration tests, plus manual passes on the key flows.",
      },
      {
        step: "4.2",
        text: "Client UAT",
        description:
          "I hand the client a staging environment with a short test script covering the key flows, then ask them to test against their own real-world scenarios — the edge cases only they know, like a specific customer type or an unusual data format they deal with daily.",
        shortDescription: "The client tests real flows before launch.",
      },
      {
        failSafe: true,
        text: "Client sign-off",
        description:
          "I treat client UAT approval as a hard gate before production release. A verbal 'looks good' isn't enough — I ask for sign-off in writing against the specific build the client tested, so there's no ambiguity later about what was actually approved.",
        shortDescription: "Nothing ships without the client's explicit sign-off.",
      },
    ],
  },
  {
    name: "Deploy & Handoff",
    topLabel: '"PRODUCTION RELEASE"',
    description: "Ship safely, then hand over cleanly.",
    items: [
      {
        step: "5.1",
        text: "Staging check",
        description:
          "I run a final check on staging with production-like data and configuration — environment variables, third-party API keys, and load behavior — since issues that never appear in local development often surface here.",
        shortDescription:
          "Final verification on a production-like environment.",
      },
      {
        failSafe: true,
        text: "Rollback ready",
        description:
          "Before every production release I confirm there's a tested rollback path — a previous deploy I can restore in minutes, or a database migration checked for reversibility — so a bad release costs five minutes, not a multi-hour incident.",
        shortDescription: "A rollback plan is ready before go-live.",
      },
      {
        step: "5.2",
        text: "Docs & handoff",
        description:
          "I hand off with documentation written for whoever inherits the project next: setup instructions, architecture notes, and a walkthrough of anything non-obvious, and I stay reachable for a short window after launch in case something needs my context specifically.",
        shortDescription: "Documentation, a walkthrough and support terms.",
      },
    ],
  },
];
