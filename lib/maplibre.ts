/**
 * Point d'entrée unique de MapLibre côté navigateur (comme sur les autres
 * sites). Depuis la v6, la bibliothèque cherche son worker à côté de son
 * propre fichier, ce qui ne tient pas une fois empaqueté par Next : le
 * worker est servi depuis public/vendor/maplibre-gl-<version>/ (copié par
 * scripts/copier-maplibre.mjs). Le chemin suit la version installée : une
 * mise à jour sans copie se voit tout de suite (worker introuvable).
 *
 * À importer uniquement depuis un composant client, en import dynamique.
 */
import { getVersion, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(`/vendor/maplibre-gl-${getVersion()}/maplibre-gl-worker.mjs`);

export * from "maplibre-gl";
