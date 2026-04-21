import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ContactGate } from "./ContactGate";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Écrire à Kostia. Un rituel de deux mots, puis les contacts directs.",
};

// Numéro WhatsApp au format international (chiffres uniquement).
const WHATSAPP_NUMBER = "33626790144";

const CHANNELS = [
  {
    label: "LinkedIn",
    handle: "in/cmardoukhaev",
    url: "https://www.linkedin.com/in/cmardoukhaev/",
    color: "accent" as const,
  },
  ...(WHATSAPP_NUMBER
    ? [
        {
          label: "WhatsApp",
          handle: "message direct",
          url: `https://wa.me/${WHATSAPP_NUMBER}`,
          color: "bg" as const,
        },
      ]
    : []),
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Écrire."
      intro={
        <p>
          Deux canaux, un humain. Avant, un rituel d&apos;intention — ton
          message ne part nulle part, c&apos;est juste pour te forcer à
          formuler ta demande avant.
        </p>
      }
    >
      <ContactGate channels={CHANNELS} />
    </PageShell>
  );
}
