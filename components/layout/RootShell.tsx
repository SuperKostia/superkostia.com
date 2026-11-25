import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KonamiListener } from "@/components/layout/KonamiListener";
import { LOCALE_OG, SLOGAN, chemin, type Lang } from "@/lib/i18n";

/** Archivo variable avec l'axe de largeur : élargie à 108 % pour les titres (décision #014). */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/** Mono des étiquettes, boutons et métadonnées. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${archivo.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Ce composant est le corps des deux layouts racine : le <head> y a sa place. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <KonamiListener />
        <Header lang={lang} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
