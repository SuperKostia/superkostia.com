import type { Metadata } from "next";
import { execSync } from "node:child_process";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { Link } from "@/components/ui/Link";
import { buttonClasses } from "@/components/ui/Button";
import pkg from "@/package.json";
import { alternates, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    description: "La cuisine du site : stack, version, décisions, remerciements.",
    intro: "La cuisine du site : stack, version, décisions, remerciements. Mis à jour à chaque déploiement.",
    decisions: "Décisions fortes",
    details: "Détails complets dans",
    remerciements: "Remerciements",
    merci1: "Ce site a été écrit à deux, avec",
    merci2: "en pair-programmeur permanent. Merci aux auteurs des dépendances open source de la stack ci-dessus : chaque ligne de ce site repose sur leur travail.",
    aEtoffer: "Section à étoffer par Kostia : équipe Axiom, amis qui ont relu, lecteurs des premières versions.",
  },
  en: {
    description: "How the site is made: stack, version, decisions, thanks.",
    intro: "How the site is made: stack, version, decisions, thanks. Updated on every deploy.",
    decisions: "Key decisions",
    details: "Full details in",
    remerciements: "Thanks",
    merci1: "This site was written by two, with",
    merci2: "as a full-time pair programmer. Thanks to the authors of the open-source dependencies in the stack above: every line of this site rests on their work.",
    aEtoffer: "Section for Kostia to expand: the Axiom team, friends who proofread, readers of the early versions.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function metadataColophon(lang: Lang): Metadata {
  return {
    title: "Colophon",
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/colophon"),
  };
}

const REPO_URL = "https://github.com/SuperKostia/superkostia.com";

function getCommit(): string {
  const envCommit = process.env.VERCEL_GIT_COMMIT_SHA;
  if (envCommit) return envCommit.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "local";
  }
}

type Decision = {
  id: string;
  title: Record<Lang, string>;
};

const DECISIONS: Decision[] = [
  { id: "001", title: { fr: "Next.js 16 plutôt que 15", en: "Next.js 16 rather than 15" } },
  {
    id: "002",
    title: {
      fr: "/hobbies/photographie : univers visuel totalement à part",
      en: "/hobbies/photography: a visual world entirely of its own",
    },
  },
  { id: "003", title: { fr: "Accent jaune acide #E4FF3A par défaut", en: "Acid yellow accent #E4FF3A by default" } },
  { id: "004", title: { fr: "Pas de dépendance clsx / tailwind-merge", en: "No clsx / tailwind-merge dependency" } },
  { id: "005", title: { fr: "Hobbies dans la nav, Contact dans le footer", en: "Hobbies in the nav, Contact in the footer" } },
  { id: "006", title: { fr: "exifr pour lire les EXIF des JPEG au build", en: "exifr to read JPEG EXIF data at build time" } },
  {
    id: "007",
    title: { fr: "public/ d'abord, Supabase Storage au-delà de 100 MB", en: "public/ first, Supabase Storage beyond 100 MB" },
  },
  {
    id: "012",
    title: { fr: "Site bilingue : le français à la racine, l'anglais sous /en", en: "Bilingual site: French at the root, English under /en" },
  },
  {
    id: "014",
    title: {
      fr: "Nouvelle DA inspirée de n8n : trame de points, pilules, accent rose",
      en: "New look inspired by n8n: dot grid, pills, pink accent",
    },
  },
];

type LinkEntry = {
  label: string;
  url: string;
};

const liensExternes = (lang: Lang): LinkEntry[] => [
  { label: lang === "en" ? "GitHub repo" : "Dépôt GitHub", url: REPO_URL },
  { label: "Changelog", url: `${REPO_URL}/blob/main/CHANGELOG.md` },
  { label: "Roadmap", url: `${REPO_URL}/blob/main/ROADMAP.md` },
  { label: lang === "en" ? "Decisions" : "Décisions", url: `${REPO_URL}/blob/main/DECISIONS.md` },
];

export function Colophon({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  } as Record<string, string>;
  const sortedDeps = Object.entries(deps).sort(([a], [b]) => a.localeCompare(b));
  const commit = getCommit();
  const buildTime = new Date().toISOString().slice(0, 16).replace("T", " ");

  return (
    <PageShell
      eyebrow="Meta"
      title="Colophon."
      intro={<p>{t.intro}</p>}
    >
      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-5">
          <NodeLabel>Build</NodeLabel>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="flex flex-col gap-3">
              <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                Version
              </dt>
              <dd className="font-display text-3xl font-medium tracking-[-0.015em]">{pkg.version}</dd>
            </Card>
            <Card className="flex flex-col gap-3">
              <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                Commit
              </dt>
              <dd className="font-mono text-2xl">
                <Link href={`${REPO_URL}/commit/${commit}`} external>
                  {commit}
                </Link>
              </dd>
            </Card>
            <Card className="flex flex-col gap-3">
              <dt className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
                Build
              </dt>
              <dd className="font-mono text-2xl">{buildTime}</dd>
            </Card>
          </dl>
        </section>

        <section className="flex flex-col gap-5">
          <NodeLabel>Stack ({sortedDeps.length} packages)</NodeLabel>
          <Card className="p-3 sm:p-4">
            <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedDeps.map(([name, version]) => (
                <li
                  key={name}
                  className="flex items-baseline justify-between gap-3 border-b border-[color:var(--color-line)] px-3 py-2.5 font-mono text-xs"
                >
                  <span className="truncate text-[color:var(--color-fg)]">{name}</span>
                  <span className="shrink-0 text-[color:var(--color-muted)]">{version}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <Panel as="section" dots className="flex flex-col gap-8 p-6 sm:p-10 lg:p-14">
          <div className="flex flex-col gap-3">
            <p className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              <span aria-hidden className="node-dot" />
              {t.decisions}
              <span aria-hidden className="node-dot" />
            </p>
            <h2 className="text-3xl font-medium leading-[0.95] tracking-[-0.015em] sm:text-4xl">
              DECISIONS.md
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {DECISIONS.map((d) => (
              <li
                key={d.id}
                className="flex items-baseline gap-4 rounded-[16px] bg-[color:var(--color-ink-surface)] px-4 py-3.5"
              >
                <span className="shrink-0 font-mono text-xs text-[color:var(--color-accent-strong)]">
                  #{d.id}
                </span>
                <span className="text-[15px] leading-snug">{d.title[lang]}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {t.details}{" "}
            <a
              href={`${REPO_URL}/blob/main/DECISIONS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink-fg)] underline decoration-1 underline-offset-[5px] hover:decoration-[color:var(--color-accent-strong)] hover:decoration-2"
            >
              DECISIONS.md
            </a>
            .
          </p>
        </Panel>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <NodeLabel>{t.remerciements}</NodeLabel>
          </div>
          <Card className="flex flex-col gap-4 p-6 text-base leading-relaxed sm:p-8 lg:col-span-8">
            <p>
              {t.merci1}{" "}
              <Link href="https://claude.com/claude-code" external>
                Claude Code
              </Link>{" "}
              {t.merci2}
            </p>
            <p className="text-[color:var(--color-muted)]">
              <em>{t.aEtoffer}</em>
            </p>
          </Card>
        </section>

        <section className="flex flex-col items-center gap-5">
          <NodeLabel>Sources</NodeLabel>
          <ul className="flex flex-wrap justify-center gap-2">
            {liensExternes(lang).map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                 
                  className={buttonClasses("default", "md")}
                >
                  {link.label}
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
