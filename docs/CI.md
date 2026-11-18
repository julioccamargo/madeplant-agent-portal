# CI

Cada PR em `main` roda:

- `npm ci`
- `npm run build` (Vite)

Release: tag `portal-v*` dispara job de build e anexa `dist/` (artefato) — ver workflow `release-portal.yml`.