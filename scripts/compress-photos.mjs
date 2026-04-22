#!/usr/bin/env node
/**
 * Compresse / redimensionne toutes les photos de public/images/photographie
 * pour rester sous la limite de 100 Mo du repo Vercel Hobby.
 *
 * Usage : npm run compress:photos
 *
 * - Redimensionne à 2400 px (côté le plus long) en gardant le ratio
 * - Réencode en JPEG qualité 82 avec mozjpeg
 * - Préserve EXIF (focale, vitesse, ouverture, ISO, date)
 * - Skip les fichiers déjà compressés correctement
 * - Opère IN PLACE (fichier écrasé uniquement si plus petit)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "images", "photographie");
const MAX_DIMENSION = 2400;
const MIN_DIMENSION_WARN = 1600;
const JPEG_QUALITY = 82;

const WATERMARK_WIDTH = 150;
const WATERMARK_HEIGHT = 24;
const WATERMARK_PADDING = 18;

function watermarkSvg() {
  return Buffer.from(
    `<svg width="${WATERMARK_WIDTH}" height="${WATERMARK_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black" fill-opacity="0.78"/>
      <rect width="3" height="100%" fill="#E4FF3A"/>
      <text x="12" y="17" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="900" letter-spacing="0.8" fill="white">SUPERKOSTIA</text>
    </svg>`,
  );
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(jpe?g|png)$/i.test(entry.name) && !entry.name.startsWith("_")) {
      files.push(full);
    }
  }
  return files;
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kb`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mb`;
}

async function processOne(filePath) {
  const originalSize = (await fs.stat(filePath)).size;
  const meta = await sharp(filePath, { failOn: "none" }).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const longest = Math.max(w, h);
  const needsResize = longest > MAX_DIMENSION;
  const isLowRes = longest > 0 && longest < MIN_DIMENSION_WARN;

  let pipeline = sharp(filePath, { failOn: "none" }).withMetadata();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Dimensions finales après resize (pour calcul de position watermark)
  const finalW = needsResize
    ? w >= h
      ? MAX_DIMENSION
      : Math.round((w / h) * MAX_DIMENSION)
    : w;
  const finalH = needsResize
    ? h >= w
      ? MAX_DIMENSION
      : Math.round((h / w) * MAX_DIMENSION)
    : h;

  // Watermark si l'image est assez grande pour le porter sans gêner
  if (finalW >= WATERMARK_WIDTH + 2 * WATERMARK_PADDING && finalH >= 200) {
    pipeline = pipeline.composite([
      {
        input: watermarkSvg(),
        top: finalH - WATERMARK_HEIGHT - WATERMARK_PADDING,
        left: finalW - WATERMARK_WIDTH - WATERMARK_PADDING,
      },
    ]);
  }

  pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const buffer = await pipeline.toBuffer();

  // FORCE=1 npm run compress:photos → réécrit même si le gain est marginal
  // (utile pour (re)watermark toutes les photos existantes)
  const force = process.env.FORCE === "1";
  const action = (() => {
    if (!force && buffer.length >= originalSize * 0.95) return "skip";
    return needsResize ? "resize" : "compress";
  })();

  if (action !== "skip") {
    const target = filePath.replace(/\.png$/i, ".jpg");
    await fs.writeFile(target, buffer);
    if (target !== filePath) await fs.unlink(filePath);
    return {
      action,
      path: target,
      originalSize,
      newSize: buffer.length,
      dims: `${w}×${h}`,
      lowRes: isLowRes,
    };
  }

  return {
    action,
    path: filePath,
    originalSize,
    newSize: originalSize,
    dims: `${w}×${h}`,
    lowRes: isLowRes,
  };
}

async function main() {
  let files;
  try {
    files = await walk(ROOT);
  } catch {
    console.log(`Aucun dossier ${ROOT} — rien à faire.`);
    return;
  }
  if (files.length === 0) {
    console.log(`Aucune photo trouvée dans ${ROOT}.`);
    return;
  }

  console.log(`Compression de ${files.length} fichier(s)...\n`);
  let totalBefore = 0;
  let totalAfter = 0;
  const lowResList = [];

  for (const file of files) {
    try {
      const result = await processOne(file);
      totalBefore += result.originalSize;
      totalAfter += result.newSize;
      const rel = path.relative(ROOT, result.path);
      const flag = result.lowRes ? " ⚠ basse résolution" : "";
      console.log(
        `  [${result.action.padEnd(8)}] ${rel.padEnd(40)} ${result.dims.padEnd(11)} ${fmt(
          result.originalSize,
        )} → ${fmt(result.newSize)}${flag}`,
      );
      if (result.lowRes) lowResList.push(rel);
    } catch (err) {
      console.error(`  [ERROR]    ${path.relative(ROOT, file)} — ${err.message}`);
    }
  }

  console.log(
    `\nTotal : ${fmt(totalBefore)} → ${fmt(totalAfter)} (${fmt(
      totalBefore - totalAfter,
    )} économisés)`,
  );

  if (lowResList.length > 0) {
    console.log(
      `\n⚠ ${lowResList.length} photo(s) en dessous de ${MIN_DIMENSION_WARN} px — rendu pixelisé attendu en plein écran.`,
    );
    console.log(
      `  Astuce : re-exporter depuis iPhone Photos en "Actual Size" (Share → Options → Actual Size) ou via AirDrop.`,
    );
    for (const f of lowResList) console.log(`  · ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
