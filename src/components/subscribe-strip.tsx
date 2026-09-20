"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeAction, type SubscribeState } from "@/lib/actions";
import { siteConfig } from "@/site.config";

const initialState: SubscribeState = { status: "idle", message: "" };

export function SubscribeStrip() {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialState
  );

  return (
    <section className="mt-10 w-full border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-6 py-10 text-center">
        <div className="text-[17px] leading-7 text-foreground">
          {siteConfig.subscribe.headline}
        </div>
        <div className="-mt-2 text-sm text-muted-foreground">
          {siteConfig.subscribe.subtext}
        </div>
        <form action={formAction} className="flex w-full gap-2">
          <label htmlFor="subscribe-email" className="sr-only">
            Email address
          </label>
          <Input
            id="subscribe-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-auto min-w-0 flex-grow rounded-md border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground"
          />
          <Button
            type="submit"
            disabled={pending}
            className="h-auto shrink-0 rounded-md bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {pending ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
        {state.status !== "idle" && (
          <p
            role="status"
            className={
              state.status === "success"
                ? "text-sm text-foreground"
                : "text-sm text-destructive"
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </section>
  );
}
