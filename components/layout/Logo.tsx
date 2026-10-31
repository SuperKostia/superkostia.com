"use client";

import { useState } from "react";
import NextLink from "next/link";
import { chemin } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

const THRESHOLD = 10;

type LogoProps = {
  onClick?: () => void;
};

export function Logo({ onClick }: LogoProps) {
  const [clicks, setClicks] = useState(0);
  const lang = useLang();
  const revealed = clicks >= THRESHOLD;

  return (
    <div className="flex items-center gap-3">
      <NextLink
        href={chemin(lang, "/")}
        onClick={() => {
          setClicks((n) => n + 1);
          onClick?.();
        }}
        className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase tracking-tight"
      >
        superkostia
      </NextLink>

      {revealed ? (
        <NextLink
          href={chemin(lang, "/colophon")}
          onClick={onClick}
          className="animate-[fade-in_300ms_ease-out] border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-accent-fg)]"
        >
          → colophon
        </NextLink>
      ) : null}
    </div>
  );
}
