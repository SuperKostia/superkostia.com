import { cn } from "@/lib/utils";

type NodeLabelProps = {
  children: React.ReactNode;
  /** Deuxième segment en pastille rose : « CAS · AXIOM ». */
  highlight?: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

/**
 * Étiquette de section façon nœud : texte mono capitales encadré de deux
 * points de connexion roses. Sert d'eyebrow au-dessus des titres.
 */
export function NodeLabel({ children, highlight, className, as: Tag = "p" }: NodeLabelProps) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-muted)]",
        className,
      )}
    >
      <span aria-hidden className="node-dot" />
      <span>{children}</span>
      {highlight ? (
        <>
          <span aria-hidden className="node-dot" />
          <span className="rounded-full bg-[color:var(--color-accent)] px-2 py-0.5 text-[color:var(--color-accent-fg)]">
            {highlight}
          </span>
        </>
      ) : null}
      <span aria-hidden className="node-dot" />
    </Tag>
  );
}
