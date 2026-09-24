"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "sec-introduce", label: "Introduce" },
  { id: "sec-skills", label: "Skills" },
  { id: "sec-process", label: "My Process" },
  { id: "sec-experience", label: "Experience" },
  { id: "sec-education", label: "Education" },
  { id: "sec-contact", label: "Get in touch" },
] as const;

/** Fixed scroll-spy nav — hidden below 900px so it doesn't overlap content
 * on mobile. */
export function AboutSideNav() {
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);

  useEffect(() => {
    function updateActiveSection() {
      let active: string = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 140) {
          active = item.id;
        }
      }
      setActiveId((current) => (current === active ? current : active));
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <nav className="fixed top-1/2 right-8 z-20 hidden -translate-y-1/2 flex-col gap-3.5 min-[900px]:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "flex items-center gap-2 text-[13px] font-normal whitespace-nowrap text-muted-foreground",
              isActive && "font-bold text-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full bg-border",
                isActive && "bg-primary"
              )}
            />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
