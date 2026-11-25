import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/MDXContent";
import { Container } from "@/components/ui/Container";
import { NodeLabel } from "@/components/ui/NodeLabel";
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
    <article className="flex flex-col" style={accentStyle}>
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-5 pb-14 pt-12 text-center sm:pb-20 sm:pt-16">
          <NextLink
            href={chemin(lang, "/hobbies")}
            className="inline-flex h-8 items-center gap-2 rounded-full bg-[color:var(--color-surface)] px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-fg)]"
          >
            <ArrowLeft size={13} strokeWidth={1.75} aria-hidden />
            {lang === "en" ? "All hobbies" : "Tous les hobbies"}
          </NextLink>
          <NodeLabel>Hobby</NodeLabel>
          <h1 className="max-w-[16ch] text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.015em]">
            {frontmatter.title}
          </h1>
          {frontmatter.sousTitre ? (
            <p className="text-2xl leading-snug tracking-[-0.01em]">{frontmatter.sousTitre}</p>
          ) : null}
          <p className="max-w-[56ch] text-balance text-base leading-snug text-[color:var(--color-muted)] sm:text-lg">
            {frontmatter.summary}
          </p>
        </Container>
      </header>

      <Container size="prose" className="pb-24">
        <MDXContent source={body} lang={lang} />
      </Container>
    </article>
  );
}
