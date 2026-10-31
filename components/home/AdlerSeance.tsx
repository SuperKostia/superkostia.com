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
      className="grid scroll-mt-20 grid-cols-1 border-b-2 border-[color:var(--color-border)] lg:grid-cols-12"
    >
      <div className="flex flex-col gap-8 px-6 py-12 sm:px-10 lg:col-span-8 lg:py-16">
        <p
          id="adler-titre"
          className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
        >
          {t.titre}
        </p>

        <blockquote className="flex flex-col gap-6">
          <p className="sr-only" aria-live="polite">
            {enCours ? "" : texte}
          </p>
          <p
            aria-hidden
            className="min-h-[6em] font-[family-name:var(--font-space-grotesk)] text-3xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-[color:var(--color-muted)]">{lang === "en" ? "“" : "«\u00a0"}</span>
            {texte.slice(0, lettres)}
            {enCours ? (
              <span className="ml-0.5 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-[color:var(--color-fg)] motion-safe:animate-pulse" />
            ) : (
              <span className="text-[color:var(--color-muted)]">{lang === "en" ? "”" : "\u00a0»"}</span>
            )}
          </p>
          <footer className="font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
            <cite className="not-italic">{citation.source}</cite> · {citation.annee}
          </footer>
        </blockquote>
      </div>

      <div className="flex flex-col justify-between gap-6 border-t-2 border-[color:var(--color-border)] px-6 py-10 sm:px-10 lg:col-span-4 lg:border-l-2 lg:border-t-0 lg:py-16">
        <div className="flex flex-col gap-3">
          <BoutonSeance onClick={encore} accent>
            {t.encore}
          </BoutonSeance>
          <BoutonSeance onClick={demanderAFreud}>{t.freud}</BoutonSeance>
          <BoutonSeance onClick={() => setReponse(REPONSE_DIVAN[lang])}>{t.divan}</BoutonSeance>
        </div>

        <p
          aria-live="polite"
          className="min-h-[4.5em] border-l-4 border-[color:var(--color-accent)] pl-4 font-mono text-sm leading-relaxed"
        >
          {reponse ?? (
            <span className="text-[color:var(--color-muted)]">{t.attente}</span>
          )}
        </p>

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {vues === null ? " " : `${vues} / ${CITATIONS_ADLER.length} ${t.decouvertes}`}
          {vues === CITATIONS_ADLER.length && ` · ${t.terminee}`}
        </p>
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
      className={`border-2 border-[color:var(--color-border)] px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.15em] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
        accent
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : "bg-[color:var(--color-bg)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
      }`}
    >
      {children}
    </button>
  );
}
