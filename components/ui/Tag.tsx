import { cn } from "@/lib/utils";

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "accent";
};

export function Tag({ className, tone = "default", ...rest }: TagProps) {
  const toneClass =
    tone === "accent"
      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
      : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]";

  return (
    <span
      className={cn(
        "inline-flex items-center border-2 border-[color:var(--color-border)] px-2 py-0.5 font-mono text-xs uppercase tracking-wider",
        toneClass,
        className,
      )}
      {...rest}
    />
  );
}
