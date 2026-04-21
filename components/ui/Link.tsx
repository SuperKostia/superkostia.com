import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type LinkProps = ComponentProps<typeof NextLink> & {
  external?: boolean;
};

export function Link({ className, external, ...rest }: LinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <NextLink
      className={cn(
        "relative inline-block font-medium text-[color:var(--color-fg)] underline decoration-2 underline-offset-4",
        "decoration-[color:var(--color-border)] hover:decoration-[color:var(--color-accent)]",
        className,
      )}
      {...externalProps}
      {...rest}
    />
  );
}
