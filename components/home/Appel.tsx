import { ButtonLink } from "@/components/ui/Button";
import { chemin, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    titre: "Une idée, un projet, une question ?",
    sous: "J'ouvre une porte de plus sans trop me faire prier.",
    ecrire: "M'écrire",
    colophon: "Comment ce site est fait",
  },
  en: {
    titre: "An idea, a project, a question?",
    sous: "I open one more door without much persuading.",
    ecrire: "Get in touch",
    colophon: "How this site is made",
  },
} satisfies Record<Lang, Record<string, string>>;

/** Dernier écran de l'accueil : un titre centré et deux pilules. */
export function Appel({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  return (
    <section className="mx-auto flex max-w-[900px] flex-col items-center gap-5 px-5 py-16 text-center sm:py-24">
      <h2 className="text-balance text-[clamp(2.25rem,4.6vw,3.25rem)] font-medium leading-[0.95] tracking-[-0.015em]">
        {t.titre}
      </h2>
      <p className="text-[color:var(--color-muted)]">{t.sous}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <ButtonLink href={chemin(lang, "/contact")} variant="accent">
          {t.ecrire}
        </ButtonLink>
        <ButtonLink href={chemin(lang, "/colophon")}>{t.colophon}</ButtonLink>
      </div>
    </section>
  );
}
