import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Kostia. Formulaire et liens directs.",
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Écrire."
      intro={
        <p>
          Formulaire (Server Action + Resend) et liens directs arrivent en Phase
          3. En attendant, la source est sur{" "}
          <a
            href="https://github.com/SuperKostia/superkostia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-2 underline-offset-4 hover:decoration-[color:var(--color-accent)]"
          >
            GitHub
          </a>
          .
        </p>
      }
    />
  );
}
