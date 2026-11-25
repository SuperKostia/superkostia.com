import { forwardRef, type ComponentProps } from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

/**
 * Pilules d'action (décision #014) : mono capitales, rayon plein.
 * - `accent` : rose, l'action principale d'un écran (une seule de préférence) ;
 * - `default` : gris, l'action secondaire ;
 * - `ghost` : sans fond, pour la navigation ;
 * - `ink` : sur un panneau sombre.
 */
export type ButtonVariant = "default" | "accent" | "ghost" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[color:var(--color-surface-2)] text-[color:var(--color-fg)] hover:bg-[color:var(--color-line)]",
  accent:
    "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-strong)]",
  ghost:
    "bg-transparent text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-2)]",
  ink: "bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-fg)] hover:bg-[color:var(--color-ink-line)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-[42px] px-4 text-[13px]",
  lg: "h-12 px-6 text-sm",
};

export function buttonClasses(
  variant: ButtonVariant = "default",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-mono uppercase tracking-[0.03em] transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...rest}
    />
  ),
);
Button.displayName = "Button";

type ButtonLinkProps = ComponentProps<typeof NextLink> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
};

/** Même pilule, en lien. */
export function ButtonLink({
  className,
  variant = "default",
  size = "md",
  external,
  ...rest
}: ButtonLinkProps) {
  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <NextLink
      className={buttonClasses(variant, size, className)}
      {...externalProps}
      {...rest}
    />
  );
}
