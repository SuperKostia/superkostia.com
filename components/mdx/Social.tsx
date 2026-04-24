import type { ComponentType, SVGProps } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  FacebookMark,
  InstagramMark,
  LinkedInMark,
  SubstackMark,
} from "@/components/icons/BrandMarks";

type Platform = "facebook" | "instagram" | "linkedin" | "substack";

const MARKS: Record<Platform, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookMark,
  instagram: InstagramMark,
  linkedin: LinkedInMark,
  substack: SubstackMark,
};

const LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  substack: "Substack",
};

type SocialProps = {
  platform: Platform;
  handle: string;
  url: string;
  cta?: string;
};

export function Social({ platform, handle, url, cta }: SocialProps) {
  const Mark = MARKS[platform];
  const label = LABELS[platform];
  const ctaText = cta ?? `Voir sur ${label}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="ouvrir"
      className="group my-8 flex items-stretch border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex aspect-square h-20 shrink-0 items-center justify-center border-r-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] text-[color:var(--color-bg)] transition-colors group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]">
        <Mark width={32} height={32} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {label}
        </span>
        <span className="truncate font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
          {handle}
        </span>
      </div>
      <div className="hidden shrink-0 items-center border-l-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-5 font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--color-accent-fg)] sm:flex">
        <span className="mr-2">{ctaText}</span>
        <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden />
      </div>
      <div className="flex shrink-0 items-center pr-4 sm:hidden">
        <ArrowUpRight
          size={20}
          strokeWidth={2.5}
          aria-hidden
          className="text-[color:var(--color-fg)]"
        />
      </div>
    </a>
  );
}
