import { cn } from "@/lib/utils";

export type LessonTab = "overview" | "notes" | "resources";

const TABS: { key: LessonTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes" },
  { key: "resources", label: "Resources" },
];

export function LessonTabs({
  active,
  onChange,
}: {
  active: LessonTab;
  onChange: (tab: LessonTab) => void;
}) {
  return (
    <div className="mb-6 flex gap-6 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "border-b-2 border-transparent pb-2.5 text-sm font-semibold text-muted-foreground",
            tab.key === active && "border-primary text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
