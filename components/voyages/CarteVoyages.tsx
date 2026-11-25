"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Camera, Minus, Plus, RotateCcw, X } from "lucide-react";
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
  x: number;
  y: number;
  sejours: Sejour[];
  photos: string[];
  proche?: { nom: string; km: number };
};

export type PaysCarte = {
  id: string;
  code: string;
  nomAnglais: string;
  d: string;
  visite: boolean;
  visites: number;
  /** Cliquable : visité ou avec des photos. */
  actif: boolean;
  /** Cadre [x0, y0, x1, y1] de la plus grande terre du pays, pour zoomer dessus. */
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
    zoomPlus: "Zoomer",
    zoomMoins: "Dézoomer",
    recentrer: "Vue d'ensemble",
    astuce: "Pincer ou ⌘ + molette pour zoomer, glisser pour se déplacer",
    introTitre: "Clique sur un pays ou une ville.",
    introTexte: "Les séjours, les dates et les photos prises sur place s'ouvrent ici.",
    legendePays: "Pays visité",
    legendeVille: "Ville (plus c'est gros, plus j'y suis retourné)",
    legendePhoto: "Photos prises hors des villes",
    photosPlacees: (n: number) => `${n} photos placées sur la carte`,
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
    rien: "Aucun voyage cette année-là.",
  },
  en: {
    aria: "World map of Kostia's travels",
    tout: "All",
    annees: "Filter by year",
    photos: "Photos",
    zoomPlus: "Zoom in",
    zoomMoins: "Zoom out",
    recentrer: "Whole world",
    astuce: "Pinch or ⌘ + scroll to zoom, drag to move around",
    introTitre: "Click a country or a city.",
    introTexte: "Stays, dates and the photos taken there open here.",
    legendePays: "Visited country",
    legendeVille: "City (the bigger, the more often I went back)",
    legendePhoto: "Photos taken away from cities",
    photosPlacees: (n: number) => `${n} photos placed on the map`,
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
    rien: "No trip that year.",
  },
};

/* ---------- Géométrie de la vue ---------- */

type Vue = { x: number; y: number; w: number; h: number };

const BASE: Vue = { x: 0, y: 24, w: 960, h: 422 };
const ZOOM_MAX = 14;

function borner(v: Vue): Vue {
  const w = Math.min(BASE.w, Math.max(BASE.w / ZOOM_MAX, v.w));
  const h = (w * BASE.h) / BASE.w;
  if (w >= BASE.w) return { ...BASE };
  const x = Math.min(BASE.x + BASE.w - w * 0.7, Math.max(BASE.x - w * 0.3, v.x));
  const y = Math.min(BASE.y + BASE.h - h * 0.7, Math.max(BASE.y - h * 0.3, v.y));
  return { x, y, w, h };
}

const annee = (iso: string) => parseInt(iso.slice(0, 4), 10);

type Selection = { type: "pays"; code: string } | { type: "point"; id: string } | null;
type Survol = { titre: string; sous?: string; x: number; y: number } | null;

/* ---------- Composant ---------- */

export function CarteVoyages({ donnees, lang }: { donnees: DonneesCarte; lang: Lang }) {
  const t = TEXTES[lang];
  const locale = lang === "en" ? "en-GB" : "fr-FR";

  const [vue, setVue] = useState<Vue>(BASE);
  const vueRef = useRef<Vue>(BASE);
  const [selection, setSelection] = useState<Selection>(null);
  const [anneeChoisie, setAnneeChoisie] = useState<number | null>(null);
  const [photosVisibles, setPhotosVisibles] = useState(true);
  const [survol, setSurvol] = useState<Survol>(null);
  const [visionneuse, setVisionneuse] = useState<{ liste: PhotoCarte[]; index: number } | null>(
    null,
  );

  const cadreRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animation = useRef<number | null>(null);
  const pointeurs = useRef(new Map<number, { x: number; y: number }>());
  const geste = useRef<{ depart: Vue; pts: Array<{ x: number; y: number }> } | null>(null);
  const aBouge = useRef(false);

  const appliquer = useCallback((v: Vue) => {
    vueRef.current = v;
    setVue(v);
  }, []);

  /* --- Index --- */

  const nomsPays = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);

  const paysParCode = useMemo(
    () => new Map(donnees.pays.filter((p) => p.code).map((p) => [p.code, p])),
    [donnees.pays],
  );
  const pointParId = useMemo(() => new Map(donnees.points.map((p) => [p.id, p])), [donnees.points]);
  const photoParId = useMemo(() => new Map(donnees.photos.map((p) => [p.id, p])), [donnees.photos]);

  const nomPays = useCallback(
    (code: string) => {
      const repli = paysParCode.get(code)?.nomAnglais || code;
      if (!code || !nomsPays) return repli;
      try {
        return nomsPays.of(code) ?? repli;
      } catch {
        return repli;
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
    (p: PointCarte) => {
      if (anneeChoisie == null) return true;
      if (p.type === "ville")
        return p.sejours.some((s) => annee(s.debut) === anneeChoisie || annee(s.fin) === anneeChoisie);
      return p.photos.some((id) => {
        const d = photoParId.get(id)?.date;
        return d ? annee(d) === anneeChoisie : false;
      });
    },
    [anneeChoisie, photoParId],
  );

  const paysActifsAnnee = useMemo(() => {
    if (anneeChoisie == null) return null;
    const s = new Set<string>();
    for (const p of donnees.points) if (p.type === "ville" && pointActif(p)) s.add(p.pays);
    return s;
  }, [anneeChoisie, donnees.points, pointActif]);

  /* --- Animation de la vue --- */

  const animerVers = useCallback(
    (cible: Vue) => {
      const fin = borner(cible);
      if (animation.current) cancelAnimationFrame(animation.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        appliquer(fin);
        return;
      }
      const debut = vueRef.current;
      const t0 = performance.now();
      const duree = 480;
      const pas = (now: number) => {
        const k = Math.min(1, (now - t0) / duree);
        const e = 1 - Math.pow(1 - k, 3);
        appliquer({
          x: debut.x + (fin.x - debut.x) * e,
          y: debut.y + (fin.y - debut.y) * e,
          w: debut.w + (fin.w - debut.w) * e,
          h: debut.h + (fin.h - debut.h) * e,
        });
        if (k < 1) animation.current = requestAnimationFrame(pas);
      };
      animation.current = requestAnimationFrame(pas);
    },
    [appliquer],
  );

  const cadrer = useCallback(
    ([x0, y0, x1, y1]: [number, number, number, number]) => {
      const marge = 1.5;
      let w = Math.max((x1 - x0) * marge, ((y1 - y0) * marge * BASE.w) / BASE.h, BASE.w / ZOOM_MAX);
      w = Math.min(w, BASE.w);
      const h = (w * BASE.h) / BASE.w;
      animerVers({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h });
    },
    [animerVers],
  );

  const zoomer = useCallback(
    (facteur: number, ecranX?: number, ecranY?: number, depuis: Vue = vueRef.current) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const fx = ecranX == null ? 0.5 : (ecranX - rect.left) / rect.width;
      const fy = ecranY == null ? 0.5 : (ecranY - rect.top) / rect.height;
      const px = depuis.x + fx * depuis.w;
      const py = depuis.y + fy * depuis.h;
      const w = Math.min(BASE.w, Math.max(BASE.w / ZOOM_MAX, depuis.w / facteur));
      const h = (w * BASE.h) / BASE.w;
      return borner({ x: px - fx * w, y: py - fy * h, w, h });
    },
    [],
  );

  /* --- Molette (⌘/Ctrl ou pincement du trackpad) --- */

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const surMolette = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      if (animation.current) cancelAnimationFrame(animation.current);
      const v = zoomer(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      if (v) appliquer(v);
    };
    svg.addEventListener("wheel", surMolette, { passive: false });
    return () => svg.removeEventListener("wheel", surMolette);
  }, [appliquer, zoomer]);

  /* --- Glisser et pincer --- */

  const demarrerGeste = () => {
    geste.current = {
      depart: vueRef.current,
      pts: [...pointeurs.current.values()].map((p) => ({ ...p })),
    };
  };

  const surPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointeurs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointeurs.current.size === 1) aBouge.current = false;
    if (animation.current) cancelAnimationFrame(animation.current);
    demarrerGeste();
  };

  const surPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointeurs.current.has(e.pointerId) || !geste.current) return;
    pointeurs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { depart, pts } = geste.current;
    const actuels = [...pointeurs.current.values()];

    if (actuels.length === 1 && pts.length === 1) {
      const dx = actuels[0].x - pts[0].x;
      const dy = actuels[0].y - pts[0].y;
      if (!aBouge.current && Math.hypot(dx, dy) > 5) {
        aBouge.current = true;
        svgRef.current?.setPointerCapture(e.pointerId);
        setSurvol(null);
      }
      if (aBouge.current) {
        const upp = depart.w / rect.width;
        appliquer(borner({ ...depart, x: depart.x - dx * upp, y: depart.y - dy * upp }));
      }
    } else if (actuels.length >= 2 && pts.length >= 2) {
      aBouge.current = true;
      const d0 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const d1 = Math.hypot(actuels[0].x - actuels[1].x, actuels[0].y - actuels[1].y);
      const mx = (actuels[0].x + actuels[1].x) / 2;
      const my = (actuels[0].y + actuels[1].y) / 2;
      const v = zoomer(d1 / Math.max(1, d0), mx, my, depart);
      if (v) appliquer(v);
    }
  };

  const surPointerFin = (e: React.PointerEvent<SVGSVGElement>) => {
    pointeurs.current.delete(e.pointerId);
    if (pointeurs.current.size > 0) demarrerGeste();
    else geste.current = null;
  };

  /* --- Sélection --- */

  const choisirPays = (code: string) => {
    if (aBouge.current) return;
    const p = paysParCode.get(code);
    if (!p) return;
    setSelection({ type: "pays", code });
    cadrer(p.cadre);
  };

  const choisirPoint = (p: PointCarte) => {
    if (aBouge.current) return;
    setSelection({ type: "point", id: p.id });
    const w = Math.min(vueRef.current.w, BASE.w / 5);
    const h = (w * BASE.h) / BASE.w;
    animerVers({ x: p.x - w / 2, y: p.y - h / 2, w, h });
  };

  const fermer = () => setSelection(null);

  const survoler = (e: React.PointerEvent, titre: string, sous?: string) => {
    if (e.pointerType !== "mouse" || geste.current) return;
    const rect = cadreRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSurvol({ titre, sous, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const surTouche = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      aBouge.current = false;
      action();
    }
  };

  /* --- Rendu --- */

  const k = BASE.w / vue.w;
  const zoome = k > 1.05;
  const echelle = Math.pow(k, 0.85);
  const villes = donnees.points.filter((p) => p.type === "ville");
  const lieuxPhoto = donnees.points.filter((p) => p.type === "photo");
  const selPays = selection?.type === "pays" ? selection.code : null;
  const selPoint = selection?.type === "point" ? pointParId.get(selection.id) : undefined;

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

  return (
    <div className="overflow-hidden rounded-[28px] bg-[color:var(--color-ink)] p-2 text-[color:var(--color-ink-fg)] sm:rounded-[32px] sm:p-3">
      {/* Barre : années + photos */}
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
                  "inline-flex h-8 shrink-0 items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
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
          aria-pressed={photosVisibles}
          onClick={() => setPhotosVisibles((v) => !v)}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
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
        <div
          ref={cadreRef}
          className="bg-dots-ink relative min-w-0 flex-1 overflow-hidden rounded-[20px]"
          onPointerLeave={() => setSurvol(null)}
        >
          <svg
            ref={svgRef}
            viewBox={`${vue.x} ${vue.y} ${vue.w} ${vue.h}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t.aria}
            className={cn(
              "block h-auto w-full select-none",
              zoome ? "cursor-grab active:cursor-grabbing" : "",
            )}
            style={{ aspectRatio: `${BASE.w} / ${BASE.h}`, touchAction: zoome ? "none" : "pan-y" }}
            onPointerDown={surPointerDown}
            onPointerMove={surPointerMove}
            onPointerUp={surPointerFin}
            onPointerCancel={surPointerFin}
            onDoubleClick={(e) => {
              const v = zoomer(2, e.clientX, e.clientY);
              if (v) animerVers(v);
            }}
            onClick={(e) => {
              if (e.target === svgRef.current && !aBouge.current) fermer();
            }}
          >
            <g>
              {donnees.pays.map((p) => {
                const filtre = paysActifsAnnee ? paysActifsAnnee.has(p.code) : p.visite;
                const choisi = selPays === p.code;
                const fill = choisi
                  ? "var(--color-accent-strong)"
                  : p.visite
                    ? "var(--color-accent)"
                    : "var(--color-ink-surface)";
                const opacite = p.visite && paysActifsAnnee && !filtre ? 0.28 : 1;
                if (!p.actif) {
                  return (
                    <path
                      key={p.id}
                      d={p.d}
                      fill={fill}
                      stroke="var(--color-ink)"
                      strokeWidth={0.6}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                const nom = nomPays(p.code);
                return (
                  <path
                    key={p.id}
                    d={p.d}
                    fill={fill}
                    fillOpacity={opacite}
                    stroke="var(--color-ink)"
                    strokeWidth={0.6}
                    vectorEffect="non-scaling-stroke"
                    role="button"
                    tabIndex={0}
                    aria-label={nom}
                    aria-pressed={choisi}
                    className="cursor-pointer outline-none transition-[fill] duration-150 hover:fill-[color:var(--color-accent-strong)] focus-visible:fill-[color:var(--color-accent-strong)]"
                    onClick={() => choisirPays(p.code)}
                    onKeyDown={(e) => surTouche(e, () => choisirPays(p.code))}
                    onPointerMove={(e) =>
                      survoler(e, nom, p.visites ? t.voyages(p.visites) : undefined)
                    }
                    onPointerLeave={() => setSurvol(null)}
                  />
                );
              })}
            </g>

            {/* Lieux de photos hors des villes */}
            {photosVisibles ? (
              <g>
                {lieuxPhoto.map((p) => {
                  const actif = pointActif(p);
                  const choisi = selPoint?.id === p.id;
                  const r = 3.4 / echelle;
                  const nom = nomPays(p.pays);
                  return (
                    <g
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${t.lieuPhoto} · ${nom} · ${t.nbPhotos(p.photos.length)}`}
                      className="cursor-pointer outline-none"
                      opacity={actif ? 1 : 0.25}
                      onClick={() => choisirPoint(p)}
                      onKeyDown={(e) => surTouche(e, () => choisirPoint(p))}
                      onPointerMove={(e) => survoler(e, `${t.lieuPhoto} · ${nom}`, t.nbPhotos(p.photos.length))}
                      onPointerLeave={() => setSurvol(null)}
                    >
                      <circle cx={p.x} cy={p.y} r={r * 2.6} fill="transparent" />
                      {choisi ? (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r * 2}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          vectorEffect="non-scaling-stroke"
                        />
                      ) : null}
                      <rect
                        x={p.x - r}
                        y={p.y - r}
                        width={r * 2}
                        height={r * 2}
                        rx={r * 0.45}
                        fill="#ffffff"
                        stroke="var(--color-ink)"
                        strokeWidth={1.2}
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle cx={p.x} cy={p.y} r={r * 0.42} fill="#ff5a8c" />
                    </g>
                  );
                })}
              </g>
            ) : null}

            {/* Villes */}
            <g>
              {villes.map((p) => {
                const actif = pointActif(p);
                const choisi = selPoint?.id === p.id;
                const r = (2.6 + Math.min(4, p.sejours.length * 0.55)) / echelle;
                const avecPhotos = photosVisibles && p.photos.length > 0;
                return (
                  <g
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${p.nom}, ${nomPays(p.pays)} · ${t.sejours(p.sejours.length)}${p.photos.length ? ` · ${t.nbPhotos(p.photos.length)}` : ""}`}
                    className="cursor-pointer outline-none [&:focus-visible>circle:last-child]:stroke-white"
                    opacity={actif ? 1 : 0.22}
                    onClick={() => choisirPoint(p)}
                    onKeyDown={(e) => surTouche(e, () => choisirPoint(p))}
                    onPointerMove={(e) =>
                      survoler(
                        e,
                        p.nom,
                        [t.sejours(p.sejours.length), p.photos.length ? t.nbPhotos(p.photos.length) : ""]
                          .filter(Boolean)
                          .join(" · "),
                      )
                    }
                    onPointerLeave={() => setSurvol(null)}
                  >
                    <circle cx={p.x} cy={p.y} r={r + 5 / echelle} fill="transparent" />
                    {avecPhotos ? (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r + 2.2 / echelle}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={1.4}
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                    {choisi ? (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r + 5 / echelle}
                        fill="none"
                        stroke="var(--color-accent-strong)"
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill="#ff5a8c"
                      stroke="var(--color-ink)"
                      strokeWidth={1.25}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </g>

            {/* Noms des villes une fois zoomé */}
            {k >= 2.4 ? (
              <g aria-hidden className="pointer-events-none">
                {villes
                  .filter((p) => pointActif(p))
                  .map((p) => (
                    <text
                      key={p.id}
                      x={p.x + (8 + Math.min(4, p.sejours.length * 0.55)) / echelle}
                      y={p.y + 3.6 / k}
                      fontSize={11 / k}
                      fill="var(--color-ink-fg)"
                      stroke="var(--color-ink)"
                      strokeWidth={3 / k}
                      paintOrder="stroke"
                      style={{ fontFamily: "var(--font-archivo)" }}
                    >
                      {p.nom}
                    </text>
                  ))}
              </g>
            ) : null}
          </svg>

          {/* Info-bulle */}
          {survol ? (
            <div
              aria-hidden
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-full bg-[color:var(--color-ink-fg)] px-3 py-1.5 text-[13px] text-[color:var(--color-ink)] shadow-lg"
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
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
            <BoutonCarte
              label={t.zoomPlus}
              onClick={() => {
                const v = zoomer(1.8);
                if (v) animerVers(v);
              }}
            >
              <Plus size={16} strokeWidth={1.75} aria-hidden />
            </BoutonCarte>
            <BoutonCarte
              label={t.zoomMoins}
              onClick={() => {
                const v = zoomer(1 / 1.8);
                if (v) animerVers(v);
              }}
            >
              <Minus size={16} strokeWidth={1.75} aria-hidden />
            </BoutonCarte>
            <BoutonCarte label={t.recentrer} onClick={() => animerVers(BASE)} inactif={!zoome}>
              <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
            </BoutonCarte>
          </div>

          <p className="pointer-events-none absolute bottom-3 left-4 hidden font-mono text-[10px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)] lg:block">
            {t.astuce}
          </p>
        </div>

        {/* La fiche */}
        <aside
          aria-live="polite"
          className="relative rounded-[20px] bg-[color:var(--color-ink-surface)] lg:w-[340px] lg:shrink-0"
        >
          <div className="flex h-full flex-col p-5 lg:absolute lg:inset-0 lg:overflow-y-auto">
          {selection == null ? (
            <Intro t={t} nbPhotos={donnees.photos.length} />
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
              onVille={(v) => {
                aBouge.current = false;
                choisirPoint(v);
              }}
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
              onPays={() => {
                aBouge.current = false;
                choisirPays(selPoint.pays);
              }}
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

function Intro({ t, nbPhotos }: { t: T; nbPhotos: number }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
        <span aria-hidden className="node-dot" />
        {t.photosPlacees(nbPhotos)}
      </span>
      <p className="text-2xl font-medium leading-[1.05] tracking-[-0.015em]">{t.introTitre}</p>
      <p className="text-sm text-[color:var(--color-ink-muted)]">{t.introTexte}</p>
      <ul className="mt-auto flex flex-col gap-2.5 pt-4 text-sm">
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
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a8c]" />
            </span>
          </span>
          {t.legendePhoto}
        </li>
      </ul>
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
