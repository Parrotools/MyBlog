# Project Progress

_Last updated: 2026-07-26 (post-session follow-ups included)_

## Session follow-ups (after the CMS build)

- **Intro plays once per browser session**: finishing or skipping the intro
  sets a session cookie (`intro_seen`); the home page server-skips the intro
  entirely when present (no overlay flash). Closing the browser resets it.
- **Page transition animations**: every route navigation enters with a
  fade + rise (`template.tsx` in both the site and admin, reduced-motion
  respected).
- **Last hardcoded widgets are now DB-driven and dashboard-editable**
  (admin → Profile): avatar image, player level/XP bar, the 9 hotbar slots
  (label/glyph/colors/lore via line format), and the About-page quest-log
  timeline. Verified in the browser.
- **Intro overlay bug fixed**: the page-transition animation's `transform`
  made the wrapper the containing block for the fixed intro overlay (it sat
  64px down, page-height tall, scrolling with content). Fix: animate `top`
  instead of `transform`, `backwards` fill so the stacking context
  dissolves, and the overlay inlines a style hiding `.site-header` while
  mounted. `/?intro=1` added as a force-replay URL.
- **Poker-fan "character cards"** on About (inspired by JIEJOE's
  poker-slides): interests render as a wide fanned hand; clicking any card
  draws it to the front with a slow 3D poker flip (card-back design shows
  mid-spin). Data comes from the DB interests setting.
- **Page-jump curtain** (inspired by JIEJOE's jump-animation, no-refresh
  flavor): internal link clicks raise a full-screen curtain with a spinner
  ring + hopping grass block, the route changes underneath, the curtain
  drops away. Skips external/file links, modifier-clicks and
  reduced-motion; safety timeout prevents a stuck curtain.
- Real contact info everywhere (DB + seeds): 2261216827@qq.com,
  github.com/Parrotools.

## What has been completed

### Phase 1 — 3D intro (approved by Zige)
- Real-3D Minecraft-style intro: HD procedural-textured stone wall (instanced
  rounded blocks), 3×3 grass-block loading grid with physics drops, TNT with
  real rigid-body physics (cannon-es), explosion with colliding debris /
  smoke / dust, camera flythrough into the site. Skip button,
  reduced-motion/no-WebGL fallback, background-tab pausing.

### Phase 2 — Public site
- Modern HD dark/light design (next-themes toggle, token-based CSS).
- Unique hover systems: Minecraft item tooltips (hotbar), conic border sweep
  on cards, block "hop", hearts pop, XP-bar surge, primed-TNT flash, shine
  and underline sweeps, button press effects.
- Pages: home (hero + player stats + hotbar + popular/latest + categories),
  posts list with category/tag filters, article pages (KaTeX math, Shiki
  code highlighting light+dark, tables, scrollspy TOC, share links,
  prev/next, view counts), categories, tag pages, personalized About
  (profile, interests, projects, contact), themed error pages
  (404 void / 403 locked / 500 creeper / 400 redstone — real status codes),
  RSS `/feed.xml`, `sitemap.xml`, `robots.txt`, full SEO metadata.

### Phase 3 — Full-stack CMS (this session's final state)
- **Database**: Prisma 6 + SQLite (`prisma/dev.db`), schema is
  Postgres-compatible. Models: User, Session, Article, Category, Tag
  (M2M), Project, Image, Setting. Seed script imports the 7 original MDX
  articles, categories, projects, profile (`npm run db:seed`).
- **Auth**: bcrypt password hashing, DB-backed sessions, httpOnly cookie,
  `proxy.ts` gate for `/admin`, real check in the admin layout, password
  change (invalidates other sessions).
- **Admin dashboard** (`/admin`): overview stats, posts CRUD with
  CodeMirror markdown editor + live preview (production pipeline via
  `/api/preview`), draft/published/archived workflow, categories / tags /
  projects CRUD, image upload manager (`/api/uploads` → `uploads/` dir →
  served by `/uploads/[...file]`), profile & interests editor, site
  settings, security settings.
- **APIs**: `/api/search` (DB full-text), `/api/views/[slug]` (view
  beacon), `/api/preview`, `/api/uploads`.
- **Public site is now fully DB-driven** — no hardcoded articles,
  categories, tags, profile, projects or site copy.
- **Verified end-to-end** with an automated browser: login → write post
  (math + code) → live preview → publish → appears on home/search/article
  page → view count increments. Zero console errors. `npm run build` and
  `npm run lint` are clean.
- Deployment scaffolding: multi-stage `Dockerfile`, `docker-compose.yml`
  (SQLite volume default, Postgres service commented), `.dockerignore`,
  `ARCHITECTURE.md`.

## Current task

Nothing in flight — the session ended with the E2E verification passing and
the production server running locally on port 3100 (`npx next start -p 3100`).
Admin login: username `zige`, password in `.env` (`ADMIN_PASSWORD`).

## Unfinished problems

1. **Docker untested** — no Docker on this machine; `Dockerfile` /
   `docker-compose.yml` are written but have never been built. Expect minor
   fixes on first real build (especially Prisma engine copying).
2. **Prisma pinned to v6** — v7 introduced a new config format
   (`prisma.config.ts`); the `package.json#prisma.seed` key prints a
   deprecation warning. Migrate when convenient.
3. **Placeholders to replace**: GitHub/X URLs (admin → Profile),
   `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, and the seeded admin password
   (change via admin → Settings) before any deployment.
4. **`content/posts/*.mdx` is now seed-only** — editing those files no
   longer changes the site; the DB is the source of truth.
5. ~~About-page quest log and hotbar hardcoded~~ — resolved in follow-up;
   all profile widgets are now DB-driven.
6. Benign Turbopack build warning about file tracing in
   `app/lib/storage.ts` (uploads route) — cosmetic.
7. Search is SQL `contains` ranking — fine at this scale; Meilisearch is
   the planned upgrade path behind the same `/api/search` contract.
8. Category admin: delete buttons sit in a list below the edit cards —
   works, but the UX could be tightened.

## Next steps

1. Change the admin password + fill real GitHub/X links via the dashboard.
2. Deploy: VPS + Docker (`docker compose up`), set `SESSION_SECRET`,
   `NEXT_PUBLIC_SITE_URL`; or Postgres by switching the Prisma provider and
   re-creating migrations.
3. V2 features (user roadmap): comments (Giscus — needs the GitHub repo),
   likes, analytics dashboard (page-view events table exists conceptually;
   viewCount is already tracked per article).
4. Make About-page quest log / advancements / hotbar editable from the
   dashboard (same Setting-JSON pattern as profile/interests).
5. V3 (user roadmap): article version history (`ArticleRevision` table),
   AI summaries / Q&A / RAG knowledge base, Meilisearch, S3 storage adapter.
