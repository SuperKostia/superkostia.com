import { PageShell } from "@/components/layout/PageShell";
import { Tag } from "@/components/ui/Tag";

export default function Home() {
  return (
    <PageShell
      eyebrow="superkostia · phase 1"
      title={
        <>
          Terrain
          <br />
          <span className="inline-block bg-[color:var(--color-accent)] px-2 text-[color:var(--color-accent-fg)] -rotate-1">
            en&nbsp;cours
          </span>
          <br />
          de chantier.
        </>
      }
      intro={
        <p>
          Le squelette est posé : header sticky, menu mobile plein écran, footer,
          pipeline MDX, pages vides. La home expérientielle (§5 du cahier des
          charges) arrive en Phase 2.
        </p>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Tag tone="accent">phase 1 · squelette</Tag>
        <Tag>navigation posée</Tag>
        <Tag>MDX lu depuis content/</Tag>
      </div>
    </PageShell>
  );
}
