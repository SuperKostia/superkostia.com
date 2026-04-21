import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  className,
}: PageShellProps) {
  return (
    <section className={cn("px-6 py-12 sm:px-10 lg:px-12", className)}>
      <header className="mb-10 flex flex-col gap-3">
        {eyebrow ? (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {intro ? (
          <div className="max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
            {intro}
          </div>
        ) : null}
      </header>
      {children}
    </section>
  );
}
