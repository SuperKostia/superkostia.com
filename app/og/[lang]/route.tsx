import { imagePartage } from "@/components/pages/ImagePartage";
import { LANGUES, type Lang } from "@/lib/i18n";

/**
 * Image de partage par défaut à une adresse stable (/og/fr, /og/en), pour les
 * pages dont les métadonnées redéfinissent openGraph : Next n'y hérite plus
 * de l'opengraph-image du layout.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return imagePartage(lang === "en" ? "en" : ("fr" satisfies Lang));
}
