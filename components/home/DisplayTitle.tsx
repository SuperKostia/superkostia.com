"use client";

import { useEffect, useState } from "react";

type Variation = {
  start: string;
  accent: string;
  end: string;
};

const VARIATIONS: Variation[] = [
  { start: "Kostia fait", accent: "trop", end: "de choses." },
  { start: "Kostia a trop", accent: "d'onglets", end: "ouverts." },
  { start: "Kostia parle", accent: "à des IA", end: "toute la journée." },
  { start: "Kostia n'arrive", accent: "pas", end: "à choisir." },
  { start: "Kostia monte", accent: "cinq boîtes", end: "à la fois." },
];

export function DisplayTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Exception ciblée : on tire une variation au mount côté client uniquement.
    // Le getSnapshot de useSyncExternalStore doit être stable, ce qui rend
    // l'approche ref-based setState suffisante ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(Math.floor(Math.random() * VARIATIONS.length));
  }, []);

  const { start, accent, end } = VARIATIONS[index];

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
