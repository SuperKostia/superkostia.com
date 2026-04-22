# Changelog — superkostia.com

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Ce fichier est édité à la main à chaque commit qui change le périmètre fonctionnel ou visuel visible du projet. Les détails techniques fins restent dans `git log`.

Les versions suivent un schéma interne `0.PHASE.ITER` tant que le site n'est pas en ligne — pas de semver tant qu'il n'y a pas de consommateur tiers.

## [Unreleased]

Phase 3 presque complète. Reste : chunk 3b (filtres `/projets`) + capsules timeline de `/a-propos`.

### Style — Effet d'océan Hockney sous la carte `/voyages` + refactor `WaterField` (2026-04-22)
- Le composant `HeroSandField` (créé pour le hero home) est renommé en `WaterField` et déplacé en `components/ui/WaterField.tsx` — c'est un effet visuel générique réutilisable, plus "Hero" ni "Sand" dans le nom, ni dans `components/home/`.
- La classe CSS `.hero-fluid` devient `.water-field` ; tout le reste de la chaîne SVG (3 turbulences animées, blend `difference`, threshold matrix, érosion, soustraction, displacement final) est intacte au caractère près.
- 2e usage : embarqué dans `components/voyages/WorldMap.tsx` derrière le SVG monde (le conteneur passe en `relative isolate` pour contenir le `z-index: -1`). Visuellement → océans entre les continents montrent l'eau Hockney qui ondule, la carte garde son rendu d3-geo / topojson.
- Pays non-visités : leur `fill` passe de `transparent` à `var(--color-bg)` (cream en light, anthracite en dark). Sans ça, ils auraient disparu dans l'océan et la carte serait devenue illisible. Hiérarchie visuelle finale : océan cyan animé · pays non-visités neutres · pays visités en `--color-fg 85%` · villes en carrés jaunes accent.
- Décision `#009` mise à jour avec le nouveau nom de composant et la mention de la portée multi-pages.

### Style — Portes home : 5e carte `Photo` (2026-04-22)
- Ajout d'une 5e carte `Photo` dans `components/home/Portes.tsx`, position 2 (après Projets, avant Voyages — alignée sur l'ordre de la nav). Lien direct vers `/hobbies/photographie` (skip de l'index `/hobbies` qui n'a qu'un seul item peuplé).
- Grille passée à `lg:grid-cols-5` (5 cartes sur une ligne en desktop). Label raccourci à `Photo` pour tenir au même gabarit typo que les autres cartes (option C, cf. discussion).
- Renumérotation des cases : Voyages 03→04, Écrits 04→05, À propos 05→06.
- Teaser : "Tout à l'iPhone, en voyage. L'autre univers visuel du site." — assume la posture iPhone-only (pas d'argentique / Leica), cohérent avec la DA "brutaliste honnête".
- Motivation : sur mobile sans menu ouvert, la section photo n'était plus discoverable depuis la home. Maintenant elle est dans le scroll naturel.

### Contenu — nouveau projet `axiom-family-swap` (2026-04-22)
- Ajout du projet **Axiom Family Swap** dans `/projets` (mise en ligne avril 2026, 20+ familles, 15 pays, 4,7/5).
- `content/projets/axiom-family-swap.mdx` : programme d'échange linguistique et culturel entre familles (un enfant part 1-2 semaines à l'étranger + réciprocité = pas de tarif d'hébergement, plateforme 100 % gratuite). Cross-link vers `/projets/axiom-academic` (satellite du même écosystème).
- Screenshot capturé via `npm run screenshot:projets` → `public/images/projets/axiom-family-swap.jpg` (139 ko, hero "Offrez à vos enfants le monde comme école" bien cadré).

### Style — Hero piscine Hockney (2026-04-22)
- Nouveau composant `components/home/HeroSandField.tsx` : SVG inline rendu derrière le `DisplayTitle`. Reproduit l'aesthetic eau de piscine de "Portrait of an Artist" de David Hockney : fond bleu cobalt-cyan avec réseau de squiggles blancs en surface qui ondulent.
- Couleurs : 8 bleus échantillonnés sur le tableau de Hockney, répartis entre une **base verticale** (deep cobalt → pale aqua : `#0087C4` → `#0087C5` → `#009BD1` → `#63C1CC`) et un **glint radial top-left** (cobalts brillants en opacités décroissantes : `#00A7DF` 0.40 → `#00A8D8` 0.22 → `#00B0CF` 0.10 → `#009EDB` 0). L'asymétrie du glint donne le côté reluisant.
- Caustiques : chaîne SVG de 8 primitives — 2× `feTurbulence` animés (73s et 47s, périodes coprime, mélangés en `feBlend` mode `difference` pour produire un motif d'interférence non-périodique) → `feColorMatrix` qui pousse le contraste vers binaire → `feMorphology erode radius=3` puis `feComposite arithmetic` (binary - eroded) qui retourne les **contours** des blobs (= le réseau de squiggles épaisses) → 3e `feTurbulence` animé (19s) consommé par `feDisplacementMap scale=14` qui warpe localement les bords des squiggles → ils se tordent et boullonnent comme à travers la surface ondulante de l'eau. PPCM des 3 périodes ≈ 18h, l'œil ne perçoit pas la répétition.
- Profondeur : `box-shadow inset` cobalt 80px au sein de `.hero-sand` qui suggère les bords du bassin.
- Accessibilité : `useReducedMotion` côté client retire les `<animate>` SMIL pour les utilisateurs en `prefers-reduced-motion: reduce` → le réseau apparaît figé. `aria-hidden` sur le SVG (purement décoratif).
- Zéro dépendance ajoutée. Décision archivée en `#009`.

### Contenu — grand renommage SEO des 75 photos (2026-04-22)
- Toutes les photos sources (dans `.source-photos/<serie>/`) et leurs dest correspondantes (dans `public/images/photographie/<serie>/`) renommées d'UUIDs opaques (`44BEB6EF-...jpeg`) vers des slugs descriptifs FR (`astypalee-chora-kastro.jpeg`, `burj-khalifa-fontaines-nuit.jpeg`, `panagia-chozoviotissa-amorgos.jpeg`, etc.).
- Règle posée : **une URL publiée ne change plus** (Cool URIs). Le nommage se fait une seule fois au niveau source, filename = URL, append-only ensuite.
- Format : `<theme-slug>.jpg`, 20-45 chars, 3-5 tokens tirets, FR sans accents. Pas de date (EXIF + Schema.org font le job), pas de préfixe marque (déjà dans le domaine + watermark pixel).
- Locations identifiées pour la pertinence SEO : Astypalée, Amorgos, Patmos (Skala, Agriolivadi, Chora, monastère Saint-Jean, Psili Ammos), Livadi Geranou (Agios Georgios), Lucky Bay & Cape Le Grand (Australie), Sydney, Perth (Hot Bread), Dubai (Burj Khalifa, Burj Al Arab, Dhow), Doha (FANAR), Lisbonne (Cristo Rei, église TAP), Gizeh (Khéops), Seychelles, Casablanca, Tanger, Rajasthan, Batumi, Grand Popo (Bénin), Lomé (Togo), Amorgos épave du Olympia (Liveros Bay).
- Moment idéal : site lancé 2026-04-21, aucune indexation Google héritée à casser.
- Aucun fichier n'a changé physiquement (même contenu, même watermark, même manifest) — git détecte 100 % comme des renames (R), pas comme delete+add.

### Ajouté — /voyages (remplace /laboratoire, cf. #008)
- Nouvelle page `/voyages` : carte monde SVG brutaliste (pays visités remplis, villes en carrés jaunes dimensionnés au nombre de passages), stats géantes (22 pays, 33 villes, 156 404 km, 61 voyages), narration "X tours de Terre" (distance / équateur terrestre), trois top-lists avec barres brutalistes (pays les plus arpentés, villes de retour, étapes les plus longues), timeline inversée par année jusqu'à 1989, capsule "point de départ" (Paris, 20 juin 1989).
- `components/voyages/WorldMap.tsx` : composant server-only, projection `geoEqualEarth` (d3-geo) sur topojson `countries-110m` (world-atlas), 177 pays rendus comme paths, matching par ISO numeric via `lib/iso-countries.ts`. Zero JS côté client, tooltip natif via `<title>`.
- `lib/nomads.ts` étendu : agrégation countries (avec visitCount), frequent_visits, longest_stays, firstTrip, yearsSpan. Rétrocompat préservée pour `a-propos` et `Ticker`.
- Nav, Portes home, sitemap, metadata OG : `Laboratoire` remplacé par `Voyages` partout.

### Supprimé
- Page `/laboratoire` (5 mini-apps placeholder, aucune jamais implémentée). Les idées restent dans le parking lot du ROADMAP.

### Deps
- `d3-geo`, `topojson-client`, `world-atlas` + types associés (`@types/d3-geo`, `@types/topojson-client`, `@types/topojson-specification`, `@types/geojson`). Tous utilisés uniquement côté serveur au rendu, zéro impact sur le bundle client.

## [0.6.0] — 2026-04-21 — Mise en ligne

### Ajouté
- Projet Vercel `superkostia` créé sous l'org `superkostia`, auto-deploy branché sur `SuperKostia/superkostia.com`.
- 4 domaines attachés : canonical `superkostia.com`, `www.superkostia.com` (redirect 308), `superkostia.fr` (redirect 308), `www.superkostia.fr` (redirect 308).
- DNS Ionos : A `@ → 76.76.21.21` + CNAME `www → cname.vercel-dns.com.` sur les 2 domaines.
- SSL Let's Encrypt actif sur les 4 domaines (émission apex forcée via `POST /v4/now/certs`).
- Email alias `hey@superkostia.com` en mode forwarding Ionos → Gmail (réponse via Gmail, "Send mail as" SMTP non configuré — Ionos ne fournit pas de mailbox gratuite avec SMTP, voie Zoho envisageable plus tard).

### Notes
- **Le site est live** : https://superkostia.com
- Les labels "DNS Change Recommended" côté Vercel sont des suggestions d'optimisation mineures (ANAME/ALIAS plutôt que A pour l'apex), pas des erreurs. Les 4 domaines sont opérationnels et certifiés.

## [0.3.3] — 2026-04-21 — Screenshots projets + CTA + vrais projets

### Ajouté
- `scripts/screenshot-projets.mjs` + `npm run screenshot:projets` : lit les MDX de `content/projets/`, capture via Playwright + Chromium headless (viewport 1440×900) la home de chaque projet qui a un `links[0].url`. Sauve dans `public/images/projets/<slug>.jpg` en qualité 85. Skip si déjà présent, `--force` pour re-shoot.
- `components/projet/ProjetHero.tsx` : carte cliquable brutaliste (screenshot dans un cadre bordure 2 px + shadow-hard, légère rotation -0.5°), pied avec hostname mono + CTA accent "Voir le site ↗". Hover : lift + retour à 0° de rotation.
- `/projets/[slug]/page.tsx` : rend `<ProjetHero>` automatiquement si un screenshot existe ET qu'un `links[0].url` est défini. Fallback silencieux sinon.
- 4 premiers screenshots capturés : mercatofirst, bookeeper, guide-etudes-superieures, wedding-patmos.
- `content/projets/mercatofirst.mdx`, `bookeeper.mdx`, `guide-etudes-superieures.mdx` : 3 nouveaux projets réels avec vrais liens et descriptions tirées des sites live.
- `wedding-patmos.mdx` corrigé : vrai URL `https://wedding.lifeispatmos.com/`, mention Emma + été 2026.

### Corrigé
- Mix-up important : MercatoFirst (CRM agents foot) et BooKeeper (marketplace keepers) étaient inversés dans la première version de `/a-propos`. Les deux phares sont désormais côte à côte avec les bonnes descriptions et liens sortants. Sauvegardé en mémoire projet pour ne pas refaire l'erreur.

### Contenu
- Premier dépôt de 16 photos réelles dans `/photographie/{patmos,voyages,australie}` (3 autres dossiers vides prêts : grece, paysages, portraits). Compression auto : 2.97 Mb → 1.24 Mb.
- Nouveau dossier photo : `australie`.

### Deps
- `playwright` en devDep pour les screenshots (pas bundlé côté client, pas requis au build Vercel).

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
