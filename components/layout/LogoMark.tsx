import { cn } from "@/lib/utils";

/**
 * Marque du site : un nœud qui se divise en deux (Kostia fait trop de choses).
 * Le nœud source prend la couleur du texte, les deux branches le rose.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 22"
      fill="none"
      aria-hidden
      className={cn("h-[22px] w-8 shrink-0", className)}
    >
      <path
        d="M7 11 C 14 11, 14 4.5, 22 4.5 M7 11 C 14 11, 14 17.5, 22 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="5" cy="11" r="4" fill="currentColor" />
      <circle cx="26" cy="4.5" r="4" fill="var(--color-accent-strong)" />
      <circle cx="26" cy="17.5" r="4" fill="var(--color-accent-strong)" />
    </svg>
  );
}
