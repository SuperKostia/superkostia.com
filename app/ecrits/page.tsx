import type { Metadata } from "next";
import NextLink from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LinkedInMark, SubstackMark } from "@/components/icons/BrandMarks";
import { getEcrits } from "@/lib/mdx";

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

export const metadata: Metadata = {
  title: "Écrits",
  description: "Notes, essais, réflexions. Liste inverse chronologique.",
};

export default async function EcritsPage() {
  const ecrits = await getEcrits();

  return (
    <PageShell
      eyebrow="Index"
      title="Écrits"
      intro={
        <p>
          Deux newsletters régulières, plus des notes locales ponctuelles.
          L&apos;anglais sur LinkedIn, le français sur Substack.
        </p>
      }
    >
      <section className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Newsletters
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {NEWSLETTERS.map((n) => {
            const { Mark } = n;
            return (
              <li key={n.url}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="lire"
                  className="group flex h-full flex-col border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
                >
                  <div className="flex items-stretch border-b-2 border-[color:var(--color-border)]">
                    <div className="flex aspect-square h-16 shrink-0 items-center justify-center border-r-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] text-[color:var(--color-bg)] group-hover:bg-[color:var(--color-accent-fg)] group-hover:text-[color:var(--color-accent)]">
                      <Mark width={28} height={28} />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3 px-4">
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-accent-fg)]">
                        {n.platform} · {n.language}
                      </span>
                      <ArrowUpRight
                        size={18}
                        strokeWidth={2.5}
                        aria-hidden
                        className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                      {n.title}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Notes locales
        </p>
        {ecrits.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          Aucun écrit dans <code>content/ecrits/</code> pour l&apos;instant.
        </p>
      ) : (
        <ul className="flex flex-col divide-y-2 divide-[color:var(--color-border)] border-y-2 border-[color:var(--color-border)]">
          {ecrits.map((entry) => (
            <li key={entry.frontmatter.slug}>
              <NextLink
                href={`/ecrits/${entry.frontmatter.slug}`}
                data-cursor="lire"
                className="flex flex-col gap-2 py-6 transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] sm:flex-row sm:items-baseline sm:gap-6"
              >
                <time
                  className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)] sm:w-28 sm:shrink-0 sm:pl-3"
                  dateTime={entry.frontmatter.date}
                >
                  {entry.frontmatter.date}
                </time>
                <div className="flex flex-col gap-1 pr-3">
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                    {entry.frontmatter.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                    {entry.frontmatter.summary}
                  </p>
                </div>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
      </section>
    </PageShell>
  );
}
