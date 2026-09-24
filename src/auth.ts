import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [GitHub],
  session: { strategy: "database" },
  pages: {
    signIn: "/admin/sign-in",
  },
  callbacks: {
    async signIn({ user }) {
      return user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
    },
  },
  events: {
    /**
     * Read model only, re-derived on every sign-in — the `signIn` callback
     * above remains the actual gate for /admin, this never replaces it.
     */
    async signIn({ user }) {
      if (!user.id) return;
      const role =
        user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()
          ? "admin"
          : "visitor";
      await db.update(users).set({ role }).where(eq(users.id, user.id));
    },
  },
});
