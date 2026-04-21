"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === "true";
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
      // Silently succeed for bots.
      unlock();
      return;
    }
    if (name.length < 2) {
      setFormError("Un nom, même court.");
      return;
    }
    if (motif.length < 5) {
      setFormError("Deux mots au moins sur pourquoi tu écris.");
      return;
    }
    setFormError(null);
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
    return <UnlockedView channels={channels} onReset={reset} />;
  }

  return <LockedForm onSubmit={handleSubmit} error={formError} />;
}

function GatePlaceholder() {
  return (
    <div
      aria-hidden
      className="h-[420px] border-2 border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
    />
  );
}

type LockedFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
};

function LockedForm({ onSubmit, error }: LockedFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard)] sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          Clé d&apos;entrée
        </p>
        <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-snug sm:text-3xl">
          Dis-moi en deux mots pourquoi tu veux me joindre. Ton mot reste chez
          toi — pas de serveur, pas de captation. C&apos;est un rituel, pas un
          formulaire.
        </p>
      </div>

      <Field label="Nom" error={null}>
        <input
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          className="w-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-base text-[color:var(--color-fg)] shadow-[var(--shadow-hard-sm)] focus:outline-none"
        />
      </Field>

      <Field label="Pourquoi tu écris" error={null}>
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
        Déverrouiller les contacts
      </button>
    </form>
  );
}

type UnlockedViewProps = {
  channels: Channel[];
  onReset: () => void;
};

function UnlockedView({ channels, onReset }: UnlockedViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        Déverrouillé · à toi
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
        Reverrouiller
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
