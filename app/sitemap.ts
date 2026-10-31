import type { MetadataRoute } from "next";
import { getEcrits, getHobbies, getProjets, ROUTES_DEDIEES } from "@/lib/mdx";
import { chemin, LANGUES } from "@/lib/i18n";

const BASE_URL = "https://superkostia.com";

/** Une entrée par langue, chacune annonçant ses équivalents (hreflang). */
function entrees(cheminFr: string, lastModified: Date): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LANGUES.map((l) => [l, `${BASE_URL}${chemin(l, cheminFr)}`]),
  );
  return LANGUES.map((l) => ({
    url: `${BASE_URL}${chemin(l, cheminFr)}`,
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projets, hobbies, ecrits] = await Promise.all([
    getProjets(),
    getHobbies(),
    getEcrits(),
  ]);

  const now = new Date();

  const statiques = [
    "/",
    "/projets",
    "/hobbies",
    "/hobbies/photographie",
    "/hobbies/voyages",
    "/ecrits",
    "/a-propos",
    "/contact",
    "/colophon",
  ].flatMap((p) => entrees(p, now));

  const projetRoutes = projets.flatMap((p) => entrees(`/projets/${p.frontmatter.slug}`, now));

  const hobbyRoutes = hobbies
    .filter((h) => !ROUTES_DEDIEES.has(h.frontmatter.slug))
    .flatMap((h) => entrees(`/hobbies/${h.frontmatter.slug}`, now));

  const ecritRoutes = ecrits.flatMap((e) =>
    entrees(`/ecrits/${e.frontmatter.slug}`, e.frontmatter.date ? new Date(e.frontmatter.date) : now),
  );

  return [...statiques, ...projetRoutes, ...hobbyRoutes, ...ecritRoutes];
}
