import NextLink from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProjetFrontmatter } from "@/lib/types";
import { chemin, libelleType, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ProjetPrevNextProps = {
  prev: ProjetFrontmatter;
  next: ProjetFrontmatter;
  lang: Lang;
};

export function ProjetPrevNext({ prev, next, lang }: ProjetPrevNextProps) {
  const en = lang === "en";
  return (
    <nav
      aria-label={en ? "Project navigation" : "Navigation entre projets"}
      className="mt-20 grid grid-cols-1 gap-3 lg:grid-cols-2"
    >
      <CartePrevNext
        href={chemin(lang, `/projets/${prev.slug}`)}
        sens="prev"
        libelle={en ? "Previous project" : "Projet précédent"}
        titre={prev.title}
        meta={`${libelleType(lang, prev.type)} · ${prev.year}`}
      />
      <CartePrevNext
        href={chemin(lang, `/projets/${next.slug}`)}
        sens="next"
        libelle={en ? "Next project" : "Projet suivant"}
        titre={next.title}
        meta={`${libelleType(lang, next.type)} · ${next.year}`}
      />
    </nav>
  );
}

function CartePrevNext({
  href,
  sens,
  libelle,
  titre,
  meta,
}: {
  href: string;
  sens: "prev" | "next";
  libelle: string;
  titre: string;
  meta: string;
}) {
  const suivant = sens === "next";
  return (
    <NextLink
      href={href}
      data-cursor="ouvrir"
      className={cn(
        "group flex flex-col gap-4 rounded-[24px] bg-[color:var(--color-surface)] p-6 transition-colors hover:bg-[color:var(--color-surface-2)] sm:p-8",
        suivant && "items-end text-right",
      )}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
        {suivant ? null : (
          <ArrowLeft
            size={14}
            strokeWidth={1.75}
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          />
        )}
        {libelle}
        {suivant ? (
          <ArrowRight
            size={14}
            strokeWidth={1.75}
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          />
        ) : null}
      </span>
      <span className="font-display text-3xl font-medium leading-[1] tracking-[-0.015em] sm:text-4xl">
        {titre}
      </span>
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
        <span aria-hidden className="node-dot" />
        {meta}
      </span>
    </NextLink>
  );
}
