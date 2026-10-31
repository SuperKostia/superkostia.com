import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/MDXContent";
import { getHobbies, getHobbyBySlug, ROUTES_DEDIEES } from "@/lib/mdx";
import { alternates, chemin, imagesPartage, LOCALE_OG, type Lang } from "@/lib/i18n";

export async function parametresHobbies() {
  const hobbies = await getHobbies();
  // "photographie" (décision #002) et "voyages" ont leur propre route statique
  // qui override le catch-all [slug] — on les exclut ici pour éviter un conflit de prerender.
  return hobbies
    .filter((h) => !ROUTES_DEDIEES.has(h.frontmatter.slug))
    .map((h) => ({ slug: h.frontmatter.slug }));
}

export async function metadataHobby(lang: Lang, slug: string): Promise<Metadata> {
  const hobby = await getHobbyBySlug(slug, lang);
  if (!hobby) return {};
  const { frontmatter } = hobby;
  const cheminFr = `/hobbies/${slug}`;
  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    alternates: alternates(lang, cheminFr),
    openGraph: {
      type: "article",
      locale: LOCALE_OG[lang],
      url: chemin(lang, cheminFr),
      title: frontmatter.title,
      description: frontmatter.summary,
      tags: frontmatter.tags,
      images: imagesPartage(lang).openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.summary,
      images: imagesPartage(lang).twitter,
    },
  };
}

export async function HobbyDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const hobby = await getHobbyBySlug(slug, lang);
  if (!hobby) notFound();

  const { frontmatter, body } = hobby;
  const accentStyle = frontmatter.accent
    ? ({ ["--color-accent" as string]: frontmatter.accent } as React.CSSProperties)
    : undefined;

  return (
    <article
      className="px-6 py-10 sm:px-10 lg:px-12"
      style={accentStyle}
    >
      <NextLink
        href={chemin(lang, "/hobbies")}
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
      >
        <ArrowLeft size={14} strokeWidth={2.5} aria-hidden />
        {lang === "en" ? "All hobbies" : "Tous les hobbies"}
      </NextLink>

      <header className="mb-12 flex flex-col gap-4 border-b-2 border-[color:var(--color-border)] pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Hobby
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {frontmatter.title}
        </h1>
        {frontmatter.sousTitre ? (
          <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-snug text-[color:var(--color-muted)]">
            {frontmatter.sousTitre}
          </p>
        ) : null}
        <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--color-muted)]">
          {frontmatter.summary}
        </p>
      </header>

      <MDXContent source={body} lang={lang} />
    </article>
  );
}
