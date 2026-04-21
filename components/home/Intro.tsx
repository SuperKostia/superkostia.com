export function Intro() {
  return (
    <div className="flex h-full flex-col justify-end gap-4 border-l-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 font-mono text-sm leading-relaxed sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        01 · manifeste
      </p>
      <p>
        Je m&apos;appelle Kostia. Je monte des boîtes, je tire des portraits, je
        dessine des logos, je lis Adler.
      </p>
      <p>
        Ce site est un terrain de jeu public : ce que je fais, ce que je rate,
        ce qui m&apos;obsède, ce qui traîne sur mon bureau.
      </p>
      <p className="text-[color:var(--color-muted)]">
        Rien n&apos;est fini. C&apos;est le principe.
      </p>
    </div>
  );
}
