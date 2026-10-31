"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LogoProjet } from "./LogoProjet";

/** Durée d'affichage d'une story avant de passer à la suivante. */
const DUREE_MS = 7000;
/** Glissement minimal (px) pour changer de story au doigt. */
const SEUIL_SWIPE = 50;
const CLE_VUS = "projets-vus";

/**
 * Géométrie de la scène desktop : hauteur --h, story --W (9/16), vignettes --w
 * (52 % de la hauteur), espace --g entre chaque carte (les flèches y logent).
 */
const SCENE = {
  "--h": "min(calc(100dvh - 6.5rem), 760px)",
  "--W": "calc(var(--h) * 9 / 16)",
  "--w": "calc(var(--h) * 0.52 * 9 / 16)",
  "--g": "5rem",
} as React.CSSProperties;

/** Décalage horizontal de chaque vignette depuis le centre de la scène. */
const POSITION_VIGNETTE: Record<number, string> = {
  [-2]: "calc(-1 * (var(--W) / 2 + 2 * var(--g) + 2 * var(--w)))",
  [-1]: "calc(-1 * (var(--W) / 2 + var(--g) + var(--w)))",
  1: "calc(var(--W) / 2 + var(--g))",
  2: "calc(var(--W) / 2 + 2 * var(--g) + var(--w))",
};

export type StoryProjet = {
  slug: string;
  titre: string;
  type: string;
  periode: string;
  resume: string;
  href: string;
  site?: string;
  image?: string;
  /** Favicon / logo du site du projet (public/images/logos), l'« avatar » de la story. */
  logo?: string;
};

const TEXTES = {
  fr: {
    fiche: "Voir la fiche",
    site: "Voir le site",
    pause: "Mettre en pause",
    lecture: "Reprendre",
    precedent: "Projet précédent",
    suivant: "Projet suivant",
    aller: "Aller au projet",
    region: "Projets en stories",
    nouveau: "nouveau",
  },
  en: {
    fiche: "See the project",
    site: "Visit the site",
    pause: "Pause",
    lecture: "Resume",
    precedent: "Previous project",
    suivant: "Next project",
    aller: "Go to project",
    region: "Projects as stories",
    nouveau: "new",
  },
} satisfies Record<Lang, Record<string, string>>;

function lireVus(): Set<string> {
  try {
    return new Set(
      JSON.parse(localStorage.getItem(CLE_VUS) ?? "[]") as string[],
    );
  } catch {
    return new Set();
  }
}

/** Les projets façon stories Instagram, dans la DA brutaliste : angles droits, ombre dure, jaune acide. */
export function ProjetsStories({
  projets,
  lang,
}: {
  projets: StoryProjet[];
  lang: Lang;
}) {
  const t = TEXTES[lang];
  const total = projets.length;
  const [index, setIndex] = useState(0);
  const [progres, setProgres] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [survol, setSurvol] = useState(false);
  const [maintenu, setMaintenu] = useState(false);
  const [vus, setVus] = useState<Set<string> | null>(null);
  const [sens, setSens] = useState<1 | -1>(1);
  const [glisse, setGlisse] = useState(0);
  const [horsEcran, setHorsEcran] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const rangeeRef = useRef<HTMLOListElement>(null);
  const depart = useRef<{ x: number; y: number; t: number } | null>(null);
  /** Progression de la story courante, de 0 à 1 (l'état n'en est que le reflet pour l'affichage). */
  const progresRef = useRef(0);

  /** Amène la story entière à l'écran (utile quand on clique une vignette depuis le haut de la page). */
  const montrerScene = useCallback(() => {
    const r = sceneRef.current?.getBoundingClientRect();
    // Défilement vertical seulement (scrollIntoView peut aussi décaler la page de côté).
    if (r && (r.top < 56 || r.bottom > window.innerHeight)) {
      window.scrollBy({
        top: r.bottom - window.innerHeight + 24,
        behavior: "smooth",
      });
    }
  }, []);

  const aller = useCallback(
    (cible: number, direction?: 1 | -1) => {
      progresRef.current = 0;
      setProgres(0);
      setGlisse(0);
      const suivant = ((cible % total) + total) % total;
      setSens(direction ?? (suivant >= index ? 1 : -1));
      setIndex(suivant);
    },
    [total, index],
  );

  // Pause quand la scène sort de l'écran (on ne fait pas défiler ce que personne ne regarde).
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const obs = new IntersectionObserver(
      ([e]) => setHorsEcran(!e.isIntersecting),
      { threshold: 0.35 },
    );
    obs.observe(scene);
    return () => obs.disconnect();
  }, []);

  // La vignette active se recentre dans sa rangée.
  useEffect(() => {
    // On fait défiler la rangée seule, sans entraîner la page.
    const rangee = rangeeRef.current;
    const active = rangee?.querySelector<HTMLElement>('[aria-current="true"]');
    if (rangee && active) {
      rangee.scrollTo({
        left: active.offsetLeft - (rangee.clientWidth - active.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  }, [index]);

  // Vus mémorisés d'une visite à l'autre (lus après montage : pas de localStorage au rendu serveur).
  // Mouvement réduit : pas de défilement automatique, l'utilisateur avance lui-même.
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setVus(lireVus());
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        setEnPause(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // La story affichée devient « vue ».
  useEffect(() => {
    const slug = projets[index]?.slug;
    if (!slug) return;
    const raf = window.requestAnimationFrame(() =>
      setVus((avant) => {
        const suivant = new Set(avant ?? lireVus());
        suivant.add(slug);
        try {
          localStorage.setItem(CLE_VUS, JSON.stringify([...suivant]));
        } catch {
          // Stockage indisponible : les anneaux « nouveau » restent allumés, rien de grave.
        }
        return suivant;
      }),
    );
    return () => window.cancelAnimationFrame(raf);
  }, [index, projets]);

  // Défilement automatique, suspendu en pause, au survol, à l'appui long ou onglet caché.
  const arrete = enPause || survol || maintenu || horsEcran;
  useEffect(() => {
    if (arrete) return;
    let precedent = performance.now();
    let raf = 0;
    const tick = (maintenant: number) => {
      const delta = document.hidden ? 0 : maintenant - precedent;
      precedent = maintenant;
      progresRef.current += delta / DUREE_MS;
      if (progresRef.current >= 1) {
        progresRef.current = 0;
        setSens(1);
        setIndex((i) => (i + 1) % total);
      }
      setProgres(progresRef.current);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [arrete, total]);

  // Clavier : ← → pour naviguer, espace pour la pause.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (
        cible &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(cible.tagName) ||
          cible.isContentEditable)
      )
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        aller(index + 1, 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        aller(index - 1, -1);
      } else if (
        e.key === " " &&
        cible?.tagName !== "BUTTON" &&
        cible?.tagName !== "A"
      ) {
        e.preventDefault();
        setEnPause((p) => !p);
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [aller, index]);

  // Tactile et souris sur la carte : tap à gauche/droite, glissement, appui long = pause.
  const surAppui = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    depart.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setMaintenu(true);
  };
  // La carte suit le doigt horizontalement pendant le glissement.
  const surDeplace = (e: React.PointerEvent) => {
    const d = depart.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - d.y))
      setGlisse(dx);
  };
  const surRelache = (e: React.PointerEvent<HTMLElement>) => {
    const d = depart.current;
    depart.current = null;
    setMaintenu(false);
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > SEUIL_SWIPE && Math.abs(dx) > Math.abs(dy)) {
      aller(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      return;
    }
    setGlisse(0);
    // Appui long ou geste avorté : c'était une pause, on ne navigue pas.
    if (performance.now() - d.t > 350 || Math.abs(dx) > 8) return;
    const zone = e.currentTarget.getBoundingClientRect();
    const recule = e.clientX - zone.left < zone.width * 0.3;
    aller(index + (recule ? -1 : 1), recule ? -1 : 1);
  };

  const courant = projets[index];
  if (!courant) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.region}
      className="flex flex-col gap-6"
    >
      {/* Rangée de vignettes, l'équivalent des ronds Instagram : carrées, DA oblige. */}
      <ol
        ref={rangeeRef}
        className="relative -mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {projets.map((p, i) => {
          const nouveau = vus !== null && !vus.has(p.slug);
          return (
            <li key={p.slug} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  aller(i);
                  montrerScene();
                }}
                aria-label={`${t.aller} ${p.titre}${nouveau ? ` (${t.nouveau})` : ""}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex w-[4.5rem] flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "relative block h-16 w-16 border-[3px] p-[3px] transition-transform group-hover:-translate-y-0.5",
                    i === index
                      ? "border-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)]"
                      : nouveau
                        ? "border-[color:var(--color-accent)]"
                        : "border-[color:var(--color-border)]/30",
                  )}
                >
                  <LogoProjet
                    titre={p.titre}
                    logo={p.logo}
                    className="h-full w-full text-lg"
                  />
                </span>
                <span
                  className={cn(
                    "w-full truncate text-center font-mono text-[10px] uppercase tracking-[0.1em]",
                    i === index
                      ? "text-[color:var(--color-fg)]"
                      : "text-[color:var(--color-muted)]",
                  )}
                >
                  {p.titre}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Scène : la story au centre, les voisines estompées de part et d'autre (desktop). */}
      <div
        ref={sceneRef}
        className="relative flex items-center justify-center overflow-x-clip lg:h-[var(--h)]"
        style={SCENE}
      >
        {/* Préchargement des voisines : le changement de story ne passe jamais par un fond vide. */}
        <div
          aria-hidden
          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        >
          {[index + 1, index - 1].map((i) => {
            const p = projets[((i % total) + total) % total];
            return p.image ? (
              <Image
                key={p.slug}
                src={p.image}
                alt=""
                width={420}
                height={746}
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            ) : null;
          })}
        </div>
        {[-2, -1, 1, 2].map((decalage) => {
          const i = (((index + decalage) % total) + total) % total;
          const p = projets[i];
          return (
            <button
              key={decalage}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => aller(i)}
              className="absolute left-1/2 top-1/2 hidden h-[52%] w-[var(--w)] border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 lg:block"
              style={{
                transform: `translate(${POSITION_VIGNETTE[decalage]}, -50%)`,
              }}
            >
              <VignetteContenu projet={p} />
            </button>
          );
        })}

        <article
          key={courant.slug}
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${total} · ${courant.titre}`}
          onPointerDown={surAppui}
          onPointerMove={surDeplace}
          onPointerUp={surRelache}
          onPointerCancel={() => {
            depart.current = null;
            setMaintenu(false);
            setGlisse(0);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerEnter={(e) => e.pointerType === "mouse" && setSurvol(true)}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setSurvol(false);
          }}
          className={cn(
            "relative z-10 flex aspect-[9/16] max-h-[calc(100dvh-5.5rem)] w-full max-w-[420px] touch-pan-y select-none flex-col overflow-hidden border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard)] [-webkit-touch-callout:none] lg:h-full lg:max-h-none lg:w-auto lg:max-w-none",
            glisse === 0 &&
              (sens === 1
                ? "animate-[story-droite_320ms_cubic-bezier(0.2,0.8,0.2,1)]"
                : "animate-[story-gauche_320ms_cubic-bezier(0.2,0.8,0.2,1)]"),
          )}
          style={
            glisse
              ? {
                  transform: `translateX(${glisse}px) rotate(${glisse / 60}deg)`,
                  transition: "none",
                }
              : undefined
          }
        >
          {/* Bandeau : barre de progression segmentée, type, période, pause */}
          <div className="flex shrink-0 flex-col gap-2.5 border-b-2 border-[color:var(--color-border)] p-2.5">
            <div className="flex gap-1">
              {projets.map((p, i) => (
                <span
                  key={p.slug}
                  className="h-1.5 flex-1 border border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
                >
                  <span
                    className="block h-full bg-[color:var(--color-accent)]"
                    style={{
                      width: `${i < index ? 100 : i === index ? progres * 100 : 0}%`,
                    }}
                  />
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <LogoProjet
                  titre={courant.titre}
                  logo={courant.logo}
                  className="h-9 w-9 text-sm"
                />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-mono text-xs font-bold uppercase tracking-wider">
                    {courant.titre}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                    {courant.periode}
                  </span>
                </span>
              </div>
              <span className="ml-auto shrink-0 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-accent-fg)]">
                {courant.type}
              </span>
              <button
                type="button"
                onClick={() => setEnPause((p) => !p)}
                aria-label={enPause ? t.lecture : t.pause}
                className="inline-flex h-8 w-8 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)]"
              >
                {enPause ? (
                  <Play size={14} strokeWidth={2.5} aria-hidden />
                ) : (
                  <Pause size={14} strokeWidth={2.5} aria-hidden />
                )}
              </button>
            </div>
          </div>

          {/* Visuel : la capture du site en entier (paysage) */}
          <div className="relative aspect-[16/10] w-full shrink-0 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)]">
            {courant.image ? (
              <Image
                src={courant.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 440px"
                className="object-cover object-top"
                draggable={false}
              />
            ) : (
              <span className="absolute inset-x-0 bottom-0 p-4 font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.85] tracking-tight text-[color:var(--color-accent-fg)] [overflow-wrap:anywhere]">
                {courant.titre}
              </span>
            )}
          </div>

          {/* Texte et actions */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-[0.95] tracking-tight lg:text-4xl">
              {courant.titre}
            </h2>
            <p className="line-clamp-6 text-sm leading-relaxed text-[color:var(--color-muted)] lg:line-clamp-[9] lg:text-base">
              {courant.resume}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <NextLink
                href={courant.href}
                data-cursor="lire"
                className="inline-flex items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {t.fiche} <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
              </NextLink>
              {courant.site ? (
                <a
                  href={courant.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="ouvrir"
                  className="inline-flex items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  {t.site}{" "}
                  <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        </article>

        {/* Flèches desktop, de part et d'autre de la story */}
        <button
          type="button"
          onClick={() => aller(index - 1, -1)}
          aria-label={t.precedent}
          className="absolute left-1/2 top-1/2 z-20 hidden h-11 w-11 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] lg:flex"
          style={{
            transform:
              "translate(calc(-1 * (var(--W) / 2 + var(--g) / 2) - 50%), -50%)",
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => aller(index + 1, 1)}
          aria-label={t.suivant}
          className="absolute left-1/2 top-1/2 z-20 hidden h-11 w-11 items-center justify-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)] lg:flex"
          style={{
            transform:
              "translate(calc(var(--W) / 2 + var(--g) / 2 - 50%), -50%)",
          }}
        >
          <ArrowRight size={18} strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </section>
  );
}

function VignetteContenu({ projet }: { projet: StoryProjet }) {
  return (
    <span className="relative flex h-full w-full flex-col">
      <span className="relative block aspect-[16/10] w-full shrink-0 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)]">
        {projet.image ? (
          <Image
            src={projet.image}
            alt=""
            fill
            sizes="240px"
            className="object-cover object-top"
          />
        ) : null}
        <span className="absolute -bottom-5 left-2.5">
          <LogoProjet
            titre={projet.titre}
            logo={projet.logo}
            className="h-10 w-10 text-sm"
          />
        </span>
      </span>
      <span className="block p-2.5 pt-7 text-left font-[family-name:var(--font-space-grotesk)] text-base font-black uppercase leading-tight">
        {projet.titre}
      </span>
      <span className="line-clamp-5 px-2.5 text-left text-[11px] leading-snug text-[color:var(--color-muted)]">
        {projet.resume}
      </span>
    </span>
  );
}
