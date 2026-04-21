import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { getNomadsProfile } from "@/lib/nomads";

export const metadata: Metadata = {
  title: "À propos",
  description: "Kostia, en long et en travers. Pas un CV.",
};

export default async function AProposPage() {
  const nomads = await getNomadsProfile();
  return (
    <article className="flex flex-col">
      <header className="border-b-2 border-[color:var(--color-border)] px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          À propos
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-[9vw]">
          Kostia.
        </h1>
      </header>

      <section className="grid grid-cols-1 border-b-2 border-[color:var(--color-border)] lg:grid-cols-12">
        <div className="flex flex-col gap-4 px-6 py-12 sm:px-10 lg:col-span-8 lg:px-12 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            01 · situation
          </p>
          <p className="max-w-2xl font-[family-name:var(--font-space-grotesk)] text-3xl leading-tight sm:text-4xl">
            Basé à{" "}
            <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
              Athènes
            </span>
            . Entrepreneur, Axiom Academic. Créatif. Curiosité sans limite.
            Intense. Tout ou rien.
          </p>
        </div>

        <aside className="border-t-2 border-[color:var(--color-border)] p-6 sm:p-8 lg:col-span-4 lg:border-l-2 lg:border-t-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            héritage
          </p>
          <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-xl leading-snug">
            Deux passions qui me viennent de mon grand-père maternel :{" "}
            <em className="not-italic underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4">
              la photo et le vélo
            </em>
            .
          </p>
        </aside>
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            02 · en ce moment
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            Ce que je fais.
          </h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <a
            href="https://mercatofirst.com"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="ouvrir"
            className="group block border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] p-6 text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <span className="inline-flex items-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg)]">
                mon phare
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">
                mercatofirst.com ↗
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
              MercatoFirst
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed">
              Un CRM pour les agents de joueurs de football. Carnet
              d&apos;adresses augmenté, pipeline avec alertes sur les fins de
              contrat, prise de contact WhatsApp.
            </p>
          </a>

          <a
            href="https://superkostia.github.io/bookeeper/"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="ouvrir"
            className="group block border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] p-6 text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <span className="inline-flex items-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg)]">
                mon coup de tête
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">
                avec Karim ↗
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
              BooKeeper
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed">
              Plateforme pour réserver un gardien de but à l&apos;heure — pour
              les clubs et équipes amateurs qui cherchent un keeper, un match
              précis, une date, un niveau.
            </p>
          </a>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>10–12 h · jour</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                Je code.
              </h3>
              <p className="text-sm leading-relaxed">
                Jamais appris. Toujours compris les principes — j&apos;avais
                juste la flemme de les pratiquer. Depuis deux mois je me
                régale.
              </p>
              <p className="mt-2 border-l-4 border-[color:var(--color-accent)] pl-4 font-[family-name:var(--font-space-grotesk)] text-base italic leading-snug text-[color:var(--color-muted)]">
                Aujourd&apos;hui le code est gratuit et parfait ; à
                l&apos;époque c&apos;était ultra cher et très imparfait.
              </p>
            </article>
          </li>
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>photographie</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                Tout à l&apos;iPhone.
              </h3>
              <p className="text-sm leading-relaxed">
                Jamais aimé les gros reflex et leurs objectifs. Je shoote avec
                le dernier iPhone — l&apos;outil doit disparaître, la
                spontanéité doit rester.
              </p>
            </article>
          </li>
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>vélo</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                Cyclisme.
              </h3>
              <p className="text-sm leading-relaxed">
                J&apos;adore le cyclisme. Je l&apos;ai été sportivement —
                c&apos;est moins ma priorité aujourd&apos;hui, mais ça reste
                là.
              </p>
            </article>
          </li>
          {nomads ? (
            <li>
              <a
                href={nomads.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ouvrir"
                className="group flex h-full flex-col gap-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] p-6 text-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center border-2 border-[color:var(--color-bg)] bg-transparent px-2 py-0.5 font-mono text-xs uppercase tracking-wider">
                    nomade
                  </span>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                  En mouvement.
                </h3>
                <dl className="mt-1 grid grid-cols-3 gap-2 border-y-2 border-[color:var(--color-bg)] py-3">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      pays
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {nomads.stats.countries}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      villes
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {nomads.stats.cities}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      km
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {new Intl.NumberFormat("fr-FR").format(
                        nomads.stats.distance_traveled_km,
                      )}
                    </dd>
                  </div>
                </dl>
                {nomads.lastTrip ? (
                  <p className="font-mono text-xs uppercase tracking-wider opacity-70">
                    Dernier arrêt : {nomads.lastTrip.place},{" "}
                    {nomads.lastTrip.country}
                  </p>
                ) : null}
                <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] opacity-60">
                  Source : nomads.com
                </p>
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="border-t-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] px-6 py-12 text-[color:var(--color-bg)] sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-12 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
            03 · obsessions
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            Ce qui m&apos;obsède.
          </h2>
        </div>

        <ol className="flex max-w-4xl flex-col gap-6">
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              01
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              Comment le monde va survivre à l&apos;IA.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              02
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              Comment la société va muter.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              03
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              Comment{" "}
              <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
                donner le meilleur aux enfants
              </span>{" "}
              maintenant, plutôt que réparer après coup.
            </p>
          </li>
        </ol>

        <blockquote className="mt-12 max-w-2xl border-l-4 border-[color:var(--color-accent)] pl-6 font-[family-name:var(--font-space-grotesk)] text-xl italic leading-snug">
          Je ne suis pas très école. Je suis anti-école, en fait.
        </blockquote>
      </section>

      <section className="border-t-2 border-[color:var(--color-border)] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            04 · capsules
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            Timeline non-linéaire.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
            À remplir ensemble. Des capsules thématiques — villes qui m&apos;ont
            formé, outils qui m&apos;ont transformé, ratages qui m&apos;ont
            servi. Envoie-moi les angles et je structure.
          </p>
        </div>
      </section>
    </article>
  );
}
