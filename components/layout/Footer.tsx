import NextLink from "next/link";
import { FOOTER_NAV } from "./nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <div className="flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-12">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase tracking-tight">
            superkostia
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Terrain de jeu public · {year}
          </p>
        </div>

        <nav aria-label="Navigation secondaire">
          <ul className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-wider">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <NextLink
                  href={item.href}
                  className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/SuperKostia/superkostia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
              >
                Source
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
