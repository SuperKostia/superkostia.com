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

- [ ] Header sticky (logo cliquable, 5 entrées max, `ThemeToggle`)
- [ ] Footer minimal (liens utiles + crédit DA)
- [ ] Menu mobile plein écran (overlay, typo énorme)
- [ ] Pipeline MDX : parsing, types frontmatter, composants MDX shared
- [ ] Page `/projets` (vide, layout en place)
- [ ] Page `/hobbies` (vide, layout en place)
- [ ] Page `/laboratoire` (vide, layout en place)
- [ ] Page `/ecrits` (vide, layout en place)
- [ ] Page `/a-propos` (vide, layout en place)
- [ ] Page `/contact` (vide, layout en place)
- [ ] Page `/colophon` (vide, layout en place)

## Phase 2 — Home expérientielle

- [ ] Grille 12 colonnes cassée, composition magazine (§5.1)
- [ ] Titres display animés, variations aléatoires au reload
- [ ] Marquee projets `featured: true` (pause au hover)
- [ ] Quatre portes d'entrée interactives (2×2 ou 4×1)
- [ ] Ticker stats Supabase en bas de page
- [ ] Easter egg : Konami code (tremblement 5s)
- [ ] Easter egg : 10 clics logo → révèle `/colophon`
- [ ] Curseur custom desktop

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
