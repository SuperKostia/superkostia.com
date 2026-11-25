import { cn } from "@/lib/utils";

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "accent" | "ink";
};

/** Pastille mono capitales (type, statut, année, techno). */
export function Tag({ className, tone = "default", ...rest }: TagProps) {
  const toneClass =
    tone === "accent"
      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
      : tone === "ink"
        ? "bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-fg)]"
        : "bg-[color:var(--color-surface-2)] text-[color:var(--color-fg)]";

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.04em]",
        toneClass,
        className,
      )}
      {...rest}
    />
  );
}
