# Changelog — superkostia.com

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Ce fichier est édité à la main à chaque commit qui change le périmètre fonctionnel ou visuel visible du projet. Les détails techniques fins restent dans `git log`.

Les versions suivent un schéma interne `0.PHASE.ITER` tant que le site n'est pas en ligne — pas de semver tant qu'il n'y a pas de consommateur tiers.

## [Unreleased]

Phase 3 presque complète. Reste : chunk 3b (filtres `/projets`) + capsules timeline de `/a-propos`.

### Feat — Coupe du Monde : alertes but de la France en direct (2026-06-22) — hors repo (serveur)
- Pendant les matchs de la France **et la France seulement**, le serveur sonde le score **en direct** (API ESPN) et envoie à **tout le flux** une alerte WhatsApp à chaque but français, via le même bridge que les récaps. **Escalade** : à chaque but, +1 « O » et +1 « A » dans GO…A…L, +1 ⚽/🔥/🐓, 🇫🇷 tous les 2 buts, 🎉 dès le 3e, 🥳 dès le 4e. Accroches écrites 1→6 (avec accents : « TRIPLÉ ! LA FRANCE DÉROULE ! ») + filet générique au-delà.
- Mécanisme (`notify.py`) : `france_alerts()` / `compose_france_goal()`, nouvelle **fenêtre live** (coup d'envoi −2 min → +2h45, couvre prolongations + tab), détection `is_france`, anti-doublon + seed dans `france_goals.json` (1re observation d'un match = seed du score courant **sans envoyer** → zéro backfill ; puis envoi des buts manquants à chaque hausse, gère les buts multiples entre deux sondages). Timer du notifier passé de **5 min à 1 min** (reste no-op hors fenêtre). Le récap de fin de match est inchangé.
- **100 % serveur (hors dépôt)** : aucun fichier du repo modifié. Architecture cf. `DECISIONS.md #010`.

### Feat — Coupe du Monde : équipe supportée à l'inscription + autocomplétion maison (2026-06-22)
- Le formulaire de cooptation demande aussi **l'équipe supportée** (champ optionnel). Transmise à la notif Telegram (`⚽ Équipe : …`), stockée (champ `team`) dans `members.json`, et affichée en **drapeau à côté de chaque pote** dans l'encart « Le flux » (map nom FR → drapeau côté dashboard).
- Le `<datalist>` natif (rendu navigateur, non stylable, dropdown mal positionné à droite du champ) est remplacé par un **combobox maison** : liste positionnée sous le champ à la charte, drapeau par équipe, recherche insensible aux accents, navigation clavier (↑/↓/Entrée/Échap) + ARIA. Free text toujours possible.
- Hors repo (serveur approbateur) : `parse_team`, stockage du champ `team`, liste publique enrichie, petite perso du welcome (« Tu supportes … »).

### Fix — Coupe du Monde : robustesse approbation 1 tap + normalisation des numéros (2026-06-15)
- `lib/phone.ts` : retire le **« 0 » de courtoisie** (`+44 (0) 7485 216933` donnait `4407485216933`, un numéro invalide → welcome qui plantait) et un 0 collé après l'indicatif, **avec exception pour les pays qui le conservent en E.164** (Italie `+39 06…`). Couvert par tests manuels (7 cas).
- Hors repo (serveur approbateur) : feedback Telegram **instantané** + clavier retiré au tap (évite le « moulinage » qui poussait à re-taper → welcomes en double), welcome envoyé **seulement si l'ajout est réel**, et un welcome qui plante n'affiche plus un spinner bloqué mais un statut explicite (« numéro injoignable, corrige par réponse »). Seed du nouveau membre pour ne pas re-spammer les matchs déjà passés.

### Feat — Home : bande « match en cours / prochain » sous la card Coupe du Monde (2026-06-14)
- `components/home/WorldCupNextMatch.tsx` (client) interroge l'API ESPN (CORS ouvert, 0 €, refresh 60 s) et affiche sous la card promo le **match en cours** (score + horloge, point rouge pulsé) ou, à défaut, le **prochain match** (date), cliquable vers le dashboard live. `lib/teams.ts` partage les noms FR + drapeaux. La bande disparaît s'il n'y a plus aucun match à venir.

### Contenu — Dashboard Coupe du Monde : bouton retour, favicon, image de partage + compteur « + N potes » (2026-06-14)
- Bouton **« ← Retour sur superkostia »** (`target="_top"` pour sortir de l'iframe quand le dashboard est embarqué), **favicon ⚽** (SVG data-uri), et **Open Graph + Twitter card** avec une image `og.png` 1200×630 à la DA du site (cream / lime / marque SK, générée via `rsvg-convert`) — le partage du lien affiche enfin un aperçu visuel.
- Compteur vivant **« + N autres potes »** (membres au-delà des 4 prénoms figés) sur la CTA du flux, le pied de chaque carte match et le sous-titre « Déjà notifiés », calculé sur `members.json`.
- Bouton **« ⤢ Plein écran »** visible posé sur le frame de l'iframe (page projet), plus lien renforcé sous le preview.
- Résumé du projet réécrit pour refléter l'évolution (parti pour Dim, devenu un flux de potes qui grandit).

### Feat — Dashboard Choose France : vue Avancement + fix scroll sidebar (2026-06-18)
- `public/projets/choose-france-2026/dashboard.html` enrichi des données d'avancement de chaque projet (phase, permis obtenu, phase design, travaux démarrés, source) et du secteur T&T, injectés dans le `const DATA` embarqué.
- Nouvelle 3e vue « Avancement » dans le toggle : les cercles sont recolorés par phase (Annoncé → Études/Design → Permis obtenu → Travaux démarrés → Opérationnel) via une rampe séquentielle, avec une légende dédiée et compteurs. La vue « Projets » garde la couleur par famille de secteur.
- Popup enrichie : ligne « Secteur T&T » + bloc d'avancement (pastille de phase, 3 badges Permis/Design/Travaux colorés Oui/Non/n.c., note sourcée avec lien). La liste latérale gagne un repère de phase par projet.
- Fix : la liste « Projets » de la sidebar s'écrasait à ~1 ligne sur écrans courts (impossible de scroller). `#panel` devient scrollable et `.plist` reçoit `flex:1 1 0; min-height:260px`, garantissant une zone de liste utilisable et scrollable à toutes les hauteurs.

### Feat — Approbation 1 tap des demandes du flux + normalisation des numéros (2026-06-14)
- Le formulaire de cooptation passe en mode « 1 tap » : la notif Telegram porte des boutons « ✅ Ajouter au flux » / « ✖️ Ignorer ». Un service approbateur (long-polling) sur le serveur ajoute la personne + envoie le welcome automatiquement au tap, ou via une réponse Telegram pour corriger le numéro et ajouter une note.
- Normalisation des numéros saisis sans indicatif (`lib/phone.ts`), via le pays de connexion (ex : `0627941615` + MA → `212627941615`). La notif affiche brut + normalisé + drapeau.
- Membres dynamiques : liste publique `public/projets/coupe-du-monde-dim/members.json` que le dashboard « Le flux » lit en live et que la page projet lit pour le badge « N potes ». `lib/telegram.ts` : `sendTelegram` accepte des boutons inline.

### Contenu — Zander (7e membre, via le formulaire) rejoint le flux (2026-06-14)
- Zander Mickael ajouté (1re demande passée par le formulaire de cooptation du dashboard) : serveur + encart « Le flux » (7 membres) + badge « 7 potes ». Prose toujours figée à 4.

### Contenu — Yas (6e membre) rejoint le flux (2026-06-14)
- Yas (pote marocaine d'Emma, Tanger) ajoutée : serveur + encart « Le flux » (6 membres) + badge « 6 potes ». Prose toujours figée sur « Dim, Karim, PAF et Valentin ».

### Contenu — Anastasia rejoint + découplage prose / encart « Le flux » (2026-06-14)
- 5e membre (Anastasia). **Découplage** : l'encart « Le flux » (tableau `MEMBERS`) liste tous les membres avec leur date et grandit à chaque ajout ; les textes en prose (sous-titre, cartes, pied de page, invitation) utilisent un libellé **figé** `RECIPIENTS_LABEL = "Dim, Karim, PAF et Valentin"` qui ne grandit pas à l'infini. Badge page projet passé à « 5 potes ».

### Feat — Dashboard coupe-du-monde : titre « de Kostia » + encart « le flux » avec dates (2026-06-14)
- Titre du dashboard passé à « Les récaps de Kostia » (l'expéditeur). Ajout d'un encart stylé « Le flux » qui liste chaque membre avec sa **date d'ajout** (chips brutalistes), plus une invitation « Rejoins Dim, Karim, PAF et Valentin 👇 ». Données centralisées dans un tableau `MEMBERS` (nom + date) d'où `RECIPIENTS_LABEL` est dérivé : ajouter un membre = une ligne.

### Contenu — Titre du projet : « de Dim » → « de Kostia » (2026-06-14)
- Le titre de `coupe-du-monde-dim` devient « Les récaps WhatsApp de **Kostia** » (c'est l'expéditeur, pas un destinataire). Le slug/URL `coupe-du-monde-dim` reste inchangé.

### Contenu — Valentin rejoint le flux Coupe du Monde (2026-06-14)
- 4e destinataire ajouté. Dashboard : liste mise à jour partout (« Dim, Karim, PAF et Valentin », via la constante `RECIPIENTS_LABEL` + spans `.rcpt`). Page projet : badge « Déjà 4 potes dans le flux ». Teaser de la home (`WorldCupPromo`) passé en « Mes potes reçoivent... » (évolutif, plus besoin de le toucher à chaque ajout).

### Contenu — Page projet coupe-du-monde : sous-titre contexte + badge social (2026-06-14)
- Sous le titre, ajout d'un **sous-titre prominent** donnant le contexte Coupe du Monde 2026, et d'un **badge** « Déjà 3 potes dans le flux ». Deux champs frontmatter optionnels `tagline` et `flux` (`lib/types.ts`), rendus conditionnellement dans l'en-tête de `app/projets/[slug]/page.tsx` (générique, n'affecte que les projets qui les renseignent).

### Contenu — Home : badge Coupe du Monde 2026 dans le panneau d'intro (2026-06-14)
- Le panneau de droite de la home (`components/home/Intro.tsx`) avait un espace vide au-dessus du « 01 · manifeste ». Ajout d'un **badge promo cliquable** (`components/home/WorldCupPromo.tsx`) qui dirige vers `/projets/coupe-du-monde-dim` : bandeau accent « ⚽ Coupe du Monde 2026 · en direct » (point rouge pulsant `motion-safe`), accroche « Un bot texte les scores à mes potes », et « Voir le projet → ». Manifeste poussé en bas (`mt-auto`).

### Feat — Dashboard coupe-du-monde : bouton « rejoindre le flux » + notif Telegram (2026-06-14)
- L'invitation à rejoindre le flux est devenue un vrai **bouton** qui ouvre un formulaire (prénom + numéro WhatsApp) dans le dashboard.
- Nouvelle route API `app/api/join-flux/route.ts` : reçoit la demande, valide (+ pot de miel anti-bot), et **notifie Constantin sur Telegram** (avec contexte ville/navigateur + rappel de la procédure d'ajout). Le dashboard statique l'appelle en `fetch` (même origine).
- DRY : envoi Telegram + contexte factorisés dans `lib/telegram.ts` (`sendTelegram`, `escapeHtml`, `buildRequestContext`), réutilisés par la route **et** la page contact (refactorisée, comportement identique). Réutilise les env vars existantes `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`. Règle 0 € respectée (API Telegram gratuite).
- Titre du dashboard passé à « Les récaps de Dim, Karim et PAF ».

### Style — Dashboard coupe-du-monde : tous les destinataires + cooptation (2026-06-14)
- Le dashboard affichait « récap envoyé à Dim ». Remplacé par la liste complète des destinataires (Dim, Karim, PAF) via une constante JS unique `RECIPIENTS_LABEL` + spans `.rcpt` (sous-titre, cartes terminées, section « Déjà notifiés », pied de page). Pour ajouter quelqu'un, une seule ligne à changer.
- Ajout d'un clin d'oeil cooptation (« Envie de le recevoir toi aussi ? Demande à être ajouté au flux 😉 »). Tiret cadratin retiré du `<title>`.

### Site — `/projets` trié par date avec affichage du mois (2026-06-13)
- `/projets` ne triait que par année (ordre arbitraire au sein d'une même année). Ajout d'un champ optionnel `date` (`"YYYY-MM-DD"`) au frontmatter projet (`lib/types.ts`), tri par date décroissante avec repli sur l'année (`lib/mdx.ts` via `projetSortKey`), et affichage « mois année » quand la date est connue, sinon l'année seule (`app/projets/page.tsx`, helper `formatPeriode` + `Intl.DateTimeFormat`).
- Dates renseignées d'après le **premier commit du repo de chaque projet** : axiom-hub (mars), wedding-patmos (mars), axiom-family-swap / guide-etudes-superieures / mercatofirst / bookeeper (avril), choose-france / coupe-du-monde-dim (juin). Les 3 plus anciens (Life is Patmos 2020, Axiom Academic 2017, Fixieshop 2016) restent en année seule. 2 sans repo propre identifiable (Dashboard SEO Axiom, Dictée de Dubaï) restent en année seule en attendant un mois.

### Contenu — Nouveau projet `coupe-du-monde-dim` : récaps WhatsApp automatiques (2026-06-13)
- Ajout du projet **Les récaps WhatsApp de Dim** dans `/projets` : un robot qui envoie à un ami le score de chaque match de la Coupe du Monde 2026 sur WhatsApp, automatiquement, dès le coup de sifflet final.
- `content/projets/coupe-du-monde-dim.mdx` : type `perso`, status `en-cours`, year 2026. Explication technique complète (bridge WhatsApp en Go/whatsmeow recompilé sur le serveur, notifier Python sans dépendance, planification systemd calée sur le calendrier réel des matchs). Dashboard live embarqué en iframe + lien plein écran.
- `public/projets/coupe-du-monde-dim/dashboard.html` : artefact single-file autonome qui interroge l'API publique ESPN (gratuite, CORS ouverte, sans clé) côté navigateur et affiche en direct le **calendrier complet du tournoi** (plage de dates `20260611-20260719` en un seul appel), groupé par jour : matchs déjà notifiés (récap envoyé à Dim) / en cours / à venir, avec drapeaux et noms en français. DA brutaliste propre au dashboard, auto-actualisation toutes les 60 s. Règle 0 € respectée.
- Système hors repo : bridge Go/whatsmeow + notifier Python + services `systemd` (service bridge KeepAlive + timer notifier 5 min, gate calendrier) sur un serveur Hetzner Cloud CX23. Architecture repo ↔ serveur détaillée en `DECISIONS.md #010`.

### Contenu — Nouveau projet `choose-france-2026` : dashboard cartographique (2026-06-10)
- Ajout du projet **Choose France 2026** dans `/projets` : dashboard interactif des 71 investissements étrangers annoncés au sommet de Versailles (93 Md€), géolocalisés site par site, cercles proportionnels au CAPEX, vues projets/régions, filtres par famille de secteur.
- `content/projets/choose-france-2026.mdx` : type `experimental`, status `publie`, year 2026, dashboard embarqué en iframe + lien plein écran.
- `public/projets/choose-france-2026/dashboard.html` : artefact single-file autonome (MapLibre GL JS via unpkg, tuiles vectorielles OpenFreeMap Positron, données embarquées en JSON). Sans clé API ni backend, règle 0 € respectée. DA propre au dashboard (encre + ambre, Bricolage Grotesque), assumée distincte de celle du site : c'est un artefact embarqué, pas une page du site.
- Pipeline data hors repo : extraction du dossier de presse officiel + enrichissement (présence des investisseurs en France) + géocodage vérifié, le tout par flotte d'agents Claude orchestrée en workflows.
- Revue multi-agents avant déploiement (20 agents, 5 axes : données, géo, code, UX, intégration site) : KPIs recalculés depuis les données, palette retravaillée (collisions orange/brun et gris/gris), bug de rafraîchissement du chip national, régions dérivées des sites, garde-fous NaN, SRI sur les CDN épinglés, contenus traduits en français (72 fiches). Branding tiers retiré de la variante publiée.
- `body { overflow-x: clip }` dans `styles/globals.css` : les breakouts 100vw (iframe projet) créaient un scroll horizontal sur les navigateurs à scrollbar classique.

### Outil — `scripts/generate-linkedin-assets.mjs` : visuels page Entreprise LinkedIn (2026-05-13)
- Nouveau script Playwright qui génère deux PNG prêts à uploader sur la page Entreprise LinkedIn de superkostia :
  - **`banner.png`** 4200×700 (ratio 6:1, spec page Entreprise — pas 4:1 qui est le profil personnel) : fond `WaterField` plein écran (version statique du composant `components/ui/WaterField.tsx`, density 0.35 pour des squiggles plus larges adaptés au format étiré), wordmark `super` cream + `kostia` chiclet jaune `#E4FF3A` rotation -1.5° (reprise stricte du traitement de l'OG image), tagline mono `terrain de jeu public · superkostia.com · athènes`. Wordmark calé à droite avec gutter gauche de 1080 px pour libérer la safe zone du logo profil que LinkedIn empile en bas-gauche du banner.
  - **`icon.png`** 400×400 : monogramme `sk` lowercase Space Grotesk 700 noir sur cream `#f4f1ea`, tracking -24px, soulignement jaune à la base tilté -2° (signature brutaliste qui se fond proprement quand LinkedIn downscale à 48 px dans le feed). Aucun corner-tick.
- Sortie dans `public/images/linkedin/` (ignoré par git, cf. `.gitignore`) — les PNG sont des assets one-shot uploadés directement sur LinkedIn, pas servis par le site.
- Réutilise le pattern du script `screenshot-projets.mjs` (Playwright headless, viewport exact, `deviceScaleFactor` paramétrable). Aucune API externe (règle 0 € respectée).
- Entrée `npm run generate:linkedin` dans `package.json` pour régénérer à la demande si la DA évolue ou pour décliner d'autres formats (Instagram, Twitter, etc.).

### Contenu — Nouveau projet `fixieshop-moscow` (2026-04-24)
- Ajout du projet **Fixieshop Moscow** dans `/projets` : compte Instagram animé en 2016 à Moscou, idée initiale de magasin de fixies non concrétisée, photos de tous les vélos de rue (notamment fixies underground Moscou + Saint-Pétersbourg).
- `content/projets/fixieshop-moscow.mdx` : type `perso`, status `publie`, year 2016, `<Social platform="instagram">` vers `@fixieshopmoscow`.
- Screenshot capturé via la nouvelle pipeline améliorée du script (cf. ci-dessous).

### Outil — `scripts/screenshot-projets.mjs` : dismiss bannières cookies + modales (2026-04-24)
- Le script de capture des projets affichait des screenshots pollués par les bandeaux cookies (Eventbrite, Instagram). Ajout d'une étape `dismissCookieBanner` qui tente de cliquer un bouton "Decline optional cookies / Refuser tout / Reject all" via `getByRole("button")` puis fallback `getByText` (Meta utilise des `<div>` stylés non-sémantiques).
- Stratégie en 2 passes : navigate → dismiss → reload (le cookie de consent posé persiste dans le contexte) → screenshot rapide avant qu'un éventuel 2e prompt (signup wall IG) n'apparaisse.
- Étape `removeBlockingDialogs` qui supprime à la fois `[role="dialog"]`/`[aria-modal]`/`<dialog>`, les backdrops `[role="presentation"]` fixed, et plus généralement les fixed-overlays plein écran qui ne sont pas la nav du haut. Inject aussi du CSS `!important` pour reset les `filter`/`backdrop-filter`/opacité.
- Couvre Eventbrite (Dictée Dubaï re-shooté propre), réduit l'impact IG (Fixieshop reste légèrement dimmé — limites de l'anti-scrape Meta, acceptable).

### Contenu — Liens sociaux Axiom sur la page projet (2026-04-24)
- Section "Suivre Axiom" ajoutée à `/projets/axiom-academic` avec 3 cartes `<Social>` (Instagram, Facebook, LinkedIn) pointant vers les comptes officiels (`@axiom.academic` + `linkedin.com/company/axiom-academic`).
- Extension du composant `<Social>` pour supporter Facebook : ajout du `FacebookMark` SVG dans `components/icons/BrandMarks.tsx` + `'facebook'` dans le type `Platform` et les maps `MARKS`/`LABELS` de `components/mdx/Social.tsx`.

### Perf — `WaterField` statique sur Safari (2026-04-22)
- Safari calcule lentement la chaîne de filter SVG (`feTurbulence` × 3 + `feMorphology` + `feDisplacementMap`), et la recomputer à chaque frame d'animation tank toute la page (pas seulement le curseur). Détection UA via un nouveau hook `useIsSafari` → sur Safari uniquement, on omet les `<animate>` SMIL → le pattern garde sa complexité visuelle (gradient cobalt + glint + réseau de caustiques) mais reste figé. Sur Chrome/Firefox/Edge : aucun changement, animations préservées.
- Limite identifiée et documentée dans `DECISIONS.md #009`.

### Fix — Curseur custom invisible / laggy sur Safari (2026-04-22)
- `components/layout/CustomCursor.tsx` : Safari ne fire pas `pointerenter`/`pointerleave` sur `document` de façon fiable → `setVisible(true)` ne s'exécutait jamais → curseur invisible. Bascule sur `setVisible(true)` au premier `pointermove` (event 100% reliable cross-browser), et remplacement de `pointerenter`/`leave` par `mouseenter`/`leave` sur `documentElement`.
- `styles/globals.css` : retrait de `mix-blend-mode: difference` sur `.custom-cursor`. Sur Safari, blend sur `position: fixed` au-dessus d'un compositing lourd (le `WaterField` avec ses 3 turbulences animées) tank les perfs et fait lagger le curseur. La palette du site (cream/anthracite/cyan/jaune) garantit la visibilité d'un point `var(--color-fg)` solide partout.

### Fix — React duplicate key warning sur `WorldMap` (2026-04-22)
- Certaines features de `world-atlas/countries-110m.json` (Antarctique notamment) n'ont pas d'`id` → `String(f.id ?? "")` retournait `""` pour toutes ces features → React voyait des keys dupliquées. Fallback sur l'index de la map (`anon-${i}`) quand l'`id` manque. Aucune conséquence visuelle, juste hygiène de console.

### Style — Effet d'océan Hockney sous la carte `/voyages` + refactor `WaterField` (2026-04-22)
- Le composant `HeroSandField` (créé pour le hero home) est renommé en `WaterField` et déplacé en `components/ui/WaterField.tsx` — c'est un effet visuel générique réutilisable, plus "Hero" ni "Sand" dans le nom, ni dans `components/home/`.
- La classe CSS `.hero-fluid` devient `.water-field` ; tout le reste de la chaîne SVG (3 turbulences animées, blend `difference`, threshold matrix, érosion, soustraction, displacement final) est intacte au caractère près.
- 2e usage : embarqué dans `components/voyages/WorldMap.tsx` derrière le SVG monde (le conteneur passe en `relative isolate` pour contenir le `z-index: -1`). Visuellement → océans entre les continents montrent l'eau Hockney qui ondule, la carte garde son rendu d3-geo / topojson.
- Prop `density?: number` (défaut `1` = échelle hero, passé à `4` sur la carte) : multiplie les `baseFrequency` des 3 turbulences et divise inversement le `radius` de l'érosion + le `scale` du displacement → sur la carte les squiggles sont 4× plus serrées, à l'échelle des continents. IDs SVG préfixés via `useId` pour éviter les collisions quand 2 instances coexistent (cas multi-page).
- Pays non-visités : `fill` passe de `transparent` à `var(--color-bg)` (cream en light, anthracite en dark) — sinon ils disparaissent dans l'océan. Pays visités passent de `--color-fg 85%` à `--color-fg` plein (l'eau ne doit pas transparaître à travers les continents, sinon l'effet a l'air d'être *sur* la terre). Hiérarchie visuelle : océan cyan animé · pays non-visités neutres · pays visités opaques foncés · villes en carrés jaunes accent.
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
