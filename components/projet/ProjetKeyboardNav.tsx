"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/useLang";

const HINT_VISIBLE_MS = 6000;

type ProjetKeyboardNavProps = {
  prevHref?: string;
  nextHref?: string;
};

export function ProjetKeyboardNav({
  prevHref,
  nextHref,
}: ProjetKeyboardNavProps) {
  const router = useRouter();
  const en = useLang() === "en";
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), HINT_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

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

      if (isPrev && prevHref) {
        event.preventDefault();
        router.push(prevHref);
        setVisible(false);
      } else if (isNext && nextHref) {
        event.preventDefault();
        router.push(nextHref);
        setVisible(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, router]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 right-6 z-30 hidden h-9 animate-[fade-in_400ms_ease-out] rounded-full bg-[color:var(--color-ink)] px-4 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-fg)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] md:inline-flex md:items-center"
    >
      <span className="inline-block w-8 text-center animate-[keynav-arrows_1.4s_ease-in-out_infinite]">
        ← →
      </span>
      <span className="ml-2">{en ? "browse" : "naviguer"}</span>
    </div>
  );
}
