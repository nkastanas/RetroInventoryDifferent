# Deployment Guide

This project uses pre-built Linux/AMD64 images from GitHub Container Registry. The production server pulls images; it does not build application source.

## Services

| Service | Image | Default host port |
|---|---|---:|
| API | `ghcr.io/nkastanas/retroinventorydifferent-api:latest` | 4444 |
| Admin web | `ghcr.io/nkastanas/retroinventorydifferent-web:latest` | 4000 |
| Storefront | `ghcr.io/nkastanas/retroinventorydifferent-storefront:latest` | 4001 |
| Showcase | `ghcr.io/nkastanas/retroinventorydifferent-showcase:latest` | 4003 |
| PostgreSQL | `postgres:15-alpine` | Internal only |

The Compose file does not include Traefik or another reverse proxy. Configure one separately if HTTPS or public internet access is required.

## First Deployment

1. Clone the repository on the server:

   ```bash
   git clone https://github.com/nkastanas/RetroInventoryDifferent.git
   cd RetroInventoryDifferent
   ```

2. Create the environment file:

   ```bash
   cp .env.example .env
   nano .env
   ```

   At minimum, set secure values for:

   ```env
   POSTGRES_PASSWORD=replace-with-a-secure-database-password
   AUTH_USERNAME=admin
   AUTH_PASSWORD=replace-with-a-secure-admin-password
   JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
   UPLOADS_PATH=/absolute/path/to/inventory/uploads
   ```

3. Create the uploads directory:

   ```bash
   mkdir -p /absolute/path/to/inventory/uploads
   ```

4. Pull and start the services:

   ```bash
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

Database migrations run automatically when the API container starts.

## Updating Production

Pushing tested code to `main` builds new `:latest` images in GitHub Actions. Production is not updated automatically.

On the production server:

```bash
cd /path/to/inventory
docker compose pull
docker compose up -d
docker compose ps
```

Compose recreates application containers whose images changed. It preserves the PostgreSQL volume and uploads bind mount. Do not run `docker compose down -v`; the `-v` option removes the database volume.

## Ports

Override host ports in `.env` when required:

```env
API_PORT=4444
WEB_PORT=4000
STOREFRONT_PORT=4001
SHOWCASE_PORT=4003
```

PostgreSQL is not published to the host. Keep it internal.

## Persistent Data

The deployment stores data in two places:

- PostgreSQL uses the Compose volume `invdif_simple_postgres_data`.
- Photos and uploaded files use the host directory configured by `UPLOADS_PATH`.

Both must be backed up.

### Database backup

```bash
docker exec inventory-db sh -c 'pg_dump --no-owner --no-acl -U "$POSTGRES_USER" "$POSTGRES_DB"' > inventory-production.sql
```

### Uploads backup

Back up the directory configured by `UPLOADS_PATH` with your normal filesystem backup tool.

## Local Source Build

The local stack is isolated from production and builds the API and admin web application from the checked-out source:

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
```

Default local access:

- API: `http://localhost:4444`
- Admin web: `http://localhost:4000`
- Login: `admin` / `admin`

The local stack uses the Compose project name `retroinventory-local` and separate `local_postgres_data` and `local_uploads` volumes.

## Automated-Test Database

`docker-compose.test.yml` creates a disposable PostgreSQL database on port 5433. Its database directory uses `tmpfs`, so its contents disappear when the container is removed.

```bash
docker compose -f docker-compose.test.yml up -d --wait
docker compose -f docker-compose.test.yml down
```

## Troubleshooting

Check container state and recent logs:

```bash
docker compose ps
docker compose logs --tail=100 api web storefront showcase postgres
```

Confirm the configured images:

```bash
docker compose config --images
```

Confirm the image used by a running container:

```bash
docker inspect inventory-api --format '{{.Config.Image}}'
```

The production file requires `POSTGRES_PASSWORD`. Validate configuration without starting containers:

```bash
docker compose config --quiet
```
