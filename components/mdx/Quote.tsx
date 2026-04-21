import type { ReactNode } from "react";

type QuoteProps = {
  children: ReactNode;
  attribution?: string;
};

export function Quote({ children, attribution }: QuoteProps) {
  return (
    <figure className="my-10">
      <blockquote className="border-l-4 border-[color:var(--color-accent)] bg-[color:var(--color-bg)] px-6 py-5 font-[family-name:var(--font-space-grotesk)] text-2xl leading-snug">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-2 pl-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
