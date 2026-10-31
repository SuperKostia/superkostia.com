import NextLink from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProjetFrontmatter } from "@/lib/types";
import { chemin, libelleType, type Lang } from "@/lib/i18n";

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
      className="mt-16 grid grid-cols-1 border-t-2 border-[color:var(--color-border)] lg:grid-cols-2"
    >
      <NextLink
        href={chemin(lang, `/projets/${prev.slug}`)}
        data-cursor="ouvrir"
        className="group flex flex-col gap-3 border-b-2 border-[color:var(--color-border)] p-6 transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] sm:p-8 lg:border-b-0 lg:border-r-2"
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          <ArrowLeft
            size={14}
            strokeWidth={2.5}
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          />
          {en ? "Previous project" : "Projet précédent"}
        </span>
        <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
          {prev.title}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          {libelleType(lang, prev.type)} · {prev.year}
        </span>
      </NextLink>

      <NextLink
        href={chemin(lang, `/projets/${next.slug}`)}
        data-cursor="ouvrir"
        className="group flex flex-col items-end gap-3 p-6 text-right transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] sm:p-8"
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          {en ? "Next project" : "Projet suivant"}
          <ArrowRight
            size={14}
            strokeWidth={2.5}
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
          {next.title}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          {libelleType(lang, next.type)} · {next.year}
        </span>
      </NextLink>
    </nav>
  );
}
