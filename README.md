# superkostia.com

Site vitrine personnel de Kostia.

## Stack
Next.js 15 · Tailwind 4 · TypeScript · MDX · Supabase · Vercel

## Documentation
- [`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md) — spécifications complètes
- [`CLAUDE.md`](./CLAUDE.md) — règles pour Claude Code

## Développement

```bash
npm install
cp .env.local.example .env.local
# remplir les variables
npm run dev
```

## Déploiement
Auto via Vercel à chaque push sur `main` (prod) et `dev` (preview).
