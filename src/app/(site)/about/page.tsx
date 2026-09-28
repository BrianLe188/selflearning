import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { StatsCard } from "@/components/about/stats-card";
import { Chapter } from "@/components/about/chapter";
import { SkillsGrid } from "@/components/about/skills-grid";
import { ExperienceTimeline } from "@/components/about/experience-timeline";
import { ProcessDiagram } from "@/components/about/process-diagram";
import { ProcessViews } from "@/components/about/process-views";
import { PROCESS_PHASES } from "@/lib/process-data";
import { AboutSideNav } from "@/components/about/about-side-nav";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fullstack developer with 3+ years of experience building and shipping modern web applications.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StatsCard />

      <div className="mx-auto w-full max-w-[860px] px-6">
        <Chapter id="sec-introduce" num="01" eyebrow="Introduce">
          <p className="mt-4 mb-5 max-w-[620px] text-[17px] leading-7 text-foreground">
            I am a Developer with over 3 years of experience working in startup
            and outsourcing environments, specializing in building and deploying
            modern web applications for international clients. I&apos;m
            experienced in React.js/Next.js, as well as backend Node.js — a good
            fit for a team looking for someone who can work in frontend and also
            has solid backend knowledge. I work daily with TypeScript, MongoDB,
            and PostgreSQL.
          </p>
          <div className="mb-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">Currently:</strong> Fullstack
              Developer at FPT Software
            </span>
            <span>
              <strong className="text-foreground">Experience:</strong> 3+ years
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/BrianLe188"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              GitHub ↗
            </a>
            <a
              href="https://portfolio-vietanhle.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              Portfolio ↗
            </a>
            <a
              href="mailto:anhkun123456@gmail.com"
              className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              Email
            </a>
          </div>
        </Chapter>

        <Chapter
          id="sec-skills"
          num="02"
          eyebrow="Skills"
          title="What I work with"
        >
          <SkillsGrid />
        </Chapter>
      </div>

      <section id="sec-process" className="w-full border-y border-border">
        <div className="mx-auto py-10">
          <div className="min-w-0 flex-1 gap-5 flex max-w-[860px] mx-auto">
            <span className="shrink-0 text-[56px] leading-none font-extrabold text-muted px-6">
              03
            </span>
            <div>
              <span className="text-[13px] font-semibold tracking-[0.02em] text-primary">
                My Process
              </span>
              <h2 className="mt-4 mb-2 text-2xl leading-[30px] font-bold text-foreground">
                From brief to delivery
              </h2>
              <p className="mb-6 max-w-[640px] text-sm leading-[22px] text-muted-foreground">
                As a freelance fullstack developer, I run every project through
                the same disciplined pipeline — with sign-off checkpoints built
                in, so nothing ships as a surprise.
              </p>
            </div>
          </div>
          <ProcessViews phases={PROCESS_PHASES}>
            <ProcessDiagram phases={PROCESS_PHASES} />
          </ProcessViews>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[860px] px-6">
        <Chapter
          id="sec-experience"
          num="04"
          eyebrow="Experience"
          title="Where I've worked"
        >
          <ExperienceTimeline />
        </Chapter>

        <Chapter id="sec-education" num="05" eyebrow="Education">
          <div className="mt-4 text-[15px] text-foreground">
            <div className="font-bold">Duy Tan University</div>
            <div>CMU Standard — Software Engineering</div>
            <div className="text-[13px] text-muted-foreground">2019 — 2023</div>
          </div>
        </Chapter>

        <Chapter
          id="sec-contact"
          num="06"
          eyebrow="Get in touch"
          title="Let's build something together"
          contact
        >
          <p className="mx-auto mb-6 max-w-[440px] text-[15px] text-muted-foreground">
            Open to new opportunities and interesting problems — reach out on
            GitHub or by email.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/BrianLe188"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-primary-foreground"
            >
              GitHub ↗
            </a>
            <a
              href="mailto:anhkun123456@gmail.com"
              className="rounded-md border border-border bg-card px-[18px] py-2.5 text-sm font-semibold text-foreground"
            >
              Email me
            </a>
          </div>
        </Chapter>
      </div>

      <AboutSideNav />
    </>
  );
}
