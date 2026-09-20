Retro Inventory Different Fork Plan

Personal fork plan for a large retro hardware/software collection.

Upstream: wottle/InventoryDifferent2
License: CC BY-NC 4.0 — modifications are allowed for non-commercial use, with attribution.
Last reviewed against upstream: 2026-09-17

1. Goal

Use Retro Inventory Different as a simple, Docker-based inventory system for a large retro hardware/software collection, while keeping the fork maintainable and reasonably easy to sync with the InventoryDifferent2 upstream project.

Main principles:

Keep the application simple.

Prefer UI/application changes over database-schema changes when possible.

Never develop directly against the production database.

Every database-schema change must have a migration.

Full backup/restore must work before large amounts of collection data are entered.

Keep custom changes split into small feature branches/commits so upstream updates remain manageable.

2. Changes we want

2.1 Full Backup / Full Export — FIRST PRIORITY

The existing application export is useful, but we want an additional complete backup format that does not depend on a hardcoded list of device fields.

The full backup should contain:

inventory-backup-YYYY-MM-DD-HHMM.zip
│
├── manifest.json
│
├── database/
│   ├── database.dump
│   ├── schema.sql
│   └── tables/
│       ├── <table-1>.jsonl
│       ├── <table-2>.jsonl
│       └── ...
│
├── uploads/
│   └── complete copy of uploaded files/images
│
└── metadata/
    ├── migrations.txt
    └── checksums.json

Requirements

database.dump

A complete PostgreSQL dump for exact disaster recovery.

Purpose:

same application version
        +
same DB schema
        +
database.dump
        =
exact restore

schema.sql

Export the actual PostgreSQL schema at backup time.

This is important if our fork later changes tables, columns, enums, indexes, etc.

tables/*.jsonl

Export every user/application table dynamically, including every column that exists at backup time.

The exporter must NOT contain code like:

export:
  fieldA
  fieldB
  fieldC

Instead it should inspect PostgreSQL and export the actual tables/columns.

This means a future field such as:

shippingCost
insuredValue
restorationCost
myCustomField

is automatically included without modifying the backup exporter.

uploads/

All uploaded images/files must be included.

manifest.json

Example:

{
  "backupFormat": 1,
  "createdAt": "2026-09-17T20:30:00Z",
  "application": "Retro Inventory Different",
  "gitCommit": "abc1234",
  "databaseEngine": "postgresql",
  "includeUploads": true
}

Also record, if available:

application version

current Git commit

current migration list/version

PostgreSQL version

backup format version

checksums.json

SHA-256 checksum for files in the backup.

Restore modes

We want two different concepts.

Full Restore

Exact disaster recovery:

database.dump + uploads

Used when restoring the same or compatible version of the fork.

Import / Migration Restore

Uses the portable JSONL files.

Purpose:

old/custom schema
       ↓
mapping / importer
       ↓
new schema

This protects the collection even if the schema changes heavily in the future.

Safety

Before any destructive restore:

warn clearly

require explicit confirmation

recommend/offer a pre-restore backup

do not overwrite the production DB silently

2.2 Financials -> Collection Value

The current Financials page is focused too much on monthly income/expenses.

For this collection, the main question is:

What is the collection worth, and how much has been invested in it?

Rename/rework the Financials view toward Collection Value.

Initial dashboard:

Current Estimated Value
Total Acquisition Cost
Repair / Maintenance Cost
Total Invested
Unrealized Gain / Difference
Items With Estimated Value / Total Items

Example:

Current Estimated Value       €38,450
Total Acquisition Cost        €17,820
Repair / Maintenance Cost      €2,340
Total Invested                €20,160
Value vs Invested             +€18,290
Items With Value              143 / 178

Add:

Value by category

Computers
Monitors
Peripherals
Software
Parts
Accessories
Other

Value history

Use the existing value snapshot/history mechanism where possible.

Target:

2024    €18,000
2025    €27,500
2026    €38,450

Implementation rule

Do not change the DB schema unless the existing fields are insufficient.

First attempt should reuse existing:

acquisition price

estimated value

value snapshots

maintenance costs

sale values where relevant

2.3 Timeline

The current /timeline is strongly Apple-oriented.

We want a general personal-computing timeline, covering topics such as:

IBM PC / PC XT / PC AT

DOS

Microsoft Windows

Intel

AMD

Apple

Commodore

Amiga

Atari

CP/M

Unix/Linux

important storage/media developments

important CPU generations

important graphics/sound developments

networking / Internet milestones

selected workstation/server developments where relevant

Stage 1

Replace the Apple-heavy seed data with a balanced general computer-history dataset.

Stage 2

Add a Timeline Manager to the admin UI:

Add Event
Edit Event
Delete Event
Reorder Event
Enable / Disable Event

Fields should at minimum include:

year
title
description
type/category
sortOrder

If possible, avoid changing the current TimelineEvent schema unless a new field is genuinely needed.

Important

Seed data must not unexpectedly recreate deleted default timeline items on a normal application restart/update.

2.4 Greek Localization

Add Greek language support:

LANGUAGE=el
CURRENCY=EUR

Translate the web/admin interface to Greek.

Keep translation strings separate from application logic.

Requirements:

English remains available.

Greek must be selectable in the same way as existing languages.

Do not hardcode Greek strings directly into components unless unavoidable.

Currency remains independently configurable.

Greek date/number formatting should be tested.

Start with the admin/web UI.

Storefront translation can be evaluated separately.

2.5 AI Image Generation

Current upstream AI image generation is optional and uses an OpenAI API key.

For now:

do not make this a first-phase fork change

real collection photos remain the source of truth

AI-edited studio images can be generated externally and uploaded manually

Possible future work:

configurable image-generation provider

local/self-hosted image backend

separate LIGHT and DARK image presets

preserve original hardware exactly when editing photographs

This stays future/optional until the core inventory changes are stable.

2.6 Docker-first operation

The final fork must remain easy to run with Docker.

We want two completely separate environments:

PRODUCTION
  real collection
  persistent PostgreSQL volume
  persistent uploads
  stable fork branch/image

DEVELOPMENT
  test/copy database
  separate PostgreSQL volume
  separate uploads
  source-built containers

Never point development containers at the production database.

3. Git / Fork Strategy

Upstream repository:

https://github.com/wottle/InventoryDifferent2

3.1 Create the GitHub fork

On GitHub:

wottle/InventoryDifferent2
        ↓
Fork
        ↓
<your-github-user>/InventoryDifferent2

Keep the upstream attribution/license intact.

3.2 Clone our fork

git clone https://github.com/<your-github-user>/InventoryDifferent2.git
cd InventoryDifferent2

Check:

git remote -v

Initially it should show our fork as origin.

3.3 Add the original project as upstream

git remote add upstream https://github.com/wottle/InventoryDifferent2.git
git fetch upstream

Verify:

git remote -v

Expected conceptually:

origin    -> our fork
upstream  -> original InventoryDifferent2

4. Branch Strategy

Keep main as the stable version of our fork.

Do not develop features directly on main.

Use one branch per change:

main
│
├── feature/full-backup
├── feature/collection-value
├── feature/timeline-manager
├── feature/greek-localization
└── feature/docker-dev

Example:

git switch main
git pull --ff-only origin main

git switch -c feature/full-backup

Work, test and commit there.

When complete:

git switch main
git merge --no-ff feature/full-backup
git push origin main

Then delete the finished branch if desired:

git branch -d feature/full-backup
git push origin --delete feature/full-backup

5. Commit Strategy

Make small commits.

Good:

add full backup manifest
export postgres schema with full backup
export all tables as jsonl
include uploads in full backup
add restore validation

Bad:

changed everything

Before changing database schema, commit the working state first.

Example:

git status
git add .
git commit -m "checkpoint before collection value schema changes"

6. Keeping the Fork Updated from Upstream

Fetch upstream:

git fetch upstream

Review new upstream commits:

git log --oneline main..upstream/main

When ready to integrate them:

git switch main
git pull --ff-only origin main
git merge upstream/main

Resolve conflicts if there are any.

Then run tests and only after successful testing:

git push origin main

For this long-lived fork, prefer explicit merge commits from upstream rather than rebasing the production history.

That makes it easier to see:

our changes
vs
upstream changes

7. Development Environment

Upstream's documented developer setup uses:

Node.js 18+

Docker / Docker Compose for PostgreSQL

API on port 4000

web UI on port 3000

storefront on port 3001

The upstream docker-compose.build.yml builds from source, but it is currently designed around a Traefik deployment.

Because we want a simple Docker-only workflow, one of our first small changes should be:

docker-compose.dev.yml

It should:

build api/ locally

build web/ locally

optionally build storefront/

run PostgreSQL

expose direct localhost ports

use development-only Docker volumes

use development-only uploads

not require Traefik

never reuse production volumes

Target usage:

docker compose -f docker-compose.dev.yml up -d --build

Target services:

http://localhost:3000   web
http://localhost:3001   storefront
http://localhost:4000   API/GraphQL

8. Production and Development Data Separation

Example layout:

/data/inventorydifferent/
│
├── prod/
│   ├── uploads/
│   └── backups/
│
└── dev/
    ├── uploads/
    └── backups/

Docker volumes must also have different names/projects.

For example:

docker compose -p inventory-prod ...
docker compose -p inventory-dev ...

This avoids accidentally sharing:

PostgreSQL volumes

networks

container names

uploads

between environments.

9. Before We Start Entering the Full Collection

Do this first:

Fork repository.

Clone fork.

Add upstream.

Confirm the unmodified project builds/runs.

Create feature/full-backup.

Implement Full Backup.

Test Full Backup.

Restore that backup into a completely empty test instance.

Verify:

device count

images

notes

maintenance

custom fields

values

timeline

settings

relationships

all other tables

Only after successful restore testing, start loading the large real collection.

10. Database Change Rules

When a feature needs a schema change:

schema.prisma
      ↓
Prisma migration
      ↓
test on DEV DB
      ↓
full backup
      ↓
test migration using COPY of production DB
      ↓
production

Never manually change production tables without recording the change as a migration.

Before applying a migration to production:

1. Full Backup
2. Verify backup completed
3. Test migration on DEV copy
4. Apply migration to PROD
5. Verify application

11. Backup Before Each Upgrade

Before merging/deploying a new fork version to production:

FULL BACKUP
    ↓
new Docker image
    ↓
automatic/manual DB migration
    ↓
application validation

Minimum validation:

login
device list
device details
images
search/filter
financial/value screen
timeline
maintenance
custom fields
export

If a migration fails, stop and restore; do not keep applying ad-hoc SQL fixes to production.

12. Test Strategy

Upstream documents these tests:

cd api && npm test
cd web && npm test
cd mcp-server && npm test

End-to-end:

docker compose -f docker-compose.test.yml up -d
npx playwright test

For every custom feature, add tests where practical.

Most important custom tests:

Backup

backup contains all DB tables

backup contains newly added columns without exporter modification

backup contains uploads

checksum validation works

restore into empty DB works

restore preserves relationships

Financial / Collection Value

totals match raw DB values

missing estimated values are handled correctly

maintenance totals are correct

sold items are handled consistently

Timeline

create/edit/delete

ordering

no duplicate seed regeneration

Greek

no untranslated core UI strings

EUR formatting

date formatting

no broken layouts caused by longer Greek text

13. Suggested Implementation Order

Phase 0 — Baseline

[ ] Fork repository
[ ] Clone
[ ] Add upstream
[ ] Run original version successfully
[ ] Record upstream commit used as baseline

Phase 1 — Safety

[ ] docker-compose.dev.yml
[ ] Full Backup
[ ] Full Restore
[ ] Portable JSONL export
[ ] Backup validation/checksums
[ ] Restore test into clean DEV instance

Phase 2 — Collection Value

[ ] Replace monthly financial focus
[ ] Current estimated collection value
[ ] Total acquisition cost
[ ] Maintenance cost
[ ] Total invested
[ ] Value difference
[ ] Category breakdown
[ ] Value history

Phase 3 — Timeline

[ ] Replace Apple-heavy seed data
[ ] General computing timeline
[ ] Timeline Manager UI
[ ] Add/Edit/Delete/Reorder

Phase 4 — Greek

[ ] Add `el` locale
[ ] Translate admin UI
[ ] LANGUAGE=el
[ ] EUR formatting
[ ] Review untranslated strings

Phase 5 — Optional

[ ] AI image provider abstraction
[ ] LIGHT/DARK image presets
[ ] Storefront changes

14. First Working Session

The first session should not modify Financials or Timeline.

Do only this:

# Fork on GitHub first

git clone https://github.com/<your-github-user>/InventoryDifferent2.git
cd InventoryDifferent2

git remote add upstream https://github.com/wottle/InventoryDifferent2.git
git fetch upstream

git status
git remote -v
git log -1 --oneline

Then create the first branch:

git switch -c feature/full-backup

First technical task:

Design and implement the full backup/export system before changing application data structures.

That gives us a safe recovery point for every later customization.

15. Important Upstream Facts

Verified from the upstream project documentation at the time this file was written:

Retro Inventory Different uses TypeScript across API/web/storefront.

PostgreSQL is used for the database.

Prisma is used by the API.

The upstream project automatically runs database migrations in its Docker deployment.

The upstream development guide explicitly recommends forking and creating feature branches from main.

Upstream tests include unit tests and Playwright E2E tests.

docker-compose.build.yml supports building the application from source.

The build compose currently expects Traefik, hence our planned simple docker-compose.dev.yml.

The project is CC BY-NC 4.0 licensed.

Relevant upstream files:

README.md
CONTRIBUTING.md
LICENSE.md
docker-compose.build.yml
docker-compose.simple.yml
.env.example
api/prisma/schema.prisma
api/prisma/migrations/

16. Rule for This Fork

Before adding a feature, ask:

Can this be implemented without changing the database schema?

If yes, prefer that route.

If no:

migration + backup + restore test

No exception for production data.
