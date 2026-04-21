# Roadmap — superkostia.com

Source de vérité sur l'avancement du projet. Mise à jour à chaque commit significatif. Référence croisée avec [`CHANGELOG.md`](./CHANGELOG.md) (ce qui a été livré) et [`DECISIONS.md`](./DECISIONS.md) (pourquoi on a tranché comme ça).

Statuts : `[ ]` à faire · `[~]` en cours · `[x]` fait · `[-]` annulé / reporté.

---

## Phase 0 — Setup

- [x] Scaffolding Next.js 16 + App Router + TS strict + Tailwind 4 + ESLint 9 + Turbopack
- [x] MDX activé (`@next/mdx`, `pageExtensions` ts/tsx/md/mdx, `mdx-components.tsx`)
- [x] Arborescence CDC §4.2 (`components/`, `content/`, `lib/`, `styles/`, `public/`)
- [x] `.env.local.example` (Supabase + Resend), `.gitignore` qui commite les `*.example`
- [x] Repo GitHub public `SuperKostia/superkostia.com` + remote `origin`
- [x] Tokens de design brutalistes (CSS vars + Tailwind 4 `@theme`)
- [x] Fonts : Inter (corps) + Space Grotesk (display) via `next/font/google`
- [x] Dark mode fonctionnel (ThemeScript anti-FOUC + ThemeToggle persistant localStorage)
- [x] Primitives UI : Button, Card, Tag, Link
- [x] Home provisoire de preview des primitives
- [ ] Client Supabase stub (`lib/supabase.ts`) — reporté en Phase 4 quand on en a besoin

## Phase 1 — Squelette

- [x] Header sticky (logo cliquable, 5 entrées : Projets/Hobbies/Laboratoire/Écrits/À propos — cf. #005, `ThemeToggle`)
- [x] Footer minimal (Contact, Colophon, lien GitHub)
- [x] Menu mobile plein écran (overlay, typo énorme, Esc + body scroll lock)
- [x] Pipeline MDX : lecture `content/*` via gray-matter, types frontmatter, helpers `getProjets` / `getHobbies` / `getEcrits`
- [x] Composants MDX partagés (`h1`, `h2`, `h3`, `p`, `a`, `ul`, `ol`, `blockquote`, `code`, `pre`, `hr`)
- [x] `PageShell` : header de page commun (eyebrow + titre display + intro)
- [x] Page `/projets` (lit et affiche le frontmatter des MDX)
- [x] Page `/hobbies` (lit et affiche le frontmatter des MDX)
- [x] Page `/laboratoire` (liste statique des 5 expérimentations CDC §6)
- [x] Page `/ecrits` (lit et affiche le frontmatter des MDX, tri date descendante)
- [x] Page `/a-propos` (stub)
- [x] Page `/contact` (stub)
- [x] Page `/colophon` (stub)
- [x] Contenu de démo : `axiom-hub.mdx`, `photographie.mdx`, `bienvenue.mdx`

## Phase 2 — Home expérientielle

### Chunk 2a — statique brutaliste
- [x] Composition en deux blocs (8/4) sur desktop, stack sur mobile
- [x] `DisplayTitle` : titre display énorme (taille viewport), variation aléatoire au mount, accent inline rotaté
- [x] `Intro` : pavé manuscrit / monospace, 1re personne, 3 lignes courtes
- [x] `Portes` : 4 cartes d'entrée (Projets · Laboratoire · Écrits · À propos) avec hover jaune acide plein et flèche qui bouge

### Chunk 2b — vivant
- [ ] Marquee projets `featured: true` (pause au hover)
- [ ] Ticker bas de page (mock d'abord, Supabase en Phase 4)
- [ ] Easter egg : Konami code (tremblement 5s)
- [ ] Easter egg : 10 clics logo → révèle `/colophon`

### Chunk 2c — curseur
- [ ] Curseur custom desktop contextuel ("lire", "ouvrir", "écouter"), pointer fin uniquement, respect `prefers-reduced-motion`

## Phase 3 — Contenu

- [ ] `/projets` : grille + filtres (type/tag/année/statut) + recherche client-side
- [ ] `/projets/[slug]` : rendu MDX + composants `<Stack>`, `<Links>`, `<Gallery>`, `<Quote>`, `<CodeBlock>`, `<VideoEmbed>`
- [ ] `/hobbies` index + `/hobbies/[slug]` avec DA par hobby (§7.3)
- [ ] **`/hobbies/photographie` — univers visuel totalement à part** (cf. décision `#002`)
- [ ] `/ecrits` + article type
- [ ] `/a-propos`

## Phase 4 — Laboratoire

- [ ] Template `/laboratoire/[slug]`
- [ ] `mur-des-visiteurs` (Supabase + honeypot)
- [ ] `quel-kostia-est-tu` (matching déterministe client-side)
- [ ] `generateur-de-noms-absurdes` (random client-side)
- [ ] `radio-kostia` (post-lancement)
- [ ] `galerie-des-polices` (post-lancement)

## Phase 5 — Polish

- [ ] OG images dynamiques (`ImageResponse`)
- [ ] View Transitions
- [ ] Audit Lighthouse (95+ partout)
- [ ] Sitemap, RSS, robots
- [ ] Analytics (Vercel + Plausible éventuel)
- [ ] Colophon final
- [ ] Sentry

## Phase 6 — Lancement

- [ ] DNS pointant vers Vercel sur `superkostia.com`
- [ ] Monitoring actif
- [ ] Annonce

---

## Parking lot (idées non-planifiées)

- Version EN (à trancher — cf. CDC §13).
- `one photo per day` ou série du moment mise en avant sur la home (extension possible de `/hobbies/photographie`).
