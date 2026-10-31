import type { Metadata } from "next";
import { execSync } from "node:child_process";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
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
      <section className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Build
        </p>
        <dl className="grid grid-cols-1 gap-0 border-2 border-[color:var(--color-border)] sm:grid-cols-3">
          <div className="flex flex-col gap-1 border-b-2 border-[color:var(--color-border)] p-4 sm:border-b-0 sm:border-r-2">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Version
            </dt>
            <dd className="font-[family-name:var(--font-space-grotesk)] text-xl font-black tracking-tight">
              {pkg.version}
            </dd>
          </div>
          <div className="flex flex-col gap-1 border-b-2 border-[color:var(--color-border)] p-4 sm:border-b-0 sm:border-r-2">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Commit
            </dt>
            <dd className="font-mono text-xl font-bold">
              <a
                href={`${REPO_URL}/commit/${commit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
              >
                {commit}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-1 p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Build
            </dt>
            <dd className="font-mono text-xl font-bold">{buildTime}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Stack ({sortedDeps.length} packages)
        </p>
        <ul className="grid grid-cols-1 gap-0 border-2 border-[color:var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
          {sortedDeps.map(([name, version], i) => (
            <li
              key={name}
              className="flex items-baseline justify-between gap-3 border-b-2 border-[color:var(--color-border)] px-4 py-2 font-mono text-xs last:border-b-0 sm:odd:border-r-2 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(3n+1)]:border-r-2 lg:[&:nth-child(3n+2)]:border-r-2 lg:[&:nth-last-child(-n+3)]:border-b-0"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="truncate uppercase tracking-wider text-[color:var(--color-fg)]">
                {name}
              </span>
              <span className="shrink-0 text-[color:var(--color-muted)]">
                {version}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.decisions}
        </p>
        <ol className="flex flex-col gap-0 border-2 border-[color:var(--color-border)]">
          {DECISIONS.map((d) => (
            <li
              key={d.id}
              className="flex items-baseline gap-4 border-b-2 border-[color:var(--color-border)] px-4 py-3 last:border-b-0"
            >
              <span className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                #{d.id}
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-base leading-snug">
                {d.title[lang]}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-[color:var(--color-muted)]">
          {t.details}{" "}
          <a
            href={`${REPO_URL}/blob/main/DECISIONS.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
          >
            DECISIONS.md
          </a>
          .
        </p>
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.remerciements}
        </p>
        <div className="max-w-2xl border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 text-base leading-relaxed shadow-[var(--shadow-hard-sm)]">
          <p>
            {t.merci1}{" "}
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
            >
              Claude Code
            </a>{" "}
            {t.merci2}
          </p>
          <p className="mt-4 text-[color:var(--color-muted)]">
            <em>
              {t.aEtoffer}
            </em>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Sources
        </p>
        <ul className="flex flex-wrap gap-3">
          {liensExternes(lang).map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ouvrir"
                className="inline-flex items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1.5 font-medium uppercase tracking-wider text-sm shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
              >
                {link.label}
                <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
