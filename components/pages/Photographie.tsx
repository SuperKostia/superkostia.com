import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSeries } from "@/lib/photos";
import { PhotoGallery } from "@/components/photographie/PhotoGallery";
import { alternates, chemin, type Lang } from "@/lib/i18n";

/** Les séries portent le nom de leur dossier (français) ; leur titre anglais. */
export const SERIES_EN: Record<string, string> = {
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
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-5 pb-2 pt-8 sm:px-8">
        <NextLink
          href={chemin(lang, "/hobbies")}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-[color:var(--color-surface)] px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--photo-fg-muted)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--photo-fg)]"
        >
          <ArrowLeft size={13} strokeWidth={1.75} aria-hidden />
          Hobbies
        </NextLink>
        <h1 className="font-mono text-[11px] font-normal uppercase tracking-[0.06em] text-[color:var(--photo-fg-muted)]">
          {lang === "en" ? "Photography" : "Photographie"}
        </h1>
      </div>

      <PhotoGallery series={series} />
    </article>
  );
}
