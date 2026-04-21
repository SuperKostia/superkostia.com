import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  default:
    "border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)]",
  accent:
    "border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard-sm)]",
  ghost:
    "border-2 border-transparent bg-transparent text-[color:var(--color-fg)] hover:border-[color:var(--color-border)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wide transition-transform",
          "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      />
    );
  },
);
Button.displayName = "Button";
