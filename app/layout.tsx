import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KonamiListener } from "@/components/layout/KonamiListener";
import { CustomCursor } from "@/components/layout/CustomCursor";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://superkostia.com"),
  title: {
    default: "superkostia",
    template: "%s — superkostia",
  },
  description: "Le terrain de jeu public de Kostia — projets, hobbies, laboratoire, écrits.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "superkostia",
    title: "superkostia",
    description:
      "Le terrain de jeu public de Kostia — projets, hobbies, laboratoire, écrits.",
  },
  twitter: {
    card: "summary_large_image",
    title: "superkostia",
    description:
      "Le terrain de jeu public de Kostia — projets, hobbies, laboratoire, écrits.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <KonamiListener />
        <CustomCursor />
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
