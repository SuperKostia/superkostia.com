import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSeries } from "@/lib/photos";
import { PhotoGallery } from "@/components/photographie/PhotoGallery";

export const metadata: Metadata = {
  title: "Photographie",
  description: "Une galerie silencieuse.",
};

export default async function PhotographiePage() {
  const series = await getAllSeries();

  return (
    <article className="flex flex-col">
      <div className="border-b border-[color:var(--photo-border)] px-6 py-8 sm:px-12">
        <NextLink
          href="/hobbies"
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
