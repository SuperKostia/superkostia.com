import { getProjets } from "@/lib/mdx";
import { AthensClock } from "./AthensClock";

export async function Ticker() {
  const projets = await getProjets();
  const dernier = projets[0]?.frontmatter.title ?? "—";

  const pills: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Athènes", value: <AthensClock /> },
    { label: "Dernier projet", value: dernier },
    { label: "Visiteurs aujourd'hui", value: "—" },
    { label: "Dernier mot sur le mur", value: "—" },
  ];

  const doubled = [...pills, ...pills];

  return (
    <section
      aria-label="Ticker temps réel"
      className="marquee border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
    >
      <div className="marquee__track marquee__track--slow flex min-w-[200%]">
        {doubled.map((pill, i) => (
          <div
            key={i}
            className="flex shrink-0 items-baseline gap-3 border-r-2 border-[color:var(--color-border)] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em]"
          >
            <span className="text-[color:var(--color-muted)]">· {pill.label}</span>
            <span className="text-[color:var(--color-fg)]">{pill.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
