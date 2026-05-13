#!/usr/bin/env node
/**
 * Génère les visuels LinkedIn de la page Entreprise.
 *
 *   public/images/linkedin/banner.png   4200 × 700  (ratio 6:1, page Entreprise)
 *   public/images/linkedin/icon.png      400 × 400  (logo de page, affiché en cercle)
 *
 * Attention : le ratio 4:1 (1584 × 396) qu'on voit partout cité c'est pour
 * le **profil personnel**. La page Entreprise utilise 6:1 (display 1128×191,
 * upload recommandé 4200×700). Source : LinkedIn Help "Image specifications
 * for your LinkedIn Pages and Career Pages".
 *
 * Pattern : on ouvre Chromium headless sur des `data:` URL HTML construites
 * inline, on screenshote au viewport exact, on écrit le PNG. Aucune API
 * externe, tout est local (cf. règle 0 € du CLAUDE.md).
 *
 * Le fond de la bannière reprend le `WaterField` (composant
 * components/ui/WaterField.tsx) en version statique : les `<animate>` SMIL
 * sont retirés, le frame initial des feTurbulence (seeds 3 et 11) donne déjà
 * un motif de caustiques riche. L'icône reste sobre (Space Grotesk noir sur
 * cream, avec un seul accent jaune pour éviter le côté fade).
 *
 * Usage : npm run generate:linkedin
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "linkedin");

const FONT_REGULAR = path.join(
  ROOT,
  "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
);
const FONT_BOLD = path.join(
  ROOT,
  "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2",
);

// Bannière à la spec page Entreprise LinkedIn : ratio 6:1, upload 4200×700.
// On rend au viewport natif (pas de deviceScaleFactor sur la bannière) parce
// qu'on est déjà à 4× la taille d'affichage (1128×191) → suffisamment retina.
const BANNER = { width: 4200, height: 700, file: "banner.png", scale: 1 };
const ICON = { width: 400, height: 400, file: "icon.png", scale: 2 };

async function fontDataUri(p) {
  const buf = await fs.readFile(p);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

/**
 * SVG du WaterField, en version statique (sans `<animate>`).
 * Reprend strictement les primitives, gradients et seeds de
 * components/ui/WaterField.tsx — densité = 0.55 sur la bannière pour des
 * squiggles plus larges, lisibles à grande échelle.
 */
function waterFieldSvg(density = 0.55) {
  const f = (n) => (n * density).toFixed(4);
  const erodeRadius = Math.max(0.5, 3 / density).toFixed(2);
  const dispScale = Math.max(2, 14 / density).toFixed(2);

  return `
<svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="wfBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0087C4"/>
      <stop offset="0.35" stop-color="#0087C5"/>
      <stop offset="0.7" stop-color="#009BD1"/>
      <stop offset="1" stop-color="#63C1CC"/>
    </linearGradient>
    <radialGradient id="wfGlint" cx="30%" cy="25%" r="75%" fx="30%" fy="25%">
      <stop offset="0" stop-color="#00A7DF" stop-opacity="0.40"/>
      <stop offset="0.35" stop-color="#00A8D8" stop-opacity="0.22"/>
      <stop offset="0.65" stop-color="#00B0CF" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#009EDB" stop-opacity="0"/>
    </radialGradient>
    <filter id="wfCaustics" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.018)} ${f(0.02)}" numOctaves="2" seed="3" result="n1"/>
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.022)} ${f(0.016)}" numOctaves="2" seed="11" result="n2"/>
      <feBlend in="n1" in2="n2" mode="difference" result="interference"/>
      <feColorMatrix in="interference" type="matrix"
        values="0 0 0 0 1
                0 0 0 0 1
                0 0 0 0 1
                50 0 0 0 -14" result="binary"/>
      <feMorphology in="binary" operator="erode" radius="${erodeRadius}" result="eroded"/>
      <feComposite in="binary" in2="eroded" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="lines"/>
      <feTurbulence type="fractalNoise" baseFrequency="${f(0.06)}" numOctaves="2" seed="17" result="warp"/>
      <feDisplacementMap in="lines" in2="warp" scale="${dispScale}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#wfBase)"/>
  <rect width="100%" height="100%" fill="url(#wfGlint)"/>
  <rect width="100%" height="100%" filter="url(#wfCaustics)"/>
</svg>`;
}

/**
 * Bannière 4200 × 700 (ratio 6:1, page Entreprise LinkedIn). Fond WaterField,
 * wordmark `superkostia` lowercase façon OG image (Space Grotesk 700, "super"
 * cream et "kostia" en chiclet jaune avec bordure noire, rotation -1.5°).
 * Tagline mono sous le wordmark.
 *
 * Safe zone profil : LinkedIn empile la photo de profil (≈ 168 × 168 en
 * display 1128) en bas-gauche de la bannière, avec 50 px de marge gauche et
 * débord vers le bas. Ramené en upload 4200, ça mange tout le coin
 * bas-gauche jusqu'à ≈ x = 900. On laisse donc 1080 px de gutter à gauche
 * pour que le wordmark vive entièrement à droite de l'icône profil.
 *
 * Le `sk` chiclet à droite a été supprimé : la photo de profil EST déjà un
 * `sk`, c'était un doublon. On gagne en plus de la respiration pour le
 * wordmark dans la zone visible.
 *
 * Densité WaterField = 0.35 (squiggles plus larges qu'à density=0.55) pour
 * que les caustiques restent lisibles à 6:1 sans saturer l'image.
 */
function bannerHtml(fontRegular, fontBold) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';src:url('${fontBold}') format('woff2');font-weight:700;font-style:normal;}
@font-face{font-family:'Space Grotesk';src:url('${fontRegular}') format('woff2');font-weight:500;font-style:normal;}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:${BANNER.width}px;height:${BANNER.height}px;overflow:hidden;background:#0087C4;}
.stage{position:relative;width:100%;height:100%;isolation:isolate;font-family:'Space Grotesk',system-ui,sans-serif;}
.water{position:absolute;inset:0;z-index:-1;}
.content{position:relative;height:100%;padding:0 240px 0 1080px;display:flex;flex-direction:column;justify-content:center;gap:40px;}
.wordmark{display:flex;align-items:flex-end;font-weight:700;font-size:300px;line-height:0.86;letter-spacing:-14px;text-transform:lowercase;}
.wordmark .super{color:#f4f1ea;text-shadow:0 6px 32px rgba(0,0,0,0.22);}
.wordmark .kostia{background:#E4FF3A;color:#111;padding:0 36px 14px 36px;margin-left:22px;border:8px solid #111;transform:rotate(-1.5deg);box-shadow:0 14px 0 rgba(0,0,0,0.18);}
.tagline{font-family:ui-monospace,Menlo,monospace;font-size:38px;letter-spacing:0.34em;text-transform:uppercase;color:#f4f1ea;opacity:0.92;}
.tagline .sep{display:inline-block;margin:0 22px;opacity:0.55;}
</style></head><body>
<div class="stage">
  <div class="water">${waterFieldSvg(0.35)}</div>
  <div class="content">
    <div class="wordmark"><span class="super">super</span><span class="kostia">kostia</span></div>
    <div class="tagline">terrain de jeu public<span class="sep">·</span>superkostia.com<span class="sep">·</span>athènes</div>
  </div>
</div>
</body></html>`;
}

/**
 * Icône 400 × 400. Sobre : cream + monogramme `sk` noir Space Grotesk 700,
 * tracking serré, centré. Aucun corner-tick (illisibles à 48 px en feed).
 *
 * Micro-surprise : un trait jaune accent placé sous la ligne de base, en
 * débord léger à droite et tilté -2°. Lisible à pleine taille comme une
 * signature brutaliste, et il se fond à 48 px sans parasiter la lecture du
 * monogramme — il devient un fin liseré jaune en bord d'image, visible à
 * l'œil exercé mais sans casser la sobriété générale.
 *
 * Le `sk` est lowercase pour rester aligné sur l'esprit du wordmark (qui
 * vit lowercase dans la source, juste mis en uppercase par CSS dans le
 * header) et il occupe ~55 % de la surface pour rester lisible une fois
 * croppé en cercle par l'UI LinkedIn.
 */
function iconHtml(fontBold) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';src:url('${fontBold}') format('woff2');font-weight:700;font-style:normal;}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:${ICON.width}px;height:${ICON.height}px;overflow:hidden;background:#f4f1ea;}
.frame{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',system-ui,sans-serif;}
.glyphWrap{position:relative;display:inline-block;}
.glyph{position:relative;z-index:1;font-weight:700;font-size:300px;line-height:1;letter-spacing:-24px;color:#111;text-transform:lowercase;padding-right:24px;}
.underline{position:absolute;z-index:0;left:-12px;right:-28px;bottom:34px;height:16px;background:#E4FF3A;border:3px solid #111;transform:rotate(-2deg);}
</style></head><body>
<div class="frame">
  <div class="glyphWrap">
    <span class="underline"></span>
    <span class="glyph">sk</span>
  </div>
</div>
</body></html>`;
}

async function render(browser, html, viewport, outPath, deviceScaleFactor = 2) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor, // PNG @scale → contrôle netteté et taille finale
  });
  const page = await context.newPage();
  // data: URL pour éviter tout fichier temporaire
  await page.setContent(html, { waitUntil: "networkidle" });
  // Petit délai supplémentaire : la chaîne de filter SVG peut prendre un
  // tick pour se calculer dans Chromium.
  await page.waitForTimeout(400);
  await page.screenshot({ path: outPath, omitBackground: false });
  await context.close();
  return outPath;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const [fontRegular, fontBold] = await Promise.all([
    fontDataUri(FONT_REGULAR),
    fontDataUri(FONT_BOLD),
  ]);

  const browser = await chromium.launch();
  try {
    const bannerOut = path.join(OUTPUT_DIR, BANNER.file);
    const iconOut = path.join(OUTPUT_DIR, ICON.file);

    await render(
      browser,
      bannerHtml(fontRegular, fontBold),
      { width: BANNER.width, height: BANNER.height },
      bannerOut,
      BANNER.scale,
    );
    console.log(`✓ ${path.relative(ROOT, bannerOut)}  (${BANNER.width * BANNER.scale}×${BANNER.height * BANNER.scale})`);

    await render(
      browser,
      iconHtml(fontBold),
      { width: ICON.width, height: ICON.height },
      iconOut,
      ICON.scale,
    );
    console.log(`✓ ${path.relative(ROOT, iconOut)}  (${ICON.width * ICON.scale}×${ICON.height * ICON.scale})`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
