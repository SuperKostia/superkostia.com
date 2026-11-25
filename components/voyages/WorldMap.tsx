import "server-only";

import { geoArea, geoBounds, geoContains, geoDistance, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import topology from "world-atlas/countries-110m.json";
import type { Topology } from "topojson-specification";

import { ALPHA2_TO_NUMERIC } from "@/lib/iso-countries";
import type { NomadsCountry, NomadsTrip } from "@/lib/nomads";
import type { Photo } from "@/lib/photos";
import type { Lang } from "@/lib/i18n";
import { CarteVoyages, type DonneesCarte, type PhotoCarte, type PointCarte } from "./CarteVoyages";

/**
 * Carte des voyages (MapLibre, fond OpenFreeMap). Ici, au build : séjours
 * regroupés par ville, photos rattachées à la ville la plus proche ou
 * regroupées en « lieux photo », cadre de zoom de chaque pays. Les contours
 * des pays visités arrivent à part (app/donnees/pays-visites).
 */

/** Rayon sous lequel une photo est rattachée à une ville de nomads.com. */
const RAYON_VILLE_KM = 60;
const RAYON_TERRE_KM = 6371;

const topo = topology as unknown as Topology;
const countriesFC = feature(topo, topo.objects.countries) as FeatureCollection<
  Geometry,
  GeoJsonProperties
>;

/** Antarctique (ISO 010) retiré : personne n'y est allé. */
const PAYS = countriesFC.features.filter((f) => String(f.id ?? "") !== "010");

const NUMERIC_TO_ALPHA2: Record<string, string> = Object.fromEntries(
  Object.entries(ALPHA2_TO_NUMERIC).map(([a2, num]) => [num, a2]),
);

const r2 = (n: number) => Math.round(n * 100) / 100;

function km(a: [number, number], b: [number, number]): number {
  return geoDistance(a, b) * RAYON_TERRE_KM;
}

/** Pour zoomer sur un pays : sa plus grande terre (la France sans la Guyane, les États-Unis sans l'Alaska). */
function plusGrandeTerre(f: Feature<Geometry, GeoJsonProperties>): Feature<Geometry, GeoJsonProperties> {
  if (f.geometry?.type !== "MultiPolygon") return f;
  let meilleure = f.geometry.coordinates[0];
  let aire = -1;
  for (const poly of f.geometry.coordinates) {
    const a = geoArea({ type: "Polygon", coordinates: poly });
    if (a > aire) {
      aire = a;
      meilleure = poly;
    }
  }
  return { ...f, geometry: { type: "Polygon", coordinates: meilleure } };
}

type WorldMapProps = {
  trips: NomadsTrip[];
  countries: NomadsCountry[];
  photos: Array<Photo & { serie: string }>;
  lang: Lang;
};

type PointCalcul = PointCarte & { n?: number };

export function WorldMap({ trips, countries, photos, lang }: WorldMapProps) {
  const visites = new Map(countries.map((c) => [c.code.toUpperCase(), c.visitCount]));

  // Villes : un point par nom de lieu dans un pays (nomads.com donne parfois
  // deux coordonnées pour la même ville).
  const villes = new Map<string, PointCalcul>();
  for (const t of trips) {
    const pays = (t.country_code ?? "").toUpperCase();
    const cle = `${pays}|${t.place}`;
    let p = villes.get(cle);
    if (!p) {
      p = {
        id: `ville-${pays}-${t.place}`,
        type: "ville",
        nom: t.place,
        pays,
        lng: r2(t.longitude),
        lat: r2(t.latitude),
        sejours: [],
        photos: [],
      };
      villes.set(cle, p);
    }
    p.sejours.push({ debut: t.date_start, fin: t.date_end, jours: parseInt(t.length, 10) || 0 });
  }
  const listeVilles = [...villes.values()];

  // Photos : à la ville la plus proche (< 60 km), sinon en « lieux photo »
  // par cellule de 0,5°.
  const photosCarte: PhotoCarte[] = [];
  const lieuxPhoto = new Map<string, PointCalcul & { n: number }>();
  for (const ph of photos) {
    if (!ph.lieu) continue;
    const pos: [number, number] = [ph.lieu.lng, ph.lieu.lat];
    const feat = PAYS.find((f) => geoContains(f, pos));
    let plusProche: PointCalcul | undefined;
    let distance = Infinity;
    for (const v of listeVilles) {
      const d = km(pos, [v.lng, v.lat]);
      if (d < distance) {
        distance = d;
        plusProche = v;
      }
    }
    const pays =
      (feat && NUMERIC_TO_ALPHA2[String(feat.id ?? "")]) ||
      (plusProche && distance < 400 ? plusProche.pays : "");

    const id = `${ph.seriesSlug}/${ph.filename}`;
    photosCarte.push({
      id,
      src: ph.src,
      alt: ph.alt,
      largeur: ph.width,
      hauteur: ph.height,
      flou: ph.blurDataURL,
      serie: ph.serie,
      date: ph.exif?.takenAt,
      pays,
    });

    if (plusProche && distance <= RAYON_VILLE_KM) {
      plusProche.photos.push(id);
      continue;
    }
    const cle = `${Math.round(pos[1] * 2) / 2},${Math.round(pos[0] * 2) / 2}`;
    let lieu = lieuxPhoto.get(cle);
    if (!lieu) {
      lieu = {
        id: `photo-${cle}`,
        type: "photo",
        nom: "",
        pays,
        lng: 0,
        lat: 0,
        sejours: [],
        photos: [],
        n: 0,
        proche: plusProche ? { nom: plusProche.nom, km: Math.round(distance) } : undefined,
      };
      lieuxPhoto.set(cle, lieu);
    }
    lieu.photos.push(id);
    lieu.lng += pos[0];
    lieu.lat += pos[1];
    lieu.n += 1;
  }
  for (const l of lieuxPhoto.values()) {
    l.lng = r2(l.lng / l.n);
    l.lat = r2(l.lat / l.n);
  }

  // Pays cliquables : visités ou avec des photos, avec leur cadre de zoom.
  const codesUtiles = new Set([...visites.keys(), ...photosCarte.map((p) => p.pays).filter(Boolean)]);
  const pays: DonneesCarte["pays"] = [];
  for (const f of PAYS) {
    const code = NUMERIC_TO_ALPHA2[String(f.id ?? "")];
    if (!code || !codesUtiles.has(code)) continue;
    const [[w, s], [e, n]] = geoBounds(plusGrandeTerre(f));
    pays.push({
      code,
      nomAnglais: String(f.properties?.name ?? code),
      visite: visites.has(code),
      visites: visites.get(code) ?? 0,
      cadre: [r2(w), r2(s), r2(e), r2(n)],
    });
  }

  const sansCalcul = (p: PointCalcul): PointCarte => {
    const copie = { ...p };
    delete copie.n;
    return copie;
  };

  const donnees: DonneesCarte = {
    pays,
    points: [...listeVilles.map(sansCalcul), ...[...lieuxPhoto.values()].map(sansCalcul)],
    photos: photosCarte,
  };

  return (
    <CarteVoyages
      donnees={donnees}
      lang={lang}
      repli={
        <CarteMiniature
          visites={[...visites.keys()]}
          ariaLabel={lang === "en" ? "World map of Kostia's travels" : "Carte du monde des voyages de Kostia"}
        />
      }
    />
  );
}

/* ---------- Version statique (vignette Hobbies, et repli sans WebGL) ---------- */

const projection = geoEqualEarth().scale(170).translate([480, 260]);
const pathGen = geoPath(projection).digits(1);

export function CarteMiniature({ visites, ariaLabel }: { visites: string[]; ariaLabel: string }) {
  const codes = new Set(visites.map((c) => ALPHA2_TO_NUMERIC[c.toUpperCase()]).filter(Boolean));
  return (
    <svg viewBox="0 24 960 422" className="block h-auto w-full" role="img" aria-label={ariaLabel}>
      {PAYS.map((f, i) => {
        const d = pathGen(f);
        if (!d) return null;
        const id = String(f.id ?? "");
        return (
          <path
            key={id || `anon-${i}`}
            d={d}
            fill={codes.has(id) ? "var(--color-accent)" : "var(--color-ink-surface)"}
            stroke="var(--color-ink)"
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
