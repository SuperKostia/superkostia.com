import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/MDXContent";
import { getHobbies, getHobbyBySlug } from "@/lib/mdx";

export async function generateStaticParams() {
  const hobbies = await getHobbies();
  return hobbies.map((h) => ({ slug: h.frontmatter.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hobby = await getHobbyBySlug(slug);
  if (!hobby) return {};
  return {
    title: hobby.frontmatter.title,
    description: hobby.frontmatter.summary,
  };
}

export default async function HobbyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const hobby = await getHobbyBySlug(slug);
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
        href="/hobbies"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
      >
        <ArrowLeft size={14} strokeWidth={2.5} aria-hidden />
        Tous les hobbies
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

      <MDXContent source={body} />
    </article>
  );
}
