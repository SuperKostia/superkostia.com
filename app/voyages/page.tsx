import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getNomadsProfile, type NomadsTrip } from "@/lib/nomads";
import { WorldMap } from "@/components/voyages/WorldMap";

export const metadata: Metadata = {
  title: "Voyages",
  description:
    "22 pays, 33 villes, 156 000 km — carte et timeline live depuis nomads.com.",
};

const EARTH_EQUATOR_KM = 40075;

function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function prettyPlaceSlug(slug: string): { place: string; country: string } {
  const parts = slug.split("-");
  const placeCount = Math.max(1, Math.floor(parts.length / 2));
  const placeParts = parts.slice(0, placeCount);
  const countryParts = parts.slice(placeCount);
  return {
    place: titleCaseSlug(placeParts.join("-")),
    country: titleCaseSlug(countryParts.join("-")),
  };
}

function groupTripsByYear(
  trips: NomadsTrip[],
): Array<{ year: string; trips: NomadsTrip[] }> {
  const map = new Map<string, NomadsTrip[]>();
  for (const t of trips) {
    const year = t.date_start.slice(0, 4);
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(t);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, trips]) => ({ year, trips }));
}

export default async function VoyagesPage() {
  const nomads = await getNomadsProfile();

  if (!nomads) {
    return (
      <section className="px-6 py-20 sm:px-10 lg:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Voyages
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight">
          Source momentanément KO.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--color-muted)]">
          La carte vit sur les données nomads.com. Leur endpoint JSON ne répond
          pas là tout de suite — reviens dans un instant.
        </p>
      </section>
    );
  }

  const visitedAlpha2 = nomads.countries.map((c) => c.code);
  const tripsByYear = groupTripsByYear(nomads.trips);
  const earthLaps = Math.floor(
    nomads.stats.distance_traveled_km / EARTH_EQUATOR_KM,
  );
  const topCountries = nomads.countries.slice(0, 8);
  const topStays = nomads.longestStays.slice(0, 8);
  const topFrequent = nomads.frequentPlaces.slice(0, 8);

  return (
    <article className="flex flex-col">
      <header className="border-b-2 border-[color:var(--color-border)] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Voyages
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-[9vw]">
          En mouvement.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
          {nomads.stats.countries} pays, {nomads.stats.cities} villes,{" "}
          {formatNumber(nomads.stats.distance_traveled_km)} km. Carte et
          timeline synchronisées{" "}
          <a
            href={nomads.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="ouvrir"
            className="underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4"
          >
            depuis nomads.com
          </a>
          .
        </p>
      </header>

      <section className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              01 · carte
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
              Là où je suis passé.
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            Pays remplis = visités. Carrés jaunes = villes. Plus c&apos;est
            gros, plus j&apos;y suis retourné.
          </p>
        </div>

        <WorldMap trips={nomads.trips} visitedAlpha2={visitedAlpha2} />
      </section>

      <section className="grid grid-cols-2 border-y-2 border-[color:var(--color-border)] sm:grid-cols-4">
        <Stat label="pays" value={nomads.stats.countries} />
        <Stat label="villes" value={nomads.stats.cities} accent />
        <Stat label="km" value={formatNumber(nomads.stats.distance_traveled_km)} />
        <Stat label="voyages" value={nomads.stats.trips} />
      </section>

      <section className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] px-6 py-10 text-[color:var(--color-bg)] sm:px-10 lg:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
          Équivalent
        </p>
        <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {earthLaps}{earthLaps > 1 ? " tours de Terre" : " tour de Terre"},
          grosso modo.
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] opacity-60">
          Équateur = {formatNumber(EARTH_EQUATOR_KM)} km. {formatNumber(nomads.stats.distance_traveled_km)} km ÷ {formatNumber(EARTH_EQUATOR_KM)} = {earthLaps}.
        </p>
      </section>

      <section className="grid grid-cols-1 border-b-2 border-[color:var(--color-border)] lg:grid-cols-3">
        <TopList
          eyebrow="02 · pays"
          title="Le plus arpentés"
          items={topCountries.map((c) => ({
            primary: c.name,
            secondary: `${c.visitCount} voyage${c.visitCount > 1 ? "s" : ""}`,
            weight: c.visitCount,
          }))}
        />
        <TopList
          eyebrow="03 · villes"
          title="Mes retours réguliers"
          accent
          items={topFrequent.map((p) => {
            const pretty = prettyPlaceSlug(p.slug);
            return {
              primary: pretty.place,
              secondary: `${pretty.country} · ${p.visits}×`,
              weight: p.visits,
            };
          })}
        />
        <TopList
          eyebrow="04 · temps passé"
          title="Les plus longues étapes"
          items={topStays.map((s) => {
            const pretty = prettyPlaceSlug(s.slug);
            const years = s.days >= 365 ? Math.floor(s.days / 365) : 0;
            const rest = s.days - years * 365;
            const label = years
              ? `${years} an${years > 1 ? "s" : ""}${rest ? ` + ${rest}j` : ""}`
              : `${s.days} j`;
            return {
              primary: pretty.place,
              secondary: label,
              weight: s.days,
            };
          })}
        />
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            05 · timeline
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            Chronologie inversée.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
            Tout, depuis la naissance à Paris en 1989. Quand nomads.com me
            suit, je remplis les trous au fur et à mesure.
          </p>
        </div>

        <ol className="flex flex-col">
          {tripsByYear.map(({ year, trips }) => (
            <li
              key={year}
              className="grid grid-cols-1 gap-4 border-t-2 border-[color:var(--color-border)] py-6 sm:grid-cols-[7rem_1fr] sm:gap-8 sm:py-8"
            >
              <div>
                <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black leading-none tracking-tight sm:text-5xl">
                  {year}
                </span>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
                  {trips.length} arrêt{trips.length > 1 ? "s" : ""}
                </p>
              </div>

              <ul className="flex flex-col">
                {trips.map((t) => (
                  <li
                    key={`${t.date_start}-${t.place_slug}`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[color:var(--color-border)]/30 py-2.5 last:border-b-0"
                  >
                    <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
                      {t.date_start.slice(5)}
                    </span>
                    <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight">
                      {t.place}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
                      {t.country}
                    </span>
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-muted)]">
                      {t.length}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {nomads.firstTrip ? (
        <section className="border-t-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-6 py-12 text-[color:var(--color-accent-fg)] sm:px-10 lg:px-12 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
            Point de départ
          </p>
          <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl leading-tight sm:text-4xl">
            Tout commence à {nomads.firstTrip.place}, le{" "}
            {formatDate(nomads.firstTrip.date_start)}.
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] opacity-60">
            Source : nomads.com — mise à jour chaque heure.
          </p>
        </section>
      ) : null}

      <section className="border-t-2 border-[color:var(--color-border)] px-6 py-10 sm:px-10 lg:px-12">
        <a
          href={nomads.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="ouvrir"
          className="group inline-flex items-center gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] px-6 py-4 text-[color:var(--color-bg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-black uppercase tracking-tight">
            Voir le profil nomads.com
          </span>
          <ArrowUpRight
            size={20}
            strokeWidth={2.5}
            aria-hidden
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </section>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 border-[color:var(--color-border)] p-6 sm:p-8 [&:not(:last-child)]:border-r-2 ${
        accent
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : ""
      }`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">
        {label}
      </span>
      <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black leading-none tracking-tight sm:text-5xl">
        {value}
      </span>
    </div>
  );
}

function TopList({
  eyebrow,
  title,
  items,
  accent,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ primary: string; secondary: string; weight: number }>;
  accent?: boolean;
}) {
  const maxWeight = Math.max(...items.map((i) => i.weight), 1);
  return (
    <div
      className={`flex flex-col border-[color:var(--color-border)] p-6 sm:p-8 [&:not(:last-child)]:border-b-2 lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r-2 ${
        accent
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : ""
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
        {title}
      </h3>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((it, i) => {
          const pct = Math.round((it.weight / maxWeight) * 100);
          return (
            <li key={`${it.primary}-${i}`} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-[family-name:var(--font-space-grotesk)] text-base font-bold tracking-tight">
                  {it.primary}
                </span>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] opacity-70">
                  {it.secondary}
                </span>
              </div>
              <div
                className="h-1.5 border border-current"
                aria-hidden
              >
                <div
                  className="h-full bg-current"
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
