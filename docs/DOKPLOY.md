# Portal no Dokploy (lab)

Frontend **estático** + nginx faz **proxy** de `/admin` para a Agent API e injeta `X-Admin-Key` no servidor (chave **não** vai no bundle JS).

## Pré-requisitos

- App **agent-api** já no ar (`GET /health` ok).
- Mesma `ADMIN_API_KEY` da API.
- Merge da branch com `Dockerfile` (ex. `main` após PR relatórios).

## Opção A — Compose no Dokploy (lab atual)

1. App tipo **Compose** no Git → `julioccamargo/madeplant-agent-portal`.
2. **Compose file:** `docker-compose.dokploy.yml` ou `docker-compose.yml` (raiz).
3. **Environment** no painel (mesmas vars do `.env.example`):

| Variável | Lab |
|----------|-----|
| `API_UPSTREAM` | `http://172.250.40.238:5080` |
| `ADMIN_API_KEY` | igual agent-api |
| `PORTAL_HOST_PORT` | `3000` |

4. **Deploy** (webhook Compose no Dokploy ou botão Redeploy).
5. Portal: `http://172.250.40.238:3000/`. Teste proxy: `GET .../admin/v1/devices?tenant=lab` → **200** JSON (não 404).

Branch: `main` após merge do PR com `Dockerfile` + `docker-compose.yml`.

## Opção B — Aplicação Dockerfile (sem compose)

1. Dokploy → **Project** `madeplant-agent` (ou novo) → **Create Application** → tipo **Dockerfile**.
2. Git: repo `julioccamargo/madeplant-agent-portal`, branch `main`.
3. **Dockerfile path:** `Dockerfile` (raiz).
4. **Port:** container `80` → host ex. `5180` (ou domínio Traefik).
5. **Environment** (runtime):

| Variável | Exemplo lab |
|----------|-------------|
| `API_UPSTREAM` | `http://172.250.40.238:5080` (URL **interna** da API vista pelo container) |
| `ADMIN_API_KEY` | (igual Dokploy da agent-api) |

Se API e portal estiverem na **mesma rede Docker** Dokploy, prefira `http://madeplant-agent-api:8080` (nome do container/serviço).

6. **Deploy**. Abra `http://<host>:5180`.

### API no compose Cloud

No app **agent-api**, adicione CORS só se algum cliente chamar a API **direto** do browser (dev `npm run dev`):

```env
PORTAL_CORS_ORIGINS=http://localhost:5173,http://172.250.40.238:5180
```

Com proxy nginx do portal, o browser só fala com o mesmo host do portal — CORS na API **não** é obrigatório para `/admin`.

## Opção C — Compose local (teste)

```bash
cd madeplant-agent-portal
export ADMIN_API_KEY='...'
export API_UPSTREAM='http://172.250.40.238:5080'
docker build -t madeplant-portal .
docker run --rm -p 5180:80 -e ADMIN_API_KEY -e API_UPSTREAM madeplant-portal
```

## Dev sem Docker

```powershell
Copy-Item .env.example .env.local
# VITE_ADMIN_API_KEY + VITE_API_BASE — proxy Vite em vite.config.js
npm run dev
```

## Troubleshooting

| Sintoma | Ação |
|---------|------|
| 503 nas chamadas | `ADMIN_API_KEY` vazia no portal ou na API |
| 502 no `/admin` | `API_UPSTREAM` incorreto / firewall entre containers |
| Tela pede `VITE_ADMIN_API_KEY` | Build antigo; use imagem com proxy (sem chave no Vite) ou defina `.env.local` só em dev |