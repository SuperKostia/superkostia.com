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
const JPEG_QUALITY = 82;

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
  const needsResize =
    (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION;

  let pipeline = sharp(filePath, { failOn: "none" }).withMetadata();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const buffer = await pipeline.toBuffer();

  // Si le nouveau buffer n'apporte pas de gain réel, on ne touche pas.
  if (buffer.length >= originalSize * 0.95) {
    return { action: "skip", path: filePath, originalSize, newSize: originalSize };
  }

  // Converti les .png en .jpg (le fichier sortant est toujours en JPEG).
  const target = filePath.replace(/\.png$/i, ".jpg");
  await fs.writeFile(target, buffer);
  if (target !== filePath) await fs.unlink(filePath);

  return {
    action: needsResize ? "resize" : "compress",
    path: target,
    originalSize,
    newSize: buffer.length,
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

  for (const file of files) {
    try {
      const result = await processOne(file);
      totalBefore += result.originalSize;
      totalAfter += result.newSize;
      const rel = path.relative(ROOT, result.path);
      console.log(
        `  [${result.action.padEnd(8)}] ${rel.padEnd(40)} ${fmt(
          result.originalSize,
        )} → ${fmt(result.newSize)}`,
      );
    } catch (err) {
      console.error(`  [ERROR]    ${path.relative(ROOT, file)} — ${err.message}`);
    }
  }

  console.log(
    `\nTotal : ${fmt(totalBefore)} → ${fmt(totalAfter)} (${fmt(
      totalBefore - totalAfter,
    )} économisés)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
