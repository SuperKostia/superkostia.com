import type { Metadata } from "next";
import NextLink from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getNomadsProfile, type NomadsTrip } from "@/lib/nomads";
import { WorldMap } from "@/components/voyages/WorldMap";
import { getAllSeries } from "@/lib/photos";
import { SERIES_EN } from "@/components/pages/Photographie";
import { Container } from "@/components/ui/Container";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { Panel } from "@/components/ui/Panel";
import { ButtonLink } from "@/components/ui/Button";
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
    legende: "Clique sur un pays ou une ville : séjours, dates et photos prises sur place. Filtre par année, zoome, déplace-toi.",
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
    stats: "Les chiffres",
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
    legende: "Click a country or a city: stays, dates and the photos taken there. Filter by year, zoom in, move around.",
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
    stats: "The numbers",
  },
};

const EARTH_EQUATOR_KM = 40075;

function formatDate(lang: Lang, iso: string): string {
  if (!iso) return "?";
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
  const [nomads, series] = await Promise.all([getNomadsProfile(), getAllSeries()]);
  const t = TEXTES[lang];
  const formatNumber = (n: number) => formatNombre(lang, n);

  if (!nomads) {
    return (
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-5 py-24 text-center">
          <NodeLabel>{t.titre}</NodeLabel>
          <h1 className="max-w-[16ch] text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.92] tracking-[-0.015em]">
            {t.ko}
          </h1>
          <p className="max-w-xl text-base leading-snug text-[color:var(--color-muted)] sm:text-lg">
            {t.koTexte}
          </p>
        </Container>
      </section>
    );
  }

  const photos = series.flatMap((s) =>
    s.photos.map((p) => ({
      ...p,
      serie: lang === "en" ? (SERIES_EN[s.slug] ?? s.title) : s.title,
    })),
  );
  const tripsByYear = groupTripsByYear(nomads.trips);
  const earthLaps = Math.floor(
    nomads.stats.distance_traveled_km / EARTH_EQUATOR_KM,
  );
  const topCountries = nomads.countries.slice(0, 8);
  const topStays = nomads.longestStays.slice(0, 8);
  const topFrequent = nomads.frequentPlaces.slice(0, 8);

  return (
    <article className="flex flex-col">
      {/* Héros centré sur trame de points */}
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-5 pb-14 pt-12 text-center sm:pb-20 sm:pt-16">
          <NextLink
            href={chemin(lang, "/hobbies")}
            className="inline-flex h-8 items-center gap-2 rounded-full bg-[color:var(--color-surface)] px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-fg)]"
          >
            <ArrowLeft size={13} strokeWidth={1.75} aria-hidden />
            Hobbies
          </NextLink>
          <NodeLabel>{t.titre}</NodeLabel>
          <h1 className="max-w-[14ch] text-balance text-[clamp(3rem,8vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.02em]">
            {t.h1}
          </h1>
          <p className="max-w-[54ch] text-balance text-base leading-snug text-[color:var(--color-muted)] sm:text-lg">
            {t.resume(
              nomads.stats.countries,
              nomads.stats.cities,
              formatNumber(nomads.stats.distance_traveled_km),
            )}
            <a
              href={nomads.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
             
              className="text-[color:var(--color-fg)] underline decoration-[color:var(--color-accent-strong)] decoration-2 underline-offset-[5px]"
            >
              {t.depuis}
            </a>
            .
          </p>
        </Container>
      </header>

      <Container size="wide" className="flex flex-col gap-24 pb-8 sm:gap-32">
        {/* Les chiffres : quatre cartes, croix d'angle comme sur un plan */}
        <section aria-label={t.stats} className="relative">
          <CroixAngles />
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label={t.pays} value={nomads.stats.countries} />
            <Stat label={t.villes} value={nomads.stats.cities} />
            <Stat label="km" value={formatNumber(nomads.stats.distance_traveled_km)} />
            <Stat label={t.voyages} value={nomads.stats.trips} />
          </div>
        </section>

        {/* La carte : panneau sombre pointillé, l'océan */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <NodeLabel>{t.carteEyebrow}</NodeLabel>
            <h2 className="text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.015em]">
              {t.carteTitre}
            </h2>
            <p className="max-w-[52ch] text-[color:var(--color-muted)]">{t.legende}</p>
          </div>
          <WorldMap
            trips={nomads.trips}
            countries={nomads.countries}
            photos={photos}
            lang={lang}
          />
        </section>

        {/* Équivalent : une phrase, centrée, comme un slogan */}
        <section className="flex flex-col items-center gap-5 text-center">
          <NodeLabel>{t.equivalent}</NodeLabel>
          <p className="max-w-[20ch] text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.015em]" style={{ fontStretch: "108%" }}>
            {t.tours(earthLaps)}
          </p>
          <p className="rounded-full bg-[color:var(--color-surface)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
            {t.equateur} = {formatNumber(EARTH_EQUATOR_KM)} km. {formatNumber(nomads.stats.distance_traveled_km)} km ÷ {formatNumber(EARTH_EQUATOR_KM)} = {earthLaps}.
          </p>
        </section>

        {/* Classements : trois cartes */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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

        {/* Chronologie : une carte par année */}
        <section className="flex flex-col gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <NodeLabel>{t.timelineEyebrow}</NodeLabel>
            <h2 className="text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.015em]">
              {t.timelineTitre}
            </h2>
            <p className="max-w-[52ch] text-[color:var(--color-muted)]">{t.timelineTexte}</p>
          </div>

          <ol className="mx-auto flex w-full max-w-[1000px] flex-col gap-3">
            {tripsByYear.map(({ year, trips }) => (
              <li
                key={year}
                className="grid grid-cols-1 gap-4 rounded-[24px] bg-[color:var(--color-surface)] p-5 sm:grid-cols-[9rem_1fr] sm:gap-6 sm:p-7"
              >
                <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
                  <span className="text-4xl font-medium leading-none tracking-[-0.02em] sm:text-5xl" style={{ fontStretch: "108%" }}>
                    {year}
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                    <span aria-hidden className="node-dot" />
                    {t.arrets(trips.length)}
                  </span>
                </div>

                <ul className="flex flex-col divide-y divide-[color:var(--color-line)] rounded-[16px] bg-[color:var(--color-bg)] px-4 sm:px-5">
                  {trips.map((trip) => (
                    <li
                      key={`${trip.date_start}-${trip.place_slug}`}
                      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
                    >
                      <span className="w-12 shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                        {trip.date_start.slice(5)}
                      </span>
                      <span className="text-lg font-medium tracking-[-0.01em]">
                        {trip.place}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                        {trip.country}
                      </span>
                      <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                        {trip.length}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        {nomads.firstTrip ? (
          <Panel dots as="section" className="flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-24">
            <p className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              <span aria-hidden className="node-dot" />
              {t.depart}
              <span aria-hidden className="node-dot" />
            </p>
            <p className="max-w-[24ch] text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1] tracking-[-0.015em]" style={{ fontStretch: "108%" }}>
              {t.commence(nomads.firstTrip.place, formatDate(lang, nomads.firstTrip.date_start))}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
              {t.source}
            </p>
            <ButtonLink
              href={nomads.profileUrl}
              external
              variant="accent"
             
              className="mt-3"
            >
              {t.profil}
              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
            </ButtonLink>
          </Panel>
        ) : (
          <div className="flex justify-center">
            <ButtonLink href={nomads.profileUrl} external variant="accent">
              {t.profil}
              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
            </ButtonLink>
          </div>
        )}
      </Container>
    </article>
  );
}

/** Petites croix aux quatre coins d'un bloc, comme des repères de plan. */
function CroixAngles() {
  const croix = "absolute font-mono text-sm leading-none text-[color:var(--color-muted)]";
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-3 hidden sm:block">
      <span className={`${croix} left-0 top-0 -translate-x-1/2 -translate-y-1/2`}>+</span>
      <span className={`${croix} right-0 top-0 translate-x-1/2 -translate-y-1/2`}>+</span>
      <span className={`${croix} bottom-0 left-0 -translate-x-1/2 translate-y-1/2`}>+</span>
      <span className={`${croix} bottom-0 right-0 translate-x-1/2 translate-y-1/2`}>+</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-[24px] bg-[color:var(--color-surface)] p-5 sm:p-7">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
        <span aria-hidden className="node-dot" />
        {label}
      </span>
      <span className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-none tracking-[-0.02em]" style={{ fontStretch: "108%" }}>
        {value}
      </span>
    </div>
  );
}

function TopList({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ primary: string; secondary: string; weight: number }>;
}) {
  const maxWeight = Math.max(...items.map((i) => i.weight), 1);
  return (
    <div className="flex flex-col rounded-[24px] bg-[color:var(--color-surface)] p-6 sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.015em]">
        {title}
      </h3>
      <ul className="mt-6 flex flex-col gap-4">
        {items.map((it, i) => {
          const pct = Math.round((it.weight / maxWeight) * 100);
          return (
            <li key={`${it.primary}-${i}`} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-medium tracking-[-0.01em]">
                  {it.primary}
                </span>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                  {it.secondary}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--color-surface-2)]" aria-hidden>
                <div
                  className="h-full rounded-full bg-[color:var(--color-accent-strong)]"
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
