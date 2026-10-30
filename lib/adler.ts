/**
 * Citations d'Alfred Adler (1870-1937) pour la home : notification à chaque
 * visite + section « Séance ». Uniquement des phrases retrouvées dans ses
 * livres (beaucoup de fausses citations d'Adler circulent, dont celles du
 * « Courage d'être détesté »). Traductions maison.
 */

export type CitationAdler = {
  id: string;
  texte: string;
  source: string;
  annee: number;
};

export const CITATIONS_ADLER: CitationAdler[] = [
  {
    id: "sens",
    texte:
      "Ce ne sont pas les situations qui décident du sens. C'est nous qui nous déterminons par le sens que nous leur donnons.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "contribuer",
    texte:
      "Chacun cherche à compter. Mais on se trompe tant qu'on ne voit pas que toute notre importance tient à ce qu'on apporte à la vie des autres.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "bagage",
    texte:
      "Ce qui compte, ce n'est pas ce avec quoi on naît, c'est l'usage qu'on fait de ce bagage.",
    source: "The Individual Psychology of Alfred Adler",
    annee: 1956,
  },
  {
    id: "souvenirs",
    texte: "Il n'y a pas de souvenirs dus au hasard.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "inferieur",
    texte: "Être humain, c'est se sentir inférieur.",
    source: "Der Sinn des Lebens",
    annee: 1933,
  },
  {
    id: "vivre",
    texte:
      "Vivre, c'est s'intéresser aux autres, faire partie d'un tout, apporter sa part au bien-être de l'humanité.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "significations",
    texte: "Les êtres humains vivent dans le royaume des significations.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "autres",
    texte:
      "C'est celui qui ne s'intéresse pas aux autres qui a le plus de mal dans la vie, et qui fait le plus de tort autour de lui.",
    source: "What Life Should Mean to You",
    annee: 1931,
  },
  {
    id: "arbre",
    texte:
      "Le style de vie d'un arbre, c'est son individualité qui s'exprime et se façonne dans un environnement.",
    source: "The Science of Living",
    annee: 1929,
  },
];

/** Réponses du bouton « Demander à Freud », dans l'ordre. Toutes historiques. */
export const REPONSES_FREUD = [
  "Freud n'est plus joignable. Adler a quitté son cercle en 1911.",
  "Adler n'a jamais été l'élève de Freud. Il le rappelait chaque fois qu'on le disait.",
  "Freud parlait de libido. Adler, de sentiment d'appartenance. Ils ont arrêté de se voir.",
  "Freud est en séance. Sur un divan, évidemment.",
];

export const REPONSE_DIVAN =
  "Pas de divan. Adler recevait assis, face à face, d'égal à égal.";

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
