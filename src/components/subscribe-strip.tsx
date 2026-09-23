import { SubscribeForm } from "@/components/subscribe-form";
import { siteConfig } from "@/site.config";

export function SubscribeStrip() {
  return (
    <section className="mt-10 w-full border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-6 py-10 text-center">
        <div className="text-[17px] leading-7 text-foreground">
          {siteConfig.subscribe.headline}
        </div>
        <div className="-mt-2 text-sm text-muted-foreground">
          {siteConfig.subscribe.subtext}
        </div>
        <SubscribeForm />
      </div>
    </section>
  );
}
