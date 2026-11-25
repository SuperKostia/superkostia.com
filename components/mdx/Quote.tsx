import type { ReactNode } from "react";

type QuoteProps = {
  children: ReactNode;
  attribution?: string;
};

export function Quote({ children, attribution }: QuoteProps) {
  return (
    <figure className="bg-dots-ink my-10 rounded-[24px] bg-[color:var(--color-ink)] px-6 py-7 text-[color:var(--color-ink-fg)] sm:px-8 sm:py-9">
      <blockquote className="font-display text-2xl font-medium leading-snug tracking-[-0.01em] sm:text-[1.75rem] [&>p]:my-0">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
          <span aria-hidden className="node-dot" />
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
