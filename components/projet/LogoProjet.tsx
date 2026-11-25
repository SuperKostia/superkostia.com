import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * L'« avatar » d'un projet : le favicon / logo de son site
 * (public/images/logos, cf. scripts/fetch-logos.mjs), sinon ses initiales sur
 * fond rose. Carré arrondi, fond blanc, anneau fin (décision #014).
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
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-inset ring-[color:var(--color-line)]",
        // Rayon par défaut, sauf si l'appelant en fixe un autre (pas de conflit de classes).
        !/\brounded-/.test(className) && "rounded-[10px]",
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
          className="object-contain p-[12%]"
        />
      ) : (
        <span className="font-display text-[0.85em] font-medium leading-none tracking-[-0.01em]">
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
