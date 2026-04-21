import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "superkostia — terrain de jeu public";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(relativePath: string) {
  const absolute = path.join(process.cwd(), "node_modules", relativePath);
  return readFile(absolute);
}

export default async function Image() {
  const [spaceGroteskBold, interMedium] = await Promise.all([
    loadFont(
      "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff",
    ),
    loadFont("@fontsource/inter/files/inter-latin-500-normal.woff").catch(
      () => null,
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f1ea",
          padding: 72,
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 6,
              color: "#6b6b6b",
              fontFamily: "ui-monospace, Menlo, monospace",
            }}
          >
            Terrain de jeu public · 2026
          </div>
          <div
            style={{
              display: "flex",
              width: 48,
              height: 48,
              background: "#0a0a0a",
              alignItems: "center",
              justifyContent: "center",
              color: "#E4FF3A",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            SK
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              fontSize: 180,
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              color: "#111",
              letterSpacing: -8,
              lineHeight: 0.9,
              textTransform: "lowercase",
            }}
          >
            <span>super</span>
            <span
              style={{
                background: "#E4FF3A",
                color: "#111",
                padding: "0 18px 6px 18px",
                transform: "rotate(-1.5deg)",
                border: "4px solid #111",
                marginLeft: 8,
              }}
            >
              kostia
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#111",
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            Projets, hobbies, laboratoire, écrits — le terrain de jeu public de
            Kostia.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            width: "100%",
            paddingTop: 24,
            borderTop: "3px solid #111",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: 4,
            color: "#111",
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          <div style={{ display: "flex" }}>superkostia.com</div>
          <div style={{ display: "flex", color: "#6b6b6b" }}>
            Athènes · FR/EN
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGroteskBold,
          weight: 700,
          style: "normal",
        },
        ...(interMedium
          ? ([
              {
                name: "Inter",
                data: interMedium,
                weight: 500,
                style: "normal",
              },
            ] as const)
          : []),
      ],
    },
  );
}
