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
- [x] Marquee projets `featured: true` (pause au hover, CSS pur, respect `prefers-reduced-motion`)
- [x] Ticker bas de home (Athènes live via `Intl` + `useSyncExternalStore`, dernier projet lu au build, 2 placeholders pour Phase 4)
- [x] Easter egg : Konami code (tremblement body + tous ses descendants, 5s, respect `prefers-reduced-motion`)
- [x] Easter egg : 10 clics logo → révèle bouton `→ colophon` à côté du logo dans le header

### Chunk 2c — curseur
- [x] Curseur custom desktop : petit rond `mix-blend-mode: difference` par défaut, morphing en pill jaune avec label contextuel au hover (`ouvrir` sur liens externes, `lire` sur liens internes, `cliquer` sur boutons, override via `data-cursor="..."`). Pointer fin uniquement (`@media (pointer: coarse)` → masqué), respect `prefers-reduced-motion`, `requestAnimationFrame` pour lisser le suivi.

## Phase 3 — Contenu

### Chunk 3a — rendu MDX + detail pages
- [x] `next-mdx-remote/rsc` branché (compile MDX au build côté server)
- [x] Composants MDX custom : `<Stack>`, `<Links>`, `<Quote>`, `<Gallery>`, `<VideoEmbed>` (`<CodeBlock>` déjà couvert via `pre`/`code` shared components)
- [x] `components/mdx/MDXContent.tsx` : renderer RSC qui câble shared + custom
- [x] `/projets/[slug]` : header meta (type/statut/année/tags) + titre énorme + MDX body, `generateStaticParams`
- [x] `/hobbies/[slug]` : header + MDX body, `accent` frontmatter override des tokens CSS
- [x] `/ecrits/[slug]` : date + temps de lecture + MDX body
- [x] Cartes des index `/projets`, `/hobbies`, `/ecrits` linkées vers leurs detail pages, avec `data-cursor` sur les links

### Chunk 3b — filtres + recherche
- [ ] `/projets` : grille + filtres (type/tag/année/statut) + recherche client-side

### Chunk 3c — rupture DA photo (décision #002) — code livré, photos à venir
- [x] `app/hobbies/photographie/layout.tsx` : tokens CSS override (`--photo-bg`, `--photo-fg`, plus de jaune acide) + font EB Garamond italique
- [x] `app/hobbies/photographie/page.tsx` : hero aléatoire plein écran + planche-contact par série + lightbox plein écran avec EXIF + tags
- [x] `lib/photos.ts` : scan `public/images/photographie/<serie>/`, lecture EXIF auto via `exifr`, support `_series.json` (titre, date, description, order, alt + tags par photo)
- [x] Lightbox : flèches clavier, Esc, préchargement des voisins pour navigation instantanée, image unoptimized (on a déjà compressé à 2400 px)
- [x] 5 dossiers de séries pré-créés : patmos, grece, portraits, paysages, voyages
- [x] Script `npm run compress:photos` (sharp + mozjpeg, max 2400 px, qualité 82, préserve EXIF)
- [x] Empty state stylisé quand aucune photo présente
- [ ] Kostia dépose ses photos, les compresse, commit

### Chunk 3d — /a-propos étoffée
- [x] Hero "Kostia.", eyebrow typographique
- [x] Section 01 · situation : bio courte 1re personne (Athènes, Axiom Academic, créatif, curiosité, intense, tout ou rien) + carte héritage (photo + vélo du grand-père maternel)
- [x] Section 02 · en ce moment : carte phare accent MercatoFirst + 3 cartes "Je code.", "Tout à l'iPhone.", "Cyclisme."
- [x] Section 03 · obsessions : 3 grosses lignes (IA, mutation sociale, bien-être des enfants) sur fond inversé + pullquote "anti-école"
- [x] Section 04 · timeline : stub avec invite à compléter ensemble
- [ ] Remplir les capsules thématiques quand Kostia m'envoie les angles
- [ ] Switch EN : reporté à Phase 5 polish (décision tacite, pas de demande urgente)

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
