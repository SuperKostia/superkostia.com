import type { Metadata } from "next";
import NextLink from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { getHobbies } from "@/lib/mdx";
import { alternates, chemin, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    description: "Voyages et photographie : la carte de mes voyages et une galerie tout à l'iPhone.",
    intro: "Ce que je fais quand je ne construis pas : les voyages, et les photos que j'en rapporte. La photo a même son propre monde visuel (cf. décision #002).",
  },
  en: {
    description: "Travel and photography: a map of my trips and a gallery shot entirely on iPhone.",
    intro: "What I do when I'm not building: travel, and the photos I bring back. Photography even has its own visual world (see decision #002).",
  },
} satisfies Record<Lang, Record<string, string>>;

export function metadataHobbies(lang: Lang): Metadata {
  return {
    title: "Hobbies",
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/hobbies"),
  };
}

export async function HobbiesIndex({ lang }: { lang: Lang }) {
  const hobbies = await getHobbies(lang);

  return (
    <PageShell
      eyebrow="Index"
      title="Hobbies"
      intro={<p>{TEXTES[lang].intro}</p>}
    >
      {hobbies.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          <code>content/hobbies/</code> : 0.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {hobbies.map((entry) => (
            <li key={entry.frontmatter.slug} className="group">
              <NextLink
                href={chemin(lang, `/hobbies/${entry.frontmatter.slug}`)}
                data-cursor="ouvrir"
                className="block h-full"
              >
                <Card
                  as="article"
                  className="flex h-full flex-col gap-3 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]"
                >
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight">
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
      )}
    </PageShell>
  );
}
