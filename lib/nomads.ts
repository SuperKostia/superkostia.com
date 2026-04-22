import "server-only";

const ENDPOINT = "https://nomads.com/@kostialevine.json";
const PROFILE_URL = "https://nomads.com/@kostialevine";

export type NomadsTrip = {
  date_start: string;
  date_end: string;
  length: string;
  place: string;
  place_slug: string;
  place_url: string;
  country: string;
  country_code: string;
  country_slug: string;
  latitude: number;
  longitude: number;
};

export type NomadsStats = {
  cities: number;
  countries: number;
  distance_traveled_km: number;
  trips: number;
  yearsSpan: number;
};

export type NomadsCountry = {
  code: string;
  name: string;
  slug: string;
  visitCount: number;
};

export type NomadsFrequentPlace = {
  slug: string;
  visits: number;
};

export type NomadsLongestStay = {
  slug: string;
  days: number;
};

export type NomadsProfile = {
  stats: NomadsStats;
  trips: NomadsTrip[];
  countries: NomadsCountry[];
  frequentPlaces: NomadsFrequentPlace[];
  longestStays: NomadsLongestStay[];
  lastTrip: NomadsTrip | null;
  firstTrip: NomadsTrip | null;
  profileUrl: string;
};

type RawTrip = NomadsTrip & { epoch_start?: number };

type RawNomadsResponse = {
  stats?: {
    cities?: number;
    countries?: number;
    distance_traveled_km?: number;
  };
  trips?: RawTrip[];
  frequent_visits?: Record<string, number>;
  longest_stays?: Record<string, number>;
};

export async function getNomadsProfile(): Promise<NomadsProfile | null> {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { "User-Agent": "superkostia.com build-time fetch" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawNomadsResponse;
    const rawTrips = data.trips ?? [];

    const trips: NomadsTrip[] = rawTrips.map((t) => ({
      date_start: t.date_start,
      date_end: t.date_end,
      length: t.length,
      place: t.place,
      place_slug: t.place_slug,
      place_url: t.place_url,
      country: t.country,
      country_code: t.country_code,
      country_slug: t.country_slug,
      latitude: t.latitude,
      longitude: t.longitude,
    }));

    const byCountry = new Map<string, NomadsCountry>();
    for (const t of trips) {
      const key = t.country_code;
      if (!byCountry.has(key)) {
        byCountry.set(key, {
          code: t.country_code,
          name: t.country,
          slug: t.country_slug,
          visitCount: 0,
        });
      }
      byCountry.get(key)!.visitCount += 1;
    }
    const countries = [...byCountry.values()].sort(
      (a, b) => b.visitCount - a.visitCount || a.name.localeCompare(b.name),
    );

    const frequentPlaces: NomadsFrequentPlace[] = Object.entries(
      data.frequent_visits ?? {},
    )
      .map(([slug, visits]) => ({ slug, visits }))
      .sort((a, b) => b.visits - a.visits);

    const longestStays: NomadsLongestStay[] = Object.entries(
      data.longest_stays ?? {},
    )
      .map(([slug, days]) => ({ slug, days }))
      .sort((a, b) => b.days - a.days);

    const lastTrip = trips[0] ?? null;
    const firstTrip = trips[trips.length - 1] ?? null;

    const firstYear = firstTrip ? parseInt(firstTrip.date_start, 10) : 0;
    const lastYear = lastTrip ? parseInt(lastTrip.date_end, 10) : 0;
    const yearsSpan =
      firstYear && lastYear ? Math.max(1, lastYear - firstYear) : 0;

    return {
      stats: {
        cities: data.stats?.cities ?? 0,
        countries: data.stats?.countries ?? byCountry.size,
        distance_traveled_km: data.stats?.distance_traveled_km ?? 0,
        trips: trips.length,
        yearsSpan,
      },
      trips,
      countries,
      frequentPlaces,
      longestStays,
      lastTrip,
      firstTrip,
      profileUrl: PROFILE_URL,
    };
  } catch {
    return null;
  }
}
