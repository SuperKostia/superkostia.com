import NextLink from "next/link";
import { NAV_PIED, NAV_PRINCIPALE, SLOGAN, chemin, type Lang } from "@/lib/i18n";
import { LogoMark } from "./LogoMark";

const lienPied =
  "inline-flex font-mono text-[13px] uppercase tracking-[0.04em] text-[color:var(--color-ink-fg)] transition-colors hover:text-[color:var(--color-accent-strong)]";

/** Pied de page : panneau sombre arrondi, marque en rose, liens en mono. */
export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  const en = lang === "en";

  return (
    <footer className="px-3 pb-3 pt-16 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-[1460px] overflow-hidden rounded-[28px] bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)] sm:rounded-[32px]">
        <div className="grid grid-cols-1 gap-12 px-7 pb-10 pt-12 sm:px-12 sm:pt-16 lg:grid-cols-12 lg:px-20">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <NextLink href={chemin(lang, "/")} className="flex items-center gap-4 self-start">
              <LogoMark className="h-9 w-14 text-[color:var(--color-accent-strong)]" />
              <span className="font-display text-4xl font-medium tracking-[-0.02em]">superkostia</span>
            </NextLink>
            <p className="max-w-[36ch] text-[color:var(--color-ink-muted)]">{SLOGAN[lang]}</p>
          </div>

          <nav
            aria-label={en ? "Footer navigation" : "Navigation du pied de page"}
            className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:col-span-6"
          >
            <ul className="flex flex-col gap-5">
              {NAV_PRINCIPALE.map((item) => (
                <li key={item.cheminFr}>
                  <NextLink href={chemin(lang, item.cheminFr)} className={lienPied}>
                    {item.label[lang]}
                  </NextLink>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-5">
              {NAV_PIED.map((item) => (
                <li key={item.cheminFr}>
                  <NextLink href={chemin(lang, item.cheminFr)} className={lienPied}>
                    {item.label[lang]}
                  </NextLink>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/SuperKostia/superkostia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={lienPied}
                >
                  Source
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div aria-hidden className="bg-dots-ink mx-7 h-40 sm:mx-12 lg:mx-20" />

        <div className="flex flex-col gap-2 px-7 py-6 text-xs text-[color:var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-12 lg:px-20">
          <span>{en ? "Public playground" : "Terrain de jeu public"} · {year}</span>
          <span>© {year} Kostia. {en ? "Nothing is finished." : "Rien n'est fini."}</span>
        </div>
      </div>
    </footer>
  );
}
