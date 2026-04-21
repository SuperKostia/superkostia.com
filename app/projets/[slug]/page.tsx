import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { MDXContent } from "@/components/mdx/MDXContent";
import { getProjets, getProjetBySlug } from "@/lib/mdx";

export async function generateStaticParams() {
  const projets = await getProjets();
  return projets.map((p) => ({ slug: p.frontmatter.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projet = await getProjetBySlug(slug);
  if (!projet) return {};
  return {
    title: projet.frontmatter.title,
    description: projet.frontmatter.summary,
  };
}

export default async function ProjetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const projet = await getProjetBySlug(slug);
  if (!projet) notFound();

  const { frontmatter, body } = projet;

  return (
    <article className="px-6 py-10 sm:px-10 lg:px-12">
      <NextLink
        href="/projets"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
      >
        <ArrowLeft size={14} strokeWidth={2.5} aria-hidden />
        Tous les projets
      </NextLink>

      <header className="mb-12 flex flex-col gap-4 border-b-2 border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="accent">{frontmatter.type}</Tag>
          <Tag>{frontmatter.status}</Tag>
          <Tag>{frontmatter.year}</Tag>
          {(frontmatter.tags ?? []).map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
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
