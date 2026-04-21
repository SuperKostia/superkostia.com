import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";

type Porte = {
  label: string;
  href: string;
  numero: string;
  teaser: string;
};

const PORTES: Porte[] = [
  {
    numero: "02",
    label: "Projets",
    href: "/projets",
    teaser: "Pro, perso, expérimental. Ce qui a été livré et ce qui l'a pas été.",
  },
  {
    numero: "03",
    label: "Laboratoire",
    href: "/laboratoire",
    teaser: "Mini-apps qui peuvent casser. C'est le principe.",
  },
  {
    numero: "04",
    label: "Écrits",
    href: "/ecrits",
    teaser: "Notes, essais, trucs à moitié pensés que je mets quand même en ligne.",
  },
  {
    numero: "05",
    label: "À propos",
    href: "/a-propos",
    teaser: "Pas un CV. Une bio qui respire.",
  },
];

export function Portes() {
  return (
    <ul className="-mb-[2px] -mr-[2px] grid grid-cols-1 border-t-2 border-[color:var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
      {PORTES.map((porte) => (
        <li
          key={porte.href}
          className="group relative border-b-2 border-r-2 border-[color:var(--color-border)]"
        >
          <NextLink
            href={porte.href}
            className="flex h-full min-h-[200px] flex-col justify-between gap-4 p-6 transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] sm:min-h-[240px] sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                {porte.numero}
              </span>
              <ArrowUpRight
                size={20}
                strokeWidth={2.5}
                aria-hidden
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-4xl xl:text-5xl">
                {porte.label}
              </span>
              <span className="block min-h-[4em] max-w-[28ch] text-sm leading-snug text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                {porte.teaser}
              </span>
            </div>
          </NextLink>
        </li>
      ))}
    </ul>
  );
}
