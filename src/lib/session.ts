import "server-only";
import { auth } from "@/auth";

/** Any signed-in visitor — unlike requireAdminSession, no role/allow-list check. */
export async function requireUserSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
