"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubscribeForm } from "@/components/subscribe-form";
import { siteConfig } from "@/site.config";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-[760px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:flex-nowrap sm:gap-6">
        <Link href="/" className="text-xl font-bold text-foreground">
          {siteConfig.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          {siteConfig.nav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href !== "#" && pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-[15px] text-muted-foreground hover:text-foreground",
                  isActive && "text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="h-auto rounded-md border-primary bg-transparent px-4.5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
                />
              }
            >
              Subscribe
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{siteConfig.subscribe.headline}</DialogTitle>
                <DialogDescription>
                  {siteConfig.subscribe.subtext}
                </DialogDescription>
              </DialogHeader>
              <SubscribeForm />
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </header>
  );
}
