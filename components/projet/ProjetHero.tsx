import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { buttonClasses } from "@/components/ui/Button";

type ProjetHeroProps = {
  title: string;
  url: string;
  screenshotSrc: string;
  lang: Lang;
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** La capture du site dans un cadre de fenêtre arrondi (barre grise à pastilles). */
export function ProjetHero({ title, url, screenshotSrc, lang }: ProjetHeroProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="ouvrir"
      className="group relative mb-16 block overflow-hidden rounded-[24px] bg-[color:var(--color-surface)] p-2 transition-colors hover:bg-[color:var(--color-surface-2)] sm:rounded-[28px] sm:p-3"
    >
      <div className="flex items-center gap-3 px-2 pb-2.5 pt-1 sm:px-3 sm:pb-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-line)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-line)]" />
        </span>
        <span className="mx-auto truncate rounded-full bg-[color:var(--color-bg)] px-4 py-1 font-mono text-[11px] tracking-[0.02em] text-[color:var(--color-muted)]">
          {hostname(url)}
        </span>
        <span className="hidden w-[42px] sm:block" aria-hidden />
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[color:var(--color-surface-2)] sm:rounded-[20px]">
        <Image
          src={screenshotSrc}
          alt={lang === "en" ? `Screenshot of ${title}` : `Capture de ${title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
        />
        <span
          className={buttonClasses(
            "accent",
            "sm",
            "absolute bottom-3 right-3 sm:bottom-4 sm:right-4 sm:h-[42px] sm:px-4 sm:text-[13px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] group-hover:bg-[color:var(--color-accent-strong)]",
          )}
        >
          {lang === "en" ? "Visit the site" : "Voir le site"}
          <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </a>
  );
}
