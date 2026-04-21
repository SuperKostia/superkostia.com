import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { getHobbies } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Hobbies",
  description:
    "Entrepreneuriat, photographie, branding, psychologie adlérienne — quatre univers.",
};

export default async function HobbiesPage() {
  const hobbies = await getHobbies();

  return (
    <PageShell
      eyebrow="Index"
      title="Hobbies"
      intro={
        <p>
          Quatre univers, quatre identités. Chaque hobby respire différemment —
          la photo a même son propre monde visuel (cf. décision #002).
        </p>
      }
    >
      {hobbies.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          Aucun hobby dans <code>content/hobbies/</code> pour l&apos;instant.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {hobbies.map((entry) => (
            <li key={entry.frontmatter.slug}>
              <Card as="article" className="flex h-full flex-col gap-3">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight">
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
