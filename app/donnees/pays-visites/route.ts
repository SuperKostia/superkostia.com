import { feature } from "topojson-client";
import type { FeatureCollection, Geometry, GeoJsonProperties, Position } from "geojson";
import topology from "world-atlas/countries-50m.json";
import type { Topology } from "topojson-specification";
import { ALPHA2_TO_NUMERIC } from "@/lib/iso-countries";
import { getNomadsProfile } from "@/lib/nomads";

/**
 * Contours des pays visités (Natural Earth 1:50m), pour la carte MapLibre des
 * voyages. Seuls les pays visités partent.
 * Coordonnées arrondies à 0,01° pour alléger.
 */
export const revalidate = 3600;

const NUMERIC_TO_ALPHA2: Record<string, string> = Object.fromEntries(
  Object.entries(ALPHA2_TO_NUMERIC).map(([a2, num]) => [num, a2]),
);

type Coords = Position | Coords[];
const arrondir = (c: Coords): Coords =>
  typeof c[0] === "number"
    ? [Math.round((c[0] as number) * 100) / 100, Math.round((c[1] as number) * 100) / 100]
    : (c as Coords[]).map(arrondir);

/**
 * Les terres qui traversent la ligne de changement de date (Chukotka russe,
 * îles Aléoutiennes, Fidji) ont des anneaux qui sautent de +180 à -180 :
 * MapLibre les tire alors d'un bord à l'autre de la carte. On décale les
 * longitudes négatives de +360 dans ces anneaux-là pour garder un tracé continu.
 */
function recoudreAnneau(anneau: Position[]): Position[] {
  const traverse = anneau.some((p, i) => i > 0 && Math.abs(p[0] - anneau[i - 1][0]) > 180);
  return traverse ? anneau.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]) : anneau;
}

function recoudre(geometrie: Geometry): Geometry {
  if (geometrie.type === "Polygon") return { ...geometrie, coordinates: geometrie.coordinates.map(recoudreAnneau) };
  if (geometrie.type === "MultiPolygon")
    return { ...geometrie, coordinates: geometrie.coordinates.map((poly) => poly.map(recoudreAnneau)) };
  return geometrie;
}

export async function GET() {
  const nomads = await getNomadsProfile();
  const utiles = new Set<string>(nomads?.countries.map((c) => c.code.toUpperCase()) ?? []);

  const topo = topology as unknown as Topology;
  const fc = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, GeoJsonProperties>;
  const features = fc.features
    .map((f) => ({ f, code: NUMERIC_TO_ALPHA2[String(f.id ?? "")] }))
    .filter(({ code }) => code && utiles.has(code))
    .map(({ f, code }) => ({
      type: "Feature" as const,
      properties: { code },
      geometry: (() => {
        const g = recoudre(f.geometry);
        return g.type === "Polygon" || g.type === "MultiPolygon"
          ? { type: g.type, coordinates: arrondir(g.coordinates as Coords) }
          : g;
      })(),
    }));

  return Response.json(
    { type: "FeatureCollection", features },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
