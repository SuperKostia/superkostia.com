import type { Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    eyebrow: "01 · manifeste",
    p1: "Je m'appelle Kostia. Je monte des boîtes, je prends des photos, je dessine des logos, je lis Adler.",
    p2: "Ce site est un terrain de jeu public : ce que je fais, ce que je rate, ce qui m'obsède, ce qui traîne sur mon bureau.",
    p3: "Rien n'est fini. C'est le principe.",
  },
  en: {
    eyebrow: "01 · manifesto",
    p1: "I'm Kostia. I build companies, I take photos, I draw logos, I read Adler.",
    p2: "This site is a public playground: what I make, what I fail at, what obsesses me, what's lying around on my desk.",
    p3: "Nothing is finished. That's the point.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function Intro({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  return (
    <div className="flex h-full flex-col gap-6 border-l-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 font-mono text-sm leading-relaxed sm:p-8">
      <div className="mt-auto flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.eyebrow}
        </p>
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p className="text-[color:var(--color-muted)]">{t.p3}</p>
      </div>
    </div>
  );
}
