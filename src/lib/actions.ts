"use server";

export interface SubscribeState {
  status: "idle" | "success" | "error";
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // TODO: replace with a real email-provider call (e.g. Resend, ConvertKit,
  // Mailchimp) once one is wired up. For now this just logs the submission.
  console.log(`[subscribe] new subscriber: ${email}`);

  return { status: "success", message: "Thanks — you're on the list!" };
}
