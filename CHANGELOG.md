# Changelog — superkostia.com

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Ce fichier est édité à la main à chaque commit qui change le périmètre fonctionnel ou visuel visible du projet. Les détails techniques fins restent dans `git log`.

Les versions suivent un schéma interne `0.PHASE.ITER` tant que le site n'est pas en ligne — pas de semver tant qu'il n'y a pas de consommateur tiers.

## [Unreleased]

Phase 2 en cours — chunks 2b (marquee + ticker + easter eggs) et 2c (curseur custom) à venir.

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
