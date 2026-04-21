import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Link } from "@/components/ui/Link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-10 px-6 py-16 sm:px-10 lg:px-20">
      <header className="flex items-start justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          superkostia · phase 0
        </p>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-[10vw]">
          Terrain
          <br />
          <span className="inline-block bg-[color:var(--color-accent)] px-2 text-[color:var(--color-accent-fg)] -rotate-1">
            en&nbsp;cours
          </span>
          <br />
          de chantier.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[color:var(--color-muted)]">
          Cette home est provisoire. Elle sert juste à vérifier que les tokens,
          les primitives et le dark mode fonctionnent avant de passer au
          squelette.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Primitives
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Bouton défaut</Button>
          <Button variant="accent">Bouton accent</Button>
          <Button variant="ghost">Bouton ghost</Button>
          <Tag>tag neutre</Tag>
          <Tag tone="accent">tag accent</Tag>
          <Link href="/">Lien interne</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Card brutaliste
          </p>
          <p className="mt-2 text-base">
            Bordure épaisse, ombre dure, aucun blur. On assume.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Dark mode
          </p>
          <p className="mt-2 text-base">
            Toggle en haut à droite. Persisté en localStorage.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Accent
          </p>
          <p className="mt-2 text-base">
            Jaune acide <code className="font-mono">#E4FF3A</code>. Utilisé avec
            parcimonie.
          </p>
        </Card>
      </section>
    </main>
  );
}
