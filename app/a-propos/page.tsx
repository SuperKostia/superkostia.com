import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "À propos",
  description: "Kostia, en long et en travers. Pas un CV.",
};

export default function AProposPage() {
  return (
    <PageShell
      eyebrow="À propos"
      title="Kostia, en long."
      intro={
        <p>
          Cette page accueillera la bio, la section &quot;ce que je fais en ce
          moment&quot;, &quot;ce qui m&apos;obsède&quot;, et une timeline
          non-linéaire. Construite en Phase 3.
        </p>
      }
    />
  );
}
