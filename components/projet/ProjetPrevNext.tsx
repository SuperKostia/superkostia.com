import NextLink from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProjetFrontmatter } from "@/lib/types";

type ProjetPrevNextProps = {
  prev: ProjetFrontmatter;
  next: ProjetFrontmatter;
};

export function ProjetPrevNext({ prev, next }: ProjetPrevNextProps) {
  return (
    <nav
      aria-label="Navigation entre projets"
      className="mt-16 grid grid-cols-1 border-t-2 border-[color:var(--color-border)] lg:grid-cols-2"
    >
      <NextLink
        href={`/projets/${prev.slug}`}
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
          Projet précédent
        </span>
        <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
          {prev.title}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          {prev.type} · {prev.year}
        </span>
      </NextLink>

      <NextLink
        href={`/projets/${next.slug}`}
        data-cursor="ouvrir"
        className="group flex flex-col items-end gap-3 p-6 text-right transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] sm:p-8"
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
          Projet suivant
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
          {next.type} · {next.year}
        </span>
      </NextLink>
    </nav>
  );
}
