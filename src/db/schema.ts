import type { AdapterAccountType } from "next-auth/adapters";
import type { JSONContent } from "@tiptap/react";
import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const postStatus = ["draft", "published"] as const;
export type PostStatus = (typeof postStatus)[number];

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  tag: text("tag").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  /** Tiptap/Novel JSON document — source of truth for editing. */
  contentJson: jsonb("content_json").$type<JSONContent>().notNull(),
  /** Rendered once on publish, used for fast public reads. */
  contentHtml: text("content_html").notNull().default(""),
  status: text("status", { enum: postStatus }).notNull().default("draft"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { mode: "date" }),
});

export const mediaType = ["image", "audio", "video"] as const;
export type MediaType = (typeof mediaType)[number];

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  type: text("type", { enum: mediaType }).notNull(),
  url: text("url").notNull(),
  /** Duration in seconds, audio/video only. */
  duration: integer("duration"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Auth.js (next-auth) — Drizzle adapter schema for Postgres.
// https://authjs.dev/getting-started/adapters/drizzle
// ---------------------------------------------------------------------------

export const userRole = ["admin", "visitor"] as const;
export type UserRole = (typeof userRole)[number];

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /** Read model only — the admin allow-list check (ADMIN_EMAIL) remains
   *  the actual gate for /admin, see auth.ts. */
  role: text("role", { enum: userRole }).notNull().default("visitor"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);
