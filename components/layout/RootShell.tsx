import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KonamiListener } from "@/components/layout/KonamiListener";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { LOCALE_OG, SLOGAN, chemin, type Lang } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

/** Métadonnées racine d'une langue (chaque page les complète avec les siennes). */
export function metadataRacine(lang: Lang): Metadata {
  return {
    metadataBase: new URL("https://superkostia.com"),
    title: {
      default: "superkostia",
      template: "%s — superkostia",
    },
    description: SLOGAN[lang],
    alternates: {
      canonical: chemin(lang, "/"),
      languages: { fr: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      locale: LOCALE_OG[lang],
      alternateLocale: LOCALE_OG[lang === "fr" ? "en" : "fr"],
      url: chemin(lang, "/"),
      siteName: "superkostia",
      title: "superkostia",
      description: SLOGAN[lang],
    },
    twitter: {
      card: "summary_large_image",
      title: "superkostia",
      description: SLOGAN[lang],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/** Squelette HTML commun aux deux layouts racine, `(fr)` et `(en)/en`. */
export function RootShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Ce composant est le corps des deux layouts racine : le <head> y a sa place. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <KonamiListener />
        <CustomCursor />
        <Header lang={lang} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
