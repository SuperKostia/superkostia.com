"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PRIMARY_NAV, FOOTER_NAV } from "./nav";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
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
        aria-label="Ouvrir le menu"
        className="inline-flex h-10 w-10 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] md:hidden"
      >
        <Menu size={18} strokeWidth={2.5} aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className="fixed inset-0 z-50 flex flex-col bg-[color:var(--color-bg)] text-[color:var(--color-fg)]"
        >
          <div className="flex items-center justify-between border-b-2 border-[color:var(--color-border)] px-6 py-4">
            <NextLink
              href="/"
              onClick={close}
              className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase tracking-tight"
            >
              superkostia
            </NextLink>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer le menu"
              className="inline-flex h-10 w-10 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)]"
            >
              <X size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto">
            <ul>
              {PRIMARY_NAV.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li
                    key={item.href}
                    className="border-b-2 border-[color:var(--color-border)]"
                  >
                    <NextLink
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center px-6 py-6 font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-none tracking-tight",
                        active && "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
                      )}
                    >
                      {item.label}
                    </NextLink>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-auto flex flex-wrap gap-4 px-6 py-6 text-sm uppercase tracking-wider">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <NextLink
                    href={item.href}
                    onClick={close}
                    className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
              <li className="ml-auto">
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
