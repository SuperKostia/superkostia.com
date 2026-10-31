import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * L'« avatar » d'un projet : le favicon / logo de son site
 * (public/images/logos, cf. scripts/fetch-logos.mjs), sinon ses initiales sur
 * fond jaune acide. Carré, bordure dure : la photo de profil, version DA.
 */
export function LogoProjet({
  titre,
  logo,
  className = "h-9 w-9",
}: {
  titre: string;
  logo?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border-2 border-[color:var(--color-border)]",
        logo
          ? "bg-white"
          : "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
        className,
      )}
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          fill
          sizes="96px"
          className="object-contain p-[8%]"
        />
      ) : (
        <span className="font-[family-name:var(--font-space-grotesk)] text-[0.85em] font-black uppercase leading-none">
          {initiales(titre)}
        </span>
      )}
    </span>
  );
}

function initiales(titre: string): string {
  const mots = titre
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  return (
    mots.length > 1 ? mots[0][0] + mots[1][0] : titre.slice(0, 2)
  ).toUpperCase();
}
