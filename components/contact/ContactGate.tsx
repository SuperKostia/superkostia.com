"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/Button";
import { NodeLabel } from "@/components/ui/NodeLabel";
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
    idees: "Idées pour démarrer",
    idee1: "Un projet à monter ensemble",
    idee2: "Une question sur Axiom Academic",
    idee3: "Un café à Athènes",
    idee4: "Juste dire bonjour",
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
    idees: "Ideas to get started",
    idee1: "A project to build together",
    idee2: "A question about Axiom Academic",
    idee3: "A coffee in Athens",
    idee4: "Just saying hi",
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
      className="mx-auto h-[460px] w-full max-w-[760px] rounded-[28px] bg-[color:var(--color-surface)]"
    />
  );
}

type Textes = (typeof TEXTES)[Lang];

type LockedFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  t: Textes;
};

const champ =
  "w-full rounded-[14px] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-fg)] placeholder:text-[color:var(--color-muted)]";

/** La porte, façon bloc de prompt : une grande carte, le champ, l'envoi en pilule rose. */
function LockedForm({ onSubmit, error, t }: LockedFormProps) {
  const motifRef = useRef<HTMLTextAreaElement>(null);
  const idees = [t.idee1, t.idee2, t.idee3, t.idee4];

  function proposer(idee: string) {
    const champMotif = motifRef.current;
    if (!champMotif) return;
    champMotif.value = idee;
    champMotif.focus();
  }

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <NodeLabel>{t.cle}</NodeLabel>
        <p className="max-w-[48ch] text-balance text-lg leading-snug sm:text-xl">{t.consigne}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative flex flex-col gap-3 rounded-[28px] bg-[color:var(--color-surface)] p-3 sm:p-4"
      >
        <div className="flex flex-col gap-4 rounded-[20px] bg-[color:var(--color-bg)] p-4 sm:p-5">
          <Field label={t.nom} error={null}>
            <input
              name="name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              className={champ}
            />
          </Field>

          <Field label={t.pourquoi} error={null}>
            <textarea
              ref={motifRef}
              name="motif"
              required
              minLength={5}
              maxLength={500}
              rows={4}
              className={cn(champ, "resize-y")}
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            {error ? (
              <p
                role="alert"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.04em] text-[color:var(--color-fg)]"
              >
                <span aria-hidden className="node-dot" />
                {error}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
             
              className={buttonClasses("accent", "md", "ml-auto")}
            >
              {t.deverrouiller}
              <ArrowUp size={16} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 pb-1">
          <p className="sr-only">{t.idees}</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {idees.map((idee) => (
              <li key={idee}>
                <button
                  type="button"
                  onClick={() => proposer(idee)}
                  className={buttonClasses("default", "sm", "h-9 px-3.5")}
                >
                  {idee}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}

type UnlockedViewProps = {
  channels: Channel[];
  onReset: () => void;
  t: Textes;
};

function UnlockedView({ channels, onReset, t }: UnlockedViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
      <p className="inline-flex items-center gap-2 self-center rounded-full bg-[color:var(--color-surface)] px-4 py-2 font-mono text-xs uppercase tracking-[0.04em]">
        <LockOpen size={14} strokeWidth={1.75} aria-hidden />
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
               
                className={cn(
                  "group relative flex h-full min-h-[240px] flex-col justify-between gap-6 overflow-hidden rounded-[28px] p-8 transition-colors sm:p-10",
                  isAccent
                    ? "bg-dots-ink bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)]"
                    : "bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-2)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "inline-flex h-7 items-center gap-2 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.04em]",
                      isAccent
                        ? "bg-[color:var(--color-ink-surface)]"
                        : "bg-[color:var(--color-surface-2)]",
                    )}
                  >
                    <span aria-hidden className="node-dot" />
                    {c.handle}
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    <ArrowUpRight size={20} strokeWidth={1.75} />
                  </span>
                </div>
                <span className="font-display text-5xl font-medium leading-[0.9] tracking-[-0.02em] sm:text-6xl">
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
        className={buttonClasses("ghost", "sm", "self-center text-[color:var(--color-muted)]")}
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
      <span className="font-mono text-xs uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
