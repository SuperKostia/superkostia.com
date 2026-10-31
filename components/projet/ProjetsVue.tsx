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
    <div className="flex flex-col gap-6">
      <div role="group" aria-label={l.choix} className="flex w-fit border-2 border-[color:var(--color-border)] shadow-[var(--shadow-hard-sm)]">
        {(["stories", "grille"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => choisir(v)}
            aria-pressed={vue === v}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider [&:not(:first-child)]:border-l-2 [&:not(:first-child)]:border-[color:var(--color-border)]",
              vue === v
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                : "bg-[color:var(--color-bg)] hover:bg-[color:var(--color-accent)]/40",
            )}
          >
            {v === "stories" ? <Square size={14} strokeWidth={2.5} aria-hidden /> : <LayoutGrid size={14} strokeWidth={2.5} aria-hidden />}
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
