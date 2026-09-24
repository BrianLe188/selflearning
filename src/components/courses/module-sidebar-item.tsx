import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModuleSidebarItem({
  index,
  title,
  isCurrent,
  isDone,
  onClick,
}: {
  index: number;
  title: string;
  isCurrent: boolean;
  isDone: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-5 py-2.5 text-left hover:bg-muted"
    >
      <span
        className={cn(
          "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-muted-foreground",
          isDone && "border-success bg-success text-white",
          !isDone && isCurrent && "border-primary bg-primary text-primary-foreground"
        )}
      >
        {isDone ? <Check className="size-3" /> : index + 1}
      </span>
      <span
        className={cn(
          "truncate text-sm text-muted-foreground",
          isCurrent && "font-bold text-foreground"
        )}
      >
        {title}
      </span>
    </button>
  );
}
