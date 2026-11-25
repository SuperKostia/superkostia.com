import type { ComponentType } from "react";
import { Clock, Globe, MapPin, Route, type LucideProps } from "lucide-react";
import { getNomadsProfile } from "@/lib/nomads";
import { formatNombre, type Lang } from "@/lib/i18n";
import { AthensClock } from "./AthensClock";

const LIBELLES = {
  fr: { aria: "Kostia en chiffres", athenes: "à Athènes, en ce moment", pays: "pays visités", km: "kilomètres parcourus", ville: "dernière ville" },
  en: { aria: "Kostia in numbers", athenes: "in Athens, right now", pays: "countries visited", km: "kilometres travelled", ville: "last city" },
} satisfies Record<Lang, Record<string, string>>;

/** Rangée de tuiles chiffrées, avec les repères en croix aux coins. */
export async function Chiffres({ lang }: { lang: Lang }) {
  const l = LIBELLES[lang];
  const nomads = await getNomadsProfile();

  const tuiles: Array<{ icone: ComponentType<LucideProps>; valeur: React.ReactNode; label: string }> = [
    { icone: Clock, valeur: <AthensClock />, label: l.athenes },
    { icone: Globe, valeur: nomads ? nomads.stats.countries : "—", label: l.pays },
    {
      icone: Route,
      valeur: nomads ? formatNombre(lang, nomads.stats.distance_traveled_km) : "—",
      label: l.km,
    },
    { icone: MapPin, valeur: nomads?.lastTrip?.place ?? "—", label: l.ville },
  ];

  return (
    <section aria-label={l.aria} className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8">
      <ul className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tuiles.map((tuile) => {
          const Icone = tuile.icone;
          return (
            <li
              key={tuile.label}
              className="relative flex items-center gap-4 rounded-[16px] bg-[color:var(--color-surface)] px-5 py-4"
            >
              <Croix className="-left-[7px] -top-[7px]" />
              <Croix className="-right-[7px] -bottom-[7px]" />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]">
                <Icone size={19} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-display truncate text-2xl font-medium leading-none tracking-[-0.01em]">
                  {tuile.valeur}
                </span>
                <span className="mt-1 text-sm text-[color:var(--color-muted)]">{tuile.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Croix({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className={`pointer-events-none absolute h-3.5 w-3.5 text-[color:var(--color-muted)] opacity-60 ${className}`}
    >
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
