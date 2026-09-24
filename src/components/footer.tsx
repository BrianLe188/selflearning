import Link from "next/link";
import { siteConfig } from "@/site.config";

export function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[860px] flex-wrap items-center justify-between gap-4 px-6 py-6">
        <span className="text-[13px] text-muted-foreground">
          {siteConfig.authorName} — {siteConfig.name}
        </span>
        <div className="flex flex-wrap gap-4">
          {siteConfig.footerTags.map((tag) => (
            <Link
              key={tag}
              href="/posts"
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
