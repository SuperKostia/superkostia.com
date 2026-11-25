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

export const LABELS: Record<Platform, string> = {
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
     
      className="group my-8 flex items-center gap-4 rounded-[24px] bg-[color:var(--color-surface)] p-3 pr-4 transition-colors hover:bg-[color:var(--color-surface-2)] sm:pr-5"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)] transition-colors group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]">
        <Mark width={28} height={28} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
          <span aria-hidden className="node-dot" />
          {label}
        </span>
        <span className="truncate font-display text-2xl font-medium leading-tight tracking-[-0.015em]">
          {handle}
        </span>
      </div>
      <span className="hidden shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-3 font-mono text-[12px] uppercase tracking-[0.04em] text-[color:var(--color-accent-fg)] transition-colors group-hover:bg-[color:var(--color-accent-strong)] sm:inline-flex">
        {ctaText}
        <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] sm:hidden">
        <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
      </span>
    </a>
  );
}
