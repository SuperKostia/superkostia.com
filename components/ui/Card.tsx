import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article" | "section";
};

export function Card({ className, as: Tag = "div", ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        "border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard)]",
        className,
      )}
      {...rest}
    />
  );
}
