import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getNomadsProfile, type NomadsTrip } from "@/lib/nomads";
import { WorldMap } from "@/components/voyages/WorldMap";
import { LOCALE, alternates, chemin, formatNombre, type Lang } from "@/lib/i18n";

export function metadataVoyages(lang: Lang): Metadata {
  return {
    title: lang === "en" ? "Travel" : "Voyages",
    description:
      lang === "en"
        ? "Countries, cities, kilometres: a live map and timeline from nomads.com."
        : "Pays, villes, kilomètres : carte et timeline live depuis nomads.com.",
    alternates: alternates(lang, "/hobbies/voyages"),
  };
}

const TEXTES = {
  fr: {
    titre: "Voyages",
    ko: "Source momentanément KO.",
    koTexte: "La carte vit sur les données nomads.com. Leur endpoint JSON ne répond pas là tout de suite, reviens dans un instant.",
    h1: "En mouvement.",
    resume: (pays: number, villes: number, km: string) => `${pays} pays, ${villes} villes, ${km} km. Carte et timeline synchronisées `,
    depuis: "depuis nomads.com",
    carteEyebrow: "01 · carte",
    carteTitre: "Là où je suis passé.",
    legende: "Pays remplis = visités. Carrés jaunes = villes. Plus c'est gros, plus j'y suis retourné.",
    pays: "pays",
    villes: "villes",
    voyages: "voyages",
    equivalent: "Équivalent",
    tours: (n: number) => `${n} ${n > 1 ? "tours de Terre" : "tour de Terre"}, grosso modo.`,
    equateur: "Équateur",
    paysEyebrow: "02 · pays",
    paysTitre: "Le plus arpentés",
    nbVoyages: (n: number) => `${n} voyage${n > 1 ? "s" : ""}`,
    villesEyebrow: "03 · villes",
    villesTitre: "Mes retours réguliers",
    tempsEyebrow: "04 · temps passé",
    tempsTitre: "Les plus longues étapes",
    duree: (annees: number, reste: number, jours: number) =>
      annees ? `${annees} an${annees > 1 ? "s" : ""}${reste ? ` + ${reste}j` : ""}` : `${jours} j`,
    timelineEyebrow: "05 · timeline",
    timelineTitre: "Chronologie inversée.",
    timelineTexte: "Tout, depuis la naissance à Paris en 1989. Quand nomads.com me suit, je remplis les trous au fur et à mesure.",
    arrets: (n: number) => `${n} arrêt${n > 1 ? "s" : ""}`,
    depart: "Point de départ",
    commence: (lieu: string, date: string) => `Tout commence à ${lieu}, le ${date}.`,
    source: "Source : nomads.com, mise à jour chaque heure.",
    profil: "Voir le profil nomads.com",
  },
  en: {
    titre: "Travel",
    ko: "Source temporarily down.",
    koTexte: "The map runs on nomads.com data. Their JSON endpoint isn't answering right now, come back in a moment.",
    h1: "On the move.",
    resume: (pays: number, villes: number, km: string) => `${pays} countries, ${villes} cities, ${km} km. Map and timeline synced `,
    depuis: "from nomads.com",
    carteEyebrow: "01 · map",
    carteTitre: "Where I've been.",
    legende: "Filled countries = visited. Yellow squares = cities. The bigger, the more often I went back.",
    pays: "countries",
    villes: "cities",
    voyages: "trips",
    equivalent: "Equivalent",
    tours: (n: number) => `${n} ${n > 1 ? "laps of the Earth" : "lap of the Earth"}, give or take.`,
    equateur: "Equator",
    paysEyebrow: "02 · countries",
    paysTitre: "Most travelled",
    nbVoyages: (n: number) => `${n} trip${n > 1 ? "s" : ""}`,
    villesEyebrow: "03 · cities",
    villesTitre: "Where I keep going back",
    tempsEyebrow: "04 · time spent",
    tempsTitre: "Longest stays",
    duree: (annees: number, reste: number, jours: number) =>
      annees ? `${annees} yr${annees > 1 ? "s" : ""}${reste ? ` + ${reste}d` : ""}` : `${jours} d`,
    timelineEyebrow: "05 · timeline",
    timelineTitre: "Reverse chronology.",
    timelineTexte: "Everything, since I was born in Paris in 1989. When nomads.com keeps up, I fill the gaps as I go.",
    arrets: (n: number) => `${n} stop${n > 1 ? "s" : ""}`,
    depart: "Starting point",
    commence: (lieu: string, date: string) => `It all starts in ${lieu}, on ${date}.`,
    source: "Source: nomads.com, updated every hour.",
    profil: "See the nomads.com profile",
  },
};

const EARTH_EQUATOR_KM = 40075;

function formatDate(lang: Lang, iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE[lang], {
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

export async function Voyages({ lang }: { lang: Lang }) {
  const nomads = await getNomadsProfile();
  const t = TEXTES[lang];
  const formatNumber = (n: number) => formatNombre(lang, n);

  if (!nomads) {
    return (
      <section className="px-6 py-20 sm:px-10 lg:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.titre}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight">
          {t.ko}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--color-muted)]">
          {t.koTexte}
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
        <NextLink
          href={chemin(lang, "/hobbies")}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
        >
          <ArrowLeft size={12} strokeWidth={1.5} aria-hidden />
          Hobbies
        </NextLink>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-[9vw]">
          {t.h1}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
          {t.resume(
            nomads.stats.countries,
            nomads.stats.cities,
            formatNumber(nomads.stats.distance_traveled_km),
          )}
          <a
            href={nomads.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="ouvrir"
            className="underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4"
          >
            {t.depuis}
          </a>
          .
        </p>
      </header>

      <section className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              {t.carteEyebrow}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
              {t.carteTitre}
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            {t.legende}
          </p>
        </div>

        <WorldMap
          trips={nomads.trips}
          visitedAlpha2={visitedAlpha2}
          ariaLabel={lang === "en" ? "World map of Kostia's travels" : undefined}
        />
      </section>

      <section className="grid grid-cols-2 border-y-2 border-[color:var(--color-border)] sm:grid-cols-4">
        <Stat label={t.pays} value={nomads.stats.countries} />
        <Stat label={t.villes} value={nomads.stats.cities} accent />
        <Stat label="km" value={formatNumber(nomads.stats.distance_traveled_km)} />
        <Stat label={t.voyages} value={nomads.stats.trips} />
      </section>

      <section className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] px-6 py-10 text-[color:var(--color-bg)] sm:px-10 lg:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
          {t.equivalent}
        </p>
        <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {t.tours(earthLaps)}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] opacity-60">
          {t.equateur} = {formatNumber(EARTH_EQUATOR_KM)} km. {formatNumber(nomads.stats.distance_traveled_km)} km ÷ {formatNumber(EARTH_EQUATOR_KM)} = {earthLaps}.
        </p>
      </section>

      <section className="grid grid-cols-1 border-b-2 border-[color:var(--color-border)] lg:grid-cols-3">
        <TopList
          eyebrow={t.paysEyebrow}
          title={t.paysTitre}
          items={topCountries.map((c) => ({
            primary: c.name,
            secondary: t.nbVoyages(c.visitCount),
            weight: c.visitCount,
          }))}
        />
        <TopList
          eyebrow={t.villesEyebrow}
          title={t.villesTitre}
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
          eyebrow={t.tempsEyebrow}
          title={t.tempsTitre}
          items={topStays.map((s) => {
            const pretty = prettyPlaceSlug(s.slug);
            const years = s.days >= 365 ? Math.floor(s.days / 365) : 0;
            const rest = s.days - years * 365;
            const label = t.duree(years, rest, s.days);
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
            {t.timelineEyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            {t.timelineTitre}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
            {t.timelineTexte}
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
                  {t.arrets(trips.length)}
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
            {t.depart}
          </p>
          <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl leading-tight sm:text-4xl">
            {t.commence(nomads.firstTrip.place, formatDate(lang, nomads.firstTrip.date_start))}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] opacity-60">
            {t.source}
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
            {t.profil}
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
