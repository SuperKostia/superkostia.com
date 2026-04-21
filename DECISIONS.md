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

## #004 — Pas de dépendance `clsx` / `tailwind-merge`

**Date** : 2026-04-21.
**Statut** : Acceptée.

**Contexte.** Pour composer des classes Tailwind conditionnelles, le duo `clsx + tailwind-merge` est l'habitude ; la règle CDC §11 (et CLAUDE.md §4) exige de justifier chaque dépendance.

**Décision.** On écrit un helper maison `cn` dans `lib/utils.ts`, sans dépendance.

**Raison.** Le helper fait 10 lignes, couvre le besoin (strings, arrays, faux-y filtered) et n'a pas besoin du merging de Tailwind tant qu'on passe par des CSS vars (pas de conflit `bg-red-500 bg-blue-500` à résoudre). Si un conflit émerge plus tard, on ajoutera `tailwind-merge` avec une justification explicite dans une nouvelle décision.
