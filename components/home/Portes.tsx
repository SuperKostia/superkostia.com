import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { chemin, type Lang } from "@/lib/i18n";

type Porte = {
  numero: string;
  cheminFr: string;
  label: Record<Lang, string>;
  teaser: Record<Lang, string>;
};

const PORTES: Porte[] = [
  {
    numero: "02",
    cheminFr: "/projets",
    label: { fr: "Projets", en: "Projects" },
    teaser: {
      fr: "Pro, perso, expérimental. Ce qui a été livré et ce qui l'a pas été.",
      en: "Work, personal, experimental. What shipped and what didn't.",
    },
  },
  {
    numero: "03",
    cheminFr: "/hobbies",
    label: { fr: "Hobbies", en: "Hobbies" },
    teaser: {
      fr: "Voyages et photo. La carte de tout ce que j'ai traversé, et les images à l'iPhone.",
      en: "Travel and photos. A map of everywhere I've been, and the shots, all on iPhone.",
    },
  },
  {
    numero: "04",
    cheminFr: "/ecrits",
    label: { fr: "Écrits", en: "Writing" },
    teaser: {
      fr: "Notes, essais, trucs à moitié pensés que je mets quand même en ligne.",
      en: "Notes, essays, half-baked thoughts I publish anyway.",
    },
  },
  {
    numero: "05",
    cheminFr: "/a-propos",
    label: { fr: "À propos", en: "About" },
    teaser: { fr: "Pas un CV. Une bio qui respire.", en: "Not a résumé. A bio that breathes." },
  },
];

export function Portes({ lang }: { lang: Lang }) {
  return (
    <ul className="-mb-[2px] -mr-[2px] grid grid-cols-1 border-t-2 border-[color:var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
      {PORTES.map((porte) => (
        <li
          key={porte.cheminFr}
          className="group relative border-b-2 border-r-2 border-[color:var(--color-border)]"
        >
          <NextLink
            href={chemin(lang, porte.cheminFr)}
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
                {porte.label[lang]}
              </span>
              <span className="block min-h-[4em] max-w-[28ch] text-sm leading-snug text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                {porte.teaser[lang]}
              </span>
            </div>
          </NextLink>
        </li>
      ))}
    </ul>
  );
}
