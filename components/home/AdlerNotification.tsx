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
      <div className="relative border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard)]">
        <div className="flex items-center justify-between gap-2 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent-fg)]">
          <span>Alfred Adler · {en ? "just now" : "à l'instant"}</span>
          <button
            type="button"
            onClick={() => setCitation(null)}
            aria-label={en ? "Close notification" : "Fermer la notification"}
            className="-m-1 p-1 hover:opacity-70"
          >
            <X size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={ouvrir}
          data-cursor="ouvrir"
          className="block w-full p-4 text-left"
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            {en ? "Sent you a message" : "T'a envoyé un message"}
          </span>
          <span className="mt-2 block font-[family-name:var(--font-space-grotesk)] text-lg font-bold leading-snug">
            {en ? `“${citation.texte.en}”` : `«\u00a0${citation.texte.fr}\u00a0»`}
          </span>
          <span className="mt-3 block font-mono text-[11px] font-bold uppercase tracking-[0.15em] underline decoration-2 underline-offset-4">
            {en ? "Open the session →" : "Ouvrir la séance →"}
          </span>
        </button>
      </div>
    </div>
  );
}
