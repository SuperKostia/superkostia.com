import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Laboratoire",
  description:
    "Mini-apps et expérimentations. Certaines cassent — c'est le principe.",
};

type LabStatus = "wip" | "a-venir";

type LabItem = {
  slug: string;
  title: string;
  summary: string;
  status: LabStatus;
};

const ITEMS: LabItem[] = [
  {
    slug: "mur-des-visiteurs",
    title: "Mur des visiteurs",
    summary: "Livre d'or public, post-its brutalistes, Supabase + honeypot.",
    status: "a-venir",
  },
  {
    slug: "quel-kostia-est-tu",
    title: "Quel Kostia es-tu ?",
    summary: "Quiz déterministe client-side qui te matche avec un projet.",
    status: "a-venir",
  },
  {
    slug: "generateur-de-noms-absurdes",
    title: "Générateur de noms absurdes",
    summary: "Trois listes, du random, des marques fictives.",
    status: "a-venir",
  },
  {
    slug: "radio-kostia",
    title: "Radio Kostia",
    summary: "Playlist curatée, visualiseur audio. Post-lancement.",
    status: "a-venir",
  },
  {
    slug: "galerie-des-polices",
    title: "Galerie des polices",
    summary: "Pangrammes et sliders sur les polices préférées de Kostia.",
    status: "a-venir",
  },
];

export default function LaboratoirePage() {
  return (
    <PageShell
      eyebrow="Index"
      title="Laboratoire"
      intro={
        <p>
          Expérimentations interactives. Zéro API payante, tout en client-side
          ou via Supabase pur. <strong>Ces trucs peuvent casser</strong> — c&apos;est
          assumé.
        </p>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.slug}>
            <Card as="article" className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <Tag tone={item.status === "wip" ? "accent" : "default"}>
                  {item.status === "wip" ? "en chantier" : "à venir"}
                </Tag>
              </div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                {item.summary}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
