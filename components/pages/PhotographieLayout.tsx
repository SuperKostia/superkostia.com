import type { ReactNode } from "react";
import { EB_Garamond } from "next/font/google";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

export function PhotographieLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Univers à part (décision #002) mais sur les jetons de la DA : les
  // variables --photo-* suivent le fond, le texte et les filets du site,
  // en clair comme en sombre (le style en ligne prime sur globals.css).
  const jetons = {
    "--photo-bg": "var(--color-bg)",
    "--photo-fg": "var(--color-fg)",
    "--photo-fg-muted": "var(--color-muted)",
    "--photo-border": "var(--color-line)",
  } as React.CSSProperties;
  return (
    <div className={`photo-surface ${garamond.variable}`} style={jetons}>
      {children}
    </div>
  );
}
