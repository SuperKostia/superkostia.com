import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/MDXContent";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { getEcrits, getEcritBySlug } from "@/lib/mdx";
import { alternates, chemin, imagesPartage, LOCALE_OG, type Lang } from "@/lib/i18n";

export async function parametresEcrits() {
  const ecrits = await getEcrits();
  return ecrits.map((e) => ({ slug: e.frontmatter.slug }));
}

export async function metadataEcrit(lang: Lang, slug: string): Promise<Metadata> {
  const ecrit = await getEcritBySlug(slug, lang);
  if (!ecrit) return {};
  const { frontmatter } = ecrit;
  const cheminFr = `/ecrits/${slug}`;
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
      publishedTime: frontmatter.date,
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

export async function EcritDetail({ lang, slug }: { lang: Lang; slug: string }) {
  const ecrit = await getEcritBySlug(slug, lang);
  if (!ecrit) notFound();

  const { frontmatter, body } = ecrit;

  return (
    <article className="flex flex-col">
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-6 pb-14 pt-10 text-center sm:pb-20 sm:pt-14">
          <NextLink
            href={chemin(lang, "/ecrits")}
            className={buttonClasses("ghost", "sm", "text-[color:var(--color-muted)]")}
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
            {lang === "en" ? "All writing" : "Tous les écrits"}
          </NextLink>
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-muted)]">
            <span aria-hidden className="node-dot" />
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            {frontmatter.tempsLecture ? (
              <>
                <span aria-hidden className="node-dot" />
                <span>
                  {lang === "en" ? "read" : "lecture"} {frontmatter.tempsLecture}
                </span>
              </>
            ) : null}
            <span aria-hidden className="node-dot" />
          </div>
          <h1 className="max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.015em]">
            {frontmatter.title}
          </h1>
          <p className="max-w-[52ch] text-balance text-lg leading-snug text-[color:var(--color-muted)]">
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
