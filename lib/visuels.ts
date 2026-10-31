import "server-only";

import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");

function siPresent(chemin: string): string | undefined {
  return fs.existsSync(path.join(PUBLIC, chemin)) ? chemin : undefined;
}

/** Capture de la home du site du projet (scripts/screenshot-projets.mjs). */
export function captureProjet(slug: string): string | undefined {
  return siPresent(`/images/projets/${slug}.jpg`);
}

/** Favicon / logo du site du projet (scripts/fetch-logos.mjs). */
export function logoProjet(slug: string): string | undefined {
  return siPresent(`/images/logos/${slug}.png`);
}
