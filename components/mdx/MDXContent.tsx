import type { ComponentProps } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { chemin, type Lang } from "@/lib/i18n";
import { sharedMDXComponents } from "./MDXComponents";
import { Stack } from "./Stack";
import { Links } from "./Links";
import { Quote } from "./Quote";
import { Gallery } from "./Gallery";
import { VideoEmbed } from "./VideoEmbed";
import { Press, PressItem } from "./Press";
import { Screenshot } from "./Screenshot";
import { LABELS, Social } from "./Social";

const CUSTOM_COMPONENTS = {
  Stack,
  Links,
  Quote,
  Gallery,
  VideoEmbed,
  Press,
  PressItem,
  Screenshot,
  Social,
};

/** Lien interne vers une page (pas un fichier de public/, comme les dashboard.html). */
function estPage(href: string): boolean {
  return href.startsWith("/") && !/\.[a-z0-9]+(?:[?#].*)?$/i.test(href);
}

/** En anglais : libellés par défaut des encarts et liens internes vers les adresses /en. */
function composantsAnglais() {
  const Anchor = sharedMDXComponents.a as (props: ComponentProps<"a">) => React.ReactNode;
  return {
    a: ({ href = "", ...props }: ComponentProps<"a">) => (
      <Anchor href={estPage(href) ? chemin("en", href) : href} {...props} />
    ),
    Links: (props: ComponentProps<typeof Links>) => <Links label="Links" {...props} />,
    Press: (props: ComponentProps<typeof Press>) => <Press label="Press" {...props} />,
    Social: (props: ComponentProps<typeof Social>) => (
      <Social cta={`View on ${LABELS[props.platform]}`} {...props} />
    ),
  };
}

type MDXContentProps = {
  source: string;
  lang?: Lang;
  /** Largeur et placement de la colonne de lecture (par défaut 720 px, calée à gauche). */
  className?: string;
};

export function MDXContent({ source, lang = "fr", className = "max-w-[720px]" }: MDXContentProps) {
  return (
    <div className={`text-[17px] leading-relaxed ${className}`}>
      <MDXRemote
        source={source}
        components={{
          ...sharedMDXComponents,
          ...CUSTOM_COMPONENTS,
          ...(lang === "en" ? composantsAnglais() : {}),
        }}
        // Le contenu est écrit par nous, dans le dépôt : les props en JavaScript
        // (`items={[…]}` de <Stack> et <Links>) doivent passer. Les expressions
        // dangereuses restent bloquées (blockDangerousJS par défaut).
        options={{ blockJS: false }}
      />
    </div>
  );
}
