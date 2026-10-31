import { getProjets } from "@/lib/mdx";
import { getNomadsProfile } from "@/lib/nomads";
import { AthensClock } from "./AthensClock";
import { formatNombre, type Lang } from "@/lib/i18n";

const LIBELLES = {
  fr: { athenes: "Athènes", projet: "Dernier projet", pays: "Pays visités", km: "Km parcourus", ville: "Dernière ville", aria: "Ticker temps réel" },
  en: { athenes: "Athens", projet: "Latest project", pays: "Countries visited", km: "Km travelled", ville: "Last city", aria: "Live ticker" },
} satisfies Record<Lang, Record<string, string>>;

export async function Ticker({ lang }: { lang: Lang }) {
  const l = LIBELLES[lang];
  const [projets, nomads] = await Promise.all([
    getProjets(lang),
    getNomadsProfile(),
  ]);
  const dernier = projets[0]?.frontmatter.title ?? "—";

  const pills: Array<{ label: string; value: React.ReactNode }> = [
    { label: l.athenes, value: <AthensClock /> },
    { label: l.projet, value: dernier },
    {
      label: l.pays,
      value: nomads ? `${nomads.stats.countries}` : "—",
    },
    {
      label: l.km,
      value: nomads ? `${formatNombre(lang, nomads.stats.distance_traveled_km)} km` : "—",
    },
    {
      label: l.ville,
      value: nomads?.lastTrip ? nomads.lastTrip.place : "—",
    },
  ];

  const doubled = [...pills, ...pills];

  return (
    <section
      aria-label={l.aria}
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
