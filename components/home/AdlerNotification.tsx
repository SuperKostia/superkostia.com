"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EVENEMENT_CITATION, marquerVue, tirerCitation, type CitationAdler } from "@/lib/adler";
import { useLang } from "@/lib/useLang";

const CLE_SESSION = "adler-notif-vue";
const DELAI_APPARITION_MS = 2500;
const DUREE_AFFICHAGE_MS = 15000;

/** « Adler t'a envoyé un message » : une citation en notification, une fois par visite. */
export function AdlerNotification() {
  const [citation, setCitation] = useState<CitationAdler | null>(null);
  const en = useLang() === "en";

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLE_SESSION)) return;
    } catch {
      return;
    }
    const apparition = window.setTimeout(() => {
      // Marqué au moment d'apparaître (et pas avant) pour survivre au double montage de StrictMode.
      sessionStorage.setItem(CLE_SESSION, "1");
      const tiree = tirerCitation();
      marquerVue(tiree.id);
      setCitation(tiree);
      // La section reprend la même citation : on la retrouve en descendant.
      window.dispatchEvent(new CustomEvent(EVENEMENT_CITATION, { detail: tiree.id }));
    }, DELAI_APPARITION_MS);
    return () => window.clearTimeout(apparition);
  }, []);

  useEffect(() => {
    if (!citation) return;
    const fin = window.setTimeout(() => setCitation(null), DUREE_AFFICHAGE_MS);
    const surEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCitation(null);
    };
    window.addEventListener("keydown", surEchap);
    return () => {
      window.clearTimeout(fin);
      window.removeEventListener("keydown", surEchap);
    };
  }, [citation]);

  if (!citation) return null;

  const ouvrir = () => {
    setCitation(null);
    document.getElementById("adler")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 animate-[notif-in_0.45s_cubic-bezier(0.2,0.9,0.3,1.2)_both] sm:inset-x-auto sm:left-6 sm:w-[380px]"
    >
      <div className="relative overflow-hidden rounded-[22px] bg-[color:var(--color-ink)] p-2 text-[color:var(--color-ink-fg)] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
            <span aria-hidden className="node-dot" />
            Alfred Adler · {en ? "just now" : "à l'instant"}
          </span>
          <button
            type="button"
            onClick={() => setCitation(null)}
            aria-label={en ? "Close notification" : "Fermer la notification"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-[color:var(--color-ink-surface)]"
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={ouvrir}
          data-cursor="ouvrir"
          className="block w-full rounded-[16px] bg-[color:var(--color-ink-surface)] p-4 text-left transition-colors hover:bg-[color:var(--color-ink-line)]"
        >
          <span className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
            {en ? "Sent you a message" : "T'a envoyé un message"}
          </span>
          <span className="font-display mt-2 block text-lg font-medium leading-snug">
            {en ? `“${citation.texte.en}”` : `«\u00a0${citation.texte.fr}\u00a0»`}
          </span>
          <span className="mt-4 inline-flex h-8 items-center rounded-full bg-[color:var(--color-accent)] px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-accent-fg)]">
            {en ? "Open the session →" : "Ouvrir la séance →"}
          </span>
        </button>
      </div>
    </div>
  );
}
