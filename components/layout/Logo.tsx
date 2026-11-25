"use client";

import { useState } from "react";
import NextLink from "next/link";
import { chemin } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import { LogoMark } from "./LogoMark";

const THRESHOLD = 10;

type LogoProps = {
  onClick?: () => void;
};

export function Logo({ onClick }: LogoProps) {
  const [clicks, setClicks] = useState(0);
  const lang = useLang();
  const revealed = clicks >= THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <NextLink
        href={chemin(lang, "/")}
        onClick={() => {
          setClicks((n) => n + 1);
          onClick?.();
        }}
        aria-label="superkostia"
        className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-2"
      >
        <LogoMark />
        <span className="font-display text-[19px] font-medium tracking-[-0.01em]">superkostia</span>
      </NextLink>

      {revealed ? (
        <NextLink
          href={chemin(lang, "/colophon")}
          onClick={onClick}
          className="animate-[fade-in_300ms_ease-out] rounded-full bg-[color:var(--color-accent)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-[color:var(--color-accent-fg)]"
        >
          → colophon
        </NextLink>
      ) : null}
    </div>
  );
}
