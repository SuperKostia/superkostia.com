import NextLink from "next/link";
import { getProjets } from "@/lib/mdx";
import { chemin, libelleType, type Lang } from "@/lib/i18n";

export async function Marquee({ lang }: { lang: Lang }) {
  const projets = await getProjets(lang);
  const featured = projets.filter((p) => p.frontmatter.featured === true);

  if (featured.length === 0) return null;

  const items = [...featured, ...featured];

  return (
    <section
      aria-label={lang === "en" ? "Featured projects" : "Projets mis en avant"}
      className="marquee border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] text-[color:var(--color-bg)]"
    >
      <div className="marquee__track flex min-w-[200%]">
        {items.map((p, i) => (
          <NextLink
            key={`${p.frontmatter.slug}-${i}`}
            href={chemin(lang, `/projets/${p.frontmatter.slug}`)}
            className="group flex shrink-0 items-center gap-4 border-r-2 border-[color:var(--color-bg)]/30 px-8 py-4"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              {p.frontmatter.year} · {libelleType(lang, p.frontmatter.type)}
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase tracking-tight group-hover:text-[color:var(--color-accent)]">
              {p.frontmatter.title}
            </span>
          </NextLink>
        ))}
      </div>
    </section>
  );
}
