"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LayoutGrid, Square } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ProjetsStories, type StoryProjet } from "./ProjetsStories";

type Vue = "stories" | "grille";

const LIBELLES = {
  fr: { stories: "Stories", grille: "Grille", choix: "Affichage des projets" },
  en: { stories: "Stories", grille: "Grid", choix: "Project view" },
} satisfies Record<Lang, Record<string, string>>;

/**
 * Bascule stories / grille. La grille (rendue côté serveur, passée en enfant)
 * reste dans le HTML dans les deux cas : moteurs et IA lisent toujours tous
 * les projets. Le choix vit dans l'adresse (?vue=grille), partageable.
 */
export function ProjetsVue({ projets, lang, children }: { projets: StoryProjet[]; lang: Lang; children: ReactNode }) {
  const [vue, setVue] = useState<Vue>("stories");
  const l = LIBELLES[lang];

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      if (new URLSearchParams(window.location.search).get("vue") === "grille") setVue("grille");
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const choisir = (v: Vue) => {
    setVue(v);
    const url = new URL(window.location.href);
    if (v === "grille") url.searchParams.set("vue", "grille");
    else url.searchParams.delete("vue");
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Sélecteur en pilules, comme les onglets d'un panneau n8n. */}
      <div
        role="group"
        aria-label={l.choix}
        className="flex w-fit gap-1 self-center rounded-full bg-[color:var(--color-surface)] p-1"
      >
        {(["stories", "grille"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => choisir(v)}
            aria-pressed={vue === v}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-4 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors",
              vue === v
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-fg)]",
            )}
          >
            {v === "stories" ? <Square size={13} strokeWidth={1.75} aria-hidden /> : <LayoutGrid size={13} strokeWidth={1.75} aria-hidden />}
            {l[v]}
          </button>
        ))}
      </div>

      {vue === "stories" ? <ProjetsStories projets={projets} lang={lang} /> : null}
      {/* En stories, la grille reste dans le HTML (moteurs, IA) mais hors de la navigation clavier. */}
      <div className={vue === "stories" ? "sr-only" : undefined} inert={vue === "stories"}>
        {children}
      </div>
    </div>
  );
}
