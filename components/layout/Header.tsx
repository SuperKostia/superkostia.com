import NextLink from "next/link";
import { NAV_PRINCIPALE, chemin, type Lang } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";
import { LangSwitch } from "./LangSwitch";

export function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/75">
      <div className="flex items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-12">
        <Logo />

        <nav
          className="hidden md:block"
          aria-label={lang === "en" ? "Main navigation" : "Navigation principale"}
        >
          <ul className="flex items-center gap-6">
            {NAV_PRINCIPALE.map((item) => (
              <li key={item.cheminFr}>
                <NextLink
                  href={chemin(lang, item.cheminFr)}
                  className="relative font-medium uppercase tracking-wider text-sm hover:text-[color:var(--color-fg)]"
                >
                  {item.label[lang]}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <LangSwitch />
            <ThemeToggle />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
