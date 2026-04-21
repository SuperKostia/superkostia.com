import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { getProjets } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Projets",
  description: "Tout ce que Kostia a monté : pro, perso, expérimental.",
};

export default async function ProjetsPage() {
  const projets = await getProjets();

  return (
    <PageShell
      eyebrow="Index"
      title="Projets"
      intro={
        <p>
          Pro, perso, expérimental. Les filtres et la recherche arrivent en Phase
          3.
        </p>
      }
    >
      {projets.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          Aucun projet dans <code>content/projets/</code> pour l&apos;instant.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projets.map((entry) => (
            <li key={entry.frontmatter.slug}>
              <Card as="article" className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Tag tone={entry.frontmatter.type === "pro" ? "accent" : "default"}>
                    {entry.frontmatter.type}
                  </Tag>
                  <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
                    {entry.frontmatter.year}
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                  {entry.frontmatter.title}
                </h2>
                <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                  {entry.frontmatter.summary}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
