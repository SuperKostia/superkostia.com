"use client";

import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
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
 *
 * Chaque nœud se saisit à la souris (ou au doigt sur tablette) : les liaisons
 * suivent, et au lâcher il revient à sa place sur un ressort amorti. Un clic
 * sans déplacement garde son effet (ouvrir la rubrique).
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

type Decalage = { x: number; y: number };
const ZERO: Decalage = { x: 0, y: 0 };

/** Seuil (px) au-delà duquel un appui devient un glisser, et plus un clic. */
const SEUIL_GLISSER = 4;
/** Ressort de retour : raideur et amortissement (masse 1), un léger rebond. */
const RAIDEUR = 210;
const AMORTI = 15;

/**
 * Glisser-déposer élastique : décalage par nœud dans le repère W × H, retour
 * à zéro sur ressort au lâcher (immédiat si l'utilisateur réduit les animations).
 */
function useNoeudsElastiques(cadreRef: React.RefObject<HTMLDivElement | null>) {
  const [decalages, setDecalages] = useState<Record<string, Decalage>>({});
  const [saisi, setSaisi] = useState<string | null>(null);
  const courants = useRef<Record<string, Decalage>>({});
  const ressorts = useRef<Record<string, number>>({});
  const geste = useRef<{ id: string; pointeur: number; x: number; y: number; origine: Decalage; bouge: boolean } | null>(null);
  const dernierGlisse = useRef<string | null>(null);

  const poser = useCallback((id: string, d: Decalage) => {
    courants.current[id] = d;
    setDecalages((prev) => ({ ...prev, [id]: d }));
  }, []);

  const arreterRessort = (id: string) => {
    if (ressorts.current[id]) cancelAnimationFrame(ressorts.current[id]);
    delete ressorts.current[id];
  };

  const relacher = useCallback(
    (id: string) => {
      const depart = courants.current[id] ?? ZERO;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        poser(id, ZERO);
        return;
      }
      let pos = { ...depart };
      let vit = { x: 0, y: 0 };
      let avant = performance.now();
      const pas = (maintenant: number) => {
        const dt = Math.min(0.032, (maintenant - avant) / 1000);
        avant = maintenant;
        vit = {
          x: vit.x + (-RAIDEUR * pos.x - AMORTI * vit.x) * dt,
          y: vit.y + (-RAIDEUR * pos.y - AMORTI * vit.y) * dt,
        };
        pos = { x: pos.x + vit.x * dt, y: pos.y + vit.y * dt };
        const fini = Math.hypot(pos.x, pos.y) < 0.3 && Math.hypot(vit.x, vit.y) < 4;
        poser(id, fini ? ZERO : pos);
        if (fini) delete ressorts.current[id];
        else ressorts.current[id] = requestAnimationFrame(pas);
      };
      ressorts.current[id] = requestAnimationFrame(pas);
    },
    [poser],
  );

  useEffect(() => {
    const actifs = ressorts.current;
    return () => Object.values(actifs).forEach((r) => cancelAnimationFrame(r));
  }, []);

  /** Props à poser sur l'élément saisissable d'un nœud. */
  const saisir = (id: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      arreterRessort(id);
      e.currentTarget.setPointerCapture(e.pointerId);
      geste.current = {
        id,
        pointeur: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        origine: courants.current[id] ?? ZERO,
        bouge: false,
      };
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const g = geste.current;
      if (!g || g.id !== id || g.pointeur !== e.pointerId) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.bouge && Math.hypot(dx, dy) < SEUIL_GLISSER) return;
      if (!g.bouge) {
        g.bouge = true;
        setSaisi(id);
      }
      const largeur = cadreRef.current?.getBoundingClientRect().width || W;
      const echelle = W / largeur;
      poser(id, {
        x: Math.max(-W * 0.6, Math.min(W * 0.6, g.origine.x + dx * echelle)),
        y: Math.max(-H * 0.9, Math.min(H * 0.9, g.origine.y + dy * echelle)),
      });
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const g = geste.current;
      if (!g || g.id !== id) return;
      geste.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      if (g.bouge) {
        // Le clic qui suit un glisser ne doit pas ouvrir le lien.
        dernierGlisse.current = id;
        window.setTimeout(() => {
          if (dernierGlisse.current === id) dernierGlisse.current = null;
        }, 0);
        setSaisi(null);
        relacher(id);
      }
    },
    onPointerCancel: () => {
      if (geste.current?.id !== id) return;
      geste.current = null;
      setSaisi(null);
      relacher(id);
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (dernierGlisse.current === id) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
  });

  const pos = (id: string, base: Decalage): Decalage => {
    const d = decalages[id] ?? ZERO;
    return { x: base.x + d.x, y: base.y + d.y };
  };

  return { pos, saisir, saisi };
}

/** Courbe horizontale douce entre deux prises. */
function courbe(a: Decalage, b: Decalage) {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

const saisissable = "cursor-grab touch-none select-none active:cursor-grabbing";
const enMain = "z-20 scale-[1.06] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.35)]";

export function Workflow({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  const cadreRef = useRef<HTMLDivElement>(null);
  const { pos, saisir, saisi } = useNoeudsElastiques(cadreRef);

  // Positions courantes (place d'origine + décalage du glisser).
  const declencheur = pos("declencheur", { x: 130, y: 100 });
  const agent = pos("agent", { x: AGENT.x, y: AGENT.y });
  const sortie = pos("sortie", { x: 970, y: 100 });
  const priseDeclencheur = { x: declencheur.x + CARRE / 2, y: declencheur.y };
  const priseAgentGauche = { x: agent.x - AGENT.w / 2, y: agent.y };
  const priseAgentDroite = { x: agent.x + AGENT.w / 2, y: agent.y };
  const priseSortie = { x: sortie.x - CARRE / 2, y: sortie.y };
  const prisesOutils = Object.fromEntries(
    Object.entries(PORTS).map(([cle, p]) => [
      cle,
      { cle, x: agent.x + (p.x - AGENT.x), y: agent.y + AGENT.h / 2 },
    ]),
  ) as Record<Outil["port"], { cle: string; x: number; y: number }>;

  return (
    <figure aria-label={t.aria} className="mt-14 w-full sm:mt-20">
      {/* Grand écran : le canevas */}
      <div className="relative mx-auto hidden w-full max-w-[1100px] [container-type:inline-size] md:block">
        <div ref={cadreRef} className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            {/* Liaisons principales */}
            <path d={courbe(priseDeclencheur, priseAgentGauche)} stroke="var(--color-fg)" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
            <path d={courbe(priseAgentDroite, priseSortie)} stroke="var(--color-fg)" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
            {/* Outils en pointillés */}
            {OUTILS.map((o) => {
              const port = prisesOutils[o.port];
              const t = pos(`outil-${o.id}`, { x: o.x, y: Y_OUTILS });
              const haut = t.y - ROND / 2;
              return (
                <path
                  key={o.id}
                  d={`M ${port.x} ${port.y} C ${port.x} ${port.y + 90}, ${t.x} ${haut - 90}, ${t.x} ${haut}`}
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
            {[priseDeclencheur, priseAgentGauche, priseAgentDroite, priseSortie].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="var(--color-accent-strong)" />
            ))}
            {Object.values(prisesOutils).map((p) => (
              <rect
                key={p.x + "-" + p.cle}
                x={p.x - 5}
                y={p.y - 5}
                width={10}
                height={10}
                rx={2}
                transform={`rotate(45 ${p.x} ${p.y})`}
                fill="var(--color-fg)"
                fillOpacity="0.55"
              />
            ))}
          </svg>

          {/* Libellés des prises de l'agent */}
          {Object.entries(prisesOutils).map(([cle, p]) => (
            <span
              key={cle}
              className="pointer-events-none absolute -translate-x-1/2 rounded-full bg-[color:var(--color-bg)] px-1.5 font-mono text-[clamp(9px,0.95cqw,11px)] uppercase tracking-[0.05em] text-[color:var(--color-muted)]"
              style={{ left: pc(p.x, W), top: pc(p.y + 14, H) }}
            >
              {PORTS[cle as Outil["port"]].label[lang]}
            </span>
          ))}

          {/* Déclencheur */}
          <div
            {...saisir("declencheur")}
            className={cn(
              noeud,
              saisissable,
              "absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[22%_10px_10px_22%] transition-[scale,box-shadow] duration-150",
              saisi === "declencheur" && enMain,
            )}
            style={{ left: pc(declencheur.x, W), top: pc(declencheur.y, H), width: pc(CARRE, W) }}
          >
            <Sunrise className="h-[42%] w-[42%]" strokeWidth={1.6} aria-hidden />
          </div>
          <Libelle x={declencheur.x} y={declencheur.y + CARRE / 2 + 12}>
            {t.declencheur}
            <span className="mt-0.5 block font-mono text-[0.8em] text-[color:var(--color-muted)]">
              <AthensClock />
            </span>
          </Libelle>

          {/* Agent */}
          <div
            {...saisir("agent")}
            className={cn(
              saisissable,
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-start gap-[6%] rounded-[16px] bg-[color:var(--color-ink)] px-[5%] text-[color:var(--color-ink-fg)] transition-[scale,box-shadow] duration-150",
              saisi === "agent" && enMain,
            )}
            style={{
              left: pc(agent.x, W),
              top: pc(agent.y, H),
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
            {...saisir("sortie")}
            draggable={false}
            href={chemin(lang, "/colophon")}
            className={cn(
              saisissable,
              "group absolute -translate-x-1/2 -translate-y-1/2 rounded-[10px_22%_22%_10px] transition-[scale,box-shadow] duration-150",
              saisi === "sortie" && enMain,
            )}
            style={{ left: pc(sortie.x, W), top: pc(sortie.y, H), width: pc(CARRE, W) }}
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
          <Libelle x={sortie.x} y={sortie.y + CARRE / 2 + 12}>
            superkostia.com
            <span className="mt-0.5 block text-[0.85em] text-[color:var(--color-muted)]">{t.sortie}</span>
          </Libelle>

          {/* Outils */}
          {OUTILS.map((o) => {
            const Icone = o.icone;
            const id = `outil-${o.id}`;
            const p = pos(id, { x: o.x, y: Y_OUTILS });
            return (
              <NextLink
                key={o.id}
                {...saisir(id)}
                draggable={false}
                href={lien(lang, o.cheminFr)}
                className={cn(
                  saisissable,
                  "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full",
                  saisi === id && "z-20",
                )}
                style={{ left: pc(p.x, W), top: pc(p.y, H), width: pc(ROND, W) }}
              >
                <span
                  className={cn(
                    noeud,
                    "aspect-square w-full rounded-full transition-[scale,box-shadow,background-color] duration-150 group-hover:bg-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent-fg)] group-hover:ring-transparent",
                    saisi === id && enMain,
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
