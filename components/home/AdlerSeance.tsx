"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CITATIONS_ADLER,
  EVENEMENT_CITATION,
  REPONSE_DIVAN,
  REPONSES_FREUD,
  lireVues,
  marquerVue,
  tirerCitation,
  type CitationAdler,
} from "@/lib/adler";
import type { Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

const TEXTES = {
  fr: {
    titre: "Séance · Alfred Adler (1870-1937)",
    encore: "Encore →",
    freud: "Demander à Freud",
    divan: "Le divan ?",
    attente: "Une question pour le docteur ?",
    decouvertes: "citations découvertes",
    terminee: "séance terminée",
  },
  en: {
    titre: "Session · Alfred Adler (1870-1937)",
    encore: "Another one →",
    freud: "Ask Freud",
    divan: "The couch?",
    attente: "A question for the doctor?",
    decouvertes: "quotes discovered",
    terminee: "session over",
  },
} satisfies Record<Lang, Record<string, string>>;

const VITESSE_MS = 22;

/** Section « Séance avec Adler » : une citation en grand, machine à écrire, Freud injoignable. */
export function AdlerSeance() {
  const lang = useLang();
  const t = TEXTES[lang];
  const [citation, setCitation] = useState<CitationAdler>(CITATIONS_ADLER[0]);
  const [lettres, setLettres] = useState(CITATIONS_ADLER[0].texte[lang].length);
  const [vues, setVues] = useState<number | null>(null);
  const [reponse, setReponse] = useState<string | null>(null);
  const [indexFreud, setIndexFreud] = useState(0);

  const afficher = useCallback((suivante: CitationAdler, animer: boolean) => {
    setCitation(suivante);
    setVues(marquerVue(suivante.id).size);
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLettres(animer && !reduit ? 0 : suivante.texte[lang].length);
  }, [lang]);

  // Compteur lu après le montage (localStorage n'existe pas côté serveur).
  useEffect(() => {
    const lecture = window.requestAnimationFrame(() => setVues(lireVues().size));
    const surCitation = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const trouvee = CITATIONS_ADLER.find((c) => c.id === id);
      if (trouvee) afficher(trouvee, false);
    };
    window.addEventListener(EVENEMENT_CITATION, surCitation);
    return () => {
      window.cancelAnimationFrame(lecture);
      window.removeEventListener(EVENEMENT_CITATION, surCitation);
    };
  }, [afficher]);

  // Machine à écrire.
  useEffect(() => {
    if (lettres >= citation.texte[lang].length) return;
    const t = window.setTimeout(() => setLettres((n) => n + 1), VITESSE_MS);
    return () => window.clearTimeout(t);
  }, [lettres, citation, lang]);

  const encore = () => {
    setReponse(null);
    afficher(tirerCitation(citation.id), true);
  };

  const demanderAFreud = () => {
    setReponse(REPONSES_FREUD[lang][indexFreud % REPONSES_FREUD[lang].length]);
    setIndexFreud((i) => i + 1);
  };

  const texte = citation.texte[lang];
  const enCours = lettres < texte.length;

  return (
    <section
      id="adler"
      aria-labelledby="adler-titre"
      className="mx-auto w-full max-w-[1260px] scroll-mt-24 px-3 py-10 sm:px-6"
    >
      <div className="rounded-[28px] bg-[color:var(--color-ink)] p-3 text-[color:var(--color-ink-fg)] sm:rounded-[32px] sm:p-5">
        {/* Barre d'onglets : les trois gestes de la séance */}
        <div className="flex flex-wrap items-center gap-2">
          <BoutonSeance onClick={encore} accent>
            {t.encore}
          </BoutonSeance>
          <BoutonSeance onClick={demanderAFreud}>{t.freud}</BoutonSeance>
          <BoutonSeance onClick={() => setReponse(REPONSE_DIVAN[lang])}>{t.divan}</BoutonSeance>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="bg-dots-ink flex flex-col gap-8 rounded-[20px] px-5 py-8 sm:px-10 sm:py-12 lg:col-span-8">
            <p
              id="adler-titre"
              className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]"
            >
              <span aria-hidden className="node-dot" />
              {t.titre}
              <span aria-hidden className="node-dot" />
            </p>

            <blockquote className="flex flex-col gap-6">
              <p className="sr-only" aria-live="polite">
                {enCours ? "" : texte}
              </p>
              <p
                aria-hidden
                className="font-display min-h-[4.2em] text-[clamp(1.75rem,3.6vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.015em]"
              >
                <span className="text-[color:var(--color-accent-strong)]">{lang === "en" ? "“" : "«\u00a0"}</span>
                {texte.slice(0, lettres)}
                {enCours ? (
                  <span className="ml-0.5 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-[color:var(--color-accent-strong)] motion-safe:animate-pulse" />
                ) : (
                  <span className="text-[color:var(--color-accent-strong)]">{lang === "en" ? "”" : "\u00a0»"}</span>
                )}
              </p>
              <footer className="font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
                <cite className="not-italic">{citation.source}</cite> · {citation.annee}
              </footer>
            </blockquote>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-[20px] bg-[color:var(--color-ink-surface)] p-5 sm:p-6 lg:col-span-4">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
                {lang === "en" ? "The doctor's desk" : "Le bureau du docteur"}
              </p>
              <p
                aria-live="polite"
                className="min-h-[6em] rounded-[16px] rounded-tl-[4px] bg-[color:var(--color-ink)] p-4 text-[15px] leading-relaxed"
              >
                {reponse ?? (
                  <span className="text-[color:var(--color-ink-muted)]">{t.attente}</span>
                )}
              </p>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              {vues === null ? "\u00a0" : `${vues} / ${CITATIONS_ADLER.length} ${t.decouvertes}`}
              {vues === CITATIONS_ADLER.length && ` · ${t.terminee}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoutonSeance({
  onClick,
  accent = false,
  children,
}: {
  onClick: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[38px] items-center rounded-full px-4 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors ${
        accent
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-strong)]"
          : "bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-fg)] hover:bg-[color:var(--color-ink-line)]"
      }`}
    >
      {children}
    </button>
  );
}
