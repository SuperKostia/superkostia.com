import { Tag } from "@/components/ui/Tag";

type StackProps = {
  items?: string[];
  label?: string;
};

export function Stack({ items = [], label = "Stack" }: StackProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-8 flex flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 shadow-[var(--shadow-hard-sm)]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <Tag>{item}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}
