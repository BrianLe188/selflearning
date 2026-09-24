/**
 * One-time seed: inserts the 12 sample courses (same slugs/tracks/levels/
 * durations/descriptions as the reference export's courses-data.js) and the
 * 6 real modules for `aspnet-core-rest-apis` — every other course is seeded
 * with an empty module list, matching the reference export's own
 * "not published yet" state.
 *
 * Run with: bun run seed:courses
 *
 * Note: relative imports only — see scripts/migrate-mdx.ts for why.
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { courses, courseModules } from "../src/db/schema-courses";
import type { CourseTrack, CourseLevel } from "../src/db/schema-courses";

interface SeedModule {
  title: string;
  description: string;
  hasThumbnail: boolean;
}

interface SeedCourse {
  slug: string;
  track: CourseTrack;
  level: CourseLevel;
  duration: string;
  title: string;
  description: string;
  modules: SeedModule[];
}

const ASPNET_MODULES: SeedModule[] = [
  {
    title: "Environment Setup",
    description:
      "Install the .NET SDK, scaffold your first Web API project, and get familiar with the file structure.",
    hasThumbnail: true,
  },
  {
    title: "Routing & Controllers",
    description:
      "Learn attribute routing, controller conventions, and how incoming requests map to actions.",
    hasThumbnail: true,
  },
  {
    title: "Models & Validation",
    description:
      "Define request/response DTOs and add input validation with data annotations.",
    hasThumbnail: true,
  },
  {
    title: "Working with a Database",
    description:
      "Connect Entity Framework Core to a real database and write your first queries.",
    hasThumbnail: true,
  },
  {
    title: "Authentication & Authorization",
    description:
      "Secure your endpoints with JWT-based authentication and role-based access control.",
    hasThumbnail: false,
  },
  {
    title: "Deploying Your API",
    description: "Package the API into a container and deploy it to a cloud provider.",
    hasThumbnail: false,
  },
];

const SEED_COURSES: SeedCourse[] = [
  {
    slug: "aspnet-core-rest-apis",
    track: "Backend",
    level: "Intermediate",
    duration: "8h",
    title: "Building REST APIs with ASP.NET Core",
    description:
      "A hands-on path from a blank project to a deployed, authenticated API — routing, data access, security, and shipping it for real.",
    modules: ASPNET_MODULES,
  },
  {
    slug: "database-design-fundamentals",
    track: "Backend",
    level: "Beginner",
    duration: "5h",
    title: "Database Design Fundamentals",
    description:
      "Core relational modeling skills — normalization, keys, and indexing — before touching any specific database engine.",
    modules: [],
  },
  {
    slug: "message-queues-in-practice",
    track: "Backend",
    level: "Advanced",
    duration: "6h",
    title: "Message Queues in Practice",
    description:
      "When and how to use a queue — patterns, pitfalls, and a working example end to end.",
    modules: [],
  },
  {
    slug: "react-patterns-large-apps",
    track: "Frontend",
    level: "Intermediate",
    duration: "7h",
    title: "React Patterns for Large Apps",
    description:
      "Structuring state, data fetching, and component boundaries as an app grows past a few screens.",
    modules: [],
  },
  {
    slug: "css-layout-first-principles",
    track: "Frontend",
    level: "Beginner",
    duration: "4h",
    title: "CSS Layout from First Principles",
    description:
      "Flexbox and grid, explained from how the browser actually lays things out — not just recipes to copy.",
    modules: [],
  },
  {
    slug: "accessible-ui-components",
    track: "Frontend",
    level: "Intermediate",
    duration: "5h",
    title: "Building Accessible UI Components",
    description:
      "Keyboard navigation, focus management, and ARIA — building components that work for everyone.",
    modules: [],
  },
  {
    slug: "designing-for-scale-intro",
    track: "System Design",
    level: "Intermediate",
    duration: "9h",
    title: "Designing for Scale: An Introduction",
    description:
      "The core vocabulary and trade-offs behind every system design conversation.",
    modules: [],
  },
  {
    slug: "caching-strategies-deep-dive",
    track: "System Design",
    level: "Advanced",
    duration: "6h",
    title: "Caching Strategies Deep Dive",
    description:
      "Where to cache, what to invalidate, and how caching strategies fail in practice.",
    modules: [],
  },
  {
    slug: "load-balancing-failover",
    track: "System Design",
    level: "Advanced",
    duration: "7h",
    title: "Load Balancing and Failover Patterns",
    description: "Keeping a system available when a piece of it inevitably goes down.",
    modules: [],
  },
  {
    slug: "cicd-pipelines-from-scratch",
    track: "DevOps",
    level: "Beginner",
    duration: "5h",
    title: "CI/CD Pipelines from Scratch",
    description:
      "Building a pipeline from a bare repository up to automated, tested deploys.",
    modules: [],
  },
  {
    slug: "container-orchestration-basics",
    track: "DevOps",
    level: "Intermediate",
    duration: "8h",
    title: "Container Orchestration Basics",
    description:
      "What an orchestrator actually does, and the smallest useful setup to learn it on.",
    modules: [],
  },
  {
    slug: "observability-logs-metrics-traces",
    track: "DevOps",
    level: "Intermediate",
    duration: "6h",
    title: "Observability: Logs, Metrics, Traces",
    description:
      "The three pillars of observability, and how to tell which one answers your question.",
    modules: [],
  },
];

async function main() {
  for (const seedCourse of SEED_COURSES) {
    const [inserted] = await db
      .insert(courses)
      .values({
        slug: seedCourse.slug,
        title: seedCourse.title,
        track: seedCourse.track,
        level: seedCourse.level,
        durationLabel: seedCourse.duration,
        description: seedCourse.description,
      })
      .onConflictDoNothing({ target: courses.slug })
      .returning({ id: courses.id });

    const courseId =
      inserted?.id ??
      (
        await db
          .select({ id: courses.id })
          .from(courses)
          .where(eq(courses.slug, seedCourse.slug))
          .limit(1)
      )[0]?.id;

    if (!courseId || seedCourse.modules.length === 0) continue;

    const [{ value: existingModules }] = await db
      .select({ value: courseModules.id })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .limit(1)
      .then((rows) => [{ value: rows.length }]);

    if (existingModules > 0) continue;

    await db.insert(courseModules).values(
      seedCourse.modules.map((mod, index) => ({
        courseId,
        position: index,
        title: mod.title,
        description: mod.description,
        // Real per-module thumbnails don't exist yet — this points at a
        // static placeholder image (matching the reference export's own
        // "placeholder box, no real photos" convention) so the "which
        // modules have a thumbnail" distinction from the reference data
        // survives into a real, non-null thumbnailUrl.
        thumbnailUrl: mod.hasThumbnail
          ? "/module-thumbnail-placeholder.png"
          : null,
      }))
    );
  }

  console.log(`Seeded ${SEED_COURSES.length} courses.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
