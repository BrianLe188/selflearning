"use client";

import { useActionState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeAction, type SubscribeState } from "@/lib/actions";

const initialState: SubscribeState = { status: "idle", message: "" };

/**
 * Just the interactive form + status message — shared by SubscribeStrip
 * (footer band) and the header's Subscribe dialog, which each wrap it with
 * their own headline/subtext markup and container.
 */
export function SubscribeForm() {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialState
  );
  const inputId = useId();

  return (
    <>
      <form action={formAction} className="flex w-full gap-2">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <Input
          id={inputId}
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
    </>
  );
}
