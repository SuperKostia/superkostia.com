"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HINT_VISIBLE_MS = 5000;
const STORAGE_KEY = "projet-keynav-seen";

type ProjetKeyboardNavProps = {
  prevSlug?: string;
  nextSlug?: string;
};

export function ProjetKeyboardNav({
  prevSlug,
  nextSlug,
}: ProjetKeyboardNavProps) {
  const router = useRouter();
  const [hintState, setHintState] = useState<"hidden" | "pulsing" | "dismissed">(
    "hidden",
  );

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHintState(seen ? "dismissed" : "pulsing");
  }, []);

  useEffect(() => {
    if (hintState !== "pulsing") return;
    const timer = window.setTimeout(() => {
      setHintState("dismissed");
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {}
    }, HINT_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [hintState]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }

      const isPrev = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
      if (!isPrev && !isNext) return;

      if (isPrev && prevSlug) {
        event.preventDefault();
        router.push(`/projets/${prevSlug}`);
        setHintState("dismissed");
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
      } else if (isNext && nextSlug) {
        event.preventDefault();
        router.push(`/projets/${nextSlug}`);
        setHintState("dismissed");
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevSlug, nextSlug, router]);

  if (hintState !== "pulsing") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 right-6 z-30 hidden animate-[fade-in_400ms_ease-out] border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] md:[@media(pointer:fine)]:inline-flex md:[@media(pointer:fine)]:items-center"
    >
      <span className="inline-block w-8 text-center animate-[keynav-arrows_1.4s_ease-in-out_infinite]">
        ← →
      </span>
      <span className="ml-2">naviguer</span>
    </div>
  );
}
