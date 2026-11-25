"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "@/lib/useLang";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const en = useLang() === "en";

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const label =
    theme === "dark"
      ? en ? "Switch to light" : "Passer en clair"
      : en ? "Switch to dark" : "Passer en sombre";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-surface-2)]"
    >
      {theme === "dark" ? (
        <Sun size={17} strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon size={17} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
