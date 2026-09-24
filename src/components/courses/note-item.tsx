import { X } from "lucide-react";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function NoteItem({
  timeSeconds,
  text,
  onJump,
  onRemove,
}: {
  timeSeconds: number;
  text: string;
  onJump: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
      <button
        type="button"
        onClick={onJump}
        className="flex-shrink-0 rounded-sm bg-muted px-2 py-1 font-mono text-xs font-bold text-primary hover:opacity-80"
      >
        {formatTime(timeSeconds)}
      </button>
      <div className="min-w-0 flex-1 text-sm leading-[22px] text-foreground">
        {text}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove note"
        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
