import type { Metadata } from "next";
import { execSync } from "node:child_process";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import pkg from "@/package.json";

export const metadata: Metadata = {
  title: "Colophon",
  description: "La cuisine du site : stack, version, décisions, remerciements.",
};

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
  title: string;
};

const DECISIONS: Decision[] = [
  { id: "001", title: "Next.js 16 plutôt que 15" },
  { id: "002", title: "/hobbies/photographie : univers visuel totalement à part" },
  { id: "003", title: "Accent jaune acide #E4FF3A par défaut" },
  { id: "004", title: "Pas de dépendance clsx / tailwind-merge" },
  { id: "005", title: "Hobbies dans la nav, Contact dans le footer" },
  { id: "006", title: "exifr pour lire les EXIF des JPEG au build" },
  { id: "007", title: "public/ d'abord, Supabase Storage au-delà de 100 MB" },
];

type LinkEntry = {
  label: string;
  url: string;
};

const EXTERNAL_LINKS: LinkEntry[] = [
  { label: "Dépôt GitHub", url: REPO_URL },
  { label: "Changelog", url: `${REPO_URL}/blob/main/CHANGELOG.md` },
  { label: "Roadmap", url: `${REPO_URL}/blob/main/ROADMAP.md` },
  { label: "Décisions", url: `${REPO_URL}/blob/main/DECISIONS.md` },
];

export default function ColophonPage() {
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
      intro={
        <p>
          La cuisine du site — stack, version, décisions, remerciements. Mis à
          jour à chaque déploiement.
        </p>
      }
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
          Décisions fortes
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
                {d.title}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-[color:var(--color-muted)]">
          Détails complets dans{" "}
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
          Remerciements
        </p>
        <div className="max-w-2xl border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-5 text-base leading-relaxed shadow-[var(--shadow-hard-sm)]">
          <p>
            Ce site a été écrit à deux, avec{" "}
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
            >
              Claude Code
            </a>{" "}
            en pair-programmeur permanent. Merci aux auteurs des dépendances
            open source de la stack ci-dessus — chaque ligne de ce site repose
            sur leur travail.
          </p>
          <p className="mt-4 text-[color:var(--color-muted)]">
            <em>
              Section à étoffer par Kostia : équipe Axiom, amis qui ont relu,
              lecteurs des premières versions.
            </em>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Sources
        </p>
        <ul className="flex flex-wrap gap-3">
          {EXTERNAL_LINKS.map((link) => (
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
