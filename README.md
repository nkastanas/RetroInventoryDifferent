# Retro Inventory Different

A self-hosted inventory management system for vintage computer collections. Track acquisition, repair history, sale, and value across a web admin dashboard, public storefront, and AI assistant integration.

![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey)

---

## What's Included

| Service | Description | Default Port |
|---|---|---|
| `api/` | GraphQL API (Express + Apollo + Prisma + PostgreSQL) | 4000 |
| `web/` | Admin dashboard (Next.js 14) | 3000 |
| `storefront/` | Public shop frontend (Next.js 14) | 3001 |
| `mcp-server/` | MCP server for AI assistant integrations | stdio |

**Admin dashboard:** card/table views, search and multi-filter, financial tracking, image management with non-destructive rotate and crop editing, notes, maintenance tasks, tags, custom fields, accessories checklist, reference links, bulk ZIP import/export, AI chat assistant, barcode/QR scanning, wishlist, stats charts, timeline, print view, trash with restore.

**Storefront:** public product grid for items listed for sale, search, filter by status/category, item detail with specs and condition, "Looking For" page from your wishlist.

---

## Docker Images

GitHub Actions publishes these Linux/AMD64 images to GitHub Container Registry whenever tested code is pushed to `main`:

```
ghcr.io/nkastanas/retroinventorydifferent-api:latest
ghcr.io/nkastanas/retroinventorydifferent-web:latest
ghcr.io/nkastanas/retroinventorydifferent-storefront:latest
ghcr.io/nkastanas/retroinventorydifferent-showcase:latest
```

Database migrations run automatically on every container start — no manual migration step needed when updating.

---

## Deployment

The supported production deployment exposes services directly on host ports. It does not include a reverse proxy.

```bash
# 1. Clone the repository
git clone https://github.com/nkastanas/RetroInventoryDifferent.git
cd RetroInventoryDifferent

# 2. Create an uploads directory for device images
mkdir -p ./uploads

# 3. Configure environment
cp .env.example .env
# Edit .env — at minimum set POSTGRES_PASSWORD and AUTH_PASSWORD
nano .env

# 4. Pull and start the production images
docker compose pull
docker compose up -d
```

Services will be available at:

- Web: `http://your-host:3000`
- Storefront: `http://your-host:3001`
- Showcase: `http://your-host:3003`
- API: `http://your-host:4000/graphql`

Override these defaults with `API_PORT`, `WEB_PORT`, `STOREFRONT_PORT`, and `SHOWCASE_PORT` in `.env`.

> **Asset tagging note:** Generated QR codes embed the server URL. Use a stable hostname or address if those codes must remain valid outside your local network.

### Portainer Stack

1. Go to **Portainer → Stacks → Add Stack**
2. Name the stack `inventory`
3. Paste the contents of `docker-compose.yml`
4. Add your environment variables in the "Environment variables" section (see below)
5. Deploy

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `AUTH_USERNAME` | If set, login requires both username and password (default: password only) |
| `AUTH_PASSWORD` | Admin login password for the web app (required to make changes) |
| `UPLOADS_PATH` | `./uploads` | Host path where device images are stored. Use an absolute path in production. |

### Recommended

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | *(auto-generated)* | Secret for signing auth tokens. Set explicitly so sessions survive restarts. Minimum 32 characters. |
| `POSTGRES_USER` | `inventory` | PostgreSQL username |
| `POSTGRES_DB` | `inventory` | PostgreSQL database name |

### Optional Features

| Variable | Description |
|----------|-------------|
| `LANGUAGE` | Language for the web app, storefront, and showcase (default: `en`, supported: `de`, `fr`, `es`) |
| `CURRENCY` | Currency for financial values in the web app (default: follows language — `USD` for `en`, `EUR` for `de`/`fr`/`es`). Set independently to use a different currency with any language, e.g. `CURRENCY=EUR` with `LANGUAGE=en` for English UI with euros. Supported: `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`, `MXN`, `ARS`, `CLP` |
| `OPENAI_API_KEY` | Enables AI product image generation|
| `ANTHROPIC_API_KEY` | Enables the AI chat assistant |
| `CONTACT_EMAIL` | Email shown on the storefront contact button (default: `store@example.com`) |
| `EXTERNAL_TEMPLATES_ENABLED` | Initial default for the remote template catalog (`true` by default). Once toggled in the web Settings page the DB value takes precedence and this env var is ignored. |

### Domains (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `DOMAIN` | — | Domain for the admin web app (e.g., `inventory.example.com`) |
| `SHOP_DOMAIN` | — | Domain for the public storefront (e.g., `shop.example.com`) |
| `SHOWCASE_DOMAIN` | — | Domain for the public showcase site (e.g., `showcase.example.com`) |

### Analytics (optional)

Set these values in `.env`:

| Variable | Description |
|----------|-------------|
| `UMAMI_URL` | URL of your Umami analytics instance |
| `UMAMI_WEBSITE_ID` | Website ID from your Umami dashboard (for web app) |
| `UMAMI_STOREFRONT_WEBSITE_ID` | Website ID from your Umami dashboard (for storefront) |
| `UMAMI_SHOWCASE_WEBSITE_ID` | Website ID from your Umami dashboard (for showcase) |

---

## Language Support

The application supports **English**, **German (Deutsch)**, **French (Français)**, and **Spanish (Español)** across all platforms.

### Web App, Storefront, and Showcase

Language for the web app, storefront, and showcase is controlled by the `LANGUAGE` environment variable on their respective containers. Supported values: `en` (default), `de`, `fr`, `es`.

Set it in your `.env` file (Compose passes it to the applicable front ends):

```env
LANGUAGE=de
```

Then restart the containers for the change to take effect:

```bash
docker compose up -d
```

The language is applied at runtime — no rebuild required.

### Currency (Web App)

By default, currency follows the language setting — English uses USD ($), German/French/Spanish use EUR (€). To use a different currency independently of language, set the `CURRENCY` variable:

```env
LANGUAGE=en
CURRENCY=EUR
```

Supported values: `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`, `MXN`, `ARS`, `CLP`.

## Device Status Lifecycle

Each device moves through a defined set of statuses. The web app provides lifecycle shortcut buttons to transition between statuses without manually editing the device.

### Statuses

| Status | Meaning |
|--------|---------|
| **In Collection** | Default state — device is part of your collection |
| **For Sale** | Listed for sale (list price recorded) |
| **Pending Sale** | Sale agreed but not yet completed |
| **Sold** | Sale complete (sale date and price recorded) |
| **Donated** | Given away (donation date recorded) |
| **In Repair** | Sent out or in active repair |
| **Repaired** | Repair complete — awaiting pickup/return to owner |
| **Returned** | Repair returned to owner (return date and optional fee recorded) |

### Lifecycle Flows

```
In Collection → For Sale → Pending Sale → Sold
                        ↘
                          Sold
                        
In Collection → For Sale ← Pending Sale

In Repair → Repaired → Returned
         ← Repaired ← (back if repair incomplete)
```

**Sale flow:** `In Collection` → `For Sale` → `Pending Sale` → `Sold`  
*(Pending Sale can also step back to For Sale, or jump directly to Sold)*

**Repair flow:** `In Repair` → `Repaired` → `Returned`  
*(Repaired can step back to In Repair if the device needs more work)*

---

## Updating

```bash
# Pull new images and restart
docker compose pull
docker compose up -d
```

Migrations run automatically on startup — your data is preserved.

---

## Backup

### Database

```bash
docker exec inventory-db pg_dump -U inventory inventory > backup_$(date +%Y%m%d).sql
```

### Images

Back up the directory at `UPLOADS_PATH` alongside your database dump.

### Restore

```bash
docker exec -i inventory-db psql -U inventory inventory < backup.sql
# Then restore the uploads directory to UPLOADS_PATH
```

---

## Connecting an AI Agent via MCP

The `mcp-server/` is a [Model Context Protocol](https://modelcontextprotocol.io) server that exposes your inventory to any MCP-compatible AI agent — Claude, Cursor, etc.

The server communicates over **stdio** (not HTTP), so agents launch it as a subprocess.

### Available Tools

**Read tools:**

| Tool | Description |
|---|---|
| `list_all_devices` | Compact dump of every device — use for whole-collection reasoning |
| `search_devices` | Filtered search by text, status, category, manufacturer, tags |
| `get_device_details` | Full details for one device (notes, tasks, images) |
| `list_devices` | All devices with flexible field selection |
| `get_financial_summary` | Total spent, received, net position, profit |

**Write tools:**

| Tool | Description |
|---|---|
| `update_device` | Update any device fields (status, value, location, specs, flags, etc.) by ID |
| `add_note` | Append a timestamped note to a device |
| `add_maintenance_task` | Log a completed maintenance task (label, date, notes, optional cost) |

### Run from source

The MCP server is not part of the production Compose stack and no fork-specific MCP image is published. Run it separately from source when needed:

```bash
cd mcp-server
npm install
npx prisma generate
npm run build
```

```json
{
  "mcpServers": {
    "inventory": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://inventory:password@localhost:5432/inventory"
      }
    }
  }
}
```

### Verifying the connection

In Claude Code, run `/mcp` — you should see `inventory` listed with its tools. Then try:

> "List all my computers" — should return all devices in your collection.

---

## Template Catalog

By default, the Add Device form connects to the remote [TemplatesDifferent](https://api.templates.inventorydifferent.com) catalog — a community-maintained database of vintage Apple hardware specs, images, and estimated values. When enabled:

- Remote template results are merged with your local user-created templates in a single ranked list
- Seeded (built-in) local templates are hidden from the `/templates` admin page to avoid duplication
- The first launch fetches and caches the full catalog locally; subsequent launches use the cache (refreshed hourly or on catalog version change)

**To disable the remote catalog**, go to **Settings → External Templates** and toggle it off. The change takes effect immediately in the web app.

Alternatively, set `EXTERNAL_TEMPLATES_ENABLED=false` in your environment before the first launch — this acts as the initial default if the setting has never been saved from the Settings page.

When disabled, all local templates (including seeded ones) appear on the `/templates` admin page, and no remote catalog is fetched.

**User-created templates** (ones you add yourself) are always visible regardless of the setting — they are never hidden by the remote catalog.

---

## Troubleshooting

**Admin web shows "API unavailable"**
Check API container logs: `docker logs inventory-api`. Verify `API_URL` is reachable from inside the web container.

**Can't log in**
Confirm `AUTH_PASSWORD` is set. If `AUTH_USERNAME` is set, both fields are required at login.

**Images not showing**
Check `UPLOADS_PATH` points to a writable directory and the volume mount is correct.

**Container does not start**
Run `docker compose ps` and `docker compose logs --tail=100 <service>` to inspect its health and recent output.
