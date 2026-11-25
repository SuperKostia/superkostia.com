import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
  /** `surface` : gris clair (par défaut) ; `ink` : panneau sombre. */
  tone?: "surface" | "ink";
};

/** Carte arrondie sans bordure ni ombre (décision #014). */
export function Card({ className, as: Tag = "div", tone = "surface", ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[24px] p-6",
        tone === "ink"
          ? "bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)]"
          : "bg-[color:var(--color-surface)]",
        className,
      )}
      {...rest}
    />
  );
}
