# Décisions — superkostia.com

Registre des décisions qui engagent le projet sur la durée. Chaque entrée a un ID stable (`#001`, `#002`, …) et on peut y référer depuis le code, les commits, ou le CDC.

Format :
- **Contexte** : ce qui a déclenché la décision.
- **Décision** : ce qu'on a choisi.
- **Raison** : pourquoi, avec les alternatives écartées.
- **Statut** : `Acceptée` · `Supplantée par #xxx` · `Abandonnée`.

---

## #001 — Next.js 16 plutôt que 15

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Le CDC (§3.2) spécifie "Next.js 15". Au moment du scaffolding, `create-next-app@latest` installe Next 16.2.4, déjà stable.

**Décision.** On part sur **Next 16.2.4**.

**Raison.** L'App Router, l'API `Metadata`, MDX, Server Components, `next/font`, Turbopack : tout ce que le CDC exige est identique entre 15 et 16. Refuser la 16 signifierait un `create-next-app@15` explicite et un lock artificiel — aucun gain. La 16 est backward-compatible pour notre périmètre.

**Impact.** Mise à jour du CDC §3.2 déconseillée (le doc est un cahier des charges daté, pas un manuel à jour) ; à la place ce registre fait foi.

---

## #002 — `/hobbies/photographie` : univers visuel totalement à part

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Kostia est photographe. Dans le CDC d'origine (§7.3), la photographie était traitée comme les autres hobbies, avec juste une DA "plus silencieuse". Après relecture, c'est insuffisant : la photo mérite une **rupture franche** avec le reste du site.

**Décision.** La page `/hobbies/photographie` sort complètement de l'univers brutaliste jaune acide. Elle adopte une esthétique propre : sobriété extrême, chrome UI quasi invisible, typographie effacée, fond neutre (blanc cassé très doux ou noir profond), l'image occupe tout l'espace. Seuls le header et le footer globaux subsistent pour maintenir un fil de continuité avec le reste du site.

**Raison.** Rien ne doit entrer en compétition visuelle avec les photos. Le brutalisme agressif du reste du site serait du bruit. Cette rupture renforce aussi l'idée CDC §7.3 "chaque hobby a sa propre micro-identité" — la photo en devient l'expression la plus radicale. Alternatives écartées :
- *Garder la DA brutaliste avec un accent plus doux* : insuffisant, c'est toujours le même système.
- *Créer un site séparé `photo.superkostia.com`* : fragmente l'audience et double la maintenance pour un bénéfice SEO/UX nul.

**Impact.**
- CDC §7.3 amendé pour rendre la rupture explicite et non-négociable.
- Phase 3 : `/hobbies/photographie` est la page la plus exigeante du point de vue DA — prévoir potentiellement un layout racine dédié (`app/hobbies/photographie/layout.tsx`) qui override les tokens.
- Tokens de design : prévoir une surcharge locale (variables CSS `--color-*` redéfinies dans un scope) plutôt que des classes Tailwind en cascade.

---

## #003 — Accent jaune acide `#E4FF3A` par défaut

**Date** : 2026-04-21.
**Statut** : Acceptée (overridable par Kostia sans décision formelle).

**Contexte.** Le CDC (§13) laisse trois options ouvertes : jaune acide `#E4FF3A`, orange `#FF5F1F`, cyan `#00F0FF`. Phase 0 nécessitait de trancher pour implémenter les tokens.

**Décision.** Jaune acide `#E4FF3A`.

**Raison.** C'est le plus tranchant des trois, le plus "brutaliste par défaut", et il reste lisible en clair comme en sombre avec un texte noir (`#111`) ou anthracite (`#0a0a0a`). Les deux autres teintes sont plus difficiles à contraster en mode clair sans tomber dans un rendu "fun" qu'on ne veut pas.

**Impact.** Un seul changement de `--color-accent` dans `styles/globals.css` suffit à basculer si Kostia veut essayer une autre piste — aucune autre couche à toucher.

---

## #005 — Hobbies dans la nav principale, Contact dans le footer

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Le CDC §8.1 prescrit "5 entrées max (Projets, Laboratoire, Écrits, À propos, Contact)" dans le header — et omet **Hobbies**, alors même que `/hobbies` est une section première classe dans l'arborescence §4.1 et détaille 4 univers distincts (§7.3). Côté home (§5.1), les 4 "portes d'entrée" listées sont Projets/Laboratoire/Écrits/À propos, donc Hobbies n'a aucune entrée de navigation visible. C'est très vraisemblablement un oubli.

**Décision.** Header principal = **Projets · Hobbies · Laboratoire · Écrits · À propos** (5 entrées, plafond respecté). Contact est déplacé dans le footer, aux côtés de Colophon et d'un lien GitHub.

**Raison.** Hobbies est content-lourd et mérite une entrée directe ; Contact est une action ponctuelle qui s'accommode très bien du footer (pattern standard). On garde le plafond CDC à 5 entrées sans sacrifier de section.

**Impact.** À l'ajout d'une future section content (ex : Archive, Presse), il faudra trancher entre étendre le plafond à 6 ou évincer une entrée existante — créer une nouvelle décision le moment venu.

---

## #006 — `exifr` pour lire les métadonnées EXIF des JPEG au build

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Le CDC §7.3 prévoit l'affichage optionnel des métadonnées EXIF (focale, vitesse, ouverture, ISO, appareil) dans la lightbox de `/hobbies/photographie`. Deux voies : automatiser via un parser EXIF ou demander à Kostia de taper les données à la main dans un fichier sidecar.

**Décision.** Installation de `exifr` (~20 kb minzipped, zéro dépendance runtime, build only). Appelé depuis `lib/photos.ts` au moment du scan du dossier `public/images/photographie/`.

**Raison.** Automatiser supprime la friction pour Kostia (drop un JPEG, c'est tout). Les alternatives :
- *Parser EXIF maison* : complexe (format binaire), inutile.
- *Champ `exif` manuel dans `_series.json`* : friction, doublon avec ce qui est déjà dans le fichier JPEG.
- *Pas d'EXIF* : appauvrit la fiche technique, va contre l'esprit CDC §7.3 ("fiche technique").

**Impact.** Dep runtime côté server uniquement (pas de bundle client). Pas de rate limit, pas de service extérieur. Zéro coût conforme CDC rule #1.

---

## #007 — Hébergement photos : `public/` pour commencer, Supabase Storage au-delà de 100 MB

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** `/hobbies/photographie` a besoin d'héberger les originaux des photos. Plusieurs options : filesystem (`public/`), Supabase Storage, Vercel Blob, CDN tiers.

**Décision.** Phase 3 : toutes les photos vivent dans `public/images/photographie/<serie>/*.jpg`, bundlées avec le déploiement Vercel et servies par son CDN. Phase 4+ (quand le repo dépassera 100 MB — limite Vercel Hobby) : migration vers Supabase Storage avec un bucket public.

**Raison.**
- **Phase 3** : zéro service, zéro auth, zéro config. Le code scanne le filesystem, `next/image` optimise. Parfaitement fluide tant qu'on reste raisonnable.
- **Seuil 100 MB** : limite brute du repo Vercel Hobby. Vercel Pro passe à 1 GB mais on veut rester gratuit (CDC rule #1). Un script `npm run compress:photos` (sharp + mozjpeg, 2400 px max, qualité 82) est fourni pour optimiser avant commit.
- **Phase 4+ migration** : Supabase Storage plan gratuit 1 GB, déjà prévu par le CDC §3.3 ("Storage pour images/vidéos lourdes"). Le scanner `lib/photos.ts` sera adapté pour lire la liste des objets via le client Supabase plutôt que `fs.readdir`.

**Impact.** À surveiller : taille du dossier `public/images/photographie/` à chaque commit. Quand ça approche 80 MB, planifier la migration.

---

## #008 — `/laboratoire` supprimée, `/voyages` prend la place + carte monde SVG brutaliste

**Date** : 2026-04-22.
**Statut** : Acceptée. Supplante #005 sur la composition du header.

**Contexte.** Le CDC (§6) prévoyait une section `/laboratoire` avec 5 mini-apps (mur-des-visiteurs, quel-kostia, générateur, radio, galerie). Aucune n'avait été implémentée, et à la relecture Kostia a tranché que ce n'était **pas vraiment ce qu'il voulait**. En parallèle, `nomads.com/@kostialevine` agrège en live ses 61 voyages, 22 pays, 33 villes, 156 404 km — tout ce contenu restait sous-exploité (juste un bloc compact sur `/a-propos` + un ticker home). Kostia a explicitement demandé d'intégrer sa carte nomads sur le site.

**Décision.**
1. **Supprimer `/laboratoire`** purement et simplement. Les 5 idées passent en parking lot.
2. **Créer `/voyages`** à sa place dans la nav principale (même slot, position 3).
3. **Reconstruire la carte nomads** côté superkostia.com à partir du JSON public, plutôt que d'iframer nomads.com ou de charger leur token Mapbox. Stack : topojson `world-atlas` + `topojson-client` + `d3-geo` (projection `geoEqualEarth`) rendus en SVG côté serveur. Zéro JS client, zéro appel tuiles externes.
4. **DA assumée brutaliste** : pays visités remplis plein (var --color-fg), villes en carrés jaunes dimensionnés au nombre de passages, stats géantes, narration ("X tours de Terre") et timeline inversée jusqu'à 1989.

**Raison.**
- **Pourquoi reconstruire au lieu d'iframer** : la map sur nomads.com est une Mapbox GL avec leur token privé. Iframer la page entière = fragile (X-Frame-Options, ruptures silencieuses, DA cassée). Reconstruire = on contrôle le rendu et ça colle à notre typographie.
- **Pourquoi d3-geo + topojson plutôt que Leaflet/MapLibre** : pas besoin de zoom/pan. On veut une image statique impactante, très brutaliste, avec un projet SVG rendu côté serveur. MapLibre/Leaflet = bundle client de 100-200 kb + tuiles externes + look "Google Maps" antinomique. `d3-geo` + `topojson-client` + `world-atlas` = tout-server, zéro bytes client au runtime, 177 pays dessinés à plat.
- **Pourquoi conserver les idées de labo au parking lot** : certaines (mur-des-visiteurs, galerie-des-polices) peuvent revenir comme easter eggs ou pages standalone plus tard. Pas de suppression morale, juste de priorisation.

**Impact.**
- Nav principale reste à 5 entrées (Projets · Hobbies · **Voyages** · Écrits · À propos) — décision #005 reste valide avec Voyages à la place de Laboratoire.
- Ajout 3 deps runtime (d3-geo, topojson-client, world-atlas) + 4 deps types dev, toutes justifiées par l'usage (CDC rule #4).
- Les deux consommateurs existants de `lib/nomads.ts` (`/a-propos` card, home `Ticker`) sont rétrocompatibles — on a enrichi le type sans retirer de champ.
- CDC §6 obsolète : ce registre fait foi pour l'arborescence actuelle.

---

## #004 — Pas de dépendance `clsx` / `tailwind-merge`

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Pour composer des classes Tailwind conditionnelles, le duo `clsx + tailwind-merge` est l'habitude ; la règle CDC §11 (et CLAUDE.md §4) exige de justifier chaque dépendance.

**Décision.** On écrit un helper maison `cn` dans `lib/utils.ts`, sans dépendance.

**Raison.** Le helper fait 10 lignes, couvre le besoin (strings, arrays, faux-y filtered) et n'a pas besoin du merging de Tailwind tant qu'on passe par des CSS vars (pas de conflit `bg-red-500 bg-blue-500` à résoudre). Si un conflit émerge plus tard, on ajoutera `tailwind-merge` avec une justification explicite dans une nouvelle décision.

---

## #009 — Effets visuels procéduraux : SVG filter chain natif plutôt que WebGL

**Date** : 2026-04-22.
**Statut** : Acceptée.
**Mise à jour** : 2026-04-22 — composant renommé `HeroSandField` → `WaterField`, déplacé en `components/ui/WaterField.tsx`, et désormais embarqué sur 2 pages (home hero + carte `/voyages`).

**Contexte.** Pour le hero de la home, besoin d'un effet d'eau / piscine vivant et organique (référence : "Portrait of an Artist (Pool with Two Figures)" de David Hockney — bleu cobalt + réseau de squiggles blanches qui ondulent en surface). Premières tentatives en CSS pur avec `data:` URI + `transform: translate3d` ont buté contre un plafond structurel : le noise est gelé dans l'image, on ne peut que la translater → ça lit comme "une texture qui glisse", jamais comme "une matière qui ondule". Trois familles de techniques disponibles dans la nature :
1. **Shader GLSL via WebGL** (Three.js / OGL) — le standard sur les sites Awwwards, GPU-accéléré, le plus fluide.
2. **SVG filter chain natif** (`feTurbulence` + `feDisplacementMap` + `feMorphology` + `feComposite` + SMIL `<animate>`) — natif navigateur, zéro JS.
3. **Canvas 2D** avec calcul de noise en JS — moyen sur tous les axes.

**Décision.** **Voie 2 : chaîne de filtres SVG inline animée par SMIL.** Chaîne finale du composant `WaterField` (8 primitives) :

```
n1 (turbulence 73s) ─┐
                     ├─→ feBlend difference → feColorMatrix threshold → feMorphology erode
n2 (turbulence 47s) ─┘                                                        │
                                                                              ↓
                                                          feComposite (binary − eroded) = "lines"
                                                                              │
warp (turbulence 19s) ────────────────────────────────────→ feDisplacementMap ←┘
                                                                              ↓
                                                                          output
```

3 turbulences avec périodes coprime (73 · 47 · 19 secondes, toutes premières) → PPCM ≈ 18h, pattern jamais répétée à l'œil.

**Raison.**
- **Voie 1 (WebGL) écartée** car Three.js / OGL = dépendance lourde (>100 kb) qui contredit la règle CDC §4 et CLAUDE.md §4 ("pas de dépendances superflues"). Aucun autre besoin sur le site ne justifierait de payer ce coût.
- **Voie 3 (Canvas + JS noise) écartée** car perf moins bonne que SVG (pas accéléré GPU sur la majorité des navigateurs) et code plus verbeux pour le même rendu.
- **Voie 2 retenue** parce que :
  - Zéro dépendance — entièrement natif, supporté évergreens (filter region, SMIL animate, displacement map sont tous spec SVG 1.1, support universel modulo bugs anciens).
  - GPU-accéléré sur Chromium et Safari moderne pour `feTurbulence` et `feDisplacementMap`.
  - SSR-friendly : le SVG part dans le HTML initial, pas de FOUC.
  - Compatible `prefers-reduced-motion` via un `useReducedMotion` hook qui omet conditionnellement les `<animate>` enfants des `<feTurbulence>` → le réseau apparaît figé pour les utilisateurs concernés.

**Limites identifiées.**
- **Performance Safari (mesurée 2026-04-22)** : Safari calcule très lentement la chaîne (`feTurbulence` × 3 + `feMorphology` + `feDisplacementMap`) et la recomputer à chaque frame fait lagger toute la page — pas juste le composant. Mitigation appliquée : détection UA via `useIsSafari` → Safari rend le `WaterField` **statique** (omet les `<animate>` SMIL). Le pattern reste visuellement riche (gradient cobalt + glint + réseau de caustiques complet) mais figé. Chromium et Firefox gardent l'animation complète.
- Performance générale : OK sur desktop Chromium récent, à surveiller sur mobile bas de gamme. Si problème futur : abaisser `numOctaves` ou n'animer que `n1` (laisser `n2` et `warp` statiques).
- SMIL est techniquement déprécié dans certaines specs mais largement supporté en pratique (Chrome, Firefox, Safari). Pas de polyfill nécessaire.
- L'effet est circonscrit pour l'instant au hero home et à la carte `/voyages`. Si on veut décliner ailleurs avec une palette différente, factoriser en props (couleurs des stops, périodes, scale du displacement). Pas le cas aujourd'hui.

**Impact.**
- Établit la convention : **pour les visuels génératifs / texturés, on cherche d'abord la solution SVG filter avant d'envisager une lib graphique**. Cette décision peut servir de référence si le besoin se représente (autres heroes, transitions, accents visuels).
- Aucune dépendance ajoutée.
- Composant `components/ui/WaterField.tsx` (~190 lignes, doc inline expliquant chaque maillon de la chaîne) + classe CSS `.water-field` portable (`position: absolute; inset: 0; z-index: -1; pointer-events: none`). Réutilisable dans n'importe quel parent ayant `position: relative` + `isolation: isolate`. Pas de props pour l'instant — les 2 usages actuels (home hero + carte voyages) veulent exactement la même palette Hockney. Quand un 3e usage demandera autre chose, ajouter des props (palette, periods, displacement scale).
