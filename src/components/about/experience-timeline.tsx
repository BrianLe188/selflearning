import { cn } from "@/lib/utils";

const EXPERIENCE = [
  {
    dates: "03/2026 — Present",
    role: "Fullstack Developer",
    company: "FPT Software",
    current: true,
    bullets: [
      "Develop and maintain the unit's projects.",
      "Support build-agent efforts on GitHub Copilot to enhance team productivity.",
    ],
  },
  {
    dates: "02/2023 — 2026",
    role: "Fullstack Developer",
    company: "DinoTech",
    current: false,
    bullets: [
      "Worked primarily with Node.js, React.js, and Next.js; analyzed customer requirements directly with clients.",
      "Coordinated with team members on solutions and guided the development process.",
      "Managed a team of 5 developers.",
      "Set up GitHub Actions to deploy source code for customers.",
      "Maintained and evolved existing systems per customer requirements, including codebase/design decisions.",
    ],
  },
  {
    dates: "08/2022 — 11/2022",
    role: "Node.js Internship",
    company: "Bizverse",
    current: false,
    bullets: [
      "Gained hands-on experience with GraphQL — its structure and best practices for efficient data fetching.",
      "Developed, updated, and maintained features to enhance system functionality and performance.",
      "Worked closely with the frontend team to ensure seamless API integration.",
      "Took part in regular team discussions to analyze challenges and shape development approaches.",
    ],
  },
] as const;

/** Vertical role/company timeline — About-page-specific, visually distinct
 * from the Courses roadmap (muted dots + line vs. numbered circles). */
export function ExperienceTimeline() {
  return (
    <div>
      {EXPERIENCE.map((job, index) => (
        <div key={job.company} className="flex gap-5">
          <div className="flex shrink-0 flex-col items-center">
            <span
              className={cn(
                "mt-1.5 h-3 w-3 shrink-0 rounded-full",
                job.current ? "bg-primary" : "bg-muted-foreground"
              )}
            />
            {index < EXPERIENCE.length - 1 && (
              <span className="min-h-6 w-px flex-grow bg-border" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-8">
            <div className="mb-1 text-[13px] text-muted-foreground">
              {job.dates}
            </div>
            <div className="text-lg font-bold text-foreground">
              {job.role}
            </div>
            <div className="mb-2.5 text-sm font-semibold text-primary">
              {job.company}
            </div>
            <ul className="list-disc space-y-1 pl-[18px]">
              {job.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="text-sm leading-[23px] text-muted-foreground"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
