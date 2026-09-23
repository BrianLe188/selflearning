import "server-only";
import { auth } from "@/auth";

/**
 * Re-checked in every admin Server Action and page, independent of Proxy —
 * a Proxy matcher change or a Server Function moved to a different route
 * would otherwise silently drop coverage (see Next.js Proxy docs).
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
