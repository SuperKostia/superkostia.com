import type { MetadataRoute } from "next";
import { getEcrits, getHobbies, getProjets } from "@/lib/mdx";

const BASE_URL = "https://superkostia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projets, hobbies, ecrits] = await Promise.all([
    getProjets(),
    getHobbies(),
    getEcrits(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/projets",
    "/hobbies",
    "/hobbies/photographie",
    "/voyages",
    "/ecrits",
    "/a-propos",
    "/contact",
    "/colophon",
  ].map((p) => ({ url: `${BASE_URL}${p}`, lastModified: now }));

  const projetRoutes: MetadataRoute.Sitemap = projets.map((p) => ({
    url: `${BASE_URL}/projets/${p.frontmatter.slug}`,
    lastModified: now,
  }));

  const hobbyRoutes: MetadataRoute.Sitemap = hobbies
    .filter((h) => h.frontmatter.slug !== "photographie")
    .map((h) => ({
      url: `${BASE_URL}/hobbies/${h.frontmatter.slug}`,
      lastModified: now,
    }));

  const ecritRoutes: MetadataRoute.Sitemap = ecrits.map((e) => ({
    url: `${BASE_URL}/ecrits/${e.frontmatter.slug}`,
    lastModified: e.frontmatter.date ? new Date(e.frontmatter.date) : now,
  }));

  return [...staticRoutes, ...projetRoutes, ...hobbyRoutes, ...ecritRoutes];
}
