"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

type Variation = {
  start: string;
  accent: string;
  end: string;
};

const VARIATIONS: Record<Lang, Variation[]> = {
  fr: [
    { start: "Kostia fait", accent: "trop", end: "de choses." },
    { start: "Kostia a trop", accent: "d'onglets", end: "ouverts." },
    { start: "Kostia parle", accent: "à des IA", end: "toute la journée." },
    { start: "Kostia n'arrive", accent: "pas", end: "à choisir." },
    { start: "Kostia monte", accent: "cinq boîtes", end: "à la fois." },
  ],
  en: [
    { start: "Kostia does", accent: "too many", end: "things." },
    { start: "Kostia has too", accent: "many tabs", end: "open." },
    { start: "Kostia talks", accent: "to AIs", end: "all day long." },
    { start: "Kostia just", accent: "can't", end: "pick one." },
    { start: "Kostia runs", accent: "five companies", end: "at once." },
  ],
};

export function DisplayTitle() {
  const [index, setIndex] = useState(0);
  const lang = useLang();

  useEffect(() => {
    // Exception ciblée : on tire une variation au mount côté client uniquement.
    // Le getSnapshot de useSyncExternalStore doit être stable, ce qui rend
    // l'approche ref-based setState suffisante ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(Math.floor(Math.random() * VARIATIONS.fr.length));
  }, []);

  const { start, accent, end } = VARIATIONS[lang][index];

  return (
    <h1
      className="font-[family-name:var(--font-space-grotesk)] text-[12vw] font-black uppercase leading-[0.85] tracking-tight sm:text-[10vw] lg:text-[8vw]"
      suppressHydrationWarning
    >
      {start}{" "}
      <span className="inline-block bg-[color:var(--color-accent)] px-3 text-[color:var(--color-accent-fg)] -rotate-1">
        {accent}
      </span>{" "}
      {end}
    </h1>
  );
}
