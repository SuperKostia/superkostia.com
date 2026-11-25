import { ButtonLink } from "@/components/ui/Button";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { chemin, type Lang } from "@/lib/i18n";
import { DisplayTitle } from "./DisplayTitle";
import { Workflow } from "./Workflow";

const TEXTES = {
  fr: {
    eyebrow: "Terrain de jeu public",
    p1: "Je monte des boîtes, je prends des photos, je dessine des logos, je lis Adler.",
    p2: "Ici, tout ce que je fais, ce que je rate et ce qui m'obsède. Rien n'est fini, c'est le principe.",
    projets: "Voir les projets",
    apropos: "Qui est Kostia ?",
  },
  en: {
    eyebrow: "Public playground",
    p1: "I build companies, take photos, draw logos and read Adler.",
    p2: "Here's everything I make, what I fail at and what obsesses me. Nothing is finished. That's the point.",
    projets: "See the projects",
    apropos: "Who is Kostia?",
  },
} satisfies Record<Lang, Record<string, string>>;

/** Héros de l'accueil : titre centré sur trame de points, puis le workflow de Kostia. */
export function Hero({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
      <div className="mx-auto flex max-w-[1360px] flex-col items-center px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
        <NodeLabel>{t.eyebrow}</NodeLabel>
        <div className="mt-6">
          <DisplayTitle />
        </div>
        <div className="mt-7 max-w-[52ch] text-balance text-center text-lg leading-snug sm:text-xl">
          <p>{t.p1}</p>
          <p className="text-[color:var(--color-muted)]">{t.p2}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={chemin(lang, "/projets")} variant="accent">
            {t.projets}
          </ButtonLink>
          <ButtonLink href={chemin(lang, "/a-propos")}>{t.apropos}</ButtonLink>
        </div>

        <Workflow lang={lang} />
      </div>
    </section>
  );
}
