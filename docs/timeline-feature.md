# Collection Timeline Feature

## Overview

The Collection Timeline plots devices in your collection by their `releaseYear` alongside curated IBM PC, DOS, Windows, Linux, and PC-industry milestones.

Available at `/timeline` in the web admin.

---

## Architecture

### Event Data

Timeline events are stored in the `TimelineEvent` database table and served via GraphQL. Public clients can read them, while authenticated administrators can create, update, and delete them through the API.

**Schema:**
```sql
TimelineEvent {
  id          SERIAL PRIMARY KEY
  year        INT
  title       TEXT
  description TEXT
  type        TEXT       -- IBM | DOS | WINDOWS | LINUX | PC_INDUSTRY
  sortOrder   INT        -- tie-breaks within the same year
  createdAt   TIMESTAMP
  updatedAt   TIMESTAMP
}
```

**GraphQL query (public, no auth required):**
```graphql
query {
  timelineEvents {
    id year title description type sortOrder
  }
}
```

### Maintaining Events

Use the authenticated GraphQL operations `createTimelineEvent`, `updateTimelineEvent`, and `deleteTimelineEvent`. See [timeline-api.md](timeline-api.md) for the inputs and examples.

Default history is installed once by database migration. Seed runs do not recreate events deleted through the API.

### Event Types & Colors

| type | Web color |
|---|---|
| `IBM` | Blue |
| `DOS` | Slate |
| `WINDOWS` | Cyan |
| `LINUX` | Green |
| `PC_INDUSTRY` | Orange |

---

## Web Implementation

- **Page**: `web/src/app/(main)/timeline/page.tsx` — `"use client"`, `useQuery` fetching both `devices` and `timelineEvents` in one query.
- **Component**: `web/src/components/TimelineView.tsx` — pure Tailwind, no chart library. Three-column grid: devices on the left, year badge center, events on the right.
- **Menu**: Hamburger → Timeline (between Stats and Usage), auth-gated.

---

## Migration

The table was introduced by `20260308000000_add_timeline_events`. The PC-history dataset is installed by `20260921000000_replace_apple_timeline`.

Apply on a running database:
```bash
cd api && npx prisma migrate deploy
```

Or via Docker:
```bash
docker compose -f docker-compose.local.yml exec api npx prisma migrate deploy
```

---

## Default history

The default dataset contains 39 events from 1975–2005. Inventory devices are independent of these events and continue to appear according to their own release years.
