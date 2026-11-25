import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type LinkProps = ComponentProps<typeof NextLink> & {
  external?: boolean;
};

/** Lien de texte : souligné fin, le soulignement vire au rose au survol. */
export function Link({ className, external, ...rest }: LinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <NextLink
      className={cn(
        "underline decoration-1 underline-offset-[5px] decoration-[color:var(--color-line)]",
        "transition-colors hover:decoration-[color:var(--color-accent-strong)] hover:decoration-2",
        className,
      )}
      {...externalProps}
      {...rest}
    />
  );
}
