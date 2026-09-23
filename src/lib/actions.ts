"use server";

import { db } from "@/db";
import { subscribers } from "@/db/schema";

export interface SubscribeState {
  status: "idle" | "success" | "error";
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    await db.insert(subscribers).values({ email }).onConflictDoNothing();
  } catch {
    return {
      status: "error",
      message: "Something went wrong — please try again.",
    };
  }

  return { status: "success", message: "Thanks — you're on the list!" };
}
