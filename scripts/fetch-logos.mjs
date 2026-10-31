#!/usr/bin/env node
/**
 * Récupère le logo (apple-touch-icon, sinon la plus grande icône déclarée,
 * sinon les emplacements standards) du site de chaque projet, et le pose en carré 192 px
 * dans public/images/logos/<slug>.png. Sert d'« avatar » aux stories.
 *
 * Usage : node scripts/fetch-logos.mjs  (--force pour tout refaire)
 *
 * Le site d'un projet = son premier lien http(s), sauf dérogations ci-dessous
 * (outils internes rattachés à un autre site, liens qui ne sont pas un site).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROJETS_DIR = path.join(ROOT, "content", "projets");
const SORTIE = path.join(ROOT, "public", "images", "logos");
const TAILLE = 192;
const force = process.argv.includes("--force");

/** Site dont on prend le logo, quand ce n'est pas le premier lien (null = pas de logo). */
const SITE_DU_PROJET = {
  "axiom-hub": "https://www.axiom-academic.com/",
  "axiom-seo-dashboard": "https://www.axiom-academic.com/",
  "guide-etudes-superieures": "https://www.axiom-academic.com/",
  "dictee-dubai": null,
  "fixieshop-moscow": null,
  "choose-france-2026": null,
  "coupe-du-monde-dim": null,
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

function icones(html, base) {
  const liens = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const attr = (tag, nom) => tag.match(new RegExp(`${nom}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
  return liens
    .map((tag) => ({ rel: (attr(tag, "rel") ?? "").toLowerCase(), href: attr(tag, "href"), sizes: attr(tag, "sizes") ?? "" }))
    .filter((l) => l.href && /(^|\s)(apple-touch-icon|icon|shortcut icon)(\s|$)/.test(l.rel))
    .map((l) => ({
      ...l,
      url: new URL(l.href, base).href,
      // apple-touch-icon d'abord, puis la plus grande taille, puis le SVG
      score:
        (l.rel.includes("apple-touch-icon") ? 10000 : 0) +
        (Number(l.sizes.split("x")[0]) || (l.href.endsWith(".svg") ? 500 : 16)),
    }))
    .sort((a, b) => b.score - a.score);
}

async function telecharger(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function versCarre(buffer) {
  return sharp(buffer, { density: 384 })
    .resize(TAILLE, TAILLE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

await fs.mkdir(SORTIE, { recursive: true });
const fichiers = (await fs.readdir(PROJETS_DIR)).filter((f) => f.endsWith(".mdx") && !f.includes(".en."));

for (const f of fichiers) {
  const { data } = matter(await fs.readFile(path.join(PROJETS_DIR, f), "utf8"));
  const slug = data.slug;
  const cible = path.join(SORTIE, `${slug}.png`);
  if (!force && (await fs.access(cible).then(() => true, () => false))) {
    console.log(`= ${slug} (déjà là)`);
    continue;
  }
  const site = slug in SITE_DU_PROJET ? SITE_DU_PROJET[slug] : data.links?.find((l) => /^https?:\/\//.test(l.url))?.url;
  if (!site) {
    console.log(`- ${slug} : pas de site, pas de logo`);
    continue;
  }
  try {
    const html = await (await fetch(site, { headers: { "User-Agent": UA }, redirect: "follow" })).text();
    const standards = ["/apple-touch-icon.png", "/favicon.svg", "/favicon.png", "/favicon.ico"];
    const candidats = [...icones(html, site), ...standards.map((p) => ({ url: new URL(p, site).href }))];
    let fait = false;
    for (const c of candidats) {
      try {
        await fs.writeFile(cible, await versCarre(await telecharger(c.url)));
        console.log(`✓ ${slug} ← ${c.url}`);
        fait = true;
        break;
      } catch {
        // format illisible (ico) ou 404 : candidat suivant
      }
    }
    if (!fait) console.log(`✗ ${slug} : aucune icône lisible sur ${site}`);
  } catch (e) {
    console.log(`✗ ${slug} : ${e.message}`);
  }
}
