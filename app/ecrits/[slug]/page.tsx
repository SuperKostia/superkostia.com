import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/MDXContent";
import { getEcrits, getEcritBySlug } from "@/lib/mdx";

export async function generateStaticParams() {
  const ecrits = await getEcrits();
  return ecrits.map((e) => ({ slug: e.frontmatter.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ecrit = await getEcritBySlug(slug);
  if (!ecrit) return {};
  const { frontmatter } = ecrit;
  const url = `/ecrits/${slug}`;
  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: frontmatter.title,
      description: frontmatter.summary,
      publishedTime: frontmatter.date,
      tags: frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.summary,
    },
  };
}

export default async function EcritDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const ecrit = await getEcritBySlug(slug);
  if (!ecrit) notFound();

  const { frontmatter, body } = ecrit;

  return (
    <article className="px-6 py-10 sm:px-10 lg:px-12">
      <NextLink
        href="/ecrits"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
      >
        <ArrowLeft size={14} strokeWidth={2.5} aria-hidden />
        Tous les écrits
      </NextLink>

      <header className="mb-12 flex flex-col gap-4 border-b-2 border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          <time dateTime={frontmatter.date}>{frontmatter.date}</time>
          {frontmatter.tempsLecture ? (
            <span>· lecture {frontmatter.tempsLecture}</span>
          ) : null}
        </div>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {frontmatter.title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--color-muted)]">
          {frontmatter.summary}
        </p>
      </header>

      <MDXContent source={body} />
    </article>
  );
}
