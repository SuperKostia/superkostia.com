import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowUpRight,
  Flame,
  House,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { NodeLabel } from "@/components/ui/NodeLabel";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import { getNomadsProfile } from "@/lib/nomads";
import { alternates, formatNombre, type Lang } from "@/lib/i18n";

const TEXTES = {
  fr: {
    titre: "À propos",
    description: "Kostia, en long et en travers. Pas un CV.",
    situationEyebrow: "01 · situation",
    baseA: "Basé à",
    ville: "Athènes",
    situation: ". Entrepreneur, Axiom Academic. Créatif. Curiosité sans limite. Intense. Tout ou rien.",
    heritage: "héritage",
    heritageTexte: "Deux passions qui me viennent de mon grand-père maternel :",
    heritagePassions: "la photo et le vélo",
    momentEyebrow: "02 · en ce moment",
    momentTitre: "Ce que je fais.",
    codeTag: "10–12 h · jour",
    codeTitre: "Je code.",
    codeTexte: "Jamais appris. Toujours compris les principes, j'avais juste la flemme de les pratiquer. Depuis deux mois je me régale.",
    codeCitation: "Aujourd'hui le code est gratuit et parfait ; à l'époque c'était ultra cher et très imparfait.",
    photoTag: "photographie",
    photoTitre: "Tout à l'iPhone.",
    photoTexte: "Jamais aimé les gros reflex et leurs objectifs. Je shoote avec le dernier iPhone : l'outil doit disparaître, la spontanéité doit rester.",
    veloTag: "vélo",
    veloTitre: "Cyclisme.",
    veloTexte: "J'adore le cyclisme. Je l'ai été sportivement ; c'est moins ma priorité aujourd'hui, mais ça reste là.",
    nomade: "nomade",
    mouvement: "En mouvement.",
    pays: "pays",
    villes: "villes",
    dernierArret: "Dernier arrêt",
    source: "Source : nomads.com",
    obsessionsEyebrow: "03 · obsessions",
    obsessionsTitre: "Ce qui m'obsède.",
    obsession1: "Comment le monde va survivre à l'IA.",
    obsession2: "Comment la société va muter.",
    obsession3Avant: "Comment",
    obsession3Accent: "donner le meilleur aux enfants",
    obsession3Apres: "maintenant, plutôt que réparer après coup.",
    antiEcole: "Je ne suis pas très école. Je suis anti-école, en fait.",
    capsulesEyebrow: "04 · capsules",
    capsulesTitre: "Timeline non-linéaire.",
    capsulesTexte: "Pas un CV. Des capsules thématiques qui disent où je suis passé, qui m'a tiré, ce qui m'a cassé.",
    cloture: "· clôture",
    obsessionDureAvant: "Mon obsession qui dure :",
    obsessionDureAccent: "créer une marque",
    obsessionDureApres: "aimée par le grand public.",
    regle: "Ma règle",
    regleAvant: ". Le maximum en",
    travail: "travail",
    creativite: "créativité",
    decouverte: "découverte",
    rencontre: "rencontre",
    regleApres: ". Tout le temps.",
  },
  en: {
    titre: "About",
    description: "Kostia, inside out. Not a résumé.",
    situationEyebrow: "01 · where I'm at",
    baseA: "Based in",
    ville: "Athens",
    situation: ". Entrepreneur, Axiom Academic. Creative. Endlessly curious. Intense. All or nothing.",
    heritage: "heritage",
    heritageTexte: "Two passions I got from my maternal grandfather:",
    heritagePassions: "photography and cycling",
    momentEyebrow: "02 · right now",
    momentTitre: "What I do.",
    codeTag: "10–12 h · a day",
    codeTitre: "I code.",
    codeTexte: "Never learned. Always understood the principles, I was just too lazy to practise them. For the past two months I've been having a blast.",
    codeCitation: "Today code is free and flawless; back then it was hugely expensive and deeply flawed.",
    photoTag: "photography",
    photoTitre: "All on iPhone.",
    photoTexte: "Never liked big DSLRs and their lenses. I shoot on the latest iPhone: the tool should disappear, the spontaneity should stay.",
    veloTag: "cycling",
    veloTitre: "Cycling.",
    veloTexte: "I love cycling. I used to race; it's less of a priority today, but it's still there.",
    nomade: "nomad",
    mouvement: "On the move.",
    pays: "countries",
    villes: "cities",
    dernierArret: "Last stop",
    source: "Source: nomads.com",
    obsessionsEyebrow: "03 · obsessions",
    obsessionsTitre: "What obsesses me.",
    obsession1: "How the world is going to survive AI.",
    obsession2: "How society is going to change.",
    obsession3Avant: "How to",
    obsession3Accent: "give children the best",
    obsession3Apres: "now, rather than fix things afterwards.",
    antiEcole: "I'm not really a school person. I'm anti-school, actually.",
    capsulesEyebrow: "04 · capsules",
    capsulesTitre: "Non-linear timeline.",
    capsulesTexte: "Not a résumé. Themed capsules about where I've been, who pulled me forward, what broke me.",
    cloture: "· closing",
    obsessionDureAvant: "The obsession that never leaves:",
    obsessionDureAccent: "building a brand",
    obsessionDureApres: "the general public loves.",
    regle: "My rule",
    regleAvant: ". The most I can in",
    travail: "work",
    creativite: "creativity",
    decouverte: "discovery",
    rencontre: "people",
    regleApres: ". All the time.",
  },
} satisfies Record<Lang, Record<string, string>>;

const CAPSULES = {
  fr: {
    villes: { titre: "Villes qui m'ont formé", items: [{ label: "Moscou" }, { label: "Paris" }, { label: "Dubaï" }, { label: "Athènes" }, { label: "Lisbonne" }] },
    outils: { titre: "Outils qui m'ont transformé", footer: "Pas une faute de frappe." },
    ratages: { titre: "Ratages qui m'ont servi", items: [{ label: "Trafficintellect", note: "Ma première boîte, montée à Moscou." }] },
    rencontres: {
      titre: "Rencontres qui m'ont tiré",
      items: [
        { label: "Arthur", note: "Russie · entrepreneur en série" },
        { label: "Laurent", note: "France · coach de chefs d'entreprise" },
        { label: "Dimitri", note: "Franco-grec · entrepreneur tech, crypto bro" },
        { label: "+ beaucoup d'autres" },
      ],
    },
    pays: {
      titre: "Pays habités",
      items: [{ label: "Moscou", note: "plus de dix ans" }, { label: "Patmos", note: "pendant le Covid" }],
      footer: "Pour les pays traversés, voir la carte Nomade plus haut.",
    },
  },
  en: {
    villes: { titre: "Cities that shaped me", items: [{ label: "Moscow" }, { label: "Paris" }, { label: "Dubai" }, { label: "Athens" }, { label: "Lisbon" }] },
    outils: { titre: "Tools that changed me", footer: "Not a typo." },
    ratages: { titre: "Failures that paid off", items: [{ label: "Trafficintellect", note: "My first company, built in Moscow." }] },
    rencontres: {
      titre: "People who pulled me forward",
      items: [
        { label: "Arthur", note: "Russia · serial entrepreneur" },
        { label: "Laurent", note: "France · coach for business leaders" },
        { label: "Dimitri", note: "French-Greek · tech entrepreneur, crypto bro" },
        { label: "+ many others" },
      ],
    },
    pays: {
      titre: "Places I've lived",
      items: [{ label: "Moscow", note: "over ten years" }, { label: "Patmos", note: "during Covid" }],
      footer: "For the countries I've passed through, see the Nomad card above.",
    },
  },
};

export function metadataAPropos(lang: Lang): Metadata {
  return {
    title: TEXTES[lang].titre,
    description: TEXTES[lang].description,
    alternates: alternates(lang, "/a-propos"),
  };
}

export async function APropos({ lang }: { lang: Lang }) {
  const nomads = await getNomadsProfile();
  const t = TEXTES[lang];
  const c = CAPSULES[lang];
  return (
    <article className="flex flex-col">
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="bg-dots-fade absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center gap-5 pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
          <NodeLabel>{t.titre}</NodeLabel>
          <h1 className="text-[clamp(4.5rem,15vw,11rem)] font-medium leading-[0.85] tracking-[-0.025em]">
            Kostia.
          </h1>
          <p className="max-w-[52ch] text-balance text-base leading-snug text-[color:var(--color-muted)] sm:text-lg">
            {t.description}
          </p>
        </Container>
      </header>

      <Container className="flex flex-col gap-24 pb-8 sm:gap-32">
        {/* 01 · situation */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="flex flex-col gap-6 p-7 sm:p-10 lg:col-span-8">
            <NodeLabel>{t.situationEyebrow}</NodeLabel>
            <p className="max-w-[28ch] text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.015em]">
              {t.baseA} <Surligne>{t.ville}</Surligne>
              {t.situation}
            </p>
          </Card>

          <Card as="section" tone="ink" className="bg-dots-ink flex flex-col justify-between gap-8 p-7 sm:p-10 lg:col-span-4">
            <p className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              <span aria-hidden className="node-dot" />
              {t.heritage}
            </p>
            <p className="text-xl leading-snug sm:text-2xl">
              {t.heritageTexte}{" "}
              <em className="not-italic text-[color:var(--color-accent-strong)]">
                {t.heritagePassions}
              </em>
              .
            </p>
          </Card>
        </section>

        {/* 02 · en ce moment */}
        <section className="flex flex-col gap-10">
          <EnTete eyebrow={t.momentEyebrow} titre={t.momentTitre} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
            {PROJETS_PHARES.map((projet) => (
              <CarteProjetPhare key={projet.titre} {...projet} lang={lang} />
            ))}
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li>
              <Card as="article" className="flex h-full flex-col gap-4 p-7">
                <Tag className="self-start">{t.codeTag}</Tag>
                <h3 className="text-3xl font-medium leading-tight tracking-[-0.015em]">{t.codeTitre}</h3>
                <p className="leading-relaxed text-[color:var(--color-muted)]">{t.codeTexte}</p>
                <p className="mt-2 flex gap-3 rounded-[16px] bg-[color:var(--color-bg)] p-4 text-base italic leading-snug">
                  <span aria-hidden className="node-dot mt-2" />
                  {t.codeCitation}
                </p>
              </Card>
            </li>
            <li>
              <Card as="article" className="flex h-full flex-col gap-4 p-7">
                <Tag className="self-start">{t.photoTag}</Tag>
                <h3 className="text-3xl font-medium leading-tight tracking-[-0.015em]">{t.photoTitre}</h3>
                <p className="leading-relaxed text-[color:var(--color-muted)]">{t.photoTexte}</p>
              </Card>
            </li>
            <li>
              <Card as="article" className="flex h-full flex-col gap-4 p-7">
                <Tag className="self-start">{t.veloTag}</Tag>
                <h3 className="text-3xl font-medium leading-tight tracking-[-0.015em]">{t.veloTitre}</h3>
                <p className="leading-relaxed text-[color:var(--color-muted)]">{t.veloTexte}</p>
              </Card>
            </li>
            {nomads ? (
              <li>
                <a
                  href={nomads.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                 
                  className="bg-dots-ink group flex h-full flex-col gap-5 rounded-[24px] bg-[color:var(--color-ink)] p-7 text-[color:var(--color-ink-fg)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Tag tone="ink">{t.nomade}</Tag>
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      <ArrowUpRight size={18} strokeWidth={1.75} />
                    </span>
                  </div>
                  <h3 className="text-3xl font-medium leading-tight tracking-[-0.015em]">{t.mouvement}</h3>
                  <dl className="grid grid-cols-3 gap-2">
                    {[
                      { label: t.pays, valeur: String(nomads.stats.countries) },
                      { label: t.villes, valeur: String(nomads.stats.cities) },
                      { label: "km", valeur: formatNombre(lang, nomads.stats.distance_traveled_km) },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col gap-1 rounded-[16px] bg-[color:var(--color-ink-surface)] px-3 py-3"
                      >
                        <dt className="font-mono text-[10px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
                          {stat.label}
                        </dt>
                        <dd className="font-display text-xl font-medium tracking-[-0.015em] sm:text-2xl">
                          {stat.valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {nomads.lastTrip ? (
                    <p className="font-mono text-xs uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
                      {t.dernierArret}
                      {lang === "en" ? ": " : " : "}
                      <span className="text-[color:var(--color-ink-fg)]">
                        {nomads.lastTrip.place}, {nomads.lastTrip.country}
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-ink-muted)]">
                    {t.source}
                  </p>
                </a>
              </li>
            ) : null}
          </ul>
        </section>

        {/* 03 · obsessions */}
        <Panel as="section" dots className="grid grid-cols-1 gap-10 p-7 sm:p-12 lg:grid-cols-12 lg:p-16">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <p className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-[color:var(--color-ink-muted)]">
              <span aria-hidden className="node-dot" />
              {t.obsessionsEyebrow}
              <span aria-hidden className="node-dot" />
            </p>
            <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.015em]">
              {t.obsessionsTitre}
            </h2>
          </div>

          <ol className="flex flex-col lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            {[
              t.obsession1,
              t.obsession2,
              <>
                {t.obsession3Avant} <Surligne>{t.obsession3Accent}</Surligne> {t.obsession3Apres}
              </>,
            ].map((texte, i) => (
              <li
                key={i}
                className="flex gap-5 border-t border-[color:var(--color-ink-line)] py-6 first:border-t-0 first:pt-0 last:pb-0"
              >
                <span className="shrink-0 pt-2 font-mono text-xs text-[color:var(--color-accent-strong)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-2xl leading-tight tracking-[-0.01em] sm:text-3xl">{texte}</p>
              </li>
            ))}
          </ol>

          <blockquote className="max-w-[32ch] text-lg italic leading-snug text-[color:var(--color-ink-muted)] lg:col-span-5 lg:self-end">
            {t.antiEcole}
          </blockquote>
        </Panel>

        {/* 04 · capsules */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <EnTete eyebrow={t.capsulesEyebrow} titre={t.capsulesTitre} />
            <p className="max-w-[40ch] leading-relaxed text-[color:var(--color-muted)]">
              {t.capsulesTexte}
            </p>
          </div>

          <div className="columns-1 gap-3 sm:columns-2 lg:col-span-8">
            <Capsule index="A" icon={MapPin} title={c.villes.titre} items={c.villes.items} />
            <Capsule
              index="B"
              icon={Wrench}
              title={c.outils.titre}
              accent
              items={[
                { label: "Claude Code", note: "Claude 3.7 Sonnet · 2025" },
                { label: "Claude Code", note: "Claude Opus 4 · 2025" },
                { label: "Claude Code", note: "Claude Opus 5.5 · 2026" },
              ]}
              footer={c.outils.footer}
            />
            <Capsule index="C" icon={Flame} title={c.ratages.titre} items={c.ratages.items} />
            <Capsule index="D" icon={Users} title={c.rencontres.titre} items={c.rencontres.items} />
            <Capsule
              index="E"
              icon={House}
              title={c.pays.titre}
              items={c.pays.items}
              footer={c.pays.footer}
            />
          </div>
        </section>

        {/* clôture */}
        <section className="flex flex-col items-center gap-10 text-center">
          <NodeLabel>{t.cloture.replace(/^·\s*/, "")}</NodeLabel>
          <blockquote className="max-w-[22ch] text-balance text-[clamp(2rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.015em]">
            {t.obsessionDureAvant} <Surligne>{t.obsessionDureAccent}</Surligne> {t.obsessionDureApres}
          </blockquote>
          <Card className="flex max-w-[640px] flex-col items-center gap-4 p-7 sm:p-9">
            <p className="font-mono text-xs uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
              {t.regle}
            </p>
            <p className="text-xl leading-snug">
              <Surligne>No limit</Surligne>
              {t.regleAvant} <strong className="font-semibold">{t.travail}</strong>,{" "}
              <strong className="font-semibold">{t.creativite}</strong>,{" "}
              <strong className="font-semibold">{t.decouverte}</strong>,{" "}
              <strong className="font-semibold">{t.rencontre}</strong>
              {t.regleApres}
            </p>
          </Card>
        </section>
      </Container>
    </article>
  );
}

/** Surlignage rose arrondi, pour le mot qui compte dans une phrase. */
function Surligne({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[0.25em] bg-[color:var(--color-accent)] box-decoration-clone px-[0.18em] text-[color:var(--color-accent-fg)]">
      {children}
    </span>
  );
}

/** Étiquette + titre de section, aligné à gauche. */
function EnTete({ eyebrow, titre }: { eyebrow: string; titre: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <NodeLabel>{eyebrow}</NodeLabel>
      <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.015em]">
        {titre}
      </h2>
    </div>
  );
}

type CapsuleProps = {
  index: string;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
  items: Array<{ label: string; note?: string }>;
  footer?: string;
  accent?: boolean;
};

type ProjetPhare = {
  titre: string;
  badge: Record<Lang, string>;
  lien: string;
  libelleLien: Record<Lang, string>;
  description: Record<Lang, string>;
  nouveau?: boolean;
};

/** Ordre = ordre d'affichage : les nouveautés d'abord. */
const PROJETS_PHARES: ProjetPhare[] = [
  {
    titre: "Kostia.ai",
    badge: { fr: "tout nouveau", en: "brand new" },
    lien: "https://kostia.ai",
    libelleLien: { fr: "kostia.ai ↗", en: "kostia.ai ↗" },
    description: {
      fr: "Mon carnet de pensées, à écouter : mes posts et ma newsletter lus par ma voix clonée par IA, en français et en anglais, avec le texte surligné mot à mot.",
      en: "My notebook of thoughts, to listen to: my posts and newsletter read by my AI-cloned voice, in French and English, with the text highlighted word by word.",
    },
    nouveau: true,
  },
  {
    titre: "Europe Explained",
    badge: { fr: "tout nouveau", en: "brand new" },
    lien: "https://europeexplained.eu",
    libelleLien: { fr: "europeexplained.eu ↗", en: "europeexplained.eu ↗" },
    description: {
      fr: "Comprendre l'Europe sans parti pris : 50 pays, l'UE, les élections, l'équivalent d'un parti dans chaque pays, et une version pour les enfants. Chaque chiffre est daté et sourcé.",
      en: "Understanding Europe without taking sides: 50 countries, the EU, elections, a party's equivalent in each country, and a kids version. Every figure is dated and sourced.",
    },
    nouveau: true,
  },
  {
    titre: "Parcoursoup",
    badge: { fr: "tout nouveau", en: "brand new" },
    lien: "https://parcoursoup.fr",
    libelleLien: { fr: "parcoursoup.fr ↗", en: "parcoursoup.fr ↗" },
    description: {
      fr: "Pour chaque formation de Parcoursup, ce que l'IA fait déjà dans les métiers visés, si les employeurs recrutent encore et ce que deviennent les diplômés.",
      en: "For every course on Parcoursup, France's university admissions platform: what AI already does in the jobs it leads to, whether employers are still hiring, and what becomes of graduates.",
    },
    nouveau: true,
  },
  {
    titre: "MumExpat",
    badge: { fr: "tout nouveau", en: "brand new" },
    lien: "https://mumexpat.com",
    libelleLien: { fr: "mumexpat.com ↗", en: "mumexpat.com ↗" },
    description: {
      fr: "Le guide des mamans francophones qui s'installent à l'étranger avec leurs enfants : 39 villes, écoles, santé, démarches, et plus de 1 000 groupes Facebook.",
      en: "The guide for French-speaking mums moving abroad with their kids: 39 cities, schools, healthcare, paperwork, and over 1,000 Facebook groups.",
    },
    nouveau: true,
  },
  {
    titre: "MercatoFirst",
    badge: { fr: "mon phare", en: "my flagship" },
    lien: "https://mercatofirst.com",
    libelleLien: { fr: "mercatofirst.com ↗", en: "mercatofirst.com ↗" },
    description: {
      fr: "Un CRM pour les agents de joueurs de football. Carnet d'adresses augmenté, pipeline avec alertes sur les fins de contrat, prise de contact WhatsApp.",
      en: "A CRM for football agents. A supercharged address book, a pipeline with contract-expiry alerts, outreach over WhatsApp.",
    },
  },
  {
    titre: "BooKeeper",
    badge: { fr: "mon coup de tête", en: "my wild idea" },
    lien: "https://superkostia.github.io/bookeeper/",
    libelleLien: { fr: "avec Karim ↗", en: "with Karim ↗" },
    description: {
      fr: "Plateforme pour réserver un gardien de but à l'heure, pour les clubs et équipes amateurs qui cherchent un keeper, un match précis, une date, un niveau.",
      en: "A platform to book a goalkeeper by the hour, for amateur clubs and teams who need a keeper for one match, one date, one level.",
    },
  },
];

function CarteProjetPhare({
  titre,
  badge,
  lien,
  libelleLien,
  description,
  nouveau,
  lang,
}: ProjetPhare & { lang: Lang }) {
  return (
    <a
      href={lien}
      target="_blank"
      rel="noopener noreferrer"
     
      className="group flex h-full flex-col gap-6 rounded-[24px] bg-[color:var(--color-surface)] p-7 transition-colors hover:bg-[color:var(--color-surface-2)] sm:p-9"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tag tone={nouveau ? "accent" : "default"}>{badge[lang]}</Tag>
        <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-fg)]">
          {libelleLien[lang]}
        </span>
      </div>
      <h3 className="text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[0.95] tracking-[-0.02em]">
        {titre}
      </h3>
      <p className="max-w-xl leading-relaxed text-[color:var(--color-muted)]">{description[lang]}</p>
    </a>
  );
}

function Capsule({
  index,
  title,
  icon: Icon,
  items,
  footer,
  accent,
}: CapsuleProps) {
  return (
    <article
      className={cn(
        "mb-3 flex break-inside-avoid flex-col gap-5 rounded-[24px] p-6 sm:p-7",
        accent
          ? "bg-dots-ink bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)]"
          : "bg-[color:var(--color-surface)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full",
            accent
              ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
              : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]",
          )}
          aria-hidden
        >
          <Icon size={19} strokeWidth={1.75} />
        </span>
        <span
          className={cn(
            "font-mono text-xs uppercase",
            accent ? "text-[color:var(--color-ink-muted)]" : "text-[color:var(--color-muted)]",
          )}
        >
          {index}
        </span>
      </div>

      <h3 className="text-2xl font-medium leading-tight tracking-[-0.015em]">{title}</h3>

      <ol className="flex flex-col">
        {items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            className={cn(
              "flex items-baseline gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0",
              accent ? "border-[color:var(--color-ink-line)]" : "border-[color:var(--color-line)]",
            )}
          >
            <span
              className={cn(
                "shrink-0 font-mono text-[11px]",
                accent ? "text-[color:var(--color-accent-strong)]" : "text-[color:var(--color-muted)]",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-medium leading-tight">{item.label}</span>
              {item.note ? (
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.04em]",
                    accent ? "text-[color:var(--color-ink-muted)]" : "text-[color:var(--color-muted)]",
                  )}
                >
                  {item.note}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {footer ? (
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.04em]",
            accent ? "text-[color:var(--color-ink-muted)]" : "text-[color:var(--color-muted)]",
          )}
        >
          {footer}
        </p>
      ) : null}
    </article>
  );
}
