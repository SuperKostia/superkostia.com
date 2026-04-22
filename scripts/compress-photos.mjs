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
const MANIFEST_PATH = path.join(ROOT, ".watermarked.json");
const MAX_DIMENSION = 2400;
const MIN_DIMENSION_WARN = 1600;
// Sous ce seuil on refuse la photo (déplacée dans _rejects/ pour que Kostia
// la re-exporte en Actual Size iPhone). Zéro photo pourrave en ligne.
const MIN_DIMENSION_REJECT = 1000;
const JPEG_QUALITY = 82;

async function loadManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    const data = JSON.parse(raw);
    return new Set(Array.isArray(data.watermarked) ? data.watermarked : []);
  } catch {
    return new Set();
  }
}

async function saveManifest(set) {
  const payload = {
    _note:
      "Fichier généré automatiquement. Liste les photos déjà watermarkées pour éviter les doublons au re-run.",
    watermarked: [...set].sort(),
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(payload, null, 2) + "\n");
}

// Cible 10% de la largeur de la photo, bornée pour rester lisible
// et ne jamais dominer la composition. Aspect ratio 150:24 = 6.25:1.
// Cible ~11% de la largeur de la photo, bornée pour rester lisible
// sans dominer. Aspect ratio 150:24 = 6.25:1. Photos < 320 px sautent.
const WATERMARK_TARGET_RATIO = 0.11;
const WATERMARK_MIN_WIDTH = 85;
const WATERMARK_MAX_WIDTH = 220;
const WATERMARK_MIN_PHOTO_WIDTH = 320;
const WATERMARK_ASPECT = 24 / 150;

function computeWatermarkSize(photoWidth) {
  const targetW = photoWidth * WATERMARK_TARGET_RATIO;
  const w = Math.round(
    Math.min(WATERMARK_MAX_WIDTH, Math.max(WATERMARK_MIN_WIDTH, targetW)),
  );
  const h = Math.round(w * WATERMARK_ASPECT);
  return { w, h };
}

function computeWatermarkPadding(photoWidth) {
  return Math.max(12, Math.round(photoWidth * 0.014));
}

function watermarkSvg(renderWidth, renderHeight) {
  // Le viewBox interne reste 150×24 pour garder les proportions internes
  // (bandeau, barre jaune, lettrage). La taille rendue est ajustée par photo.
  return Buffer.from(
    `<svg width="${renderWidth}" height="${renderHeight}" viewBox="0 0 150 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
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

async function processOne(filePath, manifest) {
  const rel = path.relative(ROOT, filePath);
  const originalSize = (await fs.stat(filePath)).size;
  const meta = await sharp(filePath, { failOn: "none" }).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const longest = Math.max(w, h);
  const needsResize = longest > MAX_DIMENSION;
  const isLowRes = longest > 0 && longest < MIN_DIMENSION_WARN;
  const mustReject = longest > 0 && longest < MIN_DIMENSION_REJECT;
  const alreadyWatermarked = manifest.has(rel);

  if (mustReject) {
    const rejectDir = path.join(ROOT, "_rejects", path.dirname(rel));
    await fs.mkdir(rejectDir, { recursive: true });
    const rejectPath = path.join(rejectDir, path.basename(rel));
    await fs.rename(filePath, rejectPath);
    manifest.delete(rel);
    return {
      action: "REJECT",
      path: rejectPath,
      originalSize,
      newSize: originalSize,
      dims: `${w}×${h}`,
      lowRes: true,
      watermarked: false,
    };
  }

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

  // Watermark UNIQUEMENT si la photo n'a pas déjà été traitée (via manifest).
  // Taille proportionnelle à la largeur de la photo.
  const { w: wmW, h: wmH } = computeWatermarkSize(finalW);
  const wmPad = computeWatermarkPadding(finalW);
  const canFitWatermark =
    finalW >= WATERMARK_MIN_PHOTO_WIDTH &&
    finalW >= wmW + 2 * wmPad &&
    finalH >= wmH + 2 * wmPad;
  const applyWatermark = canFitWatermark && !alreadyWatermarked;

  if (applyWatermark) {
    pipeline = pipeline.composite([
      {
        input: watermarkSvg(wmW, wmH),
        top: finalH - wmH - wmPad,
        left: finalW - wmW - wmPad,
      },
    ]);
  }

  pipeline = pipeline.jpeg({
    quality: JPEG_QUALITY,
    mozjpeg: true,
    progressive: true,
  });

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
    const targetRel = path.relative(ROOT, target);
    if (applyWatermark) manifest.add(targetRel);
    return {
      action,
      path: target,
      originalSize,
      newSize: buffer.length,
      dims: `${w}×${h}`,
      lowRes: isLowRes,
      watermarked: applyWatermark,
    };
  }

  return {
    action,
    path: filePath,
    originalSize,
    newSize: originalSize,
    dims: `${w}×${h}`,
    lowRes: isLowRes,
    watermarked: false,
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

  const manifest = await loadManifest();

  console.log(`Compression de ${files.length} fichier(s)...\n`);
  let totalBefore = 0;
  let totalAfter = 0;
  const lowResList = [];

  for (const file of files) {
    try {
      const result = await processOne(file, manifest);
      totalBefore += result.originalSize;
      totalAfter += result.newSize;
      const rel = path.relative(ROOT, result.path);
      const flag = result.lowRes ? " ⚠ basse résolution" : "";
      const wm = result.watermarked ? " ✓ watermark" : "";
      console.log(
        `  [${result.action.padEnd(8)}] ${rel.padEnd(40)} ${result.dims.padEnd(11)} ${fmt(
          result.originalSize,
        )} → ${fmt(result.newSize)}${wm}${flag}`,
      );
      if (result.lowRes) lowResList.push(rel);
    } catch (err) {
      console.error(`  [ERROR]    ${path.relative(ROOT, file)} — ${err.message}`);
    }
  }

  await saveManifest(manifest);

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
