import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Kostia — LinkedIn ou WhatsApp.",
};

// TODO: remplacer par ton vrai numéro WhatsApp (format international, chiffres uniquement, ex. 33612345678).
const WHATSAPP_NUMBER = "";
const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "";

type Channel = {
  label: string;
  handle: string;
  url: string;
  color: "accent" | "bg";
};

const CHANNELS: Channel[] = [
  {
    label: "LinkedIn",
    handle: "in/constantinmardoukhaev",
    url: "https://www.linkedin.com/in/constantinmardoukhaev/",
    color: "accent",
  },
  ...(WHATSAPP_URL
    ? [
        {
          label: "WhatsApp",
          handle: "message direct",
          url: WHATSAPP_URL,
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
          Deux canaux, un humain. Pour les sujets pro, LinkedIn. Pour un ping
          rapide, WhatsApp.
        </p>
      }
    >
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CHANNELS.map((c) => {
          const isAccent = c.color === "accent";
          return (
            <li key={c.url}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ouvrir"
                className={`group flex h-full flex-col justify-between gap-6 border-2 border-[color:var(--color-border)] p-8 shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-1 hover:-translate-y-1 sm:p-10 ${
                  isAccent
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">
                    {c.handle}
                  </span>
                  <ArrowUpRight
                    size={22}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
                <span className="font-[family-name:var(--font-space-grotesk)] text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl">
                  {c.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {!WHATSAPP_URL ? (
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Carte WhatsApp masquée jusqu&apos;à ajout du numéro dans{" "}
          <code className="font-mono normal-case">app/contact/page.tsx</code>.
        </p>
      ) : null}
    </PageShell>
  );
}
