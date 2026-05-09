# Production Stack (Monorepo)

This stack runs:
- `frontend` (Next.js)
- `backend` (NestJS)
- `redis`
- `caddy` (reverse proxy + automatic TLS)
- optional local `postgres` (only if you start with `--profile local-db`)

## 1) Arvan VPS prerequisites

- Docker Engine + Docker Compose plugin installed
- Domain A record pointing to VPS public IP
- Open ports: `80` and `443`

## 2) Prepare env

```bash
cd docker
cp .env.example .env
```

Set:
- `DOMAIN` to your real domain (example: `shop.example.com`)
- `NEXT_PUBLIC_API_URL=https://<domain>/api/v1`
- `APP_BASE_URL=https://<domain>`
- `FRONTEND_URL=https://<domain>`
- `CORS_ORIGINS=https://<domain>`
- `DB_*` values to your managed Arvan PostgreSQL connection
- Strong JWT secrets (`openssl rand -base64 32`)

If your managed Postgres requires TLS:
- `DB_SSL=true`
- keep `DB_SSL_REJECT_UNAUTHORIZED=true` (set `false` only if provider instructs)

## 3) Update Caddy domain

In `docker/Caddyfile`, replace `{$DOMAIN:localhost}` with your domain or keep env-style and set `DOMAIN` in `.env`.

## 4) Build and run

Managed Postgres (recommended):
```bash
docker compose up --build -d
```

If you want local Postgres container instead:
```bash
docker compose --profile local-db up --build -d
```

## 5) Run DB migrations before go-live

Run this from your trusted machine with production DB env values:

```bash
cd apps/backend
npm run migration:run
```

## 6) Access and checks

- App: `https://<domain>`
- API health: `https://<domain>/api/v1/health`
- Logs:
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`
  - `docker compose logs -f caddy`

## 7) Stop / update

```bash
docker compose down
docker compose pull
docker compose up -d --build
```
