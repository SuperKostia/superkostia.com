# CLAUDE.md — superkostia.com

Ce fichier contient les règles permanentes pour tout agent Claude Code travaillant sur ce projet. Il est lu automatiquement à chaque session.

## Contexte

Site vitrine personnel de Kostia (Constantin). Le cahier des charges complet est dans `CAHIER-DES-CHARGES.md` à la racine — **le lire avant toute action** sur une nouvelle session.

Domaine de production : `superkostia.com`

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

À mettre à jour au fur et à mesure par Claude Code :

- [ ] Phase 0 — Setup
- [ ] Phase 1 — Squelette
- [ ] Phase 2 — Home expérientielle
- [ ] Phase 3 — Contenu
- [ ] Phase 4 — Laboratoire
- [ ] Phase 5 — Polish
- [ ] Phase 6 — Lancement

## Secrets attendus

Ces variables doivent exister dans `.env.local` (jamais commitées) :

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Un `.env.local.example` sans valeurs doit être maintenu à la racine.
