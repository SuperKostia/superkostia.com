import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { NodeLabel } from "@/components/ui/NodeLabel";

type PressProps = {
  children?: ReactNode;
  label?: string;
};

export function Press({ children, label = "Presse" }: PressProps) {
  return (
    <div className="my-8 flex flex-col gap-4">
      <NodeLabel>{label}</NodeLabel>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</ul>
    </div>
  );
}

type PressItemProps = {
  name: string;
  logo: string;
  url: string;
  date?: string;
};

export function PressItem({ name, logo, url, date }: PressItemProps) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
       
        className="group flex h-full items-center gap-4 rounded-[20px] bg-[color:var(--color-surface)] p-3 pr-5 transition-colors hover:bg-[color:var(--color-surface-2)]"
      >
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[12px] bg-white">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-medium">{name}</p>
          {date ? (
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
              {date}
            </p>
          ) : null}
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] transition-colors group-hover:bg-[color:var(--color-accent-strong)]">
          <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
        </span>
      </a>
    </li>
  );
}
