import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Colophon",
  description: "Stack, remerciements, changelog. La cuisine du site.",
};

export default function ColophonPage() {
  return (
    <PageShell
      eyebrow="Meta"
      title="Colophon."
      intro={
        <p>
          La cuisine du site : stack (lue depuis <code>package.json</code>),
          changelog, stats. Monté en Phase 5.
        </p>
      }
    />
  );
}
