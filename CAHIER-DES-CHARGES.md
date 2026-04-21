# superkostia.com — Cahier des charges

**Version** : 1.0
**Auteur** : Constantin (Kostia)
**Destinataire** : Claude Code (agent de génération)
**Date** : 21 avril 2026

---

## 1. Vision & intention

`superkostia.com` est la **vitrine personnelle de Kostia** : un espace qui réunit projets professionnels, hobbies, expérimentations et réflexions. Ce n'est pas un portfolio classique — c'est un **terrain de jeu public** qui doit refléter un univers créatif, curieux, profondément transverse.

**Trois mots-clés directeurs** :
1. **Vivant** — le site respire, il évolue, il ne ressemble pas à un CV figé.
2. **Interactif** — le visiteur n'est pas passif : il joue, il explore, il découvre.
3. **Dense sans être chargé** — beaucoup de contenu, beaucoup de sujets, mais une navigation qui rend la densité lisible.

**Ce qu'il ne faut surtout pas faire** :
- Un portfolio template "hero + sections + footer".
- Un site "corporate" lisse.
- Une home qui essaie de tout dire en une seule page scroll.
- Des animations gratuites qui ralentissent sans servir.

---

## 2. Direction artistique : brutaliste / créatif / expérimental

### 2.1 Principes esthétiques

- **Typographie comme élément graphique principal**. Mix assumé de polices : une grotesque très neutre (Inter, Helvetica Now, ou système) pour le corps + une display expressive pour les titres (Space Grotesk, PP Neue Montreal, JetBrains Mono, ou similaire). Tailles extrêmes (très grand, très petit), jamais "moyen mou".
- **Grilles cassées**. Alignements volontairement déséquilibrés par endroits. Pas de centrage systématique. Utiliser CSS Grid pour des compositions asymétriques.
- **Couleurs** : palette restreinte et contrastée. Base blanc cassé + noir profond + **une seule couleur d'accent saturée** (à choisir : jaune acide `#E4FF3A`, orange `#FF5F1F`, ou cyan `#00F0FF`). L'accent sert à pointer, jamais à décorer.
- **Bordures épaisses, ombres portées dures** (pas de blur). Esthétique "neo-brutalist" : `border: 2px solid black; box-shadow: 6px 6px 0 black;`
- **Curseur custom** sur les éléments interactifs.
- **Imperfections assumées** : grain, léger bruit, textures, éléments qui débordent, rotations légères (-2° à +2°).

### 2.2 Références visuelles à citer à Claude Code

- Sites brutalistes de référence : Gary Sheng, Bruno Simon (mais version moins 3D), Rauno Freiberg, Studio Oeuf, Cyberpunk 2077 UI (pour l'énergie, pas le contenu).
- Pour l'interactivité ludique : Bruno Simon portfolio, Josh Comeau's blog.

### 2.3 Dark mode

Obligatoire. Le dark mode **n'est pas une inversion** du light — c'est une DA à part entière (fond `#0A0A0A`, texte `#EDEDED`, accent qui vibre plus). Toggle persistant en localStorage.

---

## 3. Stack technique — recommandation argumentée

Le choix dépend de ce que le site doit faire. Voici le raisonnement :

### 3.1 Contraintes identifiées

- **Contenu** : mix de pages statiques (projets, hobbies), de sections interactives (mini-apps, expérimentations), et potentiellement de contenu semi-dynamique (commentaires, stats en direct).
- **SEO** : le site doit être indexable (rendu serveur ou statique).
- **Itération rapide** : Kostia ajoutera souvent des projets, des pages, des expérimentations → le système de contenu doit être simple à étendre.
- **Zéro coût d'usage** : aucune API payante. Tout doit fonctionner sur les plans gratuits.

### 3.2 Stack recommandée : **Next.js 15 (App Router) + Tailwind CSS 4 + TypeScript + MDX + Vercel**

**Pourquoi Next.js plutôt qu'Astro ou Vite** :
- App Router + Server Components = performance statique + possibilité de serverless (Supabase, webhooks) dans le même repo.
- MDX natif pour écrire des articles / descriptions de projet comme des fichiers markdown avec composants React embarqués (parfait pour une vitrine évolutive).
- Écosystème mature pour animations (Framer Motion, GSAP), 3D (React Three Fiber si besoin), formulaires.
- Déploiement Vercel ultra simple, preview branches natives.

**Pourquoi pas Astro** : excellent pour du contenu pur, mais les îles interactives deviennent fastidieuses dès qu'on empile beaucoup d'expérimentations React avec état partagé.

**Pourquoi pas Vite seul** : pas de SSR natif, SEO plus difficile, pas d'API routes.

### 3.2bis Backend léger : uniquement du statique + Supabase

**Décision de principe : aucun appel à une API LLM payante.** Le site ne doit rien coûter en usage.

Les seules API routes Next.js du projet seront :
- `POST /api/livre-or` — écriture d'un message sur le mur des visiteurs (Supabase + honeypot anti-spam).
- `POST /api/contact` — envoi du formulaire de contact (Resend plan gratuit : 100 mails/jour).

Tout le reste est statique (SSG) ou client-side. Pas de chatbot, pas de générateur IA, pas de clé API à protéger.

### 3.3 Backend / données

**Recommandation : Vercel + Supabase.**

- **Vercel** : hébergement, serverless functions (API routes Next.js), edge functions, preview deploys.
- **Supabase** : déjà maîtrisé (Axiom Hub, wedding site), parfait pour :
  - Livre d'or / commentaires publics.
  - Compteur de visites, stats custom.
  - Éventuel espace privé (notes, drafts).
  - Storage pour images/vidéos lourdes.

**Secrets à gérer via `.env.local` + Vercel Environment Variables** : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (plan gratuit).

### 3.4 Stack secondaire

| Besoin | Choix |
|---|---|
| Styling | Tailwind CSS 4 (variables CSS natives) |
| Animations | Framer Motion (UI) + GSAP (cas complexes) |
| 3D (si besoin ponctuel) | React Three Fiber + Drei |
| Icônes | Lucide React |
| Fonts | next/font (local) pour les display, système pour le corps |
| Analytics | Vercel Analytics + éventuellement Plausible (RGPD-friendly) |
| Monitoring erreurs | Sentry (plan gratuit) |
| Formulaires | Server Actions Next.js (pas besoin de service tiers) |
| Content | MDX dans `/content` + frontmatter (gray-matter) |

---

## 4. Architecture & structure du site

### 4.1 Arborescence des pages

```
/                          → Home (hub expérientiel, voir §5)
/projets                   → Index de tous les projets (pro + perso)
/projets/[slug]            → Page détail d'un projet (MDX)
/hobbies                   → Index des hobbies / centres d'intérêt
/hobbies/[slug]            → Page détail d'un hobby
/laboratoire               → Page des expérimentations interactives (voir §6)
/laboratoire/[slug]        → Expérimentation individuelle
/ecrits                    → Blog / notes / essais (MDX)
/ecrits/[slug]             → Article
/a-propos                  → Page "à propos" non-conventionnelle
/contact                   → Page contact + formulaire
/colophon                  → Page meta : stack, remerciements, changelog
/rss.xml                   → Flux RSS des écrits
/sitemap.xml               → Sitemap auto
```

### 4.2 Organisation des dossiers

```
superkostia/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Home
│   ├── projets/
│   ├── hobbies/
│   ├── laboratoire/
│   ├── ecrits/
│   ├── a-propos/
│   ├── contact/
│   ├── colophon/
│   └── api/
│       ├── livre-or/              # POST commentaires
│       └── contact/               # POST formulaire de contact
├── components/
│   ├── ui/                        # Primitives (Button, Card, Tag...)
│   ├── layout/                    # Header, Footer, Nav, CursorCustom
│   ├── home/                      # Composants spécifiques à la home
│   ├── lab/                       # Composants des expérimentations
│   └── mdx/                       # Composants utilisables dans MDX
├── content/
│   ├── projets/                   # 1 fichier .mdx par projet
│   ├── hobbies/                   # 1 fichier .mdx par hobby
│   └── ecrits/                    # 1 fichier .mdx par article
├── lib/
│   ├── supabase.ts
│   ├── mdx.ts                     # Parsing content/
│   └── utils.ts
├── public/
│   ├── fonts/
│   ├── images/
│   └── ogs/                       # OG images générées
├── styles/
│   └── globals.css
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.3 Schéma du frontmatter MDX

Chaque fichier dans `content/projets/*.mdx` doit respecter :

```yaml
---
title: "Axiom Hub"
slug: "axiom-hub"
type: "pro"                    # "pro" | "perso" | "experimental"
status: "en-cours"             # "en-cours" | "publie" | "archive" | "abandonne"
year: 2026
tags: ["saas", "supabase", "crm", "ia"]
summary: "Plateforme interne d'Axiom Academic."
cover: "/images/axiom-hub.jpg"
accent: "#E4FF3A"              # override l'accent par défaut sur cette page
stack: ["Next.js", "Supabase", "Claude API"]
links:
  - label: "Site"
    url: "https://..."
  - label: "GitHub"
    url: "https://..."
featured: true                 # apparaît sur la home
---
```

Même logique pour `hobbies/` et `ecrits/`.

---

## 5. La home — le cœur du concept

La home n'est **pas un scroll linéaire**. C'est un **hub interactif** qui donne envie d'explorer.

### 5.1 Composition (desktop, ≥1024px)

Grille CSS 12 colonnes, hauteur 100vh minimum, composition "magazine" cassée :

- **Bloc principal (7 colonnes)** : grand titre typographique animé — *"Kostia fait trop de choses."* (ou variations qui tournent aléatoirement au reload : "Kostia a trop d'onglets ouverts.", "Kostia parle à des IA.", "Kostia n'arrive pas à choisir."). Police display, taille ~8-10vw.
- **Bloc secondaire (5 colonnes)** : petit pavé manuscrit/tapé court qui présente le site en 3-4 phrases, ton direct, première personne.
- **Bandeau projets featured (12 colonnes, scroll horizontal)** : marquee infini avec les projets `featured: true`. Pause au survol. Clic → page projet.
- **Quatre portes d'entrée cliquables** (grille 2x2 ou 4x1) : Projets / Laboratoire / Écrits / À propos. Chaque porte est une carte brutaliste avec un micro-preview animé au hover.
- **Ticker bas de page** : ligne de texte qui défile avec stats en direct tirées de Supabase — nb de visiteurs aujourd'hui, dernier projet ajouté, dernier commentaire laissé, heure à Athènes (localisation de Kostia).

### 5.2 Easter eggs et interactivité

- **Konami code** (↑↑↓↓←→←→BA) → déclenche un mode "trop de choses" où tous les éléments de la page se mettent à trembler légèrement pendant 5 secondes.
- **Logo cliquable n fois** : après 10 clics sur le nom "superkostia" dans le header, révèle un bouton caché qui mène à `/colophon`.
- **Curseur custom** : petit rond qui devient un texte contextuel au survol ("lire", "ouvrir", "écouter", "jouer").

### 5.3 Mobile (<768px)

La grille casse en stack vertical, mais on **garde l'ADN brutaliste** : titres énormes, bordures épaisses, scroll horizontal pour les projets featured conservé. Pas de "version mobile diminuée".

---

## 6. Le laboratoire — expérimentations interactives (sans IA)

Section dédiée aux expérimentations. Chaque item est une **mini-app** vivant dans `/laboratoire/[slug]`. Toutes les expérimentations retenues fonctionnent **sans API payante** (logique côté client ou Supabase pur).

### 6.1 `mur-des-visiteurs`
Livre d'or public. Les visiteurs peuvent laisser un mot (140 char max), épinglé sur un mur typographique avec rotations aléatoires façon post-it. Modération simple via table Supabase avec flag `approved`. Anti-spam basique : honeypot + rate limit par IP stocké en Supabase.

### 6.2 `radio-kostia`
Lecteur audio custom avec playlist curatée (embeds Spotify gratuits). Interface minimaliste, visualiseur audio en canvas si fichiers locaux servis via Supabase Storage. Zéro coût API.

### 6.3 `quel-kostia-est-tu`
Quiz de 5 questions qui matche le visiteur avec un des projets ou hobbies de Kostia. **Matching déterministe côté client** : chaque réponse pondère un vecteur, à la fin on prend le projet au score le plus proche. Pas d'IA, juste de la logique pure. Résultat partageable (image OG générée).

### 6.4 `generateur-de-noms-absurdes`
Version déterministe du générateur de naming : trois listes de mots (préfixes, racines, suffixes) tirées au sort côté client pour produire des noms de marques fictives. Rigolo, rapide, zéro euro. L'utilisateur peut "verrouiller" un segment et régénérer les autres.

### 6.5 `galerie-des-polices`
Une page qui présente typographiquement les polices que Kostia aime, avec pangrammes personnalisés, poids variables manipulables par l'utilisateur via des sliders. Croise bien le hobby branding.

### 6.6 Structure commune

Chaque expérimentation a :
- Sa propre page dans `/laboratoire/[slug]`
- Une entrée sur l'index `/laboratoire` avec preview + tag de statut (`live`, `wip`, `broken`, `archived`).
- Un fichier de métadonnées (même schéma que projets).

L'index du laboratoire doit clairement communiquer que **ces trucs peuvent casser** — c'est assumé, c'est le principe.

---

## 7. Pages secondaires

### 7.1 `/projets`

- Layout : grille masonry ou grille stricte avec cartes de tailles variables.
- Filtres par : type (pro/perso/experimental), tag, année, statut.
- Recherche instantanée (client-side, Fuse.js ou implémentation custom).
- Chaque carte : titre, année, 1 tag principal, bordure brutaliste, hover révèle le summary.

### 7.2 `/projets/[slug]`

- Rendu MDX avec composants custom : `<Stack>`, `<Links>`, `<Gallery>`, `<Quote>`, `<CodeBlock>`, `<VideoEmbed>`.
- Header : titre énorme, meta (année, statut, tags), bouton retour.
- Contenu principal : 65ch max pour la lisibilité, mais des éléments peuvent déborder (images full-bleed, citations décalées).
- Footer projet : navigation "projet précédent / suivant", suggestion de projets liés (par tags partagés).

### 7.3 `/hobbies` et `/hobbies/[slug]`

Même logique structurelle que projets mais avec une DA volontairement plus débridée : **chaque hobby a sa propre couleur d'accent et sa propre micro-identité visuelle**. C'est l'endroit où la DA brutaliste peut respirer différemment sur chaque page.

**Les quatre hobbies fondateurs** :

#### `/hobbies/entrepreneuriat`
- **Angle** : pas un CV des boîtes montées, mais une réflexion sur la démarche. Qu'est-ce que ça veut dire monter des projets en série. Leçons apprises, erreurs assumées.
- **Interactif** : une timeline horizontale scrollable des projets entrepreneuriaux (ratés compris — c'est le principe).
- **Contenu** : essais courts sous forme de micro-articles MDX, citations, idées en cours.

#### `/hobbies/photographie`
- **DA — décalage total assumé** : Kostia est photographe. Cette section ne doit **pas ressembler au reste du site**. On sort du brutaliste jaune acide. On entre dans un univers visuel à part : sobriété extrême, fond neutre (blanc cassé très doux ou noir profond selon le mode), typographie discrète voire effacée, chrome UI quasi invisible pour que l'image occupe tout l'espace mental du visiteur. L'unité avec le reste du site est minimale — juste le header/footer globaux. À l'intérieur, c'est un autre monde. Cf. décision [`#002`](./DECISIONS.md) — cette rupture est **explicite** et non-négociable.
- **Angle** : galerie. Zéro texte marketing. Les images parlent.
- **Interactif** : layout masonry ou type "contact sheet" style planche-contact argentique. Lightbox au clic (pas de modal lourde — juste agrandissement plein écran avec flèches clavier). Metadata EXIF affichable en option (focale, vitesse, ouverture, lieu) pour le côté "fiche technique".
- **Technique** : images servies via Supabase Storage + `next/image`, AVIF/WebP auto. Tags par série/thème/lieu.
- **Possible extension** : un "one photo per day" ou une série du moment en mise en avant sur la home.

#### `/hobbies/branding`
- **Angle** : l'obsession pour la création de marques. Études de cas des identités visuelles conçues (Axiom Academic, Axiom Hub, éventuels side projects), décortiquées.
- **Interactif** : pour chaque marque présentée, un composant qui montre **logo / palette / typo / application** dans une grille brutaliste. Bouton "voir les variantes" qui montre les explorations avant la version finale.
- **Croise avec le laboratoire** : le `generateur-de-noms-absurdes` (section 6.4) et la `galerie-des-polices` (6.5) renvoient naturellement vers ce hobby.

#### `/hobbies/psychologie-adlerienne`
- **Angle** : le plus personnel des quatre. Pourquoi Adler. Ce que ça change dans la façon de penser les relations, l'entrepreneuriat, l'équipe. Références aux auteurs clés (Adler évidemment, mais aussi Kishimi & Koga pour "Le courage de ne pas être aimé" si c'est pertinent).
- **Traitement** : plus éditorial, plus sobre que les autres hobbies. Typographie généreuse, interlignage confortable, lecture longue assumée. Accent couleur plus feutré (pas fluo).
- **Interactif** : une section "concepts" avec des cartes qui se retournent (front = terme adlérien, back = définition + exemple vécu). Parfait pour la grille brutaliste cartonnée.

**Note DA** : ces quatre univers ne doivent pas ressembler au même template repeint. Chacun peut casser les règles à sa manière — photographie très visuelle et silencieuse, branding très graphique et systémique, entrepreneuriat très textuel et sec, adlérien très littéraire. L'unité vient du header/footer globaux et de la typographie de base.

### 7.4 `/ecrits`

Blog. Liste inverse chronologique. Tags. Temps de lecture affiché. RSS.

### 7.5 `/a-propos`

**Pas un CV.** Structure suggérée :
- Bio longue, ton personnel, première personne, en français (avec switch EN si souhaité).
- Section "ce que je fais en ce moment" (à mettre à jour régulièrement, un fichier MDX dédié).
- Section "ce qui m'obsède" (liste vivante de préoccupations du moment).
- Timeline non-linéaire : pas "2020 → 2026" mais des capsules thématiques.
- Pas de photo de CV. Éventuellement une illustration ou une photo contextuelle.

### 7.6 `/contact`

- Formulaire minimal : nom + email + message.
- Server Action Next.js → envoi par email (Resend ou équivalent) + stockage Supabase.
- Liens directs : email, LinkedIn, GitHub, Twitter/X, Bluesky.

### 7.7 `/colophon`

Page "meta" qui assume la transparence :
- Stack utilisée (générée automatiquement depuis `package.json` si possible).
- Remerciements.
- Changelog du site (lien vers le dépôt GitHub public ou fichier markdown).
- Stats en direct (via Supabase) : nb de pages, dernière build, etc.

---

## 8. Comportements globaux

### 8.1 Navigation

- Header sticky discret : logo (superkostia) + 5 entrées max (Projets, Laboratoire, Écrits, À propos, Contact) + toggle dark mode.
- Menu mobile : overlay plein écran, typographie énorme, une entrée par ligne.
- **Aucune** page n'affiche de breadcrumbs — on assume que la nav est suffisante.

### 8.2 Transitions

- Page transitions via View Transitions API (supportée nativement par Next 15) : fade + léger translate, rien de plus.
- Hover sur liens : soulignement qui s'étire de gauche à droite.
- Pas de "smooth scroll" global — c'est chiant pour l'utilisateur et ça n'apporte rien.

### 8.3 Accessibilité

- Contraste AAA sur le texte principal, AA minimum partout.
- Focus visible épais (bordure de 3px accent).
- `prefers-reduced-motion` respecté : toutes les animations non-essentielles sont désactivées.
- `alt` obligatoire sur toutes les images.
- Navigation clavier complète.
- Pas d'interaction uniquement au hover.

### 8.4 Performance

- Lighthouse 95+ sur tous les axes (perf, a11y, SEO, best practices).
- LCP < 2s. CLS < 0.1.
- Images via `next/image` systématiquement, formats AVIF/WebP, lazy loading.
- Fonts en `font-display: swap` avec fallback système.
- Bundle JS initial < 150kb (hors images).
- ISR (Incremental Static Regeneration) pour les pages de contenu.

### 8.5 SEO

- Metadata API Next 15 : `title`, `description`, `openGraph`, `twitter` sur chaque page.
- OG images générées dynamiquement via `ImageResponse` (typographique, cohérente avec la DA).
- Sitemap + robots.txt auto.
- Données structurées JSON-LD (`Person` sur la home/a-propos, `Article` sur les écrits, `CreativeWork` sur les projets).

---

## 9. Contenu — base de départ

À fournir à Claude Code sous forme de fichiers MDX dans `content/` dès le MVP :

**À préparer par Kostia avant génération** :
- 5 projets pro minimum (Axiom Academic, Axiom Hub, Dictée Géante de Dubaï, Wedding Patmos, et un cinquième).
- 3 projets perso / expérimentaux.
- 3 hobbies.
- 1 article d'inauguration pour `/ecrits`.
- Bio pour `/a-propos`.
- Liste des expérimentations laboratoire à prioriser (MVP : `chat-avec-kostia` + `mur-des-visiteurs`).

---

## 10. Phasage de développement

### Phase 0 — Setup (jour 1)
- Init Next.js + Tailwind + TS + MDX.
- Configuration Vercel + Supabase.
- Système de design : variables CSS, fonts, composants primitifs (Button, Card, Tag, Link).
- Dark mode fonctionnel.

### Phase 1 — Squelette (jours 2-3)
- Layout global : Header, Footer, navigation mobile.
- Pipeline MDX : parsing, types, composants MDX.
- Pages vides : `/`, `/projets`, `/hobbies`, `/laboratoire`, `/ecrits`, `/a-propos`, `/contact`, `/colophon`.

### Phase 2 — Home expérientielle (jours 4-5)
- Composition grille cassée.
- Titres animés, variations aléatoires.
- Marquee projets featured.
- Portes d'entrée interactives.
- Ticker bas de page (stats Supabase).
- Easter eggs (Konami, 10 clics logo).
- Curseur custom desktop.

### Phase 3 — Contenu (jours 6-7)
- Pages `/projets`, `/projets/[slug]` + filtres/recherche.
- Pages `/hobbies` équivalentes.
- Page `/ecrits` + article type.
- Page `/a-propos`.

### Phase 4 — Laboratoire (jours 8-9)
- Template de page lab.
- `mur-des-visiteurs` (Supabase).
- `quel-kostia-est-tu` (matching déterministe client-side).
- `generateur-de-noms-absurdes` (listes + random client-side).
- Les deux autres (`radio-kostia`, `galerie-des-polices`) peuvent venir en post-lancement.

### Phase 5 — Polish (jours 11-12)
- OG images dynamiques.
- View Transitions.
- Audit Lighthouse, corrections a11y.
- Sitemap, RSS, robots.
- Analytics.
- Colophon.

### Phase 6 — Lancement
- Mise en ligne sur superkostia.com.
- Monitoring Sentry + Vercel Analytics.
- Annonce.

---

## 11. Conventions de code

- **TypeScript strict** : `strict: true`, pas de `any` implicite.
- **ESLint + Prettier** : config Next.js par défaut + règles `tailwindcss/classnames-order`.
- **Naming** : composants en PascalCase, fichiers utilitaires en kebab-case, hooks en camelCase préfixés `use`.
- **Commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, `content:`, `style:`).
- **Branches** : `main` (prod), `dev` (préprod), feature branches `feat/nom-court`.

---

## 12. Contraintes à transmettre explicitement à Claude Code

Quand tu lanceras Claude Code avec ce document, précise-lui systématiquement :

1. **Respecter la DA brutaliste** — ne jamais glisser vers un "design propre par défaut". Si en doute, pousser le curseur vers plus d'audace.
2. **Pas de dépendances superflues**. Chaque `npm install` doit être justifié.
3. **Composants réutilisables** dès qu'un pattern apparaît 2 fois.
4. **Mobile first, mais sans sacrifice** de l'ADN desktop.
5. **Français par défaut** sur l'interface (labels, placeholders, messages d'erreur). Contenu MDX en français aussi, sauf les articles explicitement en anglais.
6. **Aucune API payante**. Pas de clé Anthropic, OpenAI, ou équivalent. Si une idée de feature nécessite une API payante, la proposer en alternative déterministe ou la signaler pour décision explicite.

---

## 13. Questions à trancher avant de lancer Claude Code

À valider par Kostia :
- [ ] Couleur d'accent principale : jaune acide / orange / cyan / autre ?
- [ ] Font display préférée : Space Grotesk / PP Neue Montreal / JetBrains Mono / autre ?
- [ ] Volume de contenu de départ (nb de projets/hobbies/écrits prêts au lancement).
- [ ] Nom de domaine DNS : géré où actuellement ? À pointer vers Vercel.
- [ ] Version EN nécessaire dès le MVP ou plus tard ?

---

**Fin du cahier des charges.**
