# Madeplant Agent Portal (lab)

Frontend minimo para auditoria: devices, timeline, resumos e screenshots.

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

No Dokploy defina `PORTAL_CORS_ORIGINS=http://localhost:5173` se chamar a API direto sem proxy.