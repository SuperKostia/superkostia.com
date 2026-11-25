/**
 * Positions des photos pour la carte des voyages.
 *
 * Lit le GPS de l'original (.source-photos/<serie>/<fichier>), sinon de la
 * photo publiée, l'arrondit à 0,1° (≈ 10 km : la ville, jamais la rue) et
 * range le tout dans lib/data/photos-lieux.json, clé = "<serie>/<fichier>".
 * Puis retire le GPS des photos publiées (cf. exif-sans-gps.mjs).
 */

import fs from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import { retirerGps } from "./exif-sans-gps.mjs";

const arrondi = (v) => Math.round(v * 10) / 10;

async function gpsDe(fichier) {
  try {
    const g = await exifr.gps(fichier);
    if (g && Number.isFinite(g.latitude) && Number.isFinite(g.longitude)) {
      return { lat: arrondi(g.latitude), lng: arrondi(g.longitude) };
    }
  } catch {}
  return null;
}

/**
 * @param {{ racine: string, sources: string, sortie: string }} chemins
 * @returns {Promise<{ total: number, places: number, nettoyees: number }>}
 */
export async function mettreAJourLieux({ racine, sources, sortie }) {
  let ancien = {};
  try {
    ancien = JSON.parse(await fs.readFile(sortie, "utf8")).lieux ?? {};
  } catch {}

  const lieux = {};
  let total = 0;
  let nettoyees = 0;
  const series = await fs.readdir(racine, { withFileTypes: true });
  for (const s of series) {
    if (!s.isDirectory() || s.name.startsWith("_") || s.name.startsWith(".")) continue;
    const dossier = path.join(racine, s.name);
    for (const f of await fs.readdir(dossier)) {
      if (!/\.(jpe?g)$/i.test(f) || f.startsWith(".") || f.startsWith("_")) continue;
      total += 1;
      const cle = `${s.name}/${f}`;
      const publiee = path.join(dossier, f);
      const base = f.replace(/\.[^.]+$/, "");
      let original = null;
      try {
        const candidats = await fs.readdir(path.join(sources, s.name));
        const trouve = candidats.find((c) => c.replace(/\.[^.]+$/, "") === base);
        if (trouve) original = path.join(sources, s.name, trouve);
      } catch {}

      const lieu =
        (original && (await gpsDe(original))) || (await gpsDe(publiee)) || ancien[cle] || null;
      if (lieu) lieux[cle] = lieu;

      const brut = await fs.readFile(publiee);
      const { buffer, modifie } = retirerGps(brut);
      if (modifie) {
        await fs.writeFile(publiee, buffer);
        nettoyees += 1;
      }
    }
  }

  const tri = Object.fromEntries(Object.entries(lieux).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(
    sortie,
    JSON.stringify(
      {
        _note:
          "Généré par scripts/compress-photos.mjs (ou node scripts/lieux-photos.mjs). Position de prise de vue arrondie à 0,1° (≈ 10 km). Les photos publiées n'ont plus de GPS.",
        lieux: tri,
      },
      null,
      2,
    ) + "\n",
  );
  return { total, places: Object.keys(tri).length, nettoyees };
}
