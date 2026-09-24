import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/db/schema";

/**
 * The Drizzle adapter's database session strategy merges the full `user`
 * row into `session.user`, so `id`/`role` are present at runtime — this
 * just gives them types.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}
