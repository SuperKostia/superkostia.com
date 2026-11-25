"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { langueDuChemin, traduireChemin } from "@/lib/i18n";

/** Bouton FR / EN : la même page dans l'autre langue. */
export function LangSwitch({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname() ?? "/";
  const lang = langueDuChemin(pathname);
  const autre = lang === "fr" ? "en" : "fr";

  return (
    <NextLink
      href={traduireChemin(pathname, autre)}
      hrefLang={autre}
      lang={autre}
      onClick={onClick}
      aria-label={autre === "en" ? "Read in English" : "Lire en français"}
      title={autre === "en" ? "Read in English" : "Lire en français"}
      className="inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-full px-3 font-mono text-[13px] uppercase tracking-[0.03em] text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-surface-2)]"
    >
      {autre}
    </NextLink>
  );
}
