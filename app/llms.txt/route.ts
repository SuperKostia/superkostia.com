import { getEcrits, getHobbies, getProjets } from "@/lib/mdx";
import { chemin, libelleStatut, libelleType } from "@/lib/i18n";

/**
 * /llms.txt (format llmstxt.org) : le site résumé pour les IA, régénéré à
 * chaque build depuis le contenu. En anglais, avec les liens des deux langues.
 */
export const dynamic = "force-static";

const SITE = "https://superkostia.com";

export async function GET() {
  const [projets, hobbies, ecrits] = await Promise.all([
    getProjets("en"),
    getHobbies("en"),
    getEcrits("en"),
  ]);

  /** « [Titre](lien anglais) ([FR](lien français)) ». */
  const lien = (titre: string, cheminFr: string) =>
    `[${titre}](${SITE}${chemin("en", cheminFr)}) ([FR](${SITE}${cheminFr}))`;

  const lignes = [
    "# superkostia",
    "",
    "> Kostia's public playground: an entrepreneur based in Athens, co-founder of Axiom Academic (international private tutoring for expat families). Projects he has built, hobbies (travel, photography), writing. Bilingual site: English under /en, French at the root.",
    "",
    "Kostia builds companies and side projects, mostly around education, expat life and AI, and ships them himself with Claude Code. The site is static and every page is plain HTML.",
    "",
    "## Pages",
    "",
    `- ${lien("About", "/a-propos")}: who Kostia is, what he works on, what obsesses him, a non-linear timeline`,
    `- ${lien("Projects", "/projets")}: every project, work and personal`,
    `- ${lien("Hobbies", "/hobbies")}: travel map and photography`,
    `- ${lien("Writing", "/ecrits")}: newsletters (LinkedIn in English, Substack in French) and notes`,
    `- ${lien("Contact", "/contact")}: LinkedIn and WhatsApp after a short intent form`,
    "",
    "## Projects",
    "",
    ...projets.map(({ frontmatter: p }) => {
      const site = p.links?.[0]?.url;
      const meta = [libelleType("en", p.type), libelleStatut("en", p.status), p.date?.slice(0, 7) ?? String(p.year)].join(", ");
      return `- ${lien(p.title, `/projets/${p.slug}`)}: ${p.summary} (${meta}${site ? `; live at ${site}` : ""})`;
    }),
    "",
    "## Hobbies",
    "",
    ...hobbies.map(({ frontmatter: h }) => `- ${lien(h.title, `/hobbies/${h.slug}`)}: ${h.summary}`),
    "",
    "## Writing",
    "",
    ...ecrits.map(({ frontmatter: e }) => `- ${lien(e.title, `/ecrits/${e.slug}`)}: ${e.summary} (${e.date})`),
    "",
    "## Optional",
    "",
    `- ${lien("Colophon", "/colophon")}: how the site is built, stack and key decisions`,
    `- [Sitemap](${SITE}/sitemap.xml)`,
    "",
  ];

  return new Response(lignes.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
