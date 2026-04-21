# Changelog — superkostia.com

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Ce fichier est édité à la main à chaque commit qui change le périmètre fonctionnel ou visuel visible du projet. Les détails techniques fins restent dans `git log`.

Les versions suivent un schéma interne `0.PHASE.ITER` tant que le site n'est pas en ligne — pas de semver tant qu'il n'y a pas de consommateur tiers.

## [Unreleased]

Phase 3 presque complète. Reste : chunk 3b (filtres `/projets`) + capsules timeline de `/a-propos` + photos réelles pour `/hobbies/photographie`.

## [0.3.2] — 2026-04-21 — Phase 3d : /a-propos étoffée

### Ajouté
- `app/a-propos/page.tsx` remplacée (plus de stub) avec 4 sections :
  - **01 · situation** : hero "Kostia.", phrase bio avec "Athènes" en accent rotaté, carte héritage sur le grand-père maternel (photo + vélo).
  - **02 · en ce moment** : carte phare accent jaune pour MercatoFirst (l'app des gardiens de but amateurs) + 3 cartes secondaires : "Je code." (10-12 h/jour, avec pullquote *"aujourd'hui le code est gratuit et parfait ; à l'époque c'était ultra cher et très imparfait"*), "Tout à l'iPhone." (pas de reflex, spontanéité), "Cyclisme." (passion moins sportive désormais).
  - **03 · obsessions** : section sur fond inversé (bg-fg / text-bg), 3 lignes numérotées géantes (IA, mutation sociale, bien-être enfants) + pullquote *"Je ne suis pas très école. Je suis anti-école, en fait."*
  - **04 · capsules** : stub avec invite à compléter la timeline non-linéaire ensemble.

### Notes
- Contenu inline TSX pour ce premier jet. Si les listes "en ce moment" / "obsessions" commencent à tourner régulièrement, on bascule sur du MDX dédié (CDC §7.5 hint).
- Switch EN non implémenté — reporté à Phase 5 polish sans décision formelle.

## [0.3.1] — 2026-04-21 — Phase 3c : univers photographie à part (rupture DA)

### Ajouté
- `app/hobbies/photographie/layout.tsx` : wrapper avec classe `.photo-surface` qui définit des tokens CSS propres (`--photo-bg`, `--photo-fg`, `--photo-fg-muted`, `--photo-border`), zéro jaune acide, font EB Garamond italique pour les titres de série. Dark mode supporté avec palette dédiée.
- `app/hobbies/photographie/page.tsx` : route statique qui override le catch-all `/hobbies/[slug]` (décision #002). Rend le `<PhotoGallery>` client.
- `lib/photos.ts` : scan de `public/images/photographie/<serie>/`, lecture EXIF automatique via `exifr` (focale, vitesse, ouverture, ISO, appareil). Supporte un `_series.json` optionnel par dossier (titre, date, description, order, alt + tags par photo).
- `components/photographie/PhotoGallery.tsx` (Client Component) : hero plein écran avec photo tirée au hasard à chaque visite, planche-contact par série (grille 2/3/4 cols, images en grayscale par défaut qui reviennent en couleur au hover), lightbox plein écran avec EXIF + tags en pied + zones cliquables gauche/droite invisibles.
- Navigation lightbox : flèches clavier ← / →, Esc pour fermer, **préchargement des voisins** au changement de photo pour une nav instantanée, `unoptimized` sur l'image courante (on a déjà compressé à 2400 px en amont).
- `components/photographie/ExifLine.tsx` : fiche technique en mono discret, `50 mm · f/2 · 1/250 · ISO 400 · Leica M10`.
- Empty state stylisé quand aucune photo présente (font italique, message mono).
- 5 dossiers de séries pré-créés pour Kostia : `patmos`, `grece`, `portraits`, `paysages`, `voyages`.
- Script `npm run compress:photos` : `scripts/compress-photos.mjs` utilise `sharp` + `mozjpeg` pour redimensionner à 2400 px (côté le plus long), qualité 82, préserve l'EXIF, opère in-place, skippe les gains < 5 %.
- Dep runtime : `exifr` (build-only, scanner EXIF). Voir DECISIONS #006.

### Décisions
- DECISIONS #006 : `exifr` accepté pour automatiser la fiche technique EXIF.
- DECISIONS #007 : photos dans `public/` pour commencer (bundlé par Vercel, servi par son CDN), migration vers Supabase Storage prévue dès que le repo approche 100 MB.

### Changé
- `app/hobbies/[slug]/page.tsx` : `generateStaticParams` exclut le slug `photographie` pour éviter un conflit de prerender avec la route statique dédiée.

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
