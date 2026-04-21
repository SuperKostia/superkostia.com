# Changelog — superkostia.com

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Ce fichier est édité à la main à chaque commit qui change le périmètre fonctionnel ou visuel visible du projet. Les détails techniques fins restent dans `git log`.

Les versions suivent un schéma interne `0.PHASE.ITER` tant que le site n'est pas en ligne — pas de semver tant qu'il n'y a pas de consommateur tiers.

## [Unreleased]

Phase 3 en cours — chunks 3b (filtres `/projets`), 3c (rupture DA `/hobbies/photographie`), 3d (`/a-propos` étoffée) à venir.

## [0.3.0] — 2026-04-21 — Phase 3a : rendu MDX + detail pages

### Ajouté
- `next-mdx-remote@^6` (dep justifiée : compile MDX au build côté Server Component, évite le double build via `@next/mdx`).
- `components/mdx/MDXContent.tsx` : renderer RSC qui câble les shared + custom components sur `<MDXRemote source=...>`.
- Composants MDX custom : `<Stack items=[...] />`, `<Links items=[...] />`, `<Quote attribution=... >...</Quote>`, `<Gallery images=[...] />`, `<VideoEmbed src=... title=... />`. Tous avec guards défensifs (`items = []` + short-circuit).
- `/projets/[slug]` : page détail avec eyebrow (type + statut + année + tags), titre display, summary, MDX body. `generateStaticParams` pré-rend tous les projets au build.
- `/hobbies/[slug]` : page détail, supporte `accent` dans le frontmatter pour override localement le token `--color-accent`.
- `/ecrits/[slug]` : page article avec date + temps de lecture + MDX body.
- Index `/projets`, `/hobbies`, `/ecrits` : cartes/lignes rendues cliquables vers leur detail page, avec `data-cursor="ouvrir"` ou `data-cursor="lire"` pour le label du curseur custom.

### Changé
- `axiom-hub.mdx` et `bienvenue.mdx` enrichis pour démontrer `<Stack>`, `<Links>`, `<Quote>`.
- `Marquee` : `<a href="/projets">` remplacé par `NextLink href={/projets/${slug}}` — chaque tuile pointe maintenant vers le bon projet.

### Notes techniques
- La compilation MDX échoue silencieusement sur certaines formes JSX multi-lignes avec objets. Forcer du single-line (`<Links items={[{...}]} />`) règle le problème. Les guards `items = []` évitent un crash de build en cas de syntaxe MDX foireuse.
- 17 pages statiques pré-rendues au build : home + 7 stubs + 4 projets + 1 hobby + 1 écrit + _not-found.

## [0.2.2] — 2026-04-21 — Phase 2c : curseur custom desktop

### Ajouté
- `CustomCursor` (Client Component) : petit rond 12 px avec `mix-blend-mode: difference` qui suit la souris via `requestAnimationFrame` (transforme directement le DOM, zéro re-render sur mousemove). Au hover d'un `<a>` / `<button>` / `[data-cursor]`, morphe en pill jaune acide avec label contextuel (`ouvrir` lien externe, `lire` lien interne, `cliquer` bouton, override via `data-cursor="..."`).
- Masqué automatiquement sur `@media (pointer: coarse)` (tactile), désactive les transitions sur `prefers-reduced-motion`.
- Curseur natif masqué via `body.has-custom-cursor * { cursor: none }` uniquement quand `pointer: fine` (pas de masquage sur mobile).
- Montage au top du `<body>` dans le root layout.

### Notes
- Le label utilise `e.target.closest([data-cursor], a, button, [role='button'])` donc l'override `data-cursor="lire plus"` fonctionne partout, y compris dans du MDX futur.

## [0.2.1] — 2026-04-21 — Phase 2b : home vivante

### Ajouté
- `Marquee` (Server Component) : bandeau horizontal infini des projets `featured: true`, CSS pur, pause au hover, respect `prefers-reduced-motion`.
- `Ticker` (Server Component) + `AthensClock` (Client Component) : bandeau bas de home avec 4 pills — heure Athènes (Intl + `useSyncExternalStore`, update toutes les 30 s), dernier projet ajouté (lu au build), placeholders `—` pour visiteurs et dernier commentaire (branchement Supabase en Phase 4).
- `KonamiListener` : écoute ↑↑↓↓←→←→BA, déclenche une classe `konami-shake` sur `body` pendant 5 s (tremblement léger du body + descendants, coupé par `prefers-reduced-motion`).
- `Logo` (Client Component) : compteur de clics, révèle un petit bouton `→ colophon` à côté du logo après 10 clics (cf. CDC §5.2).
- Contenu de démo : 3 projets `featured: true` supplémentaires (Axiom Academic, Dictée Géante de Dubaï, Wedding Patmos) pour nourrir la marquee.

### Changé
- Home composée avec : Hero (DisplayTitle + Intro) → Marquee → Portes → Ticker.
- `styles/globals.css` : animations `marquee-scroll`, `konami-shake`, `konami-shake-soft`, `fade-in` + variantes `.marquee__track--slow`.
- `Header` : le `NextLink` logo devient le nouveau composant `Logo`.
- Root layout : `KonamiListener` monté au top du `<body>`.

## [0.2.0] — 2026-04-21 — Phase 2a : home statique brutaliste

### Ajouté
- `DisplayTitle` : h1 display en `8-12vw`, tire une variation au hasard parmi 5 au mount côté client ("Kostia fait trop de choses", "a trop d'onglets ouverts", "parle à des IA toute la journée", "n'arrive pas à choisir", "monte cinq boîtes à la fois"), mot-clé en accent jaune acide rotaté.
- `Intro` : pavé secondaire monospace / 1re personne, ton direct.
- `Portes` : 4 cartes d'entrée (Projets / Laboratoire / Écrits / À propos) avec numéros `02-05`, hover qui bascule la carte en jaune acide plein et fait glisser la flèche `ArrowUpRight`.
- Nouvelle home : grille 8/4 sur desktop (title + intro), stack sur mobile, portes en 1/2/4 cols selon breakpoint.

### Changé
- `app/page.tsx` n'utilise plus `PageShell` (la home ne veut pas du même header de page que les index).

## [0.1.0] — 2026-04-21 — Phase 1 : squelette

### Ajouté
- Header sticky : logo cliquable, nav desktop `Projets · Hobbies · Laboratoire · Écrits · À propos`, `ThemeToggle`, `MobileMenu`.
- `MobileMenu` : overlay plein écran, typo énorme, fermeture au clic d'un lien, Esc, `body.overflow: hidden` pendant l'ouverture.
- `Footer` : `Contact`, `Colophon`, lien GitHub, crédit DA.
- Pipeline MDX : `lib/mdx.ts` (lecture `content/{projets,hobbies,ecrits}` avec `gray-matter`, helpers `getProjets` / `getHobbies` / `getEcrits` + variantes `BySlug`) et `lib/types.ts` (frontmatter typé).
- Composants MDX partagés (`components/mdx/MDXComponents.tsx`) branchés sur `mdx-components.tsx`.
- `PageShell` : header de page réutilisable (eyebrow + display title + intro).
- Pages créées : `/projets`, `/hobbies`, `/laboratoire`, `/ecrits`, `/a-propos`, `/contact`, `/colophon`.
- Contenu de démo : `axiom-hub.mdx`, `photographie.mdx`, `bienvenue.mdx` (1 par catégorie pour prouver le pipeline).
- Dépendance `server-only` (marqueur anti-bundling client pour `lib/mdx.ts`).

### Changé
- Home provisoire : passe par le nouveau `PageShell`, `ThemeToggle` vit désormais dans le header global.
- `CAHIER-DES-CHARGES.md` : pas touché dans cette release — le décalage header nav (Hobbies ajouté, Contact déplacé) est couvert par la décision `#005`.

## [0.0.2] — 2026-04-21

### Ajouté
- Tokens de design brutalistes (CSS vars + Tailwind 4 `@theme`) : `--color-bg`, `--color-fg`, `--color-accent` (jaune acide `#E4FF3A`), `--shadow-hard`.
- Fonts : Inter (corps) + Space Grotesk (display) via `next/font/google`.
- Dark mode fonctionnel avec `ThemeScript` (anti-FOUC avant hydratation) et `ThemeToggle` (persistance localStorage, `useSyncExternalStore`).
- Primitives UI dans `components/ui/` : `Button` (3 variants × 3 tailles), `Card`, `Tag`, `Link`.
- `lib/utils.ts` : helper `cn` sans dépendance externe.
- Home provisoire pour prévisualiser les primitives + toggle dark.
- Focus épais accent, respect `prefers-reduced-motion` (§8.3).

### Documentation
- Docs de suivi créés : `ROADMAP.md`, `CHANGELOG.md`, `DECISIONS.md`.
- CDC §7.3 `/hobbies/photographie` amendé : univers visuel totalement à part (décision `#002`).

## [0.0.1] — 2026-04-21

### Ajouté
- Scaffolding Next.js 16.2.4 + App Router + TS strict + Tailwind 4 + ESLint 9 + Turbopack.
- Support MDX (`@next/mdx`, `pageExtensions: ts/tsx/md/mdx`, `mdx-components.tsx`).
- Arborescence CDC §4.2 : `components/{ui,layout,home,lab,mdx}`, `content/{projets,hobbies,ecrits}`, `lib/`, `styles/`, `public/{fonts,images,ogs}`.
- `globals.css` déplacé de `app/` vers `styles/`.
- `<html lang="fr">` + metadata projet `superkostia`.
- `.env.local.example` avec les clés Supabase et Resend.
- `.gitignore` ajusté pour commiter les `*.example`.
- Repo GitHub public `SuperKostia/superkostia.com` + remote `origin`.
