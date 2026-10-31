"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_PIED, NAV_PRINCIPALE, chemin, langueDuChemin } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitch } from "./LangSwitch";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const lang = langueDuChemin(pathname);
  const en = lang === "en";
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={en ? "Open menu" : "Ouvrir le menu"}
        className="inline-flex h-10 w-10 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] md:hidden"
      >
        <Menu size={18} strokeWidth={2.5} aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={en ? "Main menu" : "Menu principal"}
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-y-auto bg-[color:var(--color-bg)] text-[color:var(--color-fg)]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-6 py-4">
            <NextLink
              href={chemin(lang, "/")}
              onClick={close}
              className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase tracking-tight"
            >
              superkostia
            </NextLink>
            <button
              type="button"
              onClick={close}
              aria-label={en ? "Close menu" : "Fermer le menu"}
              className="inline-flex h-10 w-10 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)]"
            >
              <X size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul>
              {NAV_PRINCIPALE.map((item) => {
                const href = chemin(lang, item.cheminFr);
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li
                    key={item.cheminFr}
                    className="border-b-2 border-[color:var(--color-border)]"
                  >
                    <NextLink
                      href={href}
                      onClick={close}
                      className={cn(
                        "flex items-center px-6 py-5 font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-none tracking-tight sm:py-6 sm:text-5xl",
                        active && "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
                      )}
                    >
                      {item.label[lang]}
                    </NextLink>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-auto flex flex-wrap items-center gap-4 px-6 py-5 text-sm uppercase tracking-wider">
              {NAV_PIED.map((item) => (
                <li key={item.cheminFr}>
                  <NextLink
                    href={chemin(lang, item.cheminFr)}
                    onClick={close}
                    className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
                  >
                    {item.label[lang]}
                  </NextLink>
                </li>
              ))}
              <li className="ml-auto flex items-center gap-2">
                <LangSwitch onClick={close} />
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
