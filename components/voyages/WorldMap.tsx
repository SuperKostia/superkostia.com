import "server-only";

import { geoArea, geoContains, geoDistance, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import topology from "world-atlas/countries-110m.json";
import type { Topology } from "topojson-specification";

import { ALPHA2_TO_NUMERIC } from "@/lib/iso-countries";
import type { NomadsCountry, NomadsTrip } from "@/lib/nomads";
import type { Photo } from "@/lib/photos";
import type { Lang } from "@/lib/i18n";
import {
  CarteVoyages,
  type DonneesCarte,
  type PaysCarte,
  type PhotoCarte,
  type PointCarte,
} from "./CarteVoyages";

/**
 * Carte des voyages : tout le calcul géographique se fait ici, au build
 * (projection, tracés, rattachement des photos aux villes). Le composant
 * client ne reçoit que des tracés et des coordonnées prêtes à dessiner.
 */

const WIDTH = 960;
const HEIGHT = 500;
/** Rayon sous lequel une photo est rattachée à une ville de nomads.com. */
const RAYON_VILLE_KM = 60;
const RAYON_TERRE_KM = 6371;

const topo = topology as unknown as Topology;
const countriesFC = feature(topo, topo.objects.countries) as FeatureCollection<
  Geometry,
  GeoJsonProperties
>;

/** Antarctique (ISO 010) retiré : personne n'y est allé, et il mangeait le bas du cadre. */
const PAYS = countriesFC.features.filter((f) => String(f.id ?? "") !== "010");

const NUMERIC_TO_ALPHA2: Record<string, string> = Object.fromEntries(
  Object.entries(ALPHA2_TO_NUMERIC).map(([a2, num]) => [num, a2]),
);

const projection = geoEqualEarth().scale(170).translate([WIDTH / 2, HEIGHT / 2 + 10]);
const pathGen = geoPath(projection).digits(1);

const r1 = (n: number) => Math.round(n * 10) / 10;

function paysDuPoint(lng: number, lat: number): Feature<Geometry, GeoJsonProperties> | undefined {
  return PAYS.find((f) => geoContains(f, [lng, lat]));
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

function km(a: [number, number], b: [number, number]): number {
  return geoDistance(a, b) * RAYON_TERRE_KM;
}

/** Retire les champs de calcul (lng, lat, n) avant l'envoi au client. */
function sansCoordonnees(p: PointCarte & { lng: number; lat: number; n?: number }): PointCarte {
  return {
    id: p.id,
    type: p.type,
    nom: p.nom,
    pays: p.pays,
    x: p.x,
    y: p.y,
    sejours: p.sejours,
    photos: p.photos,
    ...(p.proche ? { proche: p.proche } : {}),
  };
}

type WorldMapProps = {
  trips: NomadsTrip[];
  countries: NomadsCountry[];
  photos: Array<Photo & { serie: string }>;
  lang: Lang;
};

export function WorldMap({ trips, countries, photos, lang }: WorldMapProps) {
  const visites = new Map(countries.map((c) => [c.code.toUpperCase(), c.visitCount]));

  // Villes : un point par lieu (coordonnées arrondies), avec ses séjours.
  const points = new Map<string, PointCarte & { lng: number; lat: number }>();
  for (const t of trips) {
    // Un lieu = un nom dans un pays : nomads.com donne parfois deux coordonnées pour la même ville.
    const cle = `${(t.country_code ?? "").toUpperCase()}|${t.place}`;
    let p = points.get(cle);
    if (!p) {
      const xy = projection([t.longitude, t.latitude]);
      if (!xy) continue;
      p = {
        id: `${t.latitude.toFixed(2)},${t.longitude.toFixed(2)}`,
        type: "ville",
        nom: t.place,
        pays: (t.country_code ?? "").toUpperCase(),
        x: r1(xy[0]),
        y: r1(xy[1]),
        sejours: [],
        photos: [],
        lng: t.longitude,
        lat: t.latitude,
      };
      points.set(cle, p);
    }
    p.sejours.push({
      debut: t.date_start,
      fin: t.date_end,
      jours: parseInt(t.length, 10) || 0,
    });
  }
  const villes = [...points.values()];

  // Photos : rattachées à la ville la plus proche (< 60 km), sinon regroupées
  // en « lieux photo » par cellule de 0,5°.
  const photosCarte: PhotoCarte[] = [];
  const lieuxPhoto = new Map<string, PointCarte & { lng: number; lat: number; n: number }>();
  for (const ph of photos) {
    if (!ph.lieu) continue;
    const pos: [number, number] = [ph.lieu.lng, ph.lieu.lat];
    const feat = paysDuPoint(pos[0], pos[1]);
    let plusProche: (typeof villes)[number] | undefined;
    let distance = Infinity;
    for (const v of villes) {
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
        x: 0,
        y: 0,
        sejours: [],
        photos: [],
        lng: 0,
        lat: 0,
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
    const xy = projection([l.lng / l.n, l.lat / l.n]);
    if (xy) {
      l.x = r1(xy[0]);
      l.y = r1(xy[1]);
    }
  }

  const paysCarte: PaysCarte[] = [];
  for (const f of PAYS) {
    const d = pathGen(f);
    if (!d) continue;
    const num = String(f.id ?? "");
    const a2 = NUMERIC_TO_ALPHA2[num] ?? "";
    const visite = a2 ? visites.has(a2) : false;
    const avecPhotos = a2 ? photosCarte.some((p) => p.pays === a2) : false;
    const b = pathGen.bounds(plusGrandeTerre(f));
    paysCarte.push({
      id: num || `anon-${paysCarte.length}`,
      code: a2,
      nomAnglais: String(f.properties?.name ?? ""),
      d,
      visite,
      visites: a2 ? (visites.get(a2) ?? 0) : 0,
      actif: visite || avecPhotos,
      cadre: [r1(b[0][0]), r1(b[0][1]), r1(b[1][0]), r1(b[1][1])],
    });
  }

  const donnees: DonneesCarte = {
    pays: paysCarte,
    points: [
      ...villes.map(sansCoordonnees),
      ...[...lieuxPhoto.values()].map(sansCoordonnees),
    ],
    photos: photosCarte,
  };

  return <CarteVoyages donnees={donnees} lang={lang} />;
}

/** Version statique et muette de la carte (vignette de la page Hobbies). */
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
