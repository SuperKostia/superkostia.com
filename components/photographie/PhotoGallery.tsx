"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Photo, Series } from "@/lib/photos";
import { ExifLine } from "./ExifLine";
import { cn } from "@/lib/utils";

const PILE_SIZE = 14;
const PILE_REARRANGE_MS = 3500;

type PileLayout = {
  top: number;
  left: number;
  rotate: number;
  z: number;
  width: number;
};

function generatePileLayouts(count: number): PileLayout[] {
  return Array.from({ length: count }, () => ({
    top: 8 + Math.random() * 78,
    left: 6 + Math.random() * 84,
    rotate: (Math.random() - 0.5) * 22,
    z: Math.floor(Math.random() * 20),
    width: 150 + Math.random() * 90,
  }));
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type PhotoGalleryProps = {
  series: Series[];
};

export function PhotoGallery({ series }: PhotoGalleryProps) {
  const allPhotos = useMemo(
    () => series.flatMap((s) => s.photos),
    [series],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const lightboxOpen = lightboxIndex !== null;

  return (
    <>
      <PhotoPile
        photos={allPhotos}
        onOpen={(globalIndex) => setLightboxIndex(globalIndex)}
        paused={lightboxOpen}
      />

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
                      placeholder={photo.blurDataURL ? "blur" : "empty"}
                      blurDataURL={photo.blurDataURL || undefined}
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
  const touchRef = useRef<{ x: number; y: number } | null>(null);

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

  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dy) > Math.abs(dx)) return;
    const THRESHOLD = 50;
    if (dx <= -THRESHOLD) next();
    else if (dx >= THRESHOLD) prev();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-[60] flex flex-col bg-[color:var(--photo-bg)]"
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

      <div
        className="relative flex-1 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          priority
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL || undefined}
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

type PhotoPileProps = {
  photos: Photo[];
  onOpen: (globalIndex: number) => void;
  paused?: boolean;
};

function PhotoPile({ photos, onOpen, paused = false }: PhotoPileProps) {
  const [sample, setSample] = useState<Photo[]>([]);
  const [layouts, setLayouts] = useState<PileLayout[]>([]);

  useEffect(() => {
    const picked = shuffle(photos).slice(0, Math.min(PILE_SIZE, photos.length));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSample(picked);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayouts(generatePileLayouts(picked.length));
  }, [photos]);

  useEffect(() => {
    if (paused || sample.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setLayouts(generatePileLayouts(sample.length));
    }, PILE_REARRANGE_MS);

    return () => window.clearInterval(id);
  }, [paused, sample.length]);

  if (sample.length === 0 || layouts.length === 0) {
    return (
      <section
        aria-hidden
        className="relative h-[85vh] w-full overflow-hidden bg-[color:var(--photo-bg)] sm:h-[90vh]"
      />
    );
  }

  return (
    <section
      aria-label="Mosaïque aléatoire"
      aria-hidden={paused}
      className={cn(
        "relative h-[85vh] w-full overflow-hidden bg-[color:var(--photo-bg)] transition-opacity duration-200 sm:h-[90vh]",
        paused && "invisible opacity-0",
      )}
    >
      {sample.map((photo, i) => {
        const layout = layouts[i];
        if (!layout) return null;
        const globalIndex = photos.findIndex((p) => p.src === photo.src);
        return (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(globalIndex)}
            aria-label={`Ouvrir ${photo.alt}`}
            data-cursor="ouvrir"
            className="group absolute block origin-center"
            style={{
              top: `${layout.top}%`,
              left: `${layout.left}%`,
              width: `${layout.width}px`,
              zIndex: layout.z,
              transform: `translate(-50%, -50%) rotate(${layout.rotate}deg)`,
              transition:
                "top 1400ms cubic-bezier(0.16, 1, 0.3, 1), left 1400ms cubic-bezier(0.16, 1, 0.3, 1), transform 1400ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              className="relative aspect-[4/5] w-full bg-white p-2 shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out group-hover:scale-110"
              style={{
                transform: "rotate(0deg)",
              }}
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="240px"
                  priority={i < 6}
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  blurDataURL={photo.blurDataURL || undefined}
                  className="object-cover"
                />
              </div>
            </div>
          </button>
        );
      })}
    </section>
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
