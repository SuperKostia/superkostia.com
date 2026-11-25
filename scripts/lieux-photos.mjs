#!/usr/bin/env node
/**
 * Range la position arrondie de chaque photo dans lib/data/photos-lieux.json
 * et retire le GPS des photos publiées. Aussi lancé à la fin de compress:photos.
 *
 * Usage : node scripts/lieux-photos.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { mettreAJourLieux } from "./lib/lieux-photos.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const r = await mettreAJourLieux({
  racine: path.join(ROOT, "public", "images", "photographie"),
  sources: path.join(ROOT, ".source-photos"),
  sortie: path.join(ROOT, "lib", "data", "photos-lieux.json"),
});
console.log(`${r.places}/${r.total} photos situées ; GPS retiré de ${r.nettoyees} fichier(s).`);
