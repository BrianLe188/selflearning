"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  type SuggestionItem,
} from "novel";

export function SlashCommandMenu({ items }: { items: SuggestionItem[] }) {
  return (
    <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
      <EditorCommandEmpty className="px-2 py-3 text-sm text-muted-foreground">
        No results
      </EditorCommandEmpty>
      <EditorCommandList>
        {items.map((item) => (
          <EditorCommandItem
            value={item.title}
            keywords={item.searchTerms}
            onCommand={(val) => item.command?.(val)}
            key={item.title}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground data-[selected=true]:bg-muted"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="font-medium">{item.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
          </EditorCommandItem>
        ))}
      </EditorCommandList>
    </EditorCommand>
  );
}
