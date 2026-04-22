import "server-only";

import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import topology from "world-atlas/countries-110m.json";
import type { Topology } from "topojson-specification";

import { ALPHA2_TO_NUMERIC } from "@/lib/iso-countries";
import type { NomadsTrip } from "@/lib/nomads";
import { WaterField } from "@/components/ui/WaterField";

type WorldMapProps = {
  trips: NomadsTrip[];
  visitedAlpha2: string[];
};

const WIDTH = 960;
const HEIGHT = 500;

const topo = topology as unknown as Topology;
const countriesFC = feature(
  topo,
  topo.objects.countries,
) as FeatureCollection<Geometry, GeoJsonProperties>;

const projection = geoEqualEarth()
  .scale(170)
  .translate([WIDTH / 2, HEIGHT / 2 + 10]);
const pathGen = geoPath(projection);

export function WorldMap({ trips, visitedAlpha2 }: WorldMapProps) {
  const visitedNumeric = new Set(
    visitedAlpha2
      .map((code) => ALPHA2_TO_NUMERIC[code.toUpperCase()])
      .filter(Boolean),
  );

  const dedupedPlaces = new Map<
    string,
    { lat: number; lng: number; place: string; country: string; count: number }
  >();
  for (const t of trips) {
    const key = `${t.latitude.toFixed(2)},${t.longitude.toFixed(2)}`;
    const existing = dedupedPlaces.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      dedupedPlaces.set(key, {
        lat: t.latitude,
        lng: t.longitude,
        place: t.place,
        country: t.country,
        count: 1,
      });
    }
  }

  return (
    <div className="relative isolate overflow-hidden border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <WaterField density={4} />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full"
        role="img"
        aria-label="Carte du monde des voyages de Kostia"
      >
        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          fill="transparent"
        />

        <g>
          {countriesFC.features.map((f, i) => {
            const d = pathGen(f);
            if (!d) return null;
            const id = String(f.id ?? "");
            const isVisited = visitedNumeric.has(id);
            // Certaines features de world-atlas n'ont pas d'`id` (ex. Antarctique).
            // On fallback sur l'index pour garantir l'unicité de la key React.
            return (
              <path
                key={id || `anon-${i}`}
                d={d}
                fill={
                  isVisited ? "var(--color-fg)" : "var(--color-bg)"
                }
                stroke="var(--color-border)"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>

        <g>
          {[...dedupedPlaces.values()].map((p) => {
            const xy = projection([p.lng, p.lat]);
            if (!xy) return null;
            const [x, y] = xy;
            const size = 5 + Math.min(6, p.count * 0.8);
            return (
              <g key={`${p.place}-${p.lat}-${p.lng}`}>
                <rect
                  x={x - size / 2}
                  y={y - size / 2}
                  width={size}
                  height={size}
                  fill="var(--color-accent)"
                  stroke="var(--color-border)"
                  strokeWidth={1.25}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${p.place}, ${p.country}${
                    p.count > 1 ? ` · ${p.count}×` : ""
                  }`}</title>
                </rect>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
