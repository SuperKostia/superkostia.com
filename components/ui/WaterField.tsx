"use client";

import { useEffect, useId, useState } from "react";

type WaterFieldProps = {
  /**
   * Densité du réseau de caustiques.
   * - `1` (défaut) = échelle hero home : grosses squiggles, lecture lointaine.
   * - `> 1` = squiggles plus fines et plus nombreuses (utile quand le champ
   *   est petit ou superposé à du contenu fin, ex: carte du monde).
   * - `< 1` = squiggles plus larges, à éviter en général.
   *
   * Mécaniquement : multiplie les `baseFrequency` des 3 turbulences
   * (cellules plus serrées), divise le `radius` de l'érosion (anneaux plus
   * fins) et le `scale` du displacement (warp proportionnellement plus court).
   */
  density?: number;
};

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
 * IDs SVG (gradients, filter) sont préfixés par un `useId` pour garantir
 * l'unicité quand plusieurs `<WaterField>` coexistent sur la même page.
 *
 * Décision archivée en DECISIONS.md #009.
 */
export function WaterField({ density = 1 }: WaterFieldProps = {}) {
  const reduced = useReducedMotion();
  const isSafari = useIsSafari();
  // Dégradation progressive : Safari calcule lentement la chaîne de filter
  // SVG (feTurbulence + feMorphology + feDisplacementMap), et la recomputer
  // à chaque frame d'animation tank tout. Sur Safari on rend statique : le
  // pattern garde sa complexité visuelle mais ne bouge plus.
  const animate = !reduced && !isSafari;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idBase = `wf-${uid}-base`;
  const idGlint = `wf-${uid}-glint`;
  const idCaustics = `wf-${uid}-caustics`;

  // Tuning dérivé de la densité. Les valeurs nominales (density=1)
  // correspondent au calage initial Hockney sur le hero home.
  const fmt = (n: number) => n.toFixed(4);
  const scaleFreq = (f: number) => fmt(f * density);
  const erodeRadius = Math.max(0.5, 3 / density);
  const dispScale = Math.max(2, 14 / density);

  // baseFrequency animations : on multiplie chaque pair X Y par la densité.
  const animateN1 = [
    `${scaleFreq(0.016)} ${scaleFreq(0.02)}`,
    `${scaleFreq(0.022)} ${scaleFreq(0.014)}`,
    `${scaleFreq(0.014)} ${scaleFreq(0.024)}`,
    `${scaleFreq(0.02)} ${scaleFreq(0.018)}`,
    `${scaleFreq(0.016)} ${scaleFreq(0.02)}`,
  ].join("; ");

  const animateN2 = [
    `${scaleFreq(0.02)} ${scaleFreq(0.018)}`,
    `${scaleFreq(0.014)} ${scaleFreq(0.024)}`,
    `${scaleFreq(0.024)} ${scaleFreq(0.014)}`,
    `${scaleFreq(0.018)} ${scaleFreq(0.022)}`,
    `${scaleFreq(0.02)} ${scaleFreq(0.018)}`,
  ].join("; ");

  const animateWarp = [
    scaleFreq(0.05),
    scaleFreq(0.09),
    scaleFreq(0.04),
    scaleFreq(0.08),
    scaleFreq(0.05),
  ].join("; ");

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
        <linearGradient id={idBase} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0087C4" />
          <stop offset="0.35" stopColor="#0087C5" />
          <stop offset="0.7" stopColor="#009BD1" />
          <stop offset="1" stopColor="#63C1CC" />
        </linearGradient>

        <radialGradient
          id={idGlint}
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
        <filter id={idCaustics} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${scaleFreq(0.018)} ${scaleFreq(0.02)}`}
            numOctaves="2"
            seed="3"
            result="n1"
          >
            {animate && (
              <animate
                attributeName="baseFrequency"
                dur="73s"
                values={animateN1}
                keyTimes="0; 0.27; 0.51; 0.76; 1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${scaleFreq(0.022)} ${scaleFreq(0.016)}`}
            numOctaves="2"
            seed="11"
            result="n2"
          >
            {animate && (
              <animate
                attributeName="baseFrequency"
                dur="47s"
                values={animateN2}
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
            radius={erodeRadius}
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
            baseFrequency={scaleFreq(0.06)}
            numOctaves="2"
            seed="17"
            result="warp"
          >
            {animate && (
              <animate
                attributeName="baseFrequency"
                dur="19s"
                values={animateWarp}
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
            scale={dispScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Couche 1 : profondeur de l'eau (vertical deep → shallow) */}
      <rect width="100%" height="100%" fill={`url(#${idBase})`} />

      {/* Couche 2 : glint radial = sun catch en biais */}
      <rect width="100%" height="100%" fill={`url(#${idGlint})`} />

      {/* Couche 3 : les caustiques blanches qui ondulent */}
      <rect width="100%" height="100%" filter={`url(#${idCaustics})`} />
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

/**
 * Détecte Safari (desktop ou iOS) pour basculer le WaterField en mode statique.
 * Justification : la chaîne de filter SVG (feTurbulence × 3 + feMorphology +
 * feDisplacementMap) recomputée chaque frame est très coûteuse sur Safari
 * (notoirement plus lent que Chromium sur les filter primitives), ce qui fait
 * lagger toute la page. Le pattern figé reste visuellement riche.
 *
 * Détection UA (pas idéal mais fiable) : Safari = WebKit sans "Chrome" dans
 * l'UA, ce qui exclut Chrome (qui contient "Safari" dans son UA aussi) et
 * Edge / Opera / etc. Couvre desktop Safari + tous les navigateurs iOS qui
 * sont obligatoirement sur WebKit (donc même perfs).
 */
function useIsSafari(): boolean {
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsSafari(/^((?!chrome|android).)*safari/i.test(ua));
  }, []);
  return isSafari;
}
