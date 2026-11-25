"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Lien de la barre : pilule grise au survol, rose pâle sur la page courante. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const actif = pathname === href || pathname.startsWith(href + "/");
  return (
    <NextLink
      href={href}
      aria-current={actif ? "page" : undefined}
      className={cn(
        "inline-flex h-[42px] items-center rounded-full px-4 font-mono text-[13px] uppercase tracking-[0.03em] transition-colors",
        actif
          ? "bg-[color:var(--color-surface-2)]"
          : "hover:bg-[color:var(--color-surface-2)]",
      )}
    >
      {children}
    </NextLink>
  );
}
