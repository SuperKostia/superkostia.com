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
      <header className="border-b-2 border-[color:var(--color-border)] px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {t.titre}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-[9vw]">
          Kostia.
        </h1>
      </header>

      <section className="grid grid-cols-1 border-b-2 border-[color:var(--color-border)] lg:grid-cols-12">
        <div className="flex flex-col gap-4 px-6 py-12 sm:px-10 lg:col-span-8 lg:px-12 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t.situationEyebrow}
          </p>
          <p className="max-w-2xl font-[family-name:var(--font-space-grotesk)] text-3xl leading-tight sm:text-4xl">
            {t.baseA}{" "}
            <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
              {t.ville}
            </span>
            {t.situation}
          </p>
        </div>

        <aside className="border-t-2 border-[color:var(--color-border)] p-6 sm:p-8 lg:col-span-4 lg:border-l-2 lg:border-t-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t.heritage}
          </p>
          <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-xl leading-snug">
            {t.heritageTexte}{" "}
            <em className="not-italic underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4">
              {t.heritagePassions}
            </em>
            .
          </p>
        </aside>
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t.momentEyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            {t.momentTitre}
          </h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PROJETS_PHARES.map((projet) => (
            <CarteProjetPhare key={projet.titre} {...projet} lang={lang} />
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>{t.codeTag}</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                {t.codeTitre}
              </h3>
              <p className="text-sm leading-relaxed">{t.codeTexte}</p>
              <p className="mt-2 border-l-4 border-[color:var(--color-accent)] pl-4 font-[family-name:var(--font-space-grotesk)] text-base italic leading-snug text-[color:var(--color-muted)]">
                {t.codeCitation}
              </p>
            </article>
          </li>
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>{t.photoTag}</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                {t.photoTitre}
              </h3>
              <p className="text-sm leading-relaxed">{t.photoTexte}</p>
            </article>
          </li>
          <li>
            <article className="flex h-full flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <Tag>{t.veloTag}</Tag>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                {t.veloTitre}
              </h3>
              <p className="text-sm leading-relaxed">{t.veloTexte}</p>
            </article>
          </li>
          {nomads ? (
            <li>
              <a
                href={nomads.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ouvrir"
                className="group flex h-full flex-col gap-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] p-6 text-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center border-2 border-[color:var(--color-bg)] bg-transparent px-2 py-0.5 font-mono text-xs uppercase tracking-wider">
                    {t.nomade}
                  </span>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={2.5}
                    aria-hidden
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black uppercase leading-tight tracking-tight">
                  {t.mouvement}
                </h3>
                <dl className="mt-1 grid grid-cols-3 gap-2 border-y-2 border-[color:var(--color-bg)] py-3">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      {t.pays}
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {nomads.stats.countries}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      {t.villes}
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {nomads.stats.cities}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.15em] opacity-60">
                      km
                    </dt>
                    <dd className="font-[family-name:var(--font-space-grotesk)] text-2xl font-black tracking-tight">
                      {formatNombre(lang, nomads.stats.distance_traveled_km)}
                    </dd>
                  </div>
                </dl>
                {nomads.lastTrip ? (
                  <p className="font-mono text-xs uppercase tracking-wider opacity-70">
                    {t.dernierArret}
                    {lang === "en" ? ": " : " : "}
                    {nomads.lastTrip.place},{" "}
                    {nomads.lastTrip.country}
                  </p>
                ) : null}
                <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.15em] opacity-60">
                  {t.source}
                </p>
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="border-t-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] px-6 py-12 text-[color:var(--color-bg)] sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-12 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
            {t.obsessionsEyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            {t.obsessionsTitre}
          </h2>
        </div>

        <ol className="flex max-w-4xl flex-col gap-6">
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              01
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              {t.obsession1}
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              02
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              {t.obsession2}
            </p>
          </li>
          <li className="flex gap-4">
            <span className="shrink-0 pt-2 font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              03
            </span>
            <p className="font-[family-name:var(--font-space-grotesk)] text-2xl leading-tight sm:text-3xl">
              {t.obsession3Avant}{" "}
              <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
                {t.obsession3Accent}
              </span>{" "}
              {t.obsession3Apres}
            </p>
          </li>
        </ol>

        <blockquote className="mt-12 max-w-2xl border-l-4 border-[color:var(--color-accent)] pl-6 font-[family-name:var(--font-space-grotesk)] text-xl italic leading-snug">
          {t.antiEcole}
        </blockquote>
      </section>

      <section className="border-t-2 border-[color:var(--color-border)] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t.capsulesEyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            {t.capsulesTitre}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-muted)]">
            {t.capsulesTexte}
          </p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          <Capsule
            index="A"
            icon={MapPin}
            title={c.villes.titre}
            items={c.villes.items}
          />

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

          <Capsule
            index="C"
            icon={Flame}
            title={c.ratages.titre}
            items={c.ratages.items}
          />

          <Capsule
            index="D"
            icon={Users}
            title={c.rencontres.titre}
            items={c.rencontres.items}
          />

          <Capsule
            index="E"
            icon={House}
            title={c.pays.titre}
            items={c.pays.items}
            footer={c.pays.footer}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t-2 border-[color:var(--color-border)] pt-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {t.cloture}
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <blockquote className="border-l-4 border-[color:var(--color-accent)] pl-6 font-[family-name:var(--font-space-grotesk)] text-2xl leading-snug sm:text-3xl">
              {t.obsessionDureAvant}{" "}
              <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
                {t.obsessionDureAccent}
              </span>{" "}
              {t.obsessionDureApres}
            </blockquote>
            <div className="flex flex-col gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6 shadow-[var(--shadow-hard-sm)]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                {t.regle}
              </p>
              <p className="font-[family-name:var(--font-space-grotesk)] text-xl leading-snug">
                <span className="inline-block bg-[color:var(--color-accent)] px-1.5 text-[color:var(--color-accent-fg)] -rotate-1">
                  No limit
                </span>
                {t.regleAvant}{" "}
                <strong className="font-black">{t.travail}</strong>,{" "}
                <strong className="font-black">{t.creativite}</strong>,{" "}
                <strong className="font-black">{t.decouverte}</strong>,{" "}
                <strong className="font-black">{t.rencontre}</strong>
                {t.regleApres}
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
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
      data-cursor="ouvrir"
      className={`group block border-2 border-[color:var(--color-border)] p-6 shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-8 ${
        nouveau
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : "bg-[color:var(--color-bg)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-fg)]"
      }`}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <span className="inline-flex items-center border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg)]">
          {badge[lang]}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">
          {libelleLien[lang]}
        </span>
      </div>
      <h3 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
        {titre}
      </h3>
      <p className="mt-4 max-w-xl text-base leading-relaxed">{description[lang]}</p>
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
        "mb-4 flex break-inside-avoid flex-col gap-4 border-2 border-[color:var(--color-border)] p-5 shadow-[var(--shadow-hard-sm)] sm:p-6",
        accent
          ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
          : "bg-[color:var(--color-bg)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center border-2 border-current",
            accent
              ? "bg-[color:var(--color-accent-fg)] text-[color:var(--color-accent)]"
              : "bg-[color:var(--color-fg)] text-[color:var(--color-bg)]",
          )}
          aria-hidden
        >
          <Icon size={20} strokeWidth={2.25} />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
          {index}
        </span>
      </div>

      <header>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl">
          {title}
        </h3>
      </header>

      <ol className="flex flex-col">
        {items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            className="flex items-baseline gap-3 border-t border-[color:var(--color-border)]/30 py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold leading-tight">
                {item.label}
              </span>
              {item.note ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] opacity-60">
                  {item.note}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {footer ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] opacity-50">
          {footer}
        </p>
      ) : null}
    </article>
  );
}
