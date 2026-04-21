import type { Metadata } from "next";
import NextLink from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { getEcrits } from "@/lib/mdx";

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
          Notes, essais, réflexions. Liste inverse chronologique. RSS et tags
          arrivent en Phase 3.
        </p>
      }
    >
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
    </PageShell>
  );
}
