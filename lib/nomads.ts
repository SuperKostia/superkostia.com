import "server-only";

const ENDPOINT = "https://nomads.com/@kostialevine.json";
const PROFILE_URL = "https://nomads.com/@kostialevine";

export type NomadsTrip = {
  date_start: string;
  date_end: string;
  length: string;
  place: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
};

export type NomadsStats = {
  cities: number;
  countries: number;
  distance_traveled_km: number;
  trips: number;
};

export type NomadsProfile = {
  stats: NomadsStats;
  lastTrip: NomadsTrip | null;
  profileUrl: string;
};

type RawNomadsResponse = {
  stats?: {
    cities?: number;
    countries?: number;
    distance_traveled_km?: number;
  };
  trips?: NomadsTrip[];
};

export async function getNomadsProfile(): Promise<NomadsProfile | null> {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { "User-Agent": "superkostia.com build-time fetch" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawNomadsResponse;
    const trips = data.trips ?? [];
    return {
      stats: {
        cities: data.stats?.cities ?? 0,
        countries: data.stats?.countries ?? 0,
        distance_traveled_km: data.stats?.distance_traveled_km ?? 0,
        trips: trips.length,
      },
      lastTrip: trips[0] ?? null,
      profileUrl: PROFILE_URL,
    };
  } catch {
    return null;
  }
}
