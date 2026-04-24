#!/usr/bin/env node
/**
 * Capture un screenshot de la home de chaque projet qui a un `links[0].url`
 * publiquement accessible dans son frontmatter MDX.
 *
 * Usage : npm run screenshot:projets
 *
 * - Lit content/projets/*.mdx
 * - Pour chaque projet avec `links: [{ url: "https://..." }]`, ouvre un
 *   Chromium headless, attend le networkidle, prend un screenshot viewport
 *   (1440×900), sauve dans public/images/projets/<slug>.jpg
 * - Skip les projets déjà screenshotés (sauf si --force)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROJETS_DIR = path.join(ROOT, "content", "projets");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "projets");
const VIEWPORT = { width: 1440, height: 900 };

const force = process.argv.includes("--force");

// Patterns de boutons "refuser" sur les bannières cookies courantes.
// Meta (Instagram, Facebook) → "Decline optional cookies".
// Sites FR/EU → "Refuser tout", "Tout refuser", "Reject all".
// On clique le premier match trouvé, on laisse le banner sinon.
const COOKIE_DECLINE_PATTERNS = [
  /Decline optional cookies/i,
  /Refuser tout/i,
  /Tout refuser/i,
  /Reject all( cookies)?/i,
];

async function dismissCookieBanner(page) {
  // Tenter de cliquer un bouton "refuser" si présent (variations FR/EN).
  for (const pattern of COOKIE_DECLINE_PATTERNS) {
    try {
      let target = page.getByRole("button", { name: pattern });
      if ((await target.count()) === 0) {
        // Meta (IG/FB) utilise des <div> stylés au lieu de vrais <button>
        target = page.getByText(pattern, { exact: false });
      }
      if ((await target.count()) > 0) {
        await target.first().click({ timeout: 2000, force: true });
        await page.waitForTimeout(600);
        return true;
      }
    } catch {
      // continue
    }
  }
  return false;
}

async function removeBlockingDialogs(page) {
  // Suppression chirurgicale : modales sémantiques + leurs backdrops.
  // On évite d'être plus large (cf. tentative "tout fixed plein écran")
  // sinon on supprime parfois le main content (IG construit ses pages
  // avec des containers fixed). Reset du body bg + filters CSS au cas où.
  await page.evaluate(() => {
    document
      .querySelectorAll('[role="dialog"], [aria-modal="true"], dialog')
      .forEach((el) => el.remove());
    document.querySelectorAll('[role="presentation"]').forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.position === "fixed" && cs.zIndex !== "auto") {
        el.remove();
      }
    });
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    // Reset défensif des filters/opacity au cas où le site appliquerait
    // un dimming pendant qu'une modale est "pending" (vu sur IG).
    const overrideStyle = document.createElement("style");
    overrideStyle.textContent = `
      html, body, body * {
        filter: none !important;
        backdrop-filter: none !important;
      }
    `;
    document.head.appendChild(overrideStyle);
  });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await fs.readdir(PROJETS_DIR))
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  const browser = await chromium.launch();
  let done = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const file of files) {
      const raw = await fs.readFile(path.join(PROJETS_DIR, file), "utf8");
      const { data } = matter(raw);
      const link = data.links?.[0]?.url;
      const slug = data.slug;

      if (!slug || !link || !/^https?:\/\//.test(link)) continue;

      const target = path.join(OUTPUT_DIR, `${slug}.jpg`);
      if (!force && (await fileExists(target))) {
        console.log(`[skip]  ${slug} (déjà présent — relancer avec --force)`);
        skipped++;
        continue;
      }

      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      try {
        console.log(`[shoot] ${slug.padEnd(30)} → ${link}`);
        // 1. Navigate, wait for network to settle.
        await page.goto(link, { waitUntil: "networkidle", timeout: 30000 });
        // 2. Laisser les images lazy-loadées finir de charger. ~2.5s reste
        //    sous le seuil d'apparition du signup wall IG (typiquement 4-5s).
        await page.waitForTimeout(2500);
        // 3. Click decline cookies si présent (pose le cookie de consent).
        await dismissCookieBanner(page);
        // 4. Suppression chirurgicale des dialogs/backdrops + reset filters.
        //    Pas de reload : on perdrait le lazy loading des images.
        await removeBlockingDialogs(page);
        await page.waitForTimeout(400);
        await page.screenshot({
          path: target,
          type: "jpeg",
          quality: 85,
          fullPage: false,
        });
        console.log(`        ✓ public/images/projets/${slug}.jpg`);
        done++;
      } catch (err) {
        console.error(`        ✗ ${err.message}`);
        failed++;
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${done} capturé(s), ${skipped} skippé(s), ${failed} échec(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
