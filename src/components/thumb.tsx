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
  /**
   * "cover" = full-width 16:9 hero image (post detail).
   * "card" = fixed 140x96 list thumbnail (post card).
   * "course" = full-width 16:9 grid thumbnail, no caption (CourseCard).
   * "row" = fixed 100x70 list thumbnail (CourseRow).
   * "roadmap" = fixed 96x64 list thumbnail (ModuleTimelineItem).
   */
  variant: "cover" | "card" | "course" | "row" | "roadmap";
  /** Path under /public, or a remote URL. Omit to render the placeholder box (no real photo yet). */
  src?: string;
  alt: string;
  className?: string;
}

const FIXED_SIZE: Record<"card" | "row" | "roadmap", string> = {
  card: "h-24 w-[140px]",
  row: "h-[70px] w-[100px]",
  roadmap: "h-16 w-24",
};

const FIXED_SIZES_ATTR: Record<"card" | "row" | "roadmap", string> = {
  card: "140px",
  row: "100px",
  roadmap: "96px",
};

const FIXED_ICON_SIZE: Record<"card" | "row" | "roadmap", number> = {
  card: 22,
  row: 22,
  roadmap: 20,
};

/**
 * Replaces the mockup's `.thumb` placeholder box with a real `next/image`
 * once content has an image, falling back to the original placeholder
 * (icon + border box) for content that doesn't have one yet.
 */
export function Thumb({ variant, src, alt, className }: ThumbProps) {
  const base =
    "relative shrink-0 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center";

  if (variant === "cover" || variant === "course") {
    return (
      <div
        className={cn(base, "w-full aspect-video flex-col gap-2", className)}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 860px) 860px, 100vw"
            className="object-cover"
            priority={variant === "cover"}
          />
        ) : (
          <>
            <ThumbIcon size={variant === "cover" ? 32 : 22} />
            {variant === "cover" && (
              <span className="text-xs text-muted-foreground/80">
                Cover image
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn(base, FIXED_SIZE[variant], className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={FIXED_SIZES_ATTR[variant]}
          className="object-cover"
        />
      ) : (
        <ThumbIcon size={FIXED_ICON_SIZE[variant]} />
      )}
    </div>
  );
}
