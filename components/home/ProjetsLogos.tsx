import NextLink from "next/link";
import { getProjets } from "@/lib/mdx";
import { logoProjet } from "@/lib/visuels";
import { chemin, type Lang } from "@/lib/i18n";
import { LogoProjet } from "@/components/projet/LogoProjet";

/** Bandeau de logos des projets phares, façon « ils nous font confiance ». */
export async function ProjetsLogos({ lang }: { lang: Lang }) {
  const projets = await getProjets(lang);
  const phares = projets.filter((p) => p.frontmatter.featured === true);
  if (phares.length === 0) return null;

  return (
    <section
      aria-labelledby="projets-phares"
      className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-5 py-14 sm:px-8"
    >
      <h2 id="projets-phares" className="text-center text-[15px] font-normal" style={{ fontStretch: "100%" }}>
        {lang === "en"
          ? "What's running right now, and what ran before."
          : "Ce qui tourne en ce moment, et ce qui a tourné."}
      </h2>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6">
        {phares.map((p) => (
          <li key={p.frontmatter.slug}>
            <NextLink
              href={chemin(lang, `/projets/${p.frontmatter.slug}`)}
              className="group flex w-[78px] flex-col items-center gap-2 text-center"
            >
              <span className="grayscale transition duration-200 group-hover:-translate-y-0.5 group-hover:grayscale-0">
                <LogoProjet
                  titre={p.frontmatter.title}
                  logo={logoProjet(p.frontmatter.slug)}
                  className="h-14 w-14"
                />
              </span>
              <span className="text-[12px] leading-tight text-[color:var(--color-muted)] group-hover:text-[color:var(--color-fg)]">
                {p.frontmatter.title}
              </span>
            </NextLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
