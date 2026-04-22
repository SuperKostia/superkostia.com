"use client";

import { useEffect, useState } from "react";

/**
 * WaterField — champ d'eau procédural en SVG natif (façon piscine Hockney).
 *
 * Composant générique réutilisable pour n'importe quel conteneur ayant
 * `position: relative` + `isolation: isolate` (ce dernier pour contenir
 * le `z-index: -1` du SVG dans le contexte de stacking parent).
 *
 * Rendu : 3 couches superposées dans un SVG `position: absolute; inset: 0` :
 *  1. Gradient vertical = profondeur (deep cobalt haut → pale aqua bas).
 *  2. Gradient radial top-left = glint solaire (asymétrie reluisante).
 *  3. Réseau de caustiques blanches via filter chain de 8 primitives :
 *     2× feTurbulence animés en périodes coprime (73s, 47s) →
 *     feBlend difference → seuillage matrix → feMorphology erode →
 *     feComposite arithmetic (soustraction = contours) → 3e turbulence
 *     animée (19s) → feDisplacementMap qui warpe les bords.
 *
 * PPCM des 3 périodes ≈ 18h, l'œil ne perçoit jamais la répétition.
 *
 * Respect prefers-reduced-motion : le hook `useReducedMotion` retire les
 * `<animate>` SMIL pour les utilisateurs concernés (le réseau apparaît figé).
 *
 * Usages : `<HeroPool>` sur la home, sous `<WorldMap>` sur /voyages.
 * Décision archivée en DECISIONS.md #009.
 */
export function WaterField() {
  const reduced = useReducedMotion();

  return (
    <svg
      className="water-field"
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Eau Hockney : 2 couches.
            Base verticale = profondeur (deep cobalt haut → pale aqua bas).
            Glint radial top-left = soleil qui frappe la surface en biais.
            Les 8 bleus échantillonnés sont répartis entre les deux couches. */}
        <linearGradient id="pool-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0087C4" />
          <stop offset="0.35" stopColor="#0087C5" />
          <stop offset="0.7" stopColor="#009BD1" />
          <stop offset="1" stopColor="#63C1CC" />
        </linearGradient>

        <radialGradient
          id="pool-glint"
          cx="30%"
          cy="25%"
          r="75%"
          fx="30%"
          fy="25%"
        >
          <stop offset="0" stopColor="#00A7DF" stopOpacity="0.40" />
          <stop offset="0.35" stopColor="#00A8D8" stopOpacity="0.22" />
          <stop offset="0.65" stopColor="#00B0CF" stopOpacity="0.10" />
          <stop offset="1" stopColor="#009EDB" stopOpacity="0" />
        </radialGradient>

        {/* Caustiques Hockney : deux noises animés à vitesses coprime (73s / 47s)
            mélangés en `difference` → motif d'interférence non-périodique
            (PPCM ≈ 57 min, l'œil ne perçoit jamais la répétition).
            Chaîne : 2× turbulence → difference → seuillage binaire → érosion
            → soustraction pour récupérer le réseau de contours. */}
        <filter
          id="pool-caustics"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.020"
            numOctaves="2"
            seed="3"
            result="n1"
          >
            {!reduced && (
              <animate
                attributeName="baseFrequency"
                dur="73s"
                values="0.016 0.020; 0.022 0.014; 0.014 0.024; 0.020 0.018; 0.016 0.020"
                keyTimes="0; 0.27; 0.51; 0.76; 1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022 0.016"
            numOctaves="2"
            seed="11"
            result="n2"
          >
            {!reduced && (
              <animate
                attributeName="baseFrequency"
                dur="47s"
                values="0.020 0.018; 0.014 0.024; 0.024 0.014; 0.018 0.022; 0.020 0.018"
                keyTimes="0; 0.21; 0.48; 0.73; 1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          {/* difference = |n1 - n2| → motif d'interférence des deux champs */}
          <feBlend
            in="n1"
            in2="n2"
            mode="difference"
            result="interference"
          />

          {/* Push contraste : alpha = clamp(50·R - 14). |n1-n2| a mean ~0.33,
              seuillage à R≈0.28 pour ~50% de couverture en blobs.
              RGB forcé à blanc pour la couleur finale des squiggles. */}
          <feColorMatrix
            in="interference"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    50 0 0 0 -14"
            result="binary"
          />

          <feMorphology
            in="binary"
            operator="erode"
            radius="3"
            result="eroded"
          />

          {/* binary - eroded = anneau autour de chaque blob = le réseau */}
          <feComposite
            in="binary"
            in2="eroded"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-1"
            k4="0"
            result="lines"
          />

          {/* Warp haute fréquence : un 3e champ de noise qui anime sur 19s
              (coprime avec 73 et 47) et sert de source de déplacement local
              → les bords des squiggles se tordent et boillonnent comme vus
              à travers une surface d'eau qui ondule. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="17"
            result="warp"
          >
            {!reduced && (
              <animate
                attributeName="baseFrequency"
                dur="19s"
                values="0.05; 0.09; 0.04; 0.08; 0.05"
                keyTimes="0; 0.24; 0.49; 0.77; 1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          <feDisplacementMap
            in="lines"
            in2="warp"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Couche 1 : profondeur de l'eau (vertical deep → shallow) */}
      <rect width="100%" height="100%" fill="url(#pool-base)" />

      {/* Couche 2 : glint radial = sun catch en biais */}
      <rect width="100%" height="100%" fill="url(#pool-glint)" />

      {/* Couche 3 : les caustiques blanches qui ondulent */}
      <rect width="100%" height="100%" filter="url(#pool-caustics)" />
    </svg>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
