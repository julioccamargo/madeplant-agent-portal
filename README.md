# Madeplant Agent Portal (lab)

Frontend lab de **relatórios**: tempo por app, atividade, timeline, screenshots e export CSV de foco.

Requisito: pelo menos **uma estação** com agente 0.5.1+ e eventos no Postgres (nao e necessario segunda VM so para validar o portal).

Versao: ver [VERSION](VERSION). CI: [docs/CI.md](docs/CI.md).

## Setup

```powershell
cd c:\PROJETOS\Madeplant-Agent-Portal
Copy-Item .env.example .env.local
# edite VITE_ADMIN_API_KEY
npm install
npm run dev
```

Abre http://localhost:5173 (proxy `/admin` → API).

Dev: `PORTAL_CORS_ORIGINS=http://localhost:5173` na agent-api se usar `VITE_API_BASE` direto.

**Produção Dokploy:** [docs/DOKPLOY.md](docs/DOKPLOY.md) — container nginx, porta **80**, env `API_UPSTREAM` + `ADMIN_API_KEY`.