import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

/**
 * Reused across hot reloads in dev so `next dev` doesn't open a new
 * connection pool on every file save.
 */
const client = global.__dbClient ?? postgres(process.env.DATABASE_URL!);

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });
