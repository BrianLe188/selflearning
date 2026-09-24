import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const courseTrack = [
  "Backend",
  "Frontend",
  "System Design",
  "DevOps",
] as const;
export type CourseTrack = (typeof courseTrack)[number];

export const courseLevel = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof courseLevel)[number];

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  track: text("track", { enum: courseTrack }).notNull(),
  level: text("level", { enum: courseLevel }).notNull(),
  durationLabel: text("duration_label").notNull(),
  description: text("description").notNull(),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const courseModules = pgTable("course_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.userId, table.courseId)]
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.userId, table.moduleId)]
);

export const lessonNotes = pgTable("lesson_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  timeSeconds: integer("time_seconds").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
