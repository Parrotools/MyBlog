# Architecture — Zige's Blog Platform

A full-stack personal CMS + blog. One Next.js 16 application serves both the
public site and the backend: route handlers + server actions form the API
layer, Prisma is the data layer, and an admin dashboard manages all content.
Nothing user-facing is hardcoded — articles, categories, tags, projects and
profile all live in the database.

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js app (one deployable service)                        │
│                                                             │
│  Public site (RSC)        Admin dashboard (/admin)          │
│  home / posts / cats /    posts CRUD / categories / tags /  │
│  tags / about / search    projects / profile / images /     │
│  feed.xml / sitemap       settings   (session-protected)    │
│        │                        │                           │
│  ──────┴────────────────────────┴──────────                 │
│  Server actions + route handlers (the API)                  │
│   /api/search  /api/views  /api/preview  /api/uploads       │
│   /uploads/[...] (file serving)   proxy.ts (auth gate)      │
│        │                                                    │
│  lib/: auth (sessions, bcrypt) · markdown (unified          │
│  pipeline) · content (queries) · storage (uploads)          │
│        │                                                    │
│  Prisma ORM ──► SQLite (dev) / PostgreSQL (prod)            │
│  Local disk uploads ──► S3-compatible storage (prod option) │
└─────────────────────────────────────────────────────────────┘
```

## Stack decisions (and why)

| Concern | Choice | Rationale |
| --- | --- | --- |
| Backend | Next.js route handlers + server actions | One process, one deploy; the RSC data flow *is* a backend. A separate Go/NestJS service can be split out later — the data layer is isolated in `lib/`. |
| Database | Prisma ORM; SQLite in dev, PostgreSQL-ready | No Docker on the dev machine, so SQLite runs today with zero install. The schema avoids SQLite-only or PG-only features; switching = change `datasource` provider + `DATABASE_URL`, re-run migrations. |
| Auth | Session cookies + bcrypt, sessions in DB | Same-origin admin panel → cookies beat JWT (revocable, httpOnly, no token storage in JS). `proxy.ts` does an optimistic cookie check; the admin layout does the real DB-backed check. |
| Markdown | unified pipeline (remark-gfm, math → KaTeX, Shiki highlight) rendering to HTML | Same function powers the public article page, the editor's live preview and `/api/preview`. Plain markdown (not MDX-evaluated) so user-typed content can never crash the React tree. |
| Editor | CodeMirror 6 (markdown mode) + live preview | Real editing UX: syntax highlight, tabs, large docs. |
| Images | Upload API → local `uploads/` dir, served by a route handler, records in DB | Never committed to source. The storage functions are isolated so an S3 adapter can replace disk writes without touching callers. |
| Search | SQL full-text-ish search endpoint (`/api/search`) | Zero-infra now; Meilisearch is a drop-in upgrade behind the same endpoint. |
| Views | `viewCount` column + beacon endpoint | "Popular posts" ranks by real views. |

## Data model

```
User ──< Session
Category ──< Article >──< Tag        (implicit M2M join table)
Project                              (portfolio entries, ordered)
Image                                (upload records)
Setting (key → JSON)                 (profile, interests, site config)
```

Article: `slug title summary content coverImage icon accent status(DRAFT|
PUBLISHED|ARCHIVED) featured viewCount publishedAt createdAt updatedAt`.

## Request flows

**Publishing:** login → session cookie → `/admin/posts/new` → CodeMirror +
live preview (`/api/preview` renders the exact production pipeline) → server
action validates + writes via Prisma → public pages render it on next request
(public pages are dynamic; the DB is the source of truth).

**Public article:** RSC queries Prisma by slug (published only; admins can
open drafts) → markdown → HTML on the server → client beacon POSTs
`/api/views/:slug` once per session to count the view.

**Auth:** login action verifies bcrypt hash → random 256-bit token stored in
`Session` + set as httpOnly cookie (7 days) → `proxy.ts` bounces cookieless
requests to `/admin/login` → admin layout loads the session row or redirects.

## Deployment

`next.config.ts` uses `output: "standalone"`. Provided: `Dockerfile`
(multi-stage), `docker-compose.yml` (app + optional Postgres), nginx sample.
Set `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`; run
`prisma migrate deploy` on release.

## Deliberately deferred

Comments (Giscus/Waline), analytics dashboards, multi-user roles, article
version history, AI summaries/RAG — the schema and layering leave room for
each (e.g. versions = an `ArticleRevision` table; analytics = event table).
