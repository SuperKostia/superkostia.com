import NextLink from "next/link";
import type { ComponentType } from "react";
import {
  Brain,
  Camera,
  Globe,
  GraduationCap,
  PenLine,
  Plane,
  Rocket,
  Sparkles,
  Sunrise,
  type LucideProps,
} from "lucide-react";
import { chemin, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AthensClock } from "./AthensClock";

/**
 * La journée de Kostia dessinée comme un workflow (clin d'œil au canevas de n8n,
 * décision #014) : un déclencheur, un agent « Kostia », une sortie, et les
 * outils branchés en pointillés. Chaque outil mène à sa rubrique.
 *
 * Tout est positionné dans un repère fixe de W × H, en pourcentages : le dessin
 * se met à l'échelle comme une image, textes compris (unités cqw).
 */

const W = 1100;
const H = 420;

type Outil = {
  id: string;
  x: number;
  port: "pro" | "perso" | "tete";
  icone: ComponentType<LucideProps>;
  label: Record<Lang, string>;
  cheminFr: string;
};

const OUTILS: Outil[] = [
  {
    id: "axiom",
    x: 105,
    port: "pro",
    icone: GraduationCap,
    label: { fr: "Faire tourner Axiom Academic", en: "Run Axiom Academic" },
    cheminFr: "/projets/axiom-academic",
  },
  {
    id: "projets",
    x: 280,
    port: "perso",
    icone: Rocket,
    label: { fr: "Lancer un projet de plus", en: "Ship one more project" },
    cheminFr: "/projets",
  },
  {
    id: "photo",
    x: 455,
    port: "perso",
    icone: Camera,
    label: { fr: "Sortir l'iPhone", en: "Take out the iPhone" },
    cheminFr: "/hobbies/photographie",
  },
  {
    id: "voyages",
    x: 645,
    port: "perso",
    icone: Plane,
    label: { fr: "Prendre un avion", en: "Catch a plane" },
    cheminFr: "/hobbies/voyages",
  },
  {
    id: "adler",
    x: 820,
    port: "tete",
    icone: Brain,
    label: { fr: "Relire Adler", en: "Reread Adler" },
    cheminFr: "/#adler",
  },
  {
    id: "ecrits",
    x: 995,
    port: "tete",
    icone: PenLine,
    label: { fr: "Écrire quand même", en: "Write anyway" },
    cheminFr: "/ecrits",
  },
];

const PORTS: Record<Outil["port"], { x: number; label: Record<Lang, string> }> = {
  pro: { x: 470, label: { fr: "Pro", en: "Work" } },
  perso: { x: 550, label: { fr: "Perso", en: "Personal" } },
  tete: { x: 630, label: { fr: "Tête", en: "Mind" } },
};

const TEXTES = {
  fr: {
    aria: "La journée de Kostia, dessinée comme un workflow",
    declencheur: "Réveil à Athènes",
    agent: "Kostia",
    agentSous: "Agent · trop de choses",
    sortie: "Tout atterrit ici",
  },
  en: {
    aria: "Kostia's day, drawn as a workflow",
    declencheur: "Wake up in Athens",
    agent: "Kostia",
    agentSous: "Agent · too many things",
    sortie: "It all lands here",
  },
} satisfies Record<Lang, Record<string, string>>;

const AGENT = { x: 550, y: 100, w: 280, h: 88 };
const CARRE = 80;
const ROND = 68;
const Y_OUTILS = 300;

const pc = (v: number, total: number) => `${(v / total) * 100}%`;

/** Lien vers une rubrique : chemin localisé, ou ancre de l'accueil. */
function lien(lang: Lang, cheminFr: string) {
  return cheminFr.startsWith("/#") ? `${chemin(lang, "/")}${cheminFr.slice(1)}` : chemin(lang, cheminFr);
}

const noeud =
  "flex items-center justify-center bg-[color:var(--color-surface)] text-[color:var(--color-fg)] ring-1 ring-[color:var(--color-line)] transition-colors";

export function Workflow({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];

  return (
    <figure aria-label={t.aria} className="mt-14 w-full sm:mt-20">
      {/* Grand écran : le canevas */}
      <div className="relative mx-auto hidden w-full max-w-[1100px] [container-type:inline-size] md:block">
        <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            {/* Liaisons principales */}
            <path
              d={`M ${130 + CARRE / 2} 100 H ${AGENT.x - AGENT.w / 2}`}
              stroke="var(--color-fg)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d={`M ${AGENT.x + AGENT.w / 2} 100 H ${970 - CARRE / 2}`}
              stroke="var(--color-fg)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Outils en pointillés */}
            {OUTILS.map((o) => {
              const px = PORTS[o.port].x;
              const y0 = AGENT.y + AGENT.h / 2;
              const y1 = Y_OUTILS - ROND / 2;
              return (
                <path
                  key={o.id}
                  d={`M ${px} ${y0} C ${px} ${y0 + 90}, ${o.x} ${y1 - 90}, ${o.x} ${y1}`}
                  stroke="var(--color-fg)"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeDasharray="5 6"
                  fill="none"
                  className="flux"
                />
              );
            })}
            {/* Prises */}
            {[130 + CARRE / 2, AGENT.x - AGENT.w / 2, AGENT.x + AGENT.w / 2, 970 - CARRE / 2].map(
              (x, i) => (
                <circle key={i} cx={x} cy={100} r={4.5} fill="var(--color-accent-strong)" />
              ),
            )}
            {Object.values(PORTS).map((p) => (
              <rect
                key={p.x}
                x={p.x - 5}
                y={AGENT.y + AGENT.h / 2 - 5}
                width={10}
                height={10}
                rx={2}
                transform={`rotate(45 ${p.x} ${AGENT.y + AGENT.h / 2})`}
                fill="var(--color-fg)"
                fillOpacity="0.55"
              />
            ))}
          </svg>

          {/* Libellés des prises de l'agent */}
          {Object.entries(PORTS).map(([cle, p]) => (
            <span
              key={cle}
              className="absolute -translate-x-1/2 rounded-full bg-[color:var(--color-bg)] px-1.5 font-mono text-[clamp(9px,0.95cqw,11px)] uppercase tracking-[0.05em] text-[color:var(--color-muted)]"
              style={{ left: pc(p.x, W), top: pc(AGENT.y + AGENT.h / 2 + 14, H) }}
            >
              {p.label[lang]}
            </span>
          ))}

          {/* Déclencheur */}
          <div
            className={cn(noeud, "absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[22%_10px_10px_22%]")}
            style={{ left: pc(130, W), top: pc(100, H), width: pc(CARRE, W) }}
          >
            <Sunrise className="h-[42%] w-[42%]" strokeWidth={1.6} aria-hidden />
          </div>
          <Libelle x={130} y={100 + CARRE / 2 + 12}>
            {t.declencheur}
            <span className="mt-0.5 block font-mono text-[0.8em] text-[color:var(--color-muted)]">
              <AthensClock />
            </span>
          </Libelle>

          {/* Agent */}
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-start gap-[6%] rounded-[16px] bg-[color:var(--color-ink)] px-[5%] text-[color:var(--color-ink-fg)]"
            style={{
              left: pc(AGENT.x, W),
              top: pc(AGENT.y, H),
              width: pc(AGENT.w, W),
              aspectRatio: `${AGENT.w} / ${AGENT.h}`,
            }}
          >
            <span className="flex aspect-square w-[22%] items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]">
              <Sparkles className="h-1/2 w-1/2" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-display text-[clamp(15px,1.9cqw,21px)] font-medium leading-none">
                {t.agent}
              </span>
              <span className="mt-1 whitespace-nowrap font-mono text-[clamp(8px,0.9cqw,10px)] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
                {t.agentSous}
              </span>
            </span>
          </div>

          {/* Sortie */}
          <NextLink
            href={chemin(lang, "/colophon")}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pc(970, W), top: pc(100, H), width: pc(CARRE, W) }}
            aria-label={`superkostia.com : ${t.sortie}`}
          >
            <span
              className={cn(
                noeud,
                "aspect-square w-full rounded-[10px_22%_22%_10px] group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)]",
              )}
            >
              <Globe className="h-[42%] w-[42%]" strokeWidth={1.6} aria-hidden />
            </span>
          </NextLink>
          <Libelle x={970} y={100 + CARRE / 2 + 12}>
            superkostia.com
            <span className="mt-0.5 block text-[0.85em] text-[color:var(--color-muted)]">{t.sortie}</span>
          </Libelle>

          {/* Outils */}
          {OUTILS.map((o) => {
            const Icone = o.icone;
            return (
              <NextLink
                key={o.id}
                href={lien(lang, o.cheminFr)}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: pc(o.x, W), top: pc(Y_OUTILS, H), width: pc(ROND, W) }}
              >
                <span
                  className={cn(
                    noeud,
                    "aspect-square w-full rounded-full group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)] group-hover:ring-transparent",
                  )}
                >
                  <Icone className="h-[40%] w-[40%]" strokeWidth={1.6} aria-hidden />
                </span>
                <span
                  className="absolute top-[calc(100%+0.6em)] w-[170%] text-center text-[clamp(11px,1.3cqw,15px)] leading-[1.15] group-hover:underline group-hover:decoration-[color:var(--color-accent-strong)] group-hover:underline-offset-4"
                >
                  {o.label[lang]}
                </span>
              </NextLink>
            );
          })}
        </div>
      </div>

      {/* Petit écran : le même flux, à la verticale */}
      <div className="bg-dots mx-auto flex max-w-[460px] flex-col items-center rounded-[28px] px-4 py-6 md:hidden">
        <div className="flex w-full items-center gap-3 rounded-[18px] bg-[color:var(--color-surface)] p-3 ring-1 ring-[color:var(--color-line)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[color:var(--color-surface-2)]">
            <Sunrise size={20} strokeWidth={1.6} aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] leading-tight">{t.declencheur}</span>
            <span className="font-mono text-xs text-[color:var(--color-muted)]">
              <AthensClock />
            </span>
          </span>
        </div>
        <span aria-hidden className="h-5 w-px bg-[color:var(--color-fg)] opacity-35" />
        <div className="flex w-full items-center gap-3 rounded-[18px] bg-[color:var(--color-ink)] p-3 text-[color:var(--color-ink-fg)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]">
            <Sparkles size={20} strokeWidth={1.75} aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-lg font-medium leading-none">{t.agent}</span>
            <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              {t.agentSous}
            </span>
          </span>
        </div>
        <span
          aria-hidden
          className="h-5 w-px border-l border-dashed border-[color:var(--color-fg)] opacity-40"
        />
        <ul className="grid w-full grid-cols-2 gap-2">
          {OUTILS.map((o) => {
            const Icone = o.icone;
            return (
              <li key={o.id}>
                <NextLink
                  href={lien(lang, o.cheminFr)}
                  className="flex h-full items-center gap-2.5 rounded-[16px] bg-[color:var(--color-surface)] p-2.5 text-[13px] leading-tight ring-1 ring-[color:var(--color-line)] transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-2)]">
                    <Icone size={16} strokeWidth={1.6} aria-hidden />
                  </span>
                  {o.label[lang]}
                </NextLink>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

function Libelle({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <span
      className="absolute w-[16%] -translate-x-1/2 text-center text-[clamp(11px,1.3cqw,15px)] leading-[1.15]"
      style={{ left: pc(x, W), top: pc(y, H) }}
    >
      {children}
    </span>
  );
}
