"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyTelegram } from "./actions";
import type { Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

const TEXTES = {
  fr: {
    nomCourt: "Un nom, même court.",
    motifCourt: "Deux mots au moins sur pourquoi tu écris.",
    cle: "Clé d'entrée",
    consigne: "Dis-moi en deux mots pourquoi tu veux me joindre. Ton message m'arrive direct sur Telegram, et tu débloques mes contacts juste après. Deux canaux, un humain.",
    nom: "Nom",
    pourquoi: "Pourquoi tu écris",
    deverrouiller: "Déverrouiller les contacts",
    ouvert: "Déverrouillé · à toi",
    reverrouiller: "Reverrouiller",
  },
  en: {
    nomCourt: "A name, even a short one.",
    motifCourt: "At least two words on why you're writing.",
    cle: "Key to get in",
    consigne: "Tell me in a few words why you want to reach me. Your message lands straight on my Telegram, and my contacts unlock right after. Two channels, one human.",
    nom: "Name",
    pourquoi: "Why you're writing",
    deverrouiller: "Unlock the contacts",
    ouvert: "Unlocked · over to you",
    reverrouiller: "Lock again",
  },
} satisfies Record<Lang, Record<string, string>>;

const STORAGE_KEY = "contact-unlocked";

type Channel = {
  label: string;
  handle: string;
  url: string;
  color: "accent" | "bg";
};

type Stage = "loading" | "locked" | "unlocked";

type ContactGateProps = {
  channels: Channel[];
};

export function ContactGate({ channels }: ContactGateProps) {
  const [stage, setStage] = useState<Stage>("loading");
  const [formError, setFormError] = useState<string | null>(null);
  const lang = useLang();
  const t = TEXTES[lang];

  useEffect(() => {
    // localStorage read ne s'expose pas proprement via useSyncExternalStore
    // (on a besoin d'un état initial "loading" pour éviter le flash form → unlocked
    // chez un visiteur qui a déjà déverrouillé). Exception ciblée au rule.
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === "true";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(stored ? "unlocked" : "locked");
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("locked");
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const motif = (form.elements.namedItem("motif") as HTMLTextAreaElement).value.trim();
    const honey = (form.elements.namedItem("website") as HTMLInputElement).value.trim();

    if (honey) {
      // Silently succeed for bots, n'envoie rien.
      unlock();
      return;
    }
    if (name.length < 2) {
      setFormError(t.nomCourt);
      return;
    }
    if (motif.length < 5) {
      setFormError(t.motifCourt);
      return;
    }
    setFormError(null);

    // Fire-and-forget vers Telegram — on ne bloque pas le déverrouillage
    // si la notif échoue, l'utilisateur a quand même rempli sa part.
    void notifyTelegram({ name, motif, honeypot: "", lang }).catch((err) => {
      console.error("notifyTelegram failed", err);
    });

    unlock();
  }

  function unlock() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setStage("unlocked");
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setStage("locked");
  }

  if (stage === "loading") {
    return <GatePlaceholder />;
  }

  if (stage === "unlocked") {
    return <UnlockedView channels={channels} onReset={reset} t={t} />;
  }

  return <LockedForm onSubmit={handleSubmit} error={formError} t={t} />;
}

function GatePlaceholder() {
  return (
    <div
      aria-hidden
      className="h-[420px] border-2 border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
    />
  );
}

type Textes = (typeof TEXTES)[Lang];

type LockedFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  t: Textes;
};

function LockedForm({ onSubmit, error, t }: LockedFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard)] sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.cle}
        </p>
        <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-snug sm:text-3xl">
          {t.consigne}
        </p>
      </div>

      <Field label={t.nom} error={null}>
        <input
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          className="w-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-base text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] focus:outline-none"
        />
      </Field>

      <Field label={t.pourquoi} error={null}>
        <textarea
          name="motif"
          required
          minLength={5}
          maxLength={500}
          rows={4}
          className="w-full resize-y border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-base text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] focus:outline-none"
        />
      </Field>

      {/* Honeypot invisible */}
      <div
        aria-hidden
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
      >
        <label>
          Site web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        data-cursor="cliquer"
        className="inline-flex items-center justify-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)] px-6 py-3 font-medium uppercase tracking-wider text-[color:var(--color-accent-fg)] shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
      >
        {t.deverrouiller}
      </button>
    </form>
  );
}

type UnlockedViewProps = {
  channels: Channel[];
  onReset: () => void;
  t: Textes;
};

function UnlockedView({ channels, onReset, t }: UnlockedViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {t.ouvert}
      </p>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {channels.map((c) => {
          const isAccent = c.color === "accent";
          return (
            <li key={c.url}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ouvrir"
                className={cn(
                  "group flex h-full flex-col justify-between gap-6 border-2 border-[color:var(--color-border)] p-8 shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-1 hover:-translate-y-1 sm:p-10",
                  isAccent
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]",
                )}
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
      <button
        type="button"
        onClick={onReset}
        className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted)] underline decoration-2 underline-offset-4 hover:text-[color:var(--color-fg)]"
      >
        {t.reverrouiller}
      </button>
    </div>
  );
}

type FieldProps = {
  label: string;
  error: string | null;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
