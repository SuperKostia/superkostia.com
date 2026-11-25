import { ArrowUpRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { NodeLabel } from "@/components/ui/NodeLabel";

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
    <div className="my-8 flex flex-col gap-4">
      <NodeLabel>{label}</NodeLabel>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const external = /^https?:\/\//.test(item.url);
          return (
            <li key={item.url}>
              <a
                href={item.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={buttonClasses(i === 0 ? "accent" : "default", "md")}
              >
                <span>{item.label}</span>
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
