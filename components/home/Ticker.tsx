import { getProjets } from "@/lib/mdx";
import { getNomadsProfile } from "@/lib/nomads";
import { AthensClock } from "./AthensClock";

function formatKm(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " km";
}

export async function Ticker() {
  const [projets, nomads] = await Promise.all([
    getProjets(),
    getNomadsProfile(),
  ]);
  const dernier = projets[0]?.frontmatter.title ?? "—";

  const pills: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Athènes", value: <AthensClock /> },
    { label: "Dernier projet", value: dernier },
    {
      label: "Pays visités",
      value: nomads ? `${nomads.stats.countries}` : "—",
    },
    {
      label: "Km parcourus",
      value: nomads ? formatKm(nomads.stats.distance_traveled_km) : "—",
    },
    {
      label: "Dernière ville",
      value: nomads?.lastTrip ? nomads.lastTrip.place : "—",
    },
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
