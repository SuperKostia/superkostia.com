import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSeries } from "@/lib/photos";
import { PhotoGallery } from "@/components/photographie/PhotoGallery";
import { alternates, chemin, type Lang } from "@/lib/i18n";

/** Les séries portent le nom de leur dossier (français) ; leur titre anglais. */
const SERIES_EN: Record<string, string> = {
  australie: "Australia",
  dubai: "Dubai",
  grece: "Greece",
  patmos: "Patmos",
  paysages: "Landscapes",
  people: "People",
  portraits: "Portraits",
  summer: "Summer",
  voyages: "Travel",
};

export function metadataPhotographie(lang: Lang): Metadata {
  return {
    title: lang === "en" ? "Photography" : "Photographie",
    description: lang === "en" ? "A quiet gallery." : "Une galerie silencieuse.",
    alternates: alternates(lang, "/hobbies/photographie"),
  };
}

export async function Photographie({ lang }: { lang: Lang }) {
  const toutes = await getAllSeries();
  const series =
    lang === "en" ? toutes.map((s) => ({ ...s, title: SERIES_EN[s.slug] ?? s.title })) : toutes;

  return (
    <article className="flex flex-col">
      <div className="border-b border-[color:var(--photo-border)] px-6 py-8 sm:px-12">
        <NextLink
          href={chemin(lang, "/hobbies")}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--photo-fg-muted)] hover:text-[color:var(--photo-fg)]"
        >
          <ArrowLeft size={12} strokeWidth={1.5} aria-hidden />
          Hobbies
        </NextLink>
      </div>

      <PhotoGallery series={series} />
    </article>
  );
}
