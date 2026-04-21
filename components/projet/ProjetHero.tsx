import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type ProjetHeroProps = {
  title: string;
  url: string;
  screenshotSrc: string;
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProjetHero({ title, url, screenshotSrc }: ProjetHeroProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="ouvrir"
      className="group relative mb-12 block -rotate-[0.5deg] border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:rotate-0"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)]">
        <Image
          src={screenshotSrc}
          alt={`Capture de ${title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover object-top"
        />
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {hostname(url)}
        </span>
        <span className="inline-flex items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-1.5 font-medium uppercase tracking-wider text-sm text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard-sm)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
          Voir le site
          <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden />
        </span>
      </div>
    </a>
  );
}
