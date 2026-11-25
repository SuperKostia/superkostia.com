import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { NodeLabel } from "@/components/ui/NodeLabel";

type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Pilules d'action sous l'intro. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Largeur du contenu sous le héros. */
  size?: "wide" | "default" | "prose";
};

/**
 * Gabarit des pages d'index : héros centré sur trame de points (titre large
 * en graisse 500, intro courte, actions en pilules), puis le contenu.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  actions,
  children,
  className,
  size = "default",
}: PageShellProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container
          size="default"
          className="flex flex-col items-center gap-5 pb-14 pt-16 text-center sm:pb-20 sm:pt-24"
        >
          {eyebrow ? <NodeLabel>{eyebrow}</NodeLabel> : null}
          <h1 className="max-w-[16ch] text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.015em]">
            {title}
          </h1>
          {intro ? (
            <div className="max-w-[56ch] text-balance text-base leading-snug text-[color:var(--color-muted)] sm:text-lg">
              {intro}
            </div>
          ) : null}
          {actions ? <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div> : null}
        </Container>
      </header>
      {children ? (
        <Container size={size} className="pb-24">
          {children}
        </Container>
      ) : null}
    </div>
  );
}
