"use server";

import { signIn, signOut } from "@/auth";

/**
 * Generic sign-in trigger for visitor-facing entry points (Header,
 * EnrollButton) — no provider specified, so Auth.js sends the user to its
 * default sign-in page listing whatever provider(s) are configured.
 */
export async function signInAction(redirectTo?: string) {
  await signIn(undefined, redirectTo ? { redirectTo } : undefined);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
