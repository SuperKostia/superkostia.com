import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Lang } from "@/lib/i18n";

export const ALT_PARTAGE: Record<Lang, string> = {
  fr: "superkostia, terrain de jeu public",
  en: "superkostia, public playground",
};

const TEXTES = {
  fr: {
    haut: "Terrain de jeu public · 2026",
    phrase: "Projets, hobbies, voyages, écrits : le terrain de jeu public de Kostia.",
    bas: "Athènes · FR/EN",
  },
  en: {
    haut: "Public playground · 2026",
    phrase: "Projects, hobbies, travel, writing: Kostia's public playground.",
    bas: "Athens · FR/EN",
  },
};
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(relativePath: string) {
  const absolute = path.join(process.cwd(), "node_modules", relativePath);
  return readFile(absolute);
}

/**
 * Police : Archivo (celle du site, décision #014) n'existe pas en local dans
 * un format lisible par satori (woff/ttf), seulement en woff2 dans le cache
 * de next/font. On garde donc Space Grotesk (@fontsource, déjà installée),
 * en graisse 500 comme les titres du site.
 */
const ENCRE = "#161616";
const GRIS = "#5c5c5c";
const SURFACE = "#f0f0f0";
const ROSE = "#ffbcca";
const ROSE_FRANC = "#ff91ac";

/** La marque à nœuds de components/layout/LogoMark.tsx, en SVG autonome. */
function Marque({ largeur }: { largeur: number }) {
  return (
    <svg width={largeur} height={(largeur * 22) / 32} viewBox="0 0 32 22" fill="none">
      <path
        d="M7 11 C 14 11, 14 4.5, 22 4.5 M7 11 C 14 11, 14 17.5, 22 17.5"
        stroke={ENCRE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="5" cy="11" r="4" fill={ENCRE} />
      <circle cx="26" cy="4.5" r="4" fill={ROSE_FRANC} />
      <circle cx="26" cy="17.5" r="4" fill={ROSE_FRANC} />
    </svg>
  );
}

function Point() {
  return <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: ROSE_FRANC }} />;
}

/** Image de partage (Open Graph et Twitter) d'une langue. */
export async function imagePartage(lang: Lang) {
  const t = TEXTES[lang];
  const [grotesk500, grotesk400] = await Promise.all([
    loadFont("@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff"),
    loadFont("@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fafafa",
          backgroundImage: "radial-gradient(circle, #d2d2d2 1.6px, transparent 2.2px)",
          backgroundSize: "28px 28px",
          padding: "40px 48px 48px",
          fontFamily: "Grotesk",
          color: ENCRE,
        }}
      >
        {/* Barre en pilule, comme l'en-tête du site */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: 76,
            padding: "0 14px 0 26px",
            borderRadius: 999,
            background: SURFACE,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Marque largeur={46} />
            <div style={{ display: "flex", fontSize: 32, fontWeight: 500, letterSpacing: -0.5 }}>
              superkostia
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 50,
              padding: "0 24px",
              borderRadius: 999,
              background: ROSE,
              fontSize: 20,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            superkostia.com
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: GRIS,
              fontWeight: 400,
            }}
          >
            <Point />
            {t.haut}
            <Point />
          </div>
          <div
            style={{
              display: "flex",
              textAlign: "center",
              fontSize: 74,
              fontWeight: 500,
              letterSpacing: -2.5,
              lineHeight: 1,
              maxWidth: 1000,
            }}
          >
            {t.phrase}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 46,
              padding: "0 22px",
              borderRadius: 999,
              background: "#e3e3e3",
              fontSize: 19,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 400,
            }}
          >
            {t.bas}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Grotesk", data: grotesk500, weight: 500, style: "normal" },
        { name: "Grotesk", data: grotesk400, weight: 400, style: "normal" },
      ],
    },
  );
}
