import { cn } from "@/lib/utils";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "aside";
  /** Trame de points en fond (canevas). */
  dots?: boolean;
};

/** Grand panneau sombre arrondi : les moments forts d'une page. */
export function Panel({ className, as: Tag = "div", dots = false, ...rest }: PanelProps) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)] sm:rounded-[32px]",
        dots && "bg-dots-ink",
        className,
      )}
      {...rest}
    />
  );
}
