import { NAV_PRINCIPALE, chemin, type Lang } from "@/lib/i18n";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { NavLink } from "./NavLink";

/** Barre de navigation flottante en pilule (décision #014). */
export function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-[54px] max-w-[1360px] items-center justify-between gap-4 rounded-full bg-[color:var(--color-surface)]/90 px-1.5 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--color-surface)]/80">
        <Logo />

        <nav
          className="hidden lg:block"
          aria-label={lang === "en" ? "Main navigation" : "Navigation principale"}
        >
          <ul className="flex items-center gap-1">
            {NAV_PRINCIPALE.map((item) => (
              <li key={item.cheminFr}>
                <NavLink href={chemin(lang, item.cheminFr)}>{item.label[lang]}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            <LangSwitch />
            <ThemeToggle />
            <ButtonLink href={chemin(lang, "/contact")} variant="accent" className="ml-1">
              {lang === "en" ? "Get in touch" : "M'écrire"}
            </ButtonLink>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

