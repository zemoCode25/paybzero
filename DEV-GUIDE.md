# FlipTop Letterboxd — Developer Guide

## What is this?

A Letterboxd-style web app for the FlipTop battle rap league — the first and
largest Filipino rap battle league. Fans can browse emcees, discover battles,
track their watch history, rate battles, and contribute to the catalog.

Think: *Letterboxd, but for FlipTop.*

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Full-stack, SSR, file-based routing |
| Database | Supabase (Postgres) | Hosted Postgres + Auth + Realtime |
| ORM | Drizzle ORM | Type-safe, schema-as-code, great migrations |
| Auth | Supabase Auth | Email + Google login, zero custom auth logic |
| Storage | Cloudflare R2 | Emcee photos and assets (S3-compatible, cheaper) |
| UI | shadcn/ui + Magic UI | Component library on top of Tailwind |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## MVP feature scope

### What's in the MVP

**Emcee profiles and database**
Every registered FlipTop emcee — name, photo, bio, division, hometown.
Browseable, searchable, filterable by division.

**Battle catalog**
Every FlipTop battle — title, YouTube embed, event, date, format (1v1, 2v2,
femcee, etc.), emcees involved. Filterable by emcee, event, year, and format.

**Event pages**
FlipTop events as containers — battles grouped by card. Ahon, Isabuhay,
Zoning, Gubat, and all other series.

**User profiles**
Sign up via email or Google. Public username, avatar, activity visible
on their profile.

**Watch history**
Mark battles as watched. Build a personal viewing record.

**Favorites**
Save emcees and battles to a personal list.

**Battle ratings**
Rate any battle 1–5 stars. See the average community rating on each battle card.

**User contributions**
Submit a missing battle (pending admin review). Suggest corrections to emcee
profiles. Flag incorrect information.

### What's not in the MVP

- Freedom wall / community threads
- Head-to-head emcee stats and win/loss records
- Battle comments
- Notifications
- Mobile app

These are post-MVP. The catalog has to exist first.

---

## Data sources

| Data | Where it comes from | How often |
|---|---|---|
| Emcee profiles + photos | fliptop.com.ph (one-time scrape) | Run once, then admin corrections |
| Battles + events | YouTube Data API v3 | Weekly automated sync |
| Admin corrections | Admin panel | As needed |
| User submissions | In-app submission form | Ongoing, moderated |

**Why YouTube as the primary source for battles?**
Every FlipTop battle is on their official YouTube channel with structured
metadata already attached — title, description, upload date, playlist (event),
view count. The YouTube Data API v3 gives all of this for free, legally, with
no scraping fragility. It's the right primary source.

**Why scrape the FlipTop site for emcees?**
Emcee profile data (bios, division, hometown) only exists on the FlipTop
website. This is a one-time seed — not an ongoing pipeline. The site is
server-rendered, so a simple Cheerio + fetch script is sufficient. No headless
browser required.

---

## MVP build phases

### Phase 1 — Seed the catalog
*Do this before building any UI.*

- Run the Cheerio seed script to pull all ~180 emcee profiles from fliptop.com.ph
- Download emcee photos and upload to Cloudflare R2 (never hotlink their CDN)
- Pull all existing FlipTop battles and events from the YouTube Data API
- Manually review and fix edge cases via the admin panel

**Why first?** A beautiful front page with no data is worthless. The catalog
is the product. Build the data pipeline before the UI that surfaces it.

### Phase 2 — Admin panel
Set up Directus or Payload CMS pointed at your Supabase Postgres database.
This gives you an instant CRUD interface for emcees, battles, and events —
plus a moderation queue for user submissions.

The admin panel's job is **corrections and moderation**, not data entry.
New battles from new events are handled automatically by the YouTube sync.

### Phase 3 — Public browse
- Emcee listing and profile pages
- Battle catalog with filters
- Event pages
- Search

### Phase 4 — User layer
- Auth (email + Google via Supabase)
- User profiles
- Watch history
- Favorites
- Battle ratings

### Phase 5 — Community contributions
- User battle submission form
- Emcee profile edit suggestions
- Content flagging
- YouTube cron job goes fully live for ongoing sync

---

## Architecture decisions (and why)

**Drizzle owns the schema, not Supabase migrations.**
Supabase has its own migration system. Drizzle has its own. Running both on
the same database causes conflicts. Drizzle is the sole owner of schema
definitions and migrations. Never use the Supabase migration UI.

**All scraped and external data is validated before hitting the database.**
Every record from the seed script and YouTube sync is validated with Zod.
Bad records are logged and skipped — they never reach production tables.

**Photos are stored in R2, not hotlinked.**
Hotlinking the FlipTop CDN means any reorganization on their end breaks every
photo in the app overnight. Photos are copied to R2 on seed day. We own them.

**Staged writes, not direct production writes.**
The seed script writes to a staging table first. Data is reviewed, then
promoted to production. This protects data quality during the initial catalog
build.

**Admin panel = existing tool, not custom-built.**
Directus or Payload CMS provides a full admin UI from the existing schema in
days, not weeks. No custom admin interface is built from scratch for MVP.

---

## Local setup

```bash
# 1. Clone and install
git clone <repo>
cd fliptop-letterboxd
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in Supabase, R2, and YouTube API keys

# 3. Run database migrations
pnpm drizzle-kit migrate

# 4. Seed the database (emcees first, then battles)
pnpm tsx scripts/seed-emcees.ts --dry-run    # preview first
pnpm tsx scripts/seed-emcees.ts              # run for real

pnpm tsx scripts/sync-battles.ts --dry-run
pnpm tsx scripts/sync-battles.ts

# 5. Start dev server
pnpm dev
```

---

## Contribution model

**Admins can:**
- Add, edit, and delete emcees, battles, and events directly
- Approve or reject user-submitted battles
- Manage content flags

**Users can:**
- Submit a missing battle (goes to pending review)
- Suggest edits to an emcee profile (goes to pending review)
- Flag incorrect information
- Rate battles and track their watch history

Nothing a user submits goes live without admin approval.

---

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# YouTube Data API
YOUTUBE_API_KEY=

# Admin panel URL
ADMIN_URL=
```

---

## Key decisions still to be made

- **Admin panel:** Directus (separate service, points at existing DB) vs.
  Payload CMS (embedded in Next.js app, more control). Both are valid — pick
  based on how much you want in one repo.
- **Rating display:** Show average rating, or also show rating distribution
  (like Letterboxd's histogram)? Post-MVP, but worth noting early.
- **User profile visibility:** Are watch history and favorites public by default,
  or private? Decide before building the user layer.
