#!/usr/bin/env node
/**
 * Pipeline photos source → processed.
 *
 * SOURCE  : .source-photos/<serie>/*.jpg (gitignoré, originaux iPhone intacts)
 * PROCESSED : public/images/photographie/<serie>/*.jpg (commité, servi par Vercel)
 *
 * Usage : npm run compress:photos
 *
 * Pour chaque source :
 *  - Redimensionne à 2400 px (côté le plus long) en gardant le ratio
 *  - Réencode en JPEG qualité 82 avec mozjpeg progressive
 *  - Watermark SUPERKOSTIA proportionnel (~11% de la largeur) en bas-droite
 *  - Préserve EXIF (focale, vitesse, ouverture, ISO, date)
 *  - Skip si la source n'a pas changé depuis le dernier run (mtime tracké dans le manifest)
 *
 * Idempotent : re-runs → rien ne bouge. Remplace un source par une nouvelle version → détecte mtime → reprocess.
 * Photos < 1000 px → déplacées dans .source-photos/_rejects/<serie>/ (à re-exporter Actual Size iPhone).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const SOURCE_ROOT = path.join(PROJECT_ROOT, ".source-photos");
const DEST_ROOT = path.join(
  PROJECT_ROOT,
  "public",
  "images",
  "photographie",
);
const MANIFEST_PATH = path.join(DEST_ROOT, ".processed.json");
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
    return typeof data.entries === "object" && data.entries !== null
      ? data.entries
      : {};
  } catch {
    return {};
  }
}

async function saveManifest(entries) {
  const sorted = Object.keys(entries)
    .sort()
    .reduce((acc, k) => {
      acc[k] = entries[k];
      return acc;
    }, {});
  const payload = {
    _note:
      "Généré par compress-photos.mjs. Clé = path relatif dans public/images/photographie/, mtime = timestamp du source dans .source-photos/.",
    entries: sorted,
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(payload, null, 2) + "\n");
}

// Cible 10% de la largeur de la photo, bornée pour rester lisible
// et ne jamais dominer la composition. Aspect ratio 150:24 = 6.25:1.
// Cible ~9% du côté LE PLUS LONG de la photo. Calculé sur longest plutôt
// que sur width pour que les portraits et paysages aient un watermark
// source identique (tant que longest est le même après resize).
// Aspect ratio watermark 150:24 = 6.25:1.
const WATERMARK_TARGET_RATIO = 0.09;
const WATERMARK_MIN_WIDTH = 90;
const WATERMARK_MAX_WIDTH = 220;
const WATERMARK_MIN_PHOTO_LONGEST = 600;
const WATERMARK_ASPECT = 24 / 150;

function computeWatermarkSize(photoLongest) {
  const targetW = photoLongest * WATERMARK_TARGET_RATIO;
  const w = Math.round(
    Math.min(WATERMARK_MAX_WIDTH, Math.max(WATERMARK_MIN_WIDTH, targetW)),
  );
  const h = Math.round(w * WATERMARK_ASPECT);
  return { w, h };
}

function computeWatermarkPadding(photoLongest) {
  return Math.max(12, Math.round(photoLongest * 0.012));
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
      if (entry.name.startsWith("_")) continue;
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

async function processOne(sourcePath, manifest) {
  const rel = path.relative(SOURCE_ROOT, sourcePath).replace(/\\/g, "/");
  const destPath = path.join(DEST_ROOT, rel).replace(/\.png$/i, ".jpg");
  const destRel = path.relative(DEST_ROOT, destPath).replace(/\\/g, "/");
  const sourceStat = await fs.stat(sourcePath);
  const sourceMtime = sourceStat.mtimeMs;
  const originalSize = sourceStat.size;

  // Idempotence : si manifest a la même mtime ET que le dest existe, skip.
  const cached = manifest[destRel];
  const destExists = await fs
    .access(destPath)
    .then(() => true)
    .catch(() => false);
  if (cached && cached.mtime === sourceMtime && destExists) {
    return {
      action: "skip",
      path: destPath,
      originalSize,
      newSize: (await fs.stat(destPath)).size,
      dims: cached.dims ?? "?×?",
      lowRes: false,
      watermarked: true,
    };
  }

  const meta = await sharp(sourcePath, { failOn: "none" }).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const longest = Math.max(w, h);
  const needsResize = longest > MAX_DIMENSION;
  const isLowRes = longest > 0 && longest < MIN_DIMENSION_WARN;
  const mustReject = longest > 0 && longest < MIN_DIMENSION_REJECT;

  if (mustReject) {
    // Déplace la source vers .source-photos/_rejects/<serie>/ — le dest
    // n'est pas modifié (si une ancienne version y existait, elle reste)
    const rejectDir = path.join(SOURCE_ROOT, "_rejects", path.dirname(rel));
    await fs.mkdir(rejectDir, { recursive: true });
    const rejectPath = path.join(rejectDir, path.basename(rel));
    await fs.rename(sourcePath, rejectPath);
    delete manifest[destRel];
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

  let pipeline = sharp(sourcePath, { failOn: "none" }).withMetadata();
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

  // Watermark systématique (source non touchée, donc zéro risque de doublage).
  // Taille basée sur le côté le plus long → même pixel-size source quelle
  // que soit l'orientation, du moment que les photos sortent toutes de
  // Actual Size iPhone (longest = 2400 après resize).
  const finalLongest = Math.max(finalW, finalH);
  const { w: wmW, h: wmH } = computeWatermarkSize(finalLongest);
  const wmPad = computeWatermarkPadding(finalLongest);
  const canFitWatermark =
    finalLongest >= WATERMARK_MIN_PHOTO_LONGEST &&
    finalW >= wmW + 2 * wmPad &&
    finalH >= wmH + 2 * wmPad;

  if (canFitWatermark) {
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
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buffer);

  manifest[destRel] = {
    mtime: sourceMtime,
    dims: `${finalW}×${finalH}`,
  };

  return {
    action: needsResize ? "resize" : "compress",
    path: destPath,
    originalSize,
    newSize: buffer.length,
    dims: `${w}×${h}`,
    lowRes: isLowRes,
    watermarked: canFitWatermark,
  };
}

async function main() {
  let files;
  try {
    files = await walk(SOURCE_ROOT);
  } catch {
    console.log(
      `Aucun dossier ${SOURCE_ROOT} — crée-le et dépose tes originaux iPhone (Actual Size) dedans.`,
    );
    return;
  }
  if (files.length === 0) {
    console.log(`Aucune photo dans ${SOURCE_ROOT}.`);
    return;
  }

  const manifest = await loadManifest();

  console.log(
    `Traitement de ${files.length} fichier(s) source vers ${path.relative(
      PROJECT_ROOT,
      DEST_ROOT,
    )}/\n`,
  );
  let totalBefore = 0;
  let totalAfter = 0;
  const lowResList = [];

  for (const file of files) {
    try {
      const result = await processOne(file, manifest);
      totalBefore += result.originalSize;
      totalAfter += result.newSize;
      const rel = path.relative(DEST_ROOT, result.path);
      const flag = result.lowRes ? " ⚠ basse résolution" : "";
      const wm = result.watermarked ? " ✓ watermark" : "";
      console.log(
        `  [${result.action.padEnd(8)}] ${rel.padEnd(40)} ${result.dims.padEnd(11)} ${fmt(
          result.originalSize,
        )} → ${fmt(result.newSize)}${wm}${flag}`,
      );
      if (result.lowRes) lowResList.push(rel);
    } catch (err) {
      console.error(
        `  [ERROR]    ${path.relative(SOURCE_ROOT, file)} — ${err.message}`,
      );
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
