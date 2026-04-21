import { ArrowUpRight } from "lucide-react";

type Link = {
  label: string;
  url: string;
};

type LinksProps = {
  items?: Link[];
  label?: string;
};

export function Links({ items = [], label = "Liens" }: LinksProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-8 flex flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {label}
      </p>
      <ul className="flex flex-wrap gap-3">
        {items.map((item) => {
          const external = /^https?:\/\//.test(item.url);
          return (
            <li key={item.url}>
              <a
                href={item.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1.5 font-medium uppercase tracking-wider text-sm shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
              >
                <span>{item.label}</span>
                <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
