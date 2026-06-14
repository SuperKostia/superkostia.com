"use client";

import { useEffect, useState } from "react";
import { frTeam } from "@/lib/teams";

/** Plage complète du tournoi, scores en direct depuis l'API publique ESPN (CORS ouvert, 0 €). */
const SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=400";

type Competitor = {
  homeAway: string;
  score?: string;
  team: { displayName: string };
};

type EspnEvent = {
  id: string;
  date: string;
  competitions: {
    status: { type: { state: string; shortDetail?: string; detail?: string } };
    competitors: Competitor[];
  }[];
};

type Pick = {
  live: boolean;
  clock: string;
  home: Competitor;
  away: Competitor;
  date: string;
};

/** Match en cours en priorité, sinon le prochain à venir (le plus proche). */
function selectMatch(events: EspnEvent[]): Pick | null {
  const live: EspnEvent[] = [];
  const upcoming: EspnEvent[] = [];
  for (const ev of events) {
    const state = ev.competitions?.[0]?.status?.type?.state;
    if (state === "in") live.push(ev);
    else if (state === "pre") upcoming.push(ev);
  }
  const byDate = (a: EspnEvent, b: EspnEvent) =>
    +new Date(a.date) - +new Date(b.date);
  live.sort(byDate);
  upcoming.sort(byDate);

  const ev = live[0] ?? upcoming[0];
  if (!ev) return null;

  const comp = ev.competitions[0];
  const cs = comp.competitors;
  const home = cs.find((c) => c.homeAway === "home") ?? cs[0];
  const away = cs.find((c) => c.homeAway === "away") ?? cs[1];
  const t = comp.status.type;
  return {
    live: t.state === "in",
    clock: t.shortDetail ?? t.detail ?? "En cours",
    home,
    away,
    date: ev.date,
  };
}

/** Bande sous la card promo : affiche le match en cours ou le prochain de la Coupe du Monde. */
export function WorldCupNextMatch() {
  const [pick, setPick] = useState<Pick | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const r = await fetch(SCOREBOARD_URL, {
          headers: { Accept: "application/json" },
        });
        if (!r.ok) return;
        const data = (await r.json()) as { events?: EspnEvent[] };
        if (alive) setPick(selectMatch(data.events ?? []));
      } catch {
        /* on garde l'affichage précédent */
      }
    };
    run();
    const id = setInterval(run, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!pick) return null;

  const [hn, hf] = frTeam(pick.home.team.displayName);
  const [an, af] = frTeam(pick.away.team.displayName);
  const when = new Date(pick.date).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <a
      href="/projets/coupe-du-monde-dim/dashboard.html"
      data-cursor="ouvrir"
      aria-label={
        pick.live
          ? `Match en cours : ${hn} contre ${an}`
          : `Prochain match : ${hn} contre ${an}, ${when}`
      }
      className="block border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2.5 shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        <span>{pick.live ? "⚽ Match en cours" : "⏭ Prochain match"}</span>
        {pick.live ? (
          <span className="inline-flex items-center gap-1.5 text-[#e10600]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e10600] motion-safe:animate-pulse" />
            {pick.clock}
          </span>
        ) : (
          <span>{when}</span>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-sm font-bold text-[color:var(--color-fg)]">
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden>{hf}</span>
          <span className="truncate">{hn}</span>
        </span>
        <span className="shrink-0 px-1 font-[family-name:var(--font-space-grotesk)] text-base font-black tabular-nums">
          {pick.live ? `${pick.home.score ?? 0}–${pick.away.score ?? 0}` : "vs"}
        </span>
        <span className="flex min-w-0 items-center justify-end gap-1.5 text-right">
          <span className="truncate">{an}</span>
          <span aria-hidden>{af}</span>
        </span>
      </div>
    </a>
  );
}
