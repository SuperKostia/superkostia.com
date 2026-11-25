import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { ProjetsVue } from "@/components/projet/ProjetsVue";
import type { StoryProjet } from "@/components/projet/ProjetsStories";
import { LogoProjet } from "@/components/projet/LogoProjet";
import { getProjets } from "@/lib/mdx";
import { captureProjet, logoProjet } from "@/lib/visuels";
import { LOCALE, alternates, chemin, libelleType, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    titre: "Projets",
    description: "Tout ce que Kostia a monté : pro, perso, expérimental.",
    intro:
      "Pro, perso, expérimental. En stories, comme sur Instagram : touche, glisse, ou passe en grille.",
  },
  en: {
    titre: "Projects",
    description: "Everything Kostia has built: work, personal, experimental.",
    intro:
      "Work, personal, experimental. As stories, like on Instagram: tap, swipe, or switch to the grid.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function metadataProjets(lang: Lang): Metadata {
  return {
    title: TEXTES[lang].titre,
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/projets"),
  };
}

/** Affiche "mois année" si une date précise est connue, sinon juste l'année. */
function formatPeriode(
  lang: Lang,
  fm: { date?: string; year: number },
): string {
  if (fm.date) {
    const [y, m = "1"] = fm.date.split("-");
    return new Intl.DateTimeFormat(LOCALE[lang], {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(y), Number(m) - 1, 1));
  }
  return String(fm.year);
}

export async function ProjetsIndex({ lang }: { lang: Lang }) {
  const projets = await getProjets(lang);
  const t = TEXTES[lang];
  const stories: StoryProjet[] = projets.map(({ frontmatter: p }) => {
    const site = p.links?.[0]?.url;
    return {
      slug: p.slug,
      titre: p.title,
      type: libelleType(lang, p.type),
      periode: formatPeriode(lang, p),
      resume: p.summary,
      href: chemin(lang, `/projets/${p.slug}`),
      site: site && /^https?:\/\//.test(site) ? site : undefined,
      image: captureProjet(p.slug),
      logo: logoProjet(p.slug),
    };
  });

  return (
    <PageShell eyebrow="Index" title={t.titre} intro={<p>{t.intro}</p>} size="wide">
      {projets.length === 0 ? (
        <p className="text-center font-mono text-sm uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
          <code>content/projets/</code> : 0.
        </p>
      ) : (
        <ProjetsVue projets={stories} lang={lang}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projets.map((entry) => {
              const fm = entry.frontmatter;
              const capture = captureProjet(fm.slug);
              return (
                <li key={fm.slug} className="group">
                  <NextLink
                    href={chemin(lang, `/projets/${fm.slug}`)}
                    data-cursor="ouvrir"
                    className="block h-full rounded-[24px]"
                  >
                    <Card
                      as="article"
                      className="flex h-full flex-col gap-4 p-3 transition-colors group-hover:bg-[color:var(--color-surface-2)]"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[color:var(--color-surface-2)]">
                        {capture ? (
                          <Image
                            src={capture}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <span aria-hidden className="bg-dots absolute inset-0" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 px-2 pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <LogoProjet
                              titre={fm.title}
                              logo={logoProjet(fm.slug)}
                              className="h-8 w-8 text-xs"
                            />
                            <Tag tone={fm.type === "pro" ? "accent" : "default"}>
                              {libelleType(lang, fm.type)}
                            </Tag>
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                            {formatPeriode(lang, fm)}
                          </span>
                        </div>
                        <h2 className="text-2xl font-medium leading-[1.05] tracking-[-0.015em]">
                          {fm.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                          {fm.summary}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-1 font-mono text-[12px] uppercase tracking-[0.04em]">
                          <span aria-hidden className="node-dot" />
                          {lang === "en" ? "See the project" : "Voir la fiche"}
                          <ArrowRight
                            size={14}
                            strokeWidth={1.75}
                            aria-hidden
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Card>
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </ProjetsVue>
      )}
    </PageShell>
  );
}
