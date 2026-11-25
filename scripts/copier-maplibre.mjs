#!/usr/bin/env node
/**
 * Copie le worker de MapLibre (version installée) dans
 * public/vendor/maplibre-gl-<version>/, d'où la carte des voyages le charge
 * (cf. lib/maplibre.ts). À relancer après chaque mise à jour de maplibre-gl.
 *
 * Usage : node scripts/copier-maplibre.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const pkg = require("maplibre-gl/package.json");
const source = path.join(ROOT, "node_modules", "maplibre-gl");
const dest = path.join(ROOT, "public", "vendor", `maplibre-gl-${pkg.version}`);

await fs.mkdir(dest, { recursive: true });
await fs.copyFile(path.join(source, "dist", "maplibre-gl-worker.mjs"), path.join(dest, "maplibre-gl-worker.mjs"));
await fs.copyFile(path.join(source, "LICENSE.txt"), path.join(dest, "LICENSE.txt"));
console.log(`MapLibre ${pkg.version} : worker copié dans ${path.relative(ROOT, dest)}/`);
