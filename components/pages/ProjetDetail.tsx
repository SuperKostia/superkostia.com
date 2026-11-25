import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
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
    <article className="flex flex-col">
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-6 pb-14 pt-10 text-center sm:pb-20 sm:pt-14">
          <NextLink
            href={chemin(lang, "/projets")}
            className={buttonClasses("ghost", "sm", "self-center text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]")}
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
            {lang === "en" ? "All projects" : "Tous les projets"}
          </NextLink>

          <LogoProjet
            titre={frontmatter.title}
            logo={logoProjet(slug)}
            className="mt-2 h-16 w-16 rounded-[16px] text-2xl sm:h-20 sm:w-20 sm:text-3xl"
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Tag tone="accent">{libelleType(lang, frontmatter.type)}</Tag>
            <Tag>{libelleStatut(lang, frontmatter.status)}</Tag>
            <Tag>{frontmatter.year}</Tag>
            {(frontmatter.tags ?? []).map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>

          <h1 className="max-w-[18ch] text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.015em]">
            {frontmatter.title}
          </h1>

          {frontmatter.tagline ? (
            <p className="max-w-[38ch] text-balance text-xl font-medium leading-snug tracking-[-0.01em] sm:text-2xl">
              {frontmatter.tagline}
            </p>
          ) : null}

          {flux ? (
            <p className="inline-flex h-8 items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 font-mono text-[12px] uppercase tracking-[0.04em] text-[color:var(--color-accent-fg)]">
              {flux}
            </p>
          ) : null}

          <p className="max-w-[60ch] text-balance text-base leading-relaxed text-[color:var(--color-muted)] sm:text-lg">
            {frontmatter.summary}
          </p>
        </Container>
      </header>

      <Container size="default" className="pb-8">
        {showHero && primaryLink ? (
          <ProjetHero
            title={frontmatter.title}
            url={primaryLink.url}
            screenshotSrc={`/images/projets/${slug}.jpg`}
            lang={lang}
          />
        ) : null}

        <MDXContent source={body} lang={lang} className="mx-auto max-w-[720px]" />

        {prevProjet && nextProjet && prevProjet !== nextProjet ? (
          <ProjetPrevNext
            prev={prevProjet.frontmatter}
            next={nextProjet.frontmatter}
            lang={lang}
          />
        ) : null}
      </Container>

      <ProjetKeyboardNav
        prevHref={prevSlug ? chemin(lang, `/projets/${prevSlug}`) : undefined}
        nextHref={nextSlug ? chemin(lang, `/projets/${nextSlug}`) : undefined}
      />
    </article>
  );
}
