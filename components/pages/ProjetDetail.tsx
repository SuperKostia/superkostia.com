import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { MDXContent } from "@/components/mdx/MDXContent";
import { ProjetHero } from "@/components/projet/ProjetHero";
import { ProjetKeyboardNav } from "@/components/projet/ProjetKeyboardNav";
import { ProjetPrevNext } from "@/components/projet/ProjetPrevNext";
import { getProjets, getProjetBySlug } from "@/lib/mdx";
import { captureProjet, logoProjet } from "@/lib/visuels";
import { LogoProjet } from "@/components/projet/LogoProjet";
import {
  alternates,
  chemin,
  imagesPartage,
  libelleStatut,
  libelleType,
  LOCALE_OG,
  type Lang,
} from "@/lib/i18n";

/** Badge "Déjà N potes" calculé depuis la liste publique des membres du flux, si elle existe. Sinon le `flux` du frontmatter. */
async function fluxBadge(
  lang: Lang,
  slug: string,
  fallback?: string,
): Promise<string | null> {
  const file = path.join(
    process.cwd(),
    "public",
    "projets",
    slug,
    "members.json",
  );
  try {
    const members = JSON.parse(await fs.readFile(file, "utf8")) as unknown[];
    if (Array.isArray(members) && members.length > 0) {
      return lang === "en"
        ? `${members.length} mates already in the feed ⚽`
        : `Déjà ${members.length} potes dans le flux ⚽`;
    }
  } catch {
    // pas de members.json pour ce projet
  }
  return fallback ?? null;
}

export async function parametresProjets() {
  const projets = await getProjets();
  return projets.map((p) => ({ slug: p.frontmatter.slug }));
}

export async function metadataProjet(
  lang: Lang,
  slug: string,
): Promise<Metadata> {
  const projet = await getProjetBySlug(slug, lang);
  if (!projet) return {};
  const { frontmatter } = projet;
  const cheminFr = `/projets/${slug}`;
  const images = imagesPartage(
    lang,
    captureProjet(slug)
      ? {
          url: `/images/projets/${slug}.jpg`,
          alt:
            lang === "en"
              ? `Screenshot of ${frontmatter.title}`
              : `Capture de ${frontmatter.title}`,
        }
      : undefined,
  );
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
      images: images.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.summary,
      images: images.twitter,
    },
  };
}

export async function ProjetDetail({
  lang,
  slug,
}: {
  lang: Lang;
  slug: string;
}) {
  const [projet, allProjets] = await Promise.all([
    getProjetBySlug(slug, lang),
    getProjets(lang),
  ]);
  if (!projet) notFound();

  const { frontmatter, body } = projet;
  const primaryLink = frontmatter.links?.[0];
  const showHero = Boolean(primaryLink?.url) && captureProjet(slug);
  const flux = await fluxBadge(lang, slug, frontmatter.flux);

  const currentIndex = allProjets.findIndex((p) => p.frontmatter.slug === slug);
  const prevProjet =
    allProjets[(currentIndex - 1 + allProjets.length) % allProjets.length];
  const nextProjet = allProjets[(currentIndex + 1) % allProjets.length];
  const prevSlug = prevProjet?.frontmatter.slug;
  const nextSlug = nextProjet?.frontmatter.slug;

  return (
    <article className="px-6 py-10 sm:px-10 lg:px-12">
      <NextLink
        href={chemin(lang, "/projets")}
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
      >
        <ArrowLeft size={14} strokeWidth={2.5} aria-hidden />
        {lang === "en" ? "All projects" : "Tous les projets"}
      </NextLink>

      <header className="mb-12 flex flex-col gap-4 border-b-2 border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="accent">{libelleType(lang, frontmatter.type)}</Tag>
          <Tag>{libelleStatut(lang, frontmatter.status)}</Tag>
          <Tag>{frontmatter.year}</Tag>
          {(frontmatter.tags ?? []).map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <LogoProjet
            titre={frontmatter.title}
            logo={logoProjet(slug)}
            className="h-14 w-14 text-xl shadow-[var(--shadow-hard-sm)] sm:h-20 sm:w-20 sm:text-3xl"
          />
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {frontmatter.title}
          </h1>
        </div>

        {frontmatter.tagline ? (
          <p className="max-w-2xl text-xl font-bold leading-tight text-[color:var(--color-fg)] sm:text-2xl">
            {frontmatter.tagline}
          </p>
        ) : null}

        {flux ? (
          <p className="inline-flex w-fit items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[color:var(--color-accent-fg)]">
            {flux}
          </p>
        ) : null}

        <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--color-muted)]">
          {frontmatter.summary}
        </p>
      </header>

      {showHero && primaryLink ? (
        <ProjetHero
          title={frontmatter.title}
          url={primaryLink.url}
          screenshotSrc={`/images/projets/${slug}.jpg`}
          lang={lang}
        />
      ) : null}

      <MDXContent source={body} lang={lang} />

      {prevProjet && nextProjet && prevProjet !== nextProjet ? (
        <ProjetPrevNext
          prev={prevProjet.frontmatter}
          next={nextProjet.frontmatter}
          lang={lang}
        />
      ) : null}

      <ProjetKeyboardNav
        prevHref={prevSlug ? chemin(lang, `/projets/${prevSlug}`) : undefined}
        nextHref={nextSlug ? chemin(lang, `/projets/${nextSlug}`) : undefined}
      />
    </article>
  );
}
