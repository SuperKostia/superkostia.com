import { cn } from "@/lib/utils";

/**
 * Icônes en matrice de points (11 × 11) : « # » allume un carré, « . » laisse
 * un point éteint de la trame. Le style des cartes sombres de n8n, en dessins maison.
 */
export const PIXELS = {
  projets: [
    "...........",
    ".####......",
    ".#..#######",
    ".#........#",
    ".##########",
    ".#........#",
    ".#........#",
    ".#........#",
    ".#........#",
    ".##########",
    "...........",
  ],
  hobbies: [
    "...........",
    "....###....",
    ".#########.",
    ".#.......#.",
    ".#..###..#.",
    ".#.#...#.#.",
    ".#.#...#.#.",
    ".#..###..#.",
    ".#.......#.",
    ".#########.",
    "...........",
  ],
  ecrits: [
    ".#######...",
    ".#.....##..",
    ".#.###..##.",
    ".#.......#.",
    ".#.#####.#.",
    ".#.......#.",
    ".#.#####.#.",
    ".#.......#.",
    ".#.###...#.",
    ".#########.",
    "...........",
  ],
  apropos: [
    "...#####...",
    "..#.....#..",
    ".#.......#.",
    "#..#...#..#",
    "#.........#",
    "#.........#",
    "#.#.....#.#",
    "#..#...#..#",
    ".#..###..#.",
    "..#.....#..",
    "...#####...",
  ],
} satisfies Record<string, string[]>;

export type NomPixel = keyof typeof PIXELS;

const PAS = 10;

export function PixelIcon({ nom, className }: { nom: NomPixel; className?: string }) {
  const lignes = PIXELS[nom];
  const taille = lignes.length * PAS;
  return (
    <svg viewBox={`0 0 ${taille} ${taille}`} aria-hidden className={cn("h-auto", className)}>
      {lignes.flatMap((ligne, y) =>
        [...ligne].map((c, x) =>
          c === "#" ? (
            <rect
              key={`${x}-${y}`}
              x={x * PAS + 1}
              y={y * PAS + 1}
              width={PAS - 2}
              height={PAS - 2}
              rx={1}
              className="fill-current"
            />
          ) : (
            <circle
              key={`${x}-${y}`}
              cx={x * PAS + PAS / 2}
              cy={y * PAS + PAS / 2}
              r={1}
              fill="var(--color-ink-line)"
            />
          ),
        ),
      )}
    </svg>
  );
}
