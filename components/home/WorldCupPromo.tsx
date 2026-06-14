import NextLink from "next/link";

/** Badge promo Coupe du Monde 2026 sur la home, dirige vers le projet des récaps WhatsApp. */
export function WorldCupPromo() {
  return (
    <NextLink
      href="/projets/coupe-du-monde-dim"
      data-cursor="ouvrir"
      aria-label="Projet : récaps Coupe du Monde 2026 sur WhatsApp"
      className="group block border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent-fg)]">
        <span>⚽ Coupe du Monde 2026</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e10600] motion-safe:animate-pulse" />
          en direct
        </span>
      </div>
      <div className="p-4">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase leading-[0.95] tracking-tight">
          Un bot texte les scores à mes potes
        </p>
        <p className="mt-2 font-mono text-xs leading-snug text-[color:var(--color-fg)]">
          Mes potes reçoivent le score de chaque match sur WhatsApp,
          automatiquement. Dashboard live + récaps.
        </p>
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] underline decoration-2 underline-offset-4 group-hover:text-[color:var(--color-fg)]">
          Voir le projet →
        </p>
      </div>
    </NextLink>
  );
}
