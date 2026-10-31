/**
 * Citations d'Alfred Adler (1870-1937) pour la home : notification à chaque
 * visite + section « Séance ». Uniquement des phrases retrouvées dans ses
 * livres (beaucoup de fausses citations d'Adler circulent, dont celles du
 * « Courage d'être détesté »). Le français est traduit maison.
 *
 * Anglais vérifié le 31/10/2026 dans le texte intégral (archive.org) :
 * What Life Should Mean to You (1931) et The Science of Living (1929) mot
 * pour mot ; « bagage » via le recueil Ansbacher (Adlerpedia) ; « inferieur »
 * est traduit de l'allemand (« Mensch sein heißt: sich minderwertig fühlen »).
 */

import type { Lang } from "./i18n";

export type CitationAdler = {
  id: string;
  /** En anglais : la phrase d'origine, sauf Der Sinn des Lebens, traduit de l'allemand. */
  texte: Record<Lang, string>;
  source: string;
  annee: number;
};

export const CITATIONS_ADLER: CitationAdler[] = [
  {
    id: "sens",
    texte: {
      fr: "Ce ne sont pas les situations qui décident du sens. C'est nous qui nous déterminons par le sens que nous leur donnons.",
      en: "Meanings are not determined by situations, but we determine ourselves by the meanings we give to situations.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "contribuer",
    texte: {
      fr: "Chacun cherche à compter. Mais on se trompe tant qu'on ne voit pas que toute notre importance tient à ce qu'on apporte à la vie des autres.",
      en: "Every human being strives for significance; but people always make mistakes if they do not see that their whole significance must consist in their contribution to the lives of others.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "bagage",
    texte: {
      fr: "Ce qui compte, ce n'est pas ce avec quoi on naît, c'est l'usage qu'on fait de ce bagage.",
      en: "The important thing is not what one is born with, but what use one makes of that equipment.",
    },
    source: "The Individual Psychology of Alfred Adler",
    annee: 1956,
  },
  {
    id: "souvenirs",
    texte: {
      fr: "Il n'y a pas de souvenirs dus au hasard.",
      en: "There are no “chance memories”.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "inferieur",
    texte: {
      fr: "Être humain, c'est se sentir inférieur.",
      en: "To be human means to feel inferior.",
    },
    source: "Der Sinn des Lebens",
    annee: 1933,
  },
  {
    id: "vivre",
    texte: {
      fr: "Vivre, c'est m'intéresser aux autres, faire partie d'un tout, apporter ma part au bien-être de l'humanité.",
      en: "Life means: to be interested in my fellow men, to be part of the whole, to contribute my share to the welfare of mankind.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "significations",
    texte: {
      fr: "Les êtres humains vivent dans le royaume des significations.",
      en: "Human beings live in the realm of meanings.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "autres",
    texte: {
      fr: "C'est celui qui ne s'intéresse pas aux autres qui a le plus de mal dans la vie, et qui fait le plus de tort autour de lui.",
      en: "It is the individual who is not interested in his fellow men who has the greatest difficulties in life and provides the greatest injury to others.",
    },
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "arbre",
    texte: {
      fr: "Le style de vie d'un arbre, c'est son individualité qui s'exprime et se façonne dans un environnement.",
      en: "The style of life of a tree is the individuality of a tree expressing itself and moulding itself in an environment.",
    },
    source: "The Science of Living",
    annee: 1929,
  },
];

/** Réponses du bouton « Demander à Freud », dans l'ordre. Toutes historiques. */
export const REPONSES_FREUD: Record<Lang, string[]> = {
  fr: [
    "Freud n'est plus joignable. Adler a quitté son cercle en 1911.",
    "Adler n'a jamais été l'élève de Freud. Il le rappelait chaque fois qu'on le disait.",
    "Freud parlait de libido. Adler, de sentiment d'appartenance. Ils ont arrêté de se voir.",
    "Freud est en séance. Sur un divan, évidemment.",
  ],
  en: [
    "Freud can't be reached. Adler walked out of his circle in 1911.",
    "Adler was never Freud's student. He pointed it out every single time someone said so.",
    "Freud talked about libido. Adler, about belonging. They stopped seeing each other.",
    "Freud is in session. On a couch, obviously.",
  ],
};

export const REPONSE_DIVAN: Record<Lang, string> = {
  fr: "Pas de divan. Adler recevait assis, face à face, d'égal à égal.",
  en: "No couch. Adler saw people sitting down, face to face, as equals.",
};

/** Événement émis quand une citation est montrée (notification ou section). */
export const EVENEMENT_CITATION = "adler:citation";

const CLE_VUES = "adler-vues";

export function lireVues(): Set<string> {
  try {
    const brut = localStorage.getItem(CLE_VUES);
    return new Set(brut ? (JSON.parse(brut) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function marquerVue(id: string): Set<string> {
  const vues = lireVues();
  vues.add(id);
  try {
    localStorage.setItem(CLE_VUES, JSON.stringify([...vues]));
  } catch {
    // Stockage indisponible (navigation privée stricte) : le compteur repart de zéro, rien de grave.
  }
  return vues;
}

/** Tire une citation pas encore vue (toutes si tout a été vu), différente de `sauf`. */
export function tirerCitation(sauf?: string): CitationAdler {
  const vues = lireVues();
  const candidates = CITATIONS_ADLER.filter((c) => c.id !== sauf);
  const nouvelles = candidates.filter((c) => !vues.has(c.id));
  const pool = nouvelles.length > 0 ? nouvelles : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
