"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_PIED, NAV_PRINCIPALE, chemin, langueDuChemin } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitch } from "./LangSwitch";
import { LogoMark } from "./LogoMark";
import { buttonClasses } from "@/components/ui/Button";
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
        className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[color:var(--color-surface-2)] text-[color:var(--color-fg)] lg:hidden"
      >
        <Menu size={18} strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={en ? "Main menu" : "Menu principal"}
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-y-auto bg-[color:var(--color-bg)] p-3 text-[color:var(--color-fg)]"
        >
          <div className="flex h-[54px] items-center justify-between rounded-full bg-[color:var(--color-surface)] px-1.5">
            <NextLink
              href={chemin(lang, "/")}
              onClick={close}
              className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-2"
            >
              <LogoMark />
              <span className="font-display text-[19px] font-medium tracking-[-0.01em]">superkostia</span>
            </NextLink>
            <button
              type="button"
              onClick={close}
              aria-label={en ? "Close menu" : "Fermer le menu"}
              className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[color:var(--color-surface-2)]"
            >
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>
          </div>

          <nav className="bg-dots mt-3 flex flex-1 flex-col rounded-[28px] p-3">
            <ul className="flex flex-col gap-2">
              {NAV_PRINCIPALE.map((item) => {
                const href = chemin(lang, item.cheminFr);
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={item.cheminFr}>
                    <NextLink
                      href={href}
                      onClick={close}
                      className={cn(
                        "flex items-center justify-between rounded-[20px] px-5 py-5 text-4xl font-medium leading-none tracking-[-0.015em]",
                        active
                          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                          : "bg-[color:var(--color-surface)]",
                      )}
                      style={{ fontStretch: "108%" }}
                    >
                      {item.label[lang]}
                      <span aria-hidden className="node-dot" />
                    </NextLink>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <NextLink
                href={chemin(lang, "/contact")}
                onClick={close}
                className={buttonClasses("accent", "lg", "w-full")}
              >
                {en ? "Get in touch" : "M'écrire"}
              </NextLink>
              <ul className="flex flex-wrap items-center gap-1">
                {NAV_PIED.filter((i) => i.cheminFr !== "/contact").map((item) => (
                  <li key={item.cheminFr}>
                    <NextLink
                      href={chemin(lang, item.cheminFr)}
                      onClick={close}
                      className={buttonClasses("ghost", "md")}
                    >
                      {item.label[lang]}
                    </NextLink>
                  </li>
                ))}
                <li className="ml-auto flex items-center gap-1">
                  <LangSwitch onClick={close} />
                  <ThemeToggle />
                </li>
              </ul>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
