"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Photo, Series } from "@/lib/photos";
import { ExifLine } from "./ExifLine";
import { cn } from "@/lib/utils";

type PhotoGalleryProps = {
  series: Series[];
};

export function PhotoGallery({ series }: PhotoGalleryProps) {
  const allPhotos = useMemo(
    () => series.flatMap((s) => s.photos),
    [series],
  );

  const [heroIndex, setHeroIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (allPhotos.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeroIndex(Math.floor(Math.random() * allPhotos.length));
  }, [allPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i === null ? null : (i + 1) % allPhotos.length,
        );
      else if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length,
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const preload = (i: number) => {
      const photo = allPhotos[i];
      if (!photo) return;
      const img = new window.Image();
      img.src = photo.src;
    };
    preload((lightboxIndex + 1) % allPhotos.length);
    preload((lightboxIndex - 1 + allPhotos.length) % allPhotos.length);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, allPhotos]);

  if (allPhotos.length === 0) {
    return <EmptyState />;
  }

  const hero = heroIndex !== null ? allPhotos[heroIndex] : null;

  return (
    <>
      <section className="relative h-[90vh] w-full overflow-hidden bg-[color:var(--photo-bg)]">
        {hero ? (
          <button
            type="button"
            onClick={() =>
              setLightboxIndex(allPhotos.findIndex((p) => p.src === hero.src))
            }
            aria-label={`Ouvrir ${hero.alt}`}
            data-cursor="ouvrir"
            className="group relative block h-full w-full"
            suppressHydrationWarning
          >
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="h-full w-full" suppressHydrationWarning />
        )}
      </section>

      {series.map((s) => (
        <section
          key={s.slug}
          className="border-t border-[color:var(--photo-border)] px-6 py-16 sm:px-12"
        >
          <header className="mb-8 flex flex-col gap-1">
            <h2 className="font-[family-name:var(--font-garamond)] text-3xl italic text-[color:var(--photo-fg)] sm:text-4xl">
              {s.title}
            </h2>
            {s.date || s.description ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--photo-fg-muted)]">
                {[s.date, s.description].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </header>

          <ul className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 scroll-smooth sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {s.photos.map((photo) => {
              const globalIndex = allPhotos.findIndex(
                (p) => p.src === photo.src,
              );
              return (
                <li
                  key={photo.src}
                  className="w-[78%] shrink-0 snap-center sm:w-auto sm:shrink"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(globalIndex)}
                    aria-label={`Ouvrir ${photo.alt}`}
                    data-cursor="ouvrir"
                    className="group relative block aspect-[4/3] w-full overflow-hidden"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-[filter] group-hover:grayscale-0 sm:grayscale"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {lightboxIndex !== null ? (
        <Lightbox
          photos={allPhotos}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

type LightboxProps = {
  photos: Photo[];
  currentIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

function Lightbox({
  photos,
  currentIndex,
  onIndexChange,
  onClose,
}: LightboxProps) {
  const photo = photos[currentIndex];
  const stripRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentIndex]);

  const prev = () =>
    onIndexChange((currentIndex - 1 + photos.length) % photos.length);
  const next = () => onIndexChange((currentIndex + 1) % photos.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-50 flex flex-col bg-[color:var(--photo-bg)]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center text-[color:var(--photo-fg)] hover:text-[color:var(--photo-fg-muted)]"
      >
        <X size={22} strokeWidth={1.5} aria-hidden />
      </button>

      <button
        type="button"
        onClick={prev}
        aria-label="Photo précédente"
        className="absolute inset-y-0 left-0 z-0 w-1/3"
      />
      <button
        type="button"
        onClick={next}
        aria-label="Photo suivante"
        className="absolute inset-y-0 right-0 z-0 w-1/3"
      />

      <div className="relative flex-1">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          priority
          unoptimized
          className="object-contain"
        />
      </div>

      <ul
        ref={stripRef}
        className="relative z-10 flex shrink-0 items-center gap-2 overflow-x-auto border-t border-[color:var(--photo-border)] px-4 py-3 scroll-smooth"
      >
        {photos.map((p, i) => {
          const isActive = i === currentIndex;
          return (
            <li key={p.src} data-active={isActive} className="shrink-0">
              <button
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Aller à ${p.alt}`}
                aria-current={isActive}
                className={cn(
                  "group relative block h-14 overflow-hidden transition-all duration-300 sm:h-16",
                  isActive
                    ? "w-24 border-2 border-[color:var(--photo-fg)] opacity-100 sm:w-28"
                    : "w-16 opacity-40 blur-[1.5px] hover:w-24 hover:opacity-90 hover:blur-0 sm:w-20 sm:hover:w-28",
                )}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[color:var(--photo-border)] px-6 py-3">
        <ExifLine exif={photo.exif} tags={photo.tags} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--photo-fg-muted)]">
          {currentIndex + 1} / {photos.length} · ← → · esc
        </p>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="font-[family-name:var(--font-garamond)] text-3xl italic text-[color:var(--photo-fg)] sm:text-4xl">
        Pas encore de photos.
      </p>
      <p className="max-w-xl font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--photo-fg-muted)]">
        Déposer des .jpg dans{" "}
        <code className="font-mono normal-case">
          public/images/photographie/&lt;serie-slug&gt;/
        </code>{" "}
        et rafraîchir.
      </p>
    </section>
  );
}
