import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { buttonClasses } from "@/components/ui/Button";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { CarteMiniature } from "@/components/voyages/WorldMap";
import { getHobbies } from "@/lib/mdx";
import { getAllSeries, type Photo } from "@/lib/photos";
import { getNomadsProfile, type NomadsProfile } from "@/lib/nomads";
import { alternates, chemin, formatNombre, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TEXTES = {
  fr: {
    description: "Voyages et photographie : la carte de mes voyages et une galerie tout à l'iPhone.",
    intro: "Ce que je fais quand je ne construis pas : les voyages, et les photos que j'en rapporte. La photo a même son propre monde visuel (cf. décision #002).",
    ouvrir: "Ouvrir",
    photos: (n: number) => `${n} photos`,
    pays: (n: number) => `${n} pays`,
    km: (km: string) => `${km} km`,
  },
  en: {
    description: "Travel and photography: a map of my trips and a gallery shot entirely on iPhone.",
    intro: "What I do when I'm not building: travel, and the photos I bring back. Photography even has its own visual world (see decision #002).",
    ouvrir: "Open",
    photos: (n: number) => `${n} photos`,
    pays: (n: number) => `${n} countries`,
    km: (km: string) => `${km} km`,
  },
};

export function metadataHobbies(lang: Lang): Metadata {
  return {
    title: "Hobbies",
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/hobbies"),
  };
}

export async function HobbiesIndex({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  const [hobbies, series, nomads] = await Promise.all([
    getHobbies(lang),
    getAllSeries(),
    getNomadsProfile(),
  ]);
  const photos = series.flatMap((s) => s.photos);

  return (
    <PageShell
      eyebrow="Index"
      title="Hobbies"
      intro={<p>{TEXTES[lang].intro}</p>}
    >
      {hobbies.length === 0 ? (
        <p className="font-mono text-sm uppercase tracking-wider text-[color:var(--color-muted)]">
          <code>content/hobbies/</code> : 0.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {hobbies.map((entry, i) => {
            const slug = entry.frontmatter.slug;
            const meta =
              slug === "photographie"
                ? t.photos(photos.length)
                : slug === "voyages" && nomads
                  ? `${t.pays(nomads.stats.countries)} · ${t.km(formatNombre(lang, nomads.stats.distance_traveled_km))}`
                  : null;
            return (
              <li key={slug}>
                <NextLink
                  href={chemin(lang, `/hobbies/${slug}`)}
                 
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-[color:var(--color-surface)] p-2 transition-colors hover:bg-[color:var(--color-surface-2)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
                    {slug === "photographie" ? (
                      <VisuelPhotos photos={photos} />
                    ) : slug === "voyages" ? (
                      <VisuelVoyages nomads={nomads} lang={lang} />
                    ) : (
                      <div aria-hidden className="bg-dots absolute inset-0" />
                    )}
                  </div>

                  <article className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-6 sm:px-5">
                    <NodeLabel as="div">
                      {`0${i + 1}`}
                      {meta ? ` · ${meta}` : ""}
                    </NodeLabel>
                    <h2 className="text-4xl font-medium leading-[0.95] tracking-[-0.015em] sm:text-5xl">
                      {entry.frontmatter.title}
                    </h2>
                    <p className="max-w-[48ch] text-base leading-snug text-[color:var(--color-muted)]">
                      {entry.frontmatter.summary}
                    </p>
                    <span
                      className={buttonClasses(
                        "default",
                        "md",
                        "mt-auto self-start group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]",
                      )}
                    >
                      {t.ouvrir}
                      <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
                    </span>
                  </article>
                </NextLink>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}

/** Trois tirages posés en éventail sur la trame : la galerie en aperçu. */
function VisuelPhotos({ photos }: { photos: Photo[] }) {
  const choix = [photos[0], photos[Math.floor(photos.length / 2)], photos[photos.length - 1]].filter(
    (p): p is Photo => Boolean(p),
  );
  const poses = [
    "left-[10%] top-[16%] w-[38%] -rotate-6",
    "left-[33%] top-[8%] w-[36%] rotate-2 z-10",
    "left-[54%] top-[20%] w-[36%] rotate-[8deg]",
  ];
  return (
    <div className="bg-dots absolute inset-0 bg-[color:var(--color-bg)]">
      {choix.map((photo, i) => (
        <div
          key={photo.src}
          className={cn(
            "absolute aspect-[4/5] rounded-[10px] bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-out group-hover:-translate-y-1",
            poses[i],
          )}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[6px]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 35vw, 220px"
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL || undefined}
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** La carte du monde en miniature, sur le panneau sombre pointillé. */
function VisuelVoyages({ nomads, lang }: { nomads: NomadsProfile | null; lang: Lang }) {
  return (
    <div className="bg-dots-ink absolute inset-0 flex items-center justify-center bg-[color:var(--color-ink)] p-4">
      {nomads ? (
        <div className="w-full">
          <CarteMiniature
            visites={nomads.countries.map((c) => c.code)}
            ariaLabel={lang === "en" ? "World map of Kostia's travels" : "Carte du monde des voyages de Kostia"}
          />
        </div>
      ) : null}
    </div>
  );
}
