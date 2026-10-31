import type { Metadata } from "next";
import NextLink from "next/link";
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
    <PageShell eyebrow="Index" title={t.titre} intro={<p>{t.intro}</p>}>
      {projets.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          <code>content/projets/</code> : 0.
        </p>
      ) : (
        <ProjetsVue projets={stories} lang={lang}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projets.map((entry) => (
              <li key={entry.frontmatter.slug} className="group">
                <NextLink
                  href={chemin(lang, `/projets/${entry.frontmatter.slug}`)}
                  data-cursor="ouvrir"
                  className="block h-full"
                >
                  <Card
                    as="article"
                    className="flex h-full flex-col gap-3 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <LogoProjet
                          titre={entry.frontmatter.title}
                          logo={logoProjet(entry.frontmatter.slug)}
                          className="h-8 w-8 text-xs"
                        />
                        <Tag
                          tone={
                            entry.frontmatter.type === "pro"
                              ? "accent"
                              : "default"
                          }
                        >
                          {libelleType(lang, entry.frontmatter.type)}
                        </Tag>
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                        {formatPeriode(lang, entry.frontmatter)}
                      </span>
                    </div>
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                      {entry.frontmatter.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                      {entry.frontmatter.summary}
                    </p>
                  </Card>
                </NextLink>
              </li>
            ))}
          </ul>
        </ProjetsVue>
      )}
    </PageShell>
  );
}
