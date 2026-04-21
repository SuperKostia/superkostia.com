# CLAUDE.md — superkostia.com

Ce fichier contient les règles permanentes pour tout agent Claude Code travaillant sur ce projet. Il est lu automatiquement à chaque session.

## Contexte

Site vitrine personnel de Kostia (Constantin). Domaine de production : `superkostia.com`.

### Documents à lire AU DÉBUT de chaque session (dans l'ordre)

1. **[`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md)** — vision, DA, stack, arborescence. Spec de référence.
2. **[`ROADMAP.md`](./ROADMAP.md)** — où on en est, ce qui est fait, ce qui vient. Statut par phase.
3. **[`DECISIONS.md`](./DECISIONS.md)** — les choix tranchés avec leur raison. Les entrées ici complètent ou surclassent le CDC quand il y a divergence.
4. **[`CHANGELOG.md`](./CHANGELOG.md)** — ce qui a été livré et quand. Édité à la main, complément du `git log`.

Repo GitHub : https://github.com/SuperKostia/superkostia.com (compte `SuperKostia`, pas le compte perso).

## Règles absolues

### 1. Aucune API payante, jamais
Ce projet doit fonctionner à **0 € d'usage**. Interdit :
- Clés API Anthropic, OpenAI, ou tout LLM commercial.
- Services d'images payants (Midjourney API, DALL-E, etc.).
- Toute dépendance avec un plan gratuit limité en appels qui pourrait basculer en payant sous charge.

Si une idée nécessite une API payante, **ne pas l'implémenter** et le signaler explicitement dans la réponse pour décision humaine.

### 2. Direction artistique brutaliste — ne jamais l'adoucir
Le site assume une esthétique brutaliste/expérimentale. Quand un pattern gagne en complexité, la tendance naturelle est de régulariser, arrondir, "rendre propre". **C'est l'opposé de ce qu'il faut**. En cas de doute, pousser vers plus d'audace, pas moins.

Référence : section 2 du cahier des charges.

### 3. Français par défaut
Interface, labels, placeholders, messages d'erreur, commentaires de code de haut niveau, noms de composants côté contenu : tout en français. Les termes techniques React/Next restent en anglais (ex : `useState`, `ServerComponent`).

### 4. Pas de dépendances superflues
Chaque `npm install` doit être justifié dans le commit. Préférer les solutions natives (fetch, Intl, CSS pur) aux libs.

### 5. TypeScript strict
`strict: true`, pas de `any` implicite, pas de `@ts-ignore` sans commentaire expliquant pourquoi.

### 6. Composants réutilisables dès la deuxième occurrence
Si un pattern apparaît 2 fois, il devient un composant dans `components/ui/` ou `components/layout/`.

### 7. Accessibilité non-négociable
- Contraste AA minimum, AAA sur le texte principal.
- Focus visible épais.
- `prefers-reduced-motion` respecté.
- Navigation clavier complète.
- `alt` sur toutes les images.

### 8. Mobile-first sans sacrifier l'ADN desktop
Le mobile garde la puissance typographique et brutaliste. Pas de "version mobile diminuée".

## Conventions

### Naming
- Composants : `PascalCase.tsx`
- Hooks : `useCamelCase.ts`
- Utilitaires : `kebab-case.ts`
- Pages App Router : respecter les conventions Next (`page.tsx`, `layout.tsx`).

### Commits
Conventional Commits :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` maintenance, config
- `content:` ajout/modif de contenu MDX
- `style:` ajustements visuels/DA
- `refactor:` réorganisation sans changement fonctionnel
- `docs:` documentation

### Branches
- `main` : production (Vercel prod)
- `dev` : préprod
- `feat/nom-court`, `fix/nom-court` : features/fixes

## Workflow attendu avec Claude Code

1. **Toujours lire `CAHIER-DES-CHARGES.md`** au début d'une nouvelle session.
2. **Travailler par phase** (voir section 10 du cahier). Ne pas tout générer d'un coup.
3. **Proposer un plan** avant d'écrire du code sur les tâches qui touchent plus de 2-3 fichiers.
4. **Commits atomiques et fréquents**. Ne pas empiler 15 changements non-liés dans un seul commit.
5. **Tester visuellement** après chaque phase (`npm run dev`) avant de passer à la suivante.

## État actuel du projet

Le suivi fin de l'avancement vit dans **[`ROADMAP.md`](./ROADMAP.md)**. Ne pas dupliquer ici — un seul endroit où mettre à jour, sinon on désynchronise.

### Hygiène de traçabilité (à tenir à chaque commit significatif)

1. Cocher la case correspondante dans `ROADMAP.md`.
2. Ajouter une entrée dans `CHANGELOG.md` sous `[Unreleased]` si le changement est visible ou structurant.
3. Si une décision non-évidente a été prise (stack, DA, dépendance majeure, rupture d'un principe du CDC), l'archiver dans `DECISIONS.md` avec un nouvel ID `#NNN`.
4. Commit atomique + push.

## Secrets attendus

Ces variables doivent exister dans `.env.local` (jamais commitées) :

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Un `.env.local.example` sans valeurs doit être maintenu à la racine.
