import type { Metadata } from "next";
import NextLink from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { LinkedInMark, SubstackMark } from "@/components/icons/BrandMarks";
import { getEcrits } from "@/lib/mdx";
import { alternates, chemin, type Lang } from "@/lib/i18n";

type Newsletter = {
  platform: string;
  title: string;
  language: string;
  url: string;
  Mark: ComponentType<SVGProps<SVGSVGElement>>;
};

const NEWSLETTERS: Newsletter[] = [
  {
    platform: "LinkedIn",
    title: "Thoughts from a Global Citizen",
    language: "EN",
    url: "https://www.linkedin.com/newsletters/thoughts-from-a-global-citizen-7351208264853848064/",
    Mark: LinkedInMark,
  },
  {
    platform: "Substack",
    title: "constantinmardoukhaev",
    language: "FR",
    url: "https://constantinmardoukhaev.substack.com/",
    Mark: SubstackMark,
  },
];

const TEXTES = {
  fr: {
    titre: "Écrits",
    description: "Notes, essais, réflexions. Liste inverse chronologique.",
    intro: "Deux newsletters régulières, plus des notes locales ponctuelles. L'anglais sur LinkedIn, le français sur Substack.",
    notes: "Notes locales",
  },
  en: {
    titre: "Writing",
    description: "Notes, essays, reflections. Newest first.",
    intro: "Two regular newsletters, plus the odd note published here. English on LinkedIn, French on Substack.",
    notes: "Notes on this site",
  },
} satisfies Record<Lang, Record<string, string>>;

export function metadataEcrits(lang: Lang): Metadata {
  return {
    title: TEXTES[lang].titre,
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/ecrits"),
  };
}

export async function EcritsIndex({ lang }: { lang: Lang }) {
  const ecrits = await getEcrits(lang);
  const t = TEXTES[lang];

  return (
    <PageShell
      eyebrow="Index"
      title={t.titre}
      intro={<p>{t.intro}</p>}
    >
      <div className="mx-auto flex max-w-[960px] flex-col gap-16">
        <section className="flex flex-col gap-5">
          <NodeLabel>Newsletters</NodeLabel>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {NEWSLETTERS.map((n) => {
              const { Mark } = n;
              return (
                <li key={n.url}>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                   
                    className="bg-dots-ink group flex h-full min-h-[220px] flex-col justify-between gap-8 rounded-[24px] bg-[color:var(--color-ink)] p-6 text-[color:var(--color-ink-fg)] sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color:var(--color-ink-surface)]">
                        <Mark width={24} height={24} />
                      </span>
                      <span className="inline-flex h-7 items-center rounded-full bg-[color:var(--color-ink-surface)] px-3 font-mono text-[11px] uppercase tracking-[0.04em]">
                        {n.platform} · {n.language}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <span className="font-display text-2xl font-medium leading-tight tracking-[-0.015em] sm:text-[28px]">
                        {n.title}
                      </span>
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      >
                        <ArrowUpRight size={18} strokeWidth={1.75} />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-5">
          <NodeLabel>{t.notes}</NodeLabel>
          {ecrits.length === 0 ? (
            <p className="font-mono text-sm uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
              <code>content/ecrits/</code> : 0.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {ecrits.map((entry) => (
                <li key={entry.frontmatter.slug}>
                  <NextLink
                    href={chemin(lang, `/ecrits/${entry.frontmatter.slug}`)}
                   
                    className="group flex flex-col gap-3 rounded-[24px] bg-[color:var(--color-surface)] p-6 transition-colors hover:bg-[color:var(--color-surface-2)] sm:flex-row sm:items-center sm:gap-8 sm:p-7"
                  >
                    <time
                      className="inline-flex h-7 shrink-0 items-center self-start rounded-full bg-[color:var(--color-surface-2)] px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)] group-hover:bg-[color:var(--color-bg)] sm:self-center"
                      dateTime={entry.frontmatter.date}
                    >
                      {entry.frontmatter.date}
                    </time>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <h2 className="text-2xl font-medium leading-tight tracking-[-0.015em] sm:text-[28px]">
                        {entry.frontmatter.title}
                      </h2>
                      <p className="text-[15px] leading-relaxed text-[color:var(--color-muted)]">
                        {entry.frontmatter.summary}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-bg)] transition-colors group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)] sm:inline-flex"
                    >
                      <ArrowRight size={18} strokeWidth={1.75} />
                    </span>
                  </NextLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
