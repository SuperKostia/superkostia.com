import NextLink from "next/link";
import { PRIMARY_NAV } from "./nav";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/75">
      <div className="flex items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-12">
        <NextLink
          href="/"
          className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase tracking-tight"
        >
          superkostia
        </NextLink>

        <nav className="hidden md:block" aria-label="Navigation principale">
          <ul className="flex items-center gap-6">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <NextLink
                  href={item.href}
                  className="relative font-medium uppercase tracking-wider text-sm hover:text-[color:var(--color-fg)]"
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
