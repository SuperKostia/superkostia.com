"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type PhotoVisionneuse = {
  src: string;
  alt: string;
  largeur: number;
  hauteur: number;
  flou?: string;
  legende?: string;
};

type VisionneuseProps = {
  photos: PhotoVisionneuse[];
  index: number;
  onIndex: (i: number) => void;
  onFermer: () => void;
  libelles: { fermer: string; precedente: string; suivante: string };
};

/** Visionneuse plein écran : flèches, Échap, glisser sur mobile. */
export function Visionneuse({ photos, index, onIndex, onFermer, libelles }: VisionneuseProps) {
  const fermerRef = useRef<HTMLButtonElement>(null);
  const departTouche = useRef<number | null>(null);
  const n = photos.length;
  const photo = photos[index];

  useEffect(() => {
    const precedentFocus = document.activeElement as HTMLElement | null;
    fermerRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      precedentFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
      else if (e.key === "ArrowRight" && n > 1) onIndex((index + 1) % n);
      else if (e.key === "ArrowLeft" && n > 1) onIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", surTouche);
    // Précharge les voisines.
    for (const j of [index + 1, index - 1]) {
      const p = photos[(j + n) % n];
      if (p) new window.Image().src = p.src;
    }
    return () => window.removeEventListener("keydown", surTouche);
  }, [index, n, onFermer, onIndex, photos]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-[60] flex flex-col bg-black/92 text-white backdrop-blur-sm"
      onClick={onFermer}
      onTouchStart={(e) => {
        departTouche.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const debut = departTouche.current;
        const fin = e.changedTouches[0]?.clientX;
        departTouche.current = null;
        if (debut == null || fin == null || n < 2) return;
        if (fin - debut > 50) onIndex((index - 1 + n) % n);
        else if (debut - fin > 50) onIndex((index + 1) % n);
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-white/60">
          {index + 1} / {n}
        </span>
        <button
          ref={fermerRef}
          type="button"
          onClick={onFermer}
          aria-label={libelles.fermer}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          placeholder={photo.flou ? "blur" : "empty"}
          blurDataURL={photo.flou || undefined}
          className="object-contain p-2 sm:p-6"
        />
        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onIndex((index - 1 + n) % n)}
              aria-label={libelles.precedente}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onIndex((index + 1) % n)}
              aria-label={libelles.suivante}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {photo.legende ? (
        <p
          className="px-4 pb-5 pt-2 text-center text-sm text-white/80"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.legende}
        </p>
      ) : null}
    </div>
  );
}
