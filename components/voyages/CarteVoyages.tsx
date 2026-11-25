"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Camera, Globe2, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { GeoJSONSource, MapLibreMap as CarteML, MapMouseEvent } from "maplibre-gl";
import { Visionneuse, type PhotoVisionneuse } from "@/components/ui/Visionneuse";
import { chemin, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ---------- Données préparées au build (cf. WorldMap.tsx) ---------- */

export type Sejour = { debut: string; fin: string; jours: number };

export type PointCarte = {
  id: string;
  /** `ville` : un lieu de nomads.com ; `photo` : des photos loin de toute ville connue. */
  type: "ville" | "photo";
  nom: string;
  pays: string;
  lng: number;
  lat: number;
  sejours: Sejour[];
  photos: string[];
  proche?: { nom: string; km: number };
};

export type PaysCarte = {
  code: string;
  nomAnglais: string;
  visite: boolean;
  visites: number;
  /** Cadre [ouest, sud, est, nord] de la plus grande terre du pays, pour zoomer dessus. */
  cadre: [number, number, number, number];
};

export type PhotoCarte = {
  id: string;
  src: string;
  alt: string;
  largeur: number;
  hauteur: number;
  flou: string;
  serie: string;
  date?: string;
  pays: string;
};

export type DonneesCarte = { pays: PaysCarte[]; points: PointCarte[]; photos: PhotoCarte[] };

/* ---------- Textes ---------- */

const TEXTES = {
  fr: {
    aria: "Carte du monde des voyages de Kostia",
    tout: "Tout",
    annees: "Filtrer par année",
    photos: "Photos",
    globe: "Globe",
    zoomPlus: "Zoomer",
    zoomMoins: "Dézoomer",
    recentrer: "Vue d'ensemble",
    gesteMac: "⌘ + molette pour zoomer",
    gesteWindows: "Ctrl + molette pour zoomer",
    gesteMobile: "Deux doigts pour déplacer la carte",
    credits: "Afficher les crédits",
    introTitre: "Clique sur un pays ou une ville.",
    introTexte: "Les séjours, les dates et les photos prises sur place s'ouvrent ici.",
    legendePays: "Pays visité",
    legendeVille: "Ville (plus c'est gros, plus j'y suis retourné)",
    legendePhoto: "Photos prises hors des villes",
    photosPlacees: (n: number) => `${n} photos placées sur la carte`,
    paysVisites: "Pays visités",
    pays: "Pays",
    ville: "Ville",
    lieuPhoto: "Photos",
    fermer: "Fermer",
    voyages: (n: number) => (n > 1 ? `${n} voyages` : "1 voyage"),
    villes: (n: number) => (n > 1 ? `${n} villes` : "1 ville"),
    nbPhotos: (n: number) => (n > 1 ? `${n} photos` : "1 photo"),
    sejours: (n: number) => (n > 1 ? `${n} séjours` : "1 séjour"),
    jours: (n: number) => (n > 1 ? `${n} jours` : "1 jour"),
    joursTotal: (n: number) => `${n} jours au total`,
    autres: (n: number) => `et ${n} autre${n > 1 ? "s" : ""}`,
    pres: (km: number, nom: string) => `Prises à environ ${km} km de ${nom}.`,
    voirPays: "Voir le pays",
    pasDePhoto: "Pas encore de photo d'ici.",
    toutesPhotos: "Toute la galerie",
    villesDuPays: "Villes",
    photosDuLieu: "Photos",
    datesSejours: "Séjours",
    precedente: "Photo précédente",
    suivante: "Photo suivante",
  },
  en: {
    aria: "World map of Kostia's travels",
    tout: "All",
    annees: "Filter by year",
    photos: "Photos",
    globe: "Globe",
    zoomPlus: "Zoom in",
    zoomMoins: "Zoom out",
    recentrer: "Whole world",
    gesteMac: "Use ⌘ + scroll to zoom",
    gesteWindows: "Use Ctrl + scroll to zoom",
    gesteMobile: "Use two fingers to move the map",
    credits: "Show credits",
    introTitre: "Click a country or a city.",
    introTexte: "Stays, dates and the photos taken there open here.",
    legendePays: "Visited country",
    legendeVille: "City (the bigger, the more often I went back)",
    legendePhoto: "Photos taken away from cities",
    photosPlacees: (n: number) => `${n} photos placed on the map`,
    paysVisites: "Visited countries",
    pays: "Country",
    ville: "City",
    lieuPhoto: "Photos",
    fermer: "Close",
    voyages: (n: number) => (n > 1 ? `${n} trips` : "1 trip"),
    villes: (n: number) => (n > 1 ? `${n} cities` : "1 city"),
    nbPhotos: (n: number) => (n > 1 ? `${n} photos` : "1 photo"),
    sejours: (n: number) => (n > 1 ? `${n} stays` : "1 stay"),
    jours: (n: number) => (n > 1 ? `${n} days` : "1 day"),
    joursTotal: (n: number) => `${n} days in total`,
    autres: (n: number) => `and ${n} more`,
    pres: (km: number, nom: string) => `Taken about ${km} km from ${nom}.`,
    voirPays: "See the country",
    pasDePhoto: "No photo from here yet.",
    toutesPhotos: "The whole gallery",
    villesDuPays: "Cities",
    photosDuLieu: "Photos",
    datesSejours: "Stays",
    precedente: "Previous photo",
    suivante: "Next photo",
  },
};

/* ---------- Carte ---------- */

/** Fond OpenFreeMap, comme sur les autres sites ; « dark » quand le site est en sombre. */
const STYLES = {
  clair: "https://tiles.openfreemap.org/styles/positron",
  sombre: "https://tiles.openfreemap.org/styles/dark",
};

const ROSE = "#ffbcca";
const ROSE_FRANC = "#ff91ac";
const ROSE_VILLE = "#ff5a8c";
const ENCRE = "#161616";

const COUCHES_POINTS = ["villes", "lieux-photo"];

const annee = (iso: string) => parseInt(iso.slice(0, 4), 10);
const sombreActif = () => document.documentElement.classList.contains("dark");
const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Selection = { type: "pays"; code: string } | { type: "point"; id: string } | null;
type Survol = { titre: string; sous?: string; x: number; y: number } | null;
type Cible = { type: "point"; id: string } | { type: "pays"; code: string } | null;

export function CarteVoyages({
  donnees,
  lang,
  repli,
}: {
  donnees: DonneesCarte;
  lang: Lang;
  /** Carte fixe affichée si le navigateur n'a pas WebGL 2. */
  repli: React.ReactNode;
}) {
  const t = TEXTES[lang];
  const locale = lang === "en" ? "en-GB" : "fr-FR";

  const [selection, setSelection] = useState<Selection>(null);
  const [anneeChoisie, setAnneeChoisie] = useState<number | null>(null);
  const [photosVisibles, setPhotosVisibles] = useState(true);
  const [globe, setGlobe] = useState(false);
  const [survol, setSurvol] = useState<Survol>(null);
  const [erreur, setErreur] = useState(false);
  const [pret, setPret] = useState(false);
  const [visionneuse, setVisionneuse] = useState<{ liste: PhotoCarte[]; index: number } | null>(
    null,
  );

  const conteneurRef = useRef<HTMLDivElement>(null);
  const pointParIdRef = useRef(new Map<string, PointCarte>());
  const paysParCodeRef = useRef(new Map<string, PaysCarte>());
  const nomPaysRef = useRef<(code: string) => string>((c) => c);
  const choisirPaysRef = useRef<(code: string) => void>(() => {});
  const choisirPointRef = useRef<(p: PointCarte) => void>(() => {});
  const carteRef = useRef<CarteML | null>(null);
  const etat = useRef({ selection, anneeChoisie, photosVisibles, globe });

  /* --- Index --- */

  const nomsPays = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);

  const paysParCode = useMemo(() => new Map(donnees.pays.map((p) => [p.code, p])), [donnees.pays]);
  const pointParId = useMemo(() => new Map(donnees.points.map((p) => [p.id, p])), [donnees.points]);
  const photoParId = useMemo(() => new Map(donnees.photos.map((p) => [p.id, p])), [donnees.photos]);

  const nomPays = useCallback(
    (code: string) => {
      const repliNom = paysParCode.get(code)?.nomAnglais || code;
      if (!code || !nomsPays) return repliNom;
      try {
        return nomsPays.of(code) ?? repliNom;
      } catch {
        return repliNom;
      }
    },
    [nomsPays, paysParCode],
  );

  const annees = useMemo(() => {
    const s = new Set<number>();
    for (const p of donnees.points) for (const sj of p.sejours) s.add(annee(sj.debut));
    return [...s].filter(Number.isFinite).sort((a, b) => b - a);
  }, [donnees.points]);

  const pointActif = useCallback(
    (p: PointCarte, an: number | null) => {
      if (an == null) return true;
      if (p.type === "ville") return p.sejours.some((s) => annee(s.debut) === an || annee(s.fin) === an);
      return p.photos.some((id) => {
        const d = photoParId.get(id)?.date;
        return d ? annee(d) === an : false;
      });
    },
    [photoParId],
  );

  /* --- Données des couches --- */

  const geojsonPoints = useCallback(
    (an: number | null) => ({
      type: "FeatureCollection" as const,
      features: donnees.points.map((p) => ({
        type: "Feature" as const,
        properties: {
          id: p.id,
          type: p.type,
          n: p.sejours.length,
          photos: p.photos.length,
          actif: pointActif(p, an),
        },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      })),
    }),
    [donnees.points, pointActif],
  );

  /** Pays éteints par le filtre d'année (visités, mais pas cette année-là). */
  const paysEteints = useCallback(
    (an: number | null) => {
      if (an == null) return new Set<string>();
      const allumes = new Set(
        donnees.points.filter((p) => p.type === "ville" && pointActif(p, an)).map((p) => p.pays),
      );
      return new Set(donnees.pays.map((p) => p.code).filter((c) => !allumes.has(c)));
    },
    [donnees.pays, donnees.points, pointActif],
  );

  const toutVoir = useCallback(
    (carte: CarteML, anime = true) => {
      if (etat.current.globe) {
        carte.easeTo({ center: [25, 28], zoom: 1.7, duration: anime && !mouvementReduit() ? 900 : 0 });
        return;
      }
      const lngs = donnees.points.map((p) => p.lng);
      const lats = donnees.points.map((p) => p.lat);
      if (!lngs.length) return;
      carte.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 36, maxZoom: 3, animate: anime && !mouvementReduit() },
      );
    },
    [donnees.points],
  );

  /** Reporte l'état React (année, photos, sélection) sur la carte. */
  const appliquerEtat = useCallback(
    (carte: CarteML) => {
      if (!carte.getSource("points")) return;
      const { anneeChoisie: an, photosVisibles: ph, selection: sel } = etat.current;
      (carte.getSource("points") as GeoJSONSource).setData(geojsonPoints(an));
      const eteints = paysEteints(an);
      for (const p of donnees.pays) {
        carte.setFeatureState({ source: "pays", id: p.code }, { eteint: eteints.has(p.code) });
        carte.setFeatureState(
          { source: "pays", id: p.code },
          { choisi: sel?.type === "pays" && sel.code === p.code },
        );
      }
      for (const p of donnees.points) {
        carte.setFeatureState(
          { source: "points", id: p.id },
          { choisi: sel?.type === "point" && sel.id === p.id },
        );
      }
      const vis = ph ? "visible" : "none";
      for (const c of ["lieux-photo", "lieux-photo-centre", "villes-anneau"]) {
        if (carte.getLayer(c)) carte.setLayoutProperty(c, "visibility", vis);
      }
    },
    [donnees.pays, donnees.points, geojsonPoints, paysEteints],
  );

  /** Pose (ou repose, après un changement de thème) les couches du site sur le fond. */
  const ajouterCouches = useCallback(
    (carte: CarteML) => {
      if (carte.getSource("pays")) return;
      const sombre = sombreActif();
      const premierTexte = carte.getStyle().layers.find((l) => l.type === "symbol")?.id;

      carte.addSource("pays", { type: "geojson", data: "/donnees/pays-visites", promoteId: "code" });
      carte.addLayer(
        {
          id: "pays-remplissage",
          type: "fill",
          source: "pays",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "choisi"], false],
              ROSE_FRANC,
              ["boolean", ["feature-state", "survol"], false],
              ROSE_FRANC,
              ROSE,
            ],
            // Les contours (1:50m) s'effacent en zoomant : de près, le fond de
            // carte et ses côtes détaillées prennent le relais.
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              ["case", ["boolean", ["feature-state", "eteint"], false], 0.12, sombre ? 0.5 : 0.62],
              7,
              ["case", ["boolean", ["feature-state", "eteint"], false], 0.04, 0.14],
            ],
          },
        },
        premierTexte,
      );
      carte.addLayer(
        {
          id: "pays-contour",
          type: "line",
          source: "pays",
          paint: {
            "line-color": ROSE_FRANC,
            "line-width": ["case", ["boolean", ["feature-state", "choisi"], false], 2.2, 0.6],
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              ["case", ["boolean", ["feature-state", "eteint"], false], 0.25, 0.9],
              7,
              0,
            ],
          },
        },
        premierTexte,
      );

      carte.addSource("points", {
        type: "geojson",
        data: geojsonPoints(etat.current.anneeChoisie),
        promoteId: "id",
      });
      const opacite = ["case", ["get", "actif"], 1, 0.22] as unknown as number;
      // Lieux photo : carré blanc arrondi façon pastille, point rose au centre.
      carte.addLayer({
        id: "lieux-photo",
        type: "circle",
        source: "points",
        filter: ["==", ["get", "type"], "photo"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 5, 8, 8],
          "circle-color": "#ffffff",
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "choisi"], false],
            ROSE_VILLE,
            ENCRE,
          ],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "choisi"], false], 3, 1.5],
          "circle-opacity": opacite,
          "circle-stroke-opacity": opacite,
        },
      });
      carte.addLayer({
        id: "lieux-photo-centre",
        type: "circle",
        source: "points",
        filter: ["==", ["get", "type"], "photo"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2, 8, 3.2],
          "circle-color": ROSE_VILLE,
          "circle-opacity": opacite,
        },
      });
      // Villes : rose vif, plus grosses quand j'y suis retourné ; anneau blanc si photos.
      const rayon = ["+", 3.6, ["min", 5, ["*", ["get", "n"], 0.55]]];
      carte.addLayer({
        id: "villes-anneau",
        type: "circle",
        source: "points",
        filter: ["all", ["==", ["get", "type"], "ville"], [">", ["get", "photos"], 0]],
        paint: {
          "circle-radius": ["+", rayon, 3] as unknown as number,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": sombre ? "#ffffff" : ENCRE,
          "circle-stroke-width": 1.5,
          "circle-stroke-opacity": opacite,
        },
      });
      carte.addLayer({
        id: "villes",
        type: "circle",
        source: "points",
        filter: ["==", ["get", "type"], "ville"],
        paint: {
          "circle-radius": rayon as unknown as number,
          "circle-color": ROSE_VILLE,
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "choisi"], false],
            sombre ? "#ffffff" : ENCRE,
            sombre ? ENCRE : "#ffffff",
          ],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "choisi"], false], 3, 1.5],
          "circle-opacity": opacite,
          "circle-stroke-opacity": opacite,
        },
      });

      appliquerEtat(carte);
    },
    [geojsonPoints, appliquerEtat],
  );

  /* --- Création de la carte --- */

  useEffect(() => {
    let annule = false;
    let observateur: MutationObserver | null = null;

    (async () => {
      const ml = await import("@/lib/maplibre");
      if (annule || !conteneurRef.current) return;
      let carte: CarteML;
      try {
        carte = new ml.MapLibreMap({
          container: conteneurRef.current,
          style: sombreActif() ? STYLES.sombre : STYLES.clair,
          center: [20, 25],
          zoom: 1.1,
          minZoom: 0.6,
          maxZoom: 15,
          renderWorldCopies: false,
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: { compact: true },
          locale: {
            "CooperativeGesturesHandler.MacHelpText": t.gesteMac,
            "CooperativeGesturesHandler.WindowsHelpText": t.gesteWindows,
            "CooperativeGesturesHandler.MobileHelpText": t.gesteMobile,
            "AttributionControl.ToggleAttribution": t.credits,
          },
        });
      } catch {
        setErreur(true);
        return;
      }
      carte.touchZoomRotate.disableRotation();
      carteRef.current = carte;

      carte.on("style.load", () => {
        if (etat.current.globe) carte.setProjection({ type: "globe" });
        ajouterCouches(carte);
      });
      carte.once("load", () => {
        // Crédit OpenStreetMap replié derrière son « i » : il reste à un clic.
        carte
          .getContainer()
          .querySelector(".maplibregl-ctrl-attrib")
          ?.classList.remove("maplibregl-compact-show");
        toutVoir(carte, false);
        setPret(true);
      });

      const sousLaSouris = (e: MapMouseEvent): Cible => {
        const { x, y } = e.point;
        const zone: [[number, number], [number, number]] = [
          [x - 7, y - 7],
          [x + 7, y + 7],
        ];
        const couches = COUCHES_POINTS.filter((c) => carte.getLayer(c));
        const point = couches.length ? carte.queryRenderedFeatures(zone, { layers: couches })[0] : undefined;
        if (point) return { type: "point", id: String(point.properties?.id ?? "") };
        if (!carte.getLayer("pays-remplissage")) return null;
        const pays = carte.queryRenderedFeatures(e.point, { layers: ["pays-remplissage"] })[0];
        return pays ? { type: "pays", code: String(pays.properties?.code ?? "") } : null;
      };

      let paysSurvole: string | null = null;
      const survolerPays = (code: string | null) => {
        if (paysSurvole === code) return;
        if (paysSurvole) carte.setFeatureState({ source: "pays", id: paysSurvole }, { survol: false });
        paysSurvole = code;
        if (code) carte.setFeatureState({ source: "pays", id: code }, { survol: true });
      };

      carte.on("mousemove", (e) => {
        const cible = sousLaSouris(e);
        carte.getCanvas().style.cursor = cible ? "pointer" : "";
        survolerPays(cible?.type === "pays" ? cible.code : null);
        if (!cible) return setSurvol(null);
        const { x, y } = e.point;
        if (cible.type === "point") {
          const p = pointParIdRef.current.get(cible.id);
          if (!p) return setSurvol(null);
          setSurvol({
            titre: p.type === "ville" ? p.nom : `${t.lieuPhoto} · ${nomPaysRef.current(p.pays)}`,
            sous: [
              p.type === "ville" ? t.sejours(p.sejours.length) : "",
              p.photos.length ? t.nbPhotos(p.photos.length) : "",
            ]
              .filter(Boolean)
              .join(" · "),
            x,
            y,
          });
        } else {
          const p = paysParCodeRef.current.get(cible.code);
          setSurvol({
            titre: nomPaysRef.current(cible.code),
            sous: p?.visites ? t.voyages(p.visites) : undefined,
            x,
            y,
          });
        }
      });
      carte.getCanvas().addEventListener("mouseleave", () => {
        survolerPays(null);
        setSurvol(null);
      });
      carte.on("click", (e) => {
        const cible = sousLaSouris(e);
        if (!cible) return;
        if (cible.type === "point") {
          const p = pointParIdRef.current.get(cible.id);
          if (p) choisirPointRef.current(p);
        } else choisirPaysRef.current(cible.code);
      });

      // Le fond suit le bouton clair / sombre du site.
      observateur = new MutationObserver(() => {
        const url = sombreActif() ? STYLES.sombre : STYLES.clair;
        carte.setStyle(url, { diff: false });
      });
      observateur.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    })();

    return () => {
      annule = true;
      observateur?.disconnect();
      carteRef.current?.remove();
      carteRef.current = null;
    };
    // La carte se crée une seule fois ; les gestionnaires lisent l'état par des refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* --- Sélection et mouvements --- */

  const choisirPays = useCallback((code: string) => {
    const p = paysParCodeRef.current.get(code);
    const carte = carteRef.current;
    if (!p) return;
    setSelection({ type: "pays", code });
    if (!carte) return;
    const [w, s, e, n] = p.cadre;
    carte.fitBounds(
      [
        [w, s],
        [e, n],
      ],
      { padding: 40, maxZoom: 6, duration: mouvementReduit() ? 0 : 900 },
    );
  }, []);

  const choisirPoint = useCallback((p: PointCarte) => {
    setSelection({ type: "point", id: p.id });
    const carte = carteRef.current;
    if (!carte) return;
    carte.flyTo({
      center: [p.lng, p.lat],
      zoom: Math.max(carte.getZoom(), p.type === "photo" ? 8 : 6.5),
      duration: mouvementReduit() ? 0 : 1100,
      essential: true,
    });
  }, []);

  // Références à jour pour les gestionnaires posés une seule fois sur la carte.
  useEffect(() => {
    etat.current = { selection, anneeChoisie, photosVisibles, globe };
    pointParIdRef.current = pointParId;
    paysParCodeRef.current = paysParCode;
    nomPaysRef.current = nomPays;
    choisirPaysRef.current = choisirPays;
    choisirPointRef.current = choisirPoint;
  });

  useEffect(() => {
    const carte = carteRef.current;
    if (carte && pret) appliquerEtat(carte);
  }, [selection, anneeChoisie, photosVisibles, pret, appliquerEtat]);

  useEffect(() => {
    const carte = carteRef.current;
    if (!carte || !pret) return;
    carte.setProjection({ type: globe ? "globe" : "mercator" });
    if (etat.current.selection == null) toutVoir(carte);
  }, [globe, pret, toutVoir]);

  const fermer = () => setSelection(null);

  /* --- Rendu --- */

  const selPoint = selection?.type === "point" ? pointParId.get(selection.id) : undefined;
  const villes = donnees.points.filter((p) => p.type === "ville");
  const paysVisites = donnees.pays.filter((p) => p.visite).sort((a, b) => b.visites - a.visites);

  const ouvrirPhotos = (ids: string[], index: number) => {
    const liste = ids.map((id) => photoParId.get(id)).filter((p): p is PhotoCarte => !!p);
    if (liste.length) setVisionneuse({ liste, index });
  };

  const fmtDate = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );
  const plage = (s: Sejour) => {
    try {
      const a = fmtDate.format(new Date(s.debut));
      const b = fmtDate.format(new Date(s.fin));
      return a === b ? a : `${a} → ${b}`;
    } catch {
      return `${s.debut} → ${s.fin}`;
    }
  };

  const pilule =
    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors";

  return (
    <div className="overflow-hidden rounded-[28px] bg-[color:var(--color-ink)] p-2 text-[color:var(--color-ink-fg)] sm:rounded-[32px] sm:p-3">
      {/* Barre : années, globe, photos */}
      <div className="flex items-center gap-2 p-1">
        <div
          role="group"
          aria-label={t.annees}
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[null, ...annees].map((a) => {
            const actif = anneeChoisie === a;
            return (
              <button
                key={a ?? "tout"}
                type="button"
                aria-pressed={actif}
                onClick={() => setAnneeChoisie(a)}
                className={cn(
                  pilule,
                  actif
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "bg-[color:var(--color-ink-surface)] hover:bg-[color:var(--color-ink-line)]",
                )}
              >
                {a ?? t.tout}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={globe}
          onClick={() => setGlobe((g) => !g)}
          className={cn(
            pilule,
            "hidden sm:inline-flex",
            globe
              ? "bg-[color:var(--color-ink-fg)] text-[color:var(--color-ink)]"
              : "bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-ink-line)]",
          )}
        >
          <Globe2 size={13} strokeWidth={1.75} aria-hidden />
          {t.globe}
        </button>
        <button
          type="button"
          aria-pressed={photosVisibles}
          onClick={() => setPhotosVisibles((v) => !v)}
          className={cn(
            pilule,
            photosVisibles
              ? "bg-[color:var(--color-ink-fg)] text-[color:var(--color-ink)]"
              : "bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-ink-line)]",
          )}
        >
          <Camera size={13} strokeWidth={1.75} aria-hidden />
          {t.photos}
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {/* La carte */}
        <div className="relative h-[420px] min-w-0 flex-1 overflow-hidden rounded-[20px] bg-[color:var(--color-ink-surface)] sm:h-[480px] lg:h-[560px]">
          {erreur ? (
            <div className="bg-dots-ink flex h-full items-center p-4">{repli}</div>
          ) : (
            <div
              ref={conteneurRef}
              role="region"
              aria-label={t.aria}
              className={cn("h-full w-full transition-opacity duration-500", pret ? "opacity-100" : "opacity-0")}
            />
          )}

          {/* Info-bulle */}
          {survol ? (
            <div
              aria-hidden
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full bg-[color:var(--color-ink)] px-3 py-1.5 text-[13px] text-[color:var(--color-ink-fg)] shadow-lg"
              style={{ left: survol.x, top: survol.y }}
            >
              {survol.titre}
              {survol.sous ? (
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.04em] opacity-60">
                  {survol.sous}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Commandes de zoom */}
          {!erreur ? (
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
              <BoutonCarte label={t.zoomPlus} onClick={() => carteRef.current?.zoomIn()}>
                <Plus size={16} strokeWidth={1.75} aria-hidden />
              </BoutonCarte>
              <BoutonCarte label={t.zoomMoins} onClick={() => carteRef.current?.zoomOut()}>
                <Minus size={16} strokeWidth={1.75} aria-hidden />
              </BoutonCarte>
              <BoutonCarte
                label={t.recentrer}
                onClick={() => {
                  setSelection(null);
                  if (carteRef.current) toutVoir(carteRef.current);
                }}
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
              </BoutonCarte>
            </div>
          ) : null}
        </div>

        {/* La fiche */}
        <aside
          aria-live="polite"
          className="relative rounded-[20px] bg-[color:var(--color-ink-surface)] lg:w-[340px] lg:shrink-0"
        >
          <div className="flex h-full flex-col p-5 lg:absolute lg:inset-0 lg:overflow-y-auto">
            {selection == null ? (
              <Intro
                t={t}
                nbPhotos={donnees.photos.length}
                pays={paysVisites.map((p) => ({ code: p.code, nom: nomPays(p.code) }))}
                onPays={choisirPays}
              />
            ) : selection.type === "pays" ? (
              <FichePays
                code={selection.code}
                t={t}
                nom={nomPays(selection.code)}
                pays={paysParCode.get(selection.code)}
                villes={villes.filter((v) => v.pays === selection.code)}
                photos={donnees.photos.filter((p) => p.pays === selection.code).map((p) => p.id)}
                photoParId={photoParId}
                onFermer={fermer}
                onVille={choisirPoint}
                onPhoto={ouvrirPhotos}
                lang={lang}
              />
            ) : selPoint ? (
              <FichePoint
                point={selPoint}
                t={t}
                nomPays={nomPays(selPoint.pays)}
                plage={plage}
                photoParId={photoParId}
                onFermer={fermer}
                onPays={() => choisirPays(selPoint.pays)}
                onPhoto={ouvrirPhotos}
                lang={lang}
              />
            ) : null}
          </div>
        </aside>
      </div>

      {visionneuse ? (
        <Visionneuse
          photos={visionneuse.liste.map(
            (p): PhotoVisionneuse => ({
              src: p.src,
              alt: p.alt,
              largeur: p.largeur,
              hauteur: p.hauteur,
              flou: p.flou,
              legende: [p.alt, p.serie, p.date ? fmtDate.format(new Date(p.date)) : ""]
                .filter(Boolean)
                .join(" · "),
            }),
          )}
          index={visionneuse.index}
          onIndex={(i) => setVisionneuse((v) => (v ? { ...v, index: i } : v))}
          onFermer={() => setVisionneuse(null)}
          libelles={{ fermer: t.fermer, precedente: t.precedente, suivante: t.suivante }}
        />
      ) : null}
    </div>
  );
}

/* ---------- Sous-composants ---------- */

type T = (typeof TEXTES)["fr"];

function BoutonCarte({
  label,
  onClick,
  inactif,
  children,
}: {
  label: string;
  onClick: () => void;
  inactif?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={inactif}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-ink-surface)] text-[color:var(--color-ink-fg)] ring-1 ring-[color:var(--color-ink-line)] transition-colors hover:bg-[color:var(--color-ink-line)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function EnTeteFiche({
  type,
  titre,
  onFermer,
  fermer,
}: {
  type: string;
  titre: string;
  onFermer: () => void;
  fermer: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
          <span aria-hidden className="node-dot" />
          {type}
        </span>
        <h3 className="text-[28px] font-medium leading-none tracking-[-0.015em]">{titre}</h3>
      </div>
      <button
        type="button"
        onClick={onFermer}
        aria-label={fermer}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] hover:bg-[color:var(--color-ink-line)]"
      >
        <X size={15} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

function Pastilles({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.filter(Boolean).map((i) => (
        <span
          key={i}
          className="inline-flex h-7 items-center rounded-full bg-[color:var(--color-ink)] px-3 font-mono text-[11px] uppercase tracking-[0.04em]"
        >
          {i}
        </span>
      ))}
    </div>
  );
}

function SousTitre({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
      {children}
    </p>
  );
}

function GrillePhotos({
  ids,
  photoParId,
  onPhoto,
  t,
  lang,
}: {
  ids: string[];
  photoParId: Map<string, PhotoCarte>;
  onPhoto: (ids: string[], index: number) => void;
  t: T;
  lang: Lang;
}) {
  if (ids.length === 0) {
    return <p className="text-sm text-[color:var(--color-ink-muted)]">{t.pasDePhoto}</p>;
  }
  return (
    <>
      <ul className="grid grid-cols-3 gap-1.5">
        {ids.map((id, i) => {
          const p = photoParId.get(id);
          if (!p) return null;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onPhoto(ids, i)}
                aria-label={p.alt}
                className="group relative block aspect-square w-full overflow-hidden rounded-[10px] bg-[color:var(--color-ink)]"
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="110px"
                  placeholder={p.flou ? "blur" : "empty"}
                  blurDataURL={p.flou || undefined}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </li>
          );
        })}
      </ul>
      <NextLink
        href={chemin(lang, "/hobbies/photographie")}
        className="mt-3 inline-flex font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)] underline decoration-[color:var(--color-accent-strong)] underline-offset-4 hover:text-[color:var(--color-ink-fg)]"
      >
        {t.toutesPhotos} →
      </NextLink>
    </>
  );
}

function Intro({
  t,
  nbPhotos,
  pays,
  onPays,
}: {
  t: T;
  nbPhotos: number;
  pays: Array<{ code: string; nom: string }>;
  onPays: (code: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
        <span aria-hidden className="node-dot" />
        {t.photosPlacees(nbPhotos)}
      </span>
      <p className="text-2xl font-medium leading-[1.05] tracking-[-0.015em]">{t.introTitre}</p>
      <p className="text-sm text-[color:var(--color-ink-muted)]">{t.introTexte}</p>
      <ul className="flex flex-col gap-2.5 pt-2 text-sm">
        <li className="flex items-center gap-3">
          <span aria-hidden className="h-3.5 w-5 rounded-[4px] bg-[color:var(--color-accent)]" />
          {t.legendePays}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden className="flex w-5 justify-center">
            <span className="h-3 w-3 rounded-full bg-[#ff5a8c]" />
          </span>
          {t.legendeVille}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden className="flex w-5 justify-center">
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5a8c] ring-[1.5px] ring-white ring-offset-[1.5px] ring-offset-[color:var(--color-ink-surface)]" />
          </span>
          {t.photos}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden className="flex w-5 justify-center">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-1 ring-[color:var(--color-ink)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a8c]" />
            </span>
          </span>
          {t.legendePhoto}
        </li>
      </ul>
      {pays.length ? (
        <>
          <SousTitre>{t.paysVisites}</SousTitre>
          <ul className="flex flex-wrap gap-1.5">
            {pays.map((p) => (
              <li key={p.code}>
                <button
                  type="button"
                  onClick={() => onPays(p.code)}
                  className="inline-flex h-8 items-center rounded-full bg-[color:var(--color-ink)] px-3 text-[13px] transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
                >
                  {p.nom}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function FichePays({
  t,
  nom,
  pays,
  villes,
  photos,
  photoParId,
  onFermer,
  onVille,
  onPhoto,
  lang,
}: {
  code: string;
  t: T;
  nom: string;
  pays?: PaysCarte;
  villes: PointCarte[];
  photos: string[];
  photoParId: Map<string, PhotoCarte>;
  onFermer: () => void;
  onVille: (v: PointCarte) => void;
  onPhoto: (ids: string[], index: number) => void;
  lang: Lang;
}) {
  const tri = [...villes].sort((a, b) => b.sejours.length - a.sejours.length);
  return (
    <div className="flex flex-col">
      <EnTeteFiche type={t.pays} titre={nom} onFermer={onFermer} fermer={t.fermer} />
      <div className="mt-4">
        <Pastilles
          items={[
            pays?.visites ? t.voyages(pays.visites) : "",
            villes.length ? t.villes(villes.length) : "",
            photos.length ? t.nbPhotos(photos.length) : "",
          ]}
        />
      </div>
      {tri.length ? (
        <>
          <SousTitre>{t.villesDuPays}</SousTitre>
          <ul className="flex flex-col">
            {tri.map((v) => (
              <li key={v.id} className="border-t border-[color:var(--color-ink-line)] first:border-t-0">
                <button
                  type="button"
                  onClick={() => onVille(v)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:text-[color:var(--color-accent-strong)]"
                >
                  <span>{v.nom}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
                    {t.sejours(v.sejours.length)}
                    {v.photos.length ? ` · ${t.nbPhotos(v.photos.length)}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <SousTitre>{t.photosDuLieu}</SousTitre>
      <GrillePhotos ids={photos} photoParId={photoParId} onPhoto={onPhoto} t={t} lang={lang} />
    </div>
  );
}

function FichePoint({
  point,
  t,
  nomPays,
  plage,
  photoParId,
  onFermer,
  onPays,
  onPhoto,
  lang,
}: {
  point: PointCarte;
  t: T;
  nomPays: string;
  plage: (s: Sejour) => string;
  photoParId: Map<string, PhotoCarte>;
  onFermer: () => void;
  onPays: () => void;
  onPhoto: (ids: string[], index: number) => void;
  lang: Lang;
}) {
  const sejours = [...point.sejours].sort((a, b) => b.debut.localeCompare(a.debut));
  const total = sejours.reduce((n, s) => n + s.jours, 0);
  const visibles = sejours.slice(0, 5);
  const estVille = point.type === "ville";
  return (
    <div className="flex flex-col">
      <EnTeteFiche
        type={estVille ? t.ville : t.lieuPhoto}
        titre={estVille ? point.nom : nomPays}
        onFermer={onFermer}
        fermer={t.fermer}
      />
      <div className="mt-4 flex flex-col gap-3">
        <Pastilles
          items={
            estVille
              ? [t.sejours(sejours.length), total ? t.joursTotal(total) : "", point.photos.length ? t.nbPhotos(point.photos.length) : ""]
              : [t.nbPhotos(point.photos.length)]
          }
        />
        {!estVille && point.proche ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">{t.pres(point.proche.km, point.proche.nom)}</p>
        ) : null}
        {point.pays ? (
          <button
            type="button"
            onClick={onPays}
            className="self-start font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)] underline decoration-[color:var(--color-accent-strong)] underline-offset-4 hover:text-[color:var(--color-ink-fg)]"
          >
            {estVille ? `${nomPays} · ${t.voirPays}` : t.voirPays} →
          </button>
        ) : null}
      </div>

      {estVille ? (
        <>
          <SousTitre>{t.datesSejours}</SousTitre>
          <ul className="flex flex-col">
            {visibles.map((s) => (
              <li
                key={`${s.debut}-${s.fin}`}
                className="flex items-baseline justify-between gap-3 border-t border-[color:var(--color-ink-line)] py-2 text-sm first:border-t-0"
              >
                <span>{plage(s)}</span>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
                  {t.jours(s.jours)}
                </span>
              </li>
            ))}
          </ul>
          {sejours.length > visibles.length ? (
            <p className="pt-1 text-sm text-[color:var(--color-ink-muted)]">
              {t.autres(sejours.length - visibles.length)}
            </p>
          ) : null}
        </>
      ) : null}

      <SousTitre>{t.photosDuLieu}</SousTitre>
      <GrillePhotos ids={point.photos} photoParId={photoParId} onPhoto={onPhoto} t={t} lang={lang} />
    </div>
  );
}
