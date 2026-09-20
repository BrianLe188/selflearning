import Image from "next/image";
import { cn } from "@/lib/utils";

function ThumbIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="text-muted-foreground opacity-50"
      aria-hidden="true"
    >
      <rect x="4" y="8" width="40" height="32" rx="4" />
      <circle cx="16" cy="18" r="3" />
      <path d="M6 34l10-10 8 8 6-6 12 12" />
    </svg>
  );
}

interface ThumbProps {
  /** "cover" = full-width 16:9 hero image. "card" = fixed 140x96 list thumbnail. */
  variant: "cover" | "card";
  /** Path under /public. Omit to render the placeholder box (no real photo yet). */
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Replaces the mockup's `.thumb` placeholder box with a real `next/image`
 * once a post has a `coverImage`, falling back to the original placeholder
 * (icon + border box) for posts that don't have one yet.
 */
export function Thumb({ variant, src, alt, className }: ThumbProps) {
  const base =
    "relative shrink-0 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center";

  if (variant === "cover") {
    return (
      <div
        className={cn(base, "w-full aspect-video flex-col gap-2", className)}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 760px) 760px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <>
            <ThumbIcon size={32} />
            <span className="text-xs text-muted-foreground/80">
              Cover image
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn(base, "h-24 w-[140px]", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="140px"
          className="object-cover"
        />
      ) : (
        <ThumbIcon size={22} />
      )}
    </div>
  );
}
