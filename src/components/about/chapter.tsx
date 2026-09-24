import type { ReactNode } from "react";

/** Numbered chapter wrapper (01–06) shared by every About page section
 * except the wide My Process diagram, which breaks out of this layout. */
export function Chapter({
  id,
  num,
  eyebrow,
  title,
  contact = false,
  children,
}: {
  id: string;
  num: string;
  eyebrow: string;
  title?: string;
  contact?: boolean;
  children?: ReactNode;
}) {
  if (contact) {
    return (
      <section
        id={id}
        className="border-b border-border py-14 text-center"
      >
        <span className="mb-2 block text-[56px] leading-none font-extrabold text-muted">
          {num}
        </span>
        <span className="text-[13px] font-semibold tracking-[0.02em] text-primary">
          {eyebrow}
        </span>
        {title && (
          <h2 className="mx-auto mt-4 mb-5 text-2xl leading-[30px] font-bold text-foreground">
            {title}
          </h2>
        )}
        {children}
      </section>
    );
  }

  return (
    <section id={id} className="flex gap-5 border-b border-border py-10">
      <span className="shrink-0 text-[56px] leading-none font-extrabold text-muted">
        {num}
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[13px] font-semibold tracking-[0.02em] text-primary">
          {eyebrow}
        </span>
        {title && (
          <h2 className="mt-4 mb-5 text-2xl leading-[30px] font-bold text-foreground">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
