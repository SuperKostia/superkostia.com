import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ContactGate } from "@/components/contact/ContactGate";
import { alternates, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    description: "Écrire à Kostia. Un rituel de deux mots, puis les contacts directs.",
    titre: "Écrire.",
    intro: "Deux canaux, un humain. Avant, un rituel d'intention : ton message ne part nulle part, c'est juste pour te forcer à formuler ta demande avant.",
    whatsapp: "message direct",
  },
  en: {
    description: "Write to Kostia. A two-word ritual, then the direct contacts.",
    titre: "Write.",
    intro: "Two channels, one human. First, a small ritual of intent: just to make you put your request into words before reaching out.",
    whatsapp: "direct message",
  },
} satisfies Record<Lang, Record<string, string>>;

export function metadataContact(lang: Lang): Metadata {
  return {
    title: "Contact",
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/contact"),
  };
}

// Numéro WhatsApp au format international (chiffres uniquement).
const WHATSAPP_NUMBER = "33626790144";

const canaux = (lang: Lang) => [
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
          handle: TEXTES[lang].whatsapp,
          url: `https://wa.me/${WHATSAPP_NUMBER}`,
          color: "bg" as const,
        },
      ]
    : []),
];

export function Contact({ lang }: { lang: Lang }) {
  const t = TEXTES[lang];
  return (
    <PageShell
      eyebrow="Contact"
      title={t.titre}
      intro={<p>{t.intro}</p>}
    >
      <ContactGate channels={canaux(lang)} />
    </PageShell>
  );
}
