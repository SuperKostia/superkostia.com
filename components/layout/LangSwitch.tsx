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
      className="inline-flex h-10 min-w-10 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
    >
      {autre}
    </NextLink>
  );
}
