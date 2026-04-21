import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type PressItem = {
  name: string;
  logo: string;
  url: string;
  date?: string;
};

type PressProps = {
  items?: PressItem[];
  label?: string;
};

export function Press({ items = [], label = "Presse" }: PressProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-8 flex flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {label}
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="lire"
              className="group flex h-full items-center gap-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="relative h-14 w-28 shrink-0 overflow-hidden bg-white">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-medium uppercase tracking-wider">
                  {item.name}
                </p>
                {item.date ? (
                  <p className="truncate font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
                    {item.date}
                  </p>
                ) : null}
              </div>
              <span className="hidden shrink-0 items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard-sm)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 sm:inline-flex">
                Lire l&apos;article
                <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden />
              </span>
              <ArrowUpRight
                size={18}
                strokeWidth={2.5}
                aria-hidden
                className="shrink-0 text-[color:var(--color-fg)] sm:hidden"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
