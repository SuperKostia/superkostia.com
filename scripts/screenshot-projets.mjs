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
        await page.goto(link, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(1200);
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
