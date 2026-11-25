import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PixelIcon, type NomPixel } from "./PixelIcon";
import { chemin, type Lang } from "@/lib/i18n";

type Porte = {
  numero: string;
  pixel: NomPixel;
  cheminFr: string;
  label: Record<Lang, string>;
  teaser: Record<Lang, string>;
};

const PORTES: Porte[] = [
  {
    numero: "02",
    pixel: "projets",
    cheminFr: "/projets",
    label: { fr: "Projets", en: "Projects" },
    teaser: {
      fr: "Pro, perso, expérimental. Ce qui a été livré et ce qui l'a pas été.",
      en: "Work, personal, experimental. What shipped and what didn't.",
    },
  },
  {
    numero: "03",
    pixel: "hobbies",
    cheminFr: "/hobbies",
    label: { fr: "Hobbies", en: "Hobbies" },
    teaser: {
      fr: "Voyages et photo. La carte de tout ce que j'ai traversé, et les images à l'iPhone.",
      en: "Travel and photos. A map of everywhere I've been, and the shots, all on iPhone.",
    },
  },
  {
    numero: "04",
    pixel: "ecrits",
    cheminFr: "/ecrits",
    label: { fr: "Écrits", en: "Writing" },
    teaser: {
      fr: "Notes, essais, trucs à moitié pensés que je mets quand même en ligne.",
      en: "Notes, essays, half-baked thoughts I publish anyway.",
    },
  },
  {
    numero: "05",
    pixel: "apropos",
    cheminFr: "/a-propos",
    label: { fr: "À propos", en: "About" },
    teaser: { fr: "Pas un CV. Une bio qui respire.", en: "Not a résumé. A bio that breathes." },
  },
];

const TITRE = {
  fr: { titre: "Quatre portes, un seul bonhomme.", sous: "Choisis par où entrer. Tout finit par se recouper." },
  en: { titre: "Four doors, one guy.", sous: "Pick a way in. It all overlaps in the end." },
} satisfies Record<Lang, Record<string, string>>;

/** Les rubriques du site en cartes sombres à icône pixel (façon cartes « Enterprise » de n8n). */
export function Portes({ lang }: { lang: Lang }) {
  const t = TITRE[lang];
  return (
    <section aria-labelledby="portes-titre" className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <h2
          id="portes-titre"
          className="max-w-[18ch] text-balance text-[clamp(2.25rem,4.6vw,3.25rem)] font-medium leading-[0.95] tracking-[-0.015em]"
        >
          {t.titre}
        </h2>
        <p className="text-[color:var(--color-muted)]">{t.sous}</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PORTES.map((porte) => (
          <li key={porte.cheminFr}>
            <NextLink
              href={chemin(lang, porte.cheminFr)}
              className="group flex h-full flex-col gap-6 rounded-[24px] bg-[color:var(--color-ink)] p-5 text-[color:var(--color-ink-fg)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="bg-dots-ink relative flex aspect-[5/4] items-center justify-center rounded-[16px]">
                <PixelIcon
                  nom={porte.pixel}
                  className="w-[34%] text-[color:var(--color-ink-fg)] transition-colors duration-200 group-hover:text-[color:var(--color-accent-strong)]"
                />
                <span className="absolute left-3 top-3 font-mono text-[11px] text-[color:var(--color-ink-muted)]">
                  {porte.numero}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                  className="absolute right-3 top-3 text-[color:var(--color-ink-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent-strong)]"
                />
              </div>
              <div className="flex flex-col gap-1.5 px-1 pb-1">
                <span className="font-display text-xl font-medium leading-none">{porte.label[lang]}</span>
                <span className="text-sm leading-snug text-[color:var(--color-ink-muted)]">
                  {porte.teaser[lang]}
                </span>
              </div>
            </NextLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
