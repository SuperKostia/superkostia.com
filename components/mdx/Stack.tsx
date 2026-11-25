import { Tag } from "@/components/ui/Tag";
import { NodeLabel } from "@/components/ui/NodeLabel";

type StackProps = {
  items?: string[];
  label?: string;
};

export function Stack({ items = [], label = "Stack" }: StackProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-8 flex flex-col gap-4 rounded-[20px] bg-[color:var(--color-surface)] p-5">
      <NodeLabel>{label}</NodeLabel>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <Tag className="bg-[color:var(--color-bg)]">{item}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}
