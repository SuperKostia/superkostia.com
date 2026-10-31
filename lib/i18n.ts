/**
 * Site bilingue (décision #012) : le français vit à la racine, l'anglais sous
 * `/en` avec des adresses traduites (/en/projects, /en/writing, /en/about…).
 * Les liens s'écrivent toujours avec le chemin français canonique, puis
 * passent par `chemin(lang, …)`.
 */

export type Lang = "fr" | "en";

export const LANGUES: Lang[] = ["fr", "en"];

export const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };

export const LOCALE_OG: Record<Lang, string> = { fr: "fr_FR", en: "en_GB" };

/** Segments de route traduits. Les slugs de contenu restent identiques. */
const SEGMENTS_EN: Record<string, string> = {
  projets: "projects",
  ecrits: "writing",
  "a-propos": "about",
  photographie: "photography",
  voyages: "travel",
};

const SEGMENTS_FR: Record<string, string> = Object.fromEntries(
  Object.entries(SEGMENTS_EN).map(([fr, en]) => [en, fr]),
);

/** Seuls le 1er segment et le sous-hobby dédié se traduisent : jamais un slug. */
function traduireSegments(segments: string[], table: Record<string, string>): string[] {
  return segments.map((s, i) => {
    const traduisible = i === 0 || (i === 1 && segments[0] === "hobbies");
    return traduisible ? (table[s] ?? s) : s;
  });
}

function decouper(p: string): { segments: string[]; suite: string } {
  const m = p.match(/^([^?#]*)(.*)$/);
  const base = m?.[1] ?? p;
  return { segments: base.split("/").filter(Boolean), suite: m?.[2] ?? "" };
}

/** Chemin français canonique → chemin dans la langue demandée. */
export function chemin(lang: Lang, cheminFr: string): string {
  if (lang === "fr") return cheminFr;
  const { segments, suite } = decouper(cheminFr);
  const traduits = traduireSegments(segments, SEGMENTS_EN);
  return `/en${traduits.length ? `/${traduits.join("/")}` : ""}${suite}`;
}

export function langueDuChemin(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

/** Chemin anglais → chemin français canonique. */
function versFrancais(cheminEn: string): string {
  const { segments, suite } = decouper(cheminEn);
  const sansPrefixe = segments[0] === "en" ? segments.slice(1) : segments;
  const traduits = traduireSegments(sansPrefixe, SEGMENTS_FR);
  return `/${traduits.join("/")}${suite}`;
}

/** La même page dans l'autre langue (bouton FR / EN). */
export function traduireChemin(pathname: string, vers: Lang): string {
  const fr = langueDuChemin(pathname) === "en" ? versFrancais(pathname) : pathname;
  return chemin(vers, fr);
}

/** canonical + hreflang d'une page, à partir de son chemin français. */
export function alternates(lang: Lang, cheminFr: string) {
  return {
    canonical: chemin(lang, cheminFr),
    languages: {
      fr: cheminFr,
      en: chemin("en", cheminFr),
      "x-default": cheminFr,
    },
  };
}

export function formatNombre(lang: Lang, n: number): string {
  return new Intl.NumberFormat(LOCALE[lang]).format(n);
}

/** Choisit la variante d'un texte selon la langue. */
export function t<T>(lang: Lang, textes: Record<Lang, T>): T {
  return textes[lang];
}

/* ---------- Libellés partagés ---------- */

export const TYPES_PROJET: Record<string, Record<Lang, string>> = {
  pro: { fr: "pro", en: "pro" },
  perso: { fr: "perso", en: "personal" },
  experimental: { fr: "experimental", en: "experimental" },
};

export const STATUTS_PROJET: Record<string, Record<Lang, string>> = {
  "en-cours": { fr: "en-cours", en: "ongoing" },
  publie: { fr: "publie", en: "shipped" },
  archive: { fr: "archive", en: "archived" },
  abandonne: { fr: "abandonne", en: "abandoned" },
};

export function libelleType(lang: Lang, type: string): string {
  return TYPES_PROJET[type]?.[lang] ?? type;
}

export function libelleStatut(lang: Lang, statut: string): string {
  return STATUTS_PROJET[statut]?.[lang] ?? statut;
}

export const NAV_PRINCIPALE: Array<{ cheminFr: string; label: Record<Lang, string> }> = [
  { cheminFr: "/projets", label: { fr: "Projets", en: "Projects" } },
  { cheminFr: "/hobbies", label: { fr: "Hobbies", en: "Hobbies" } },
  { cheminFr: "/ecrits", label: { fr: "Écrits", en: "Writing" } },
  { cheminFr: "/a-propos", label: { fr: "À propos", en: "About" } },
];

export const NAV_PIED: Array<{ cheminFr: string; label: Record<Lang, string> }> = [
  { cheminFr: "/contact", label: { fr: "Contact", en: "Contact" } },
  { cheminFr: "/colophon", label: { fr: "Colophon", en: "Colophon" } },
];

export const SLOGAN: Record<Lang, string> = {
  fr: "Le terrain de jeu public de Kostia : projets, hobbies, voyages, écrits.",
  en: "Kostia's public playground: projects, hobbies, travel, writing.",
};
