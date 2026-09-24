import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const SKILLS = [
  {
    title: "React.js / Next.js",
    description:
      "3 years building and shipping medium-to-small scale products, with a focus on performance and maintainable frontend architecture.",
    fullWidth: false,
  },
  {
    title: "Node.js / NestJS / Express",
    description:
      "3 years building RESTful APIs and real-time applications using WebSockets and Socket.IO.",
    fullWidth: false,
  },
  {
    title: "TypeScript",
    description:
      "Used across every past and ongoing project — comfortable with advanced types and their practical application.",
    fullWidth: false,
  },
  {
    title: "Build Agent",
    description:
      "Researching and building coding/testing agents tailored to each project's requirements and business logic.",
    fullWidth: false,
  },
  {
    title: "Also comfortable with",
    description: "Tailwind CSS, MongoDB, SQL, Playwright (automated testing).",
    fullWidth: true,
  },
] as const;

export function SkillsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {SKILLS.map((skill) => (
        <Card
          key={skill.title}
          className={cn(
            "rounded-md border border-border bg-card py-0 ring-0",
            skill.fullWidth && "col-span-2"
          )}
        >
          <CardContent className="p-5">
            <h3 className="mb-2 text-base font-bold text-foreground">
              {skill.title}
            </h3>
            <p className="text-sm leading-[22px] text-muted-foreground">
              {skill.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
