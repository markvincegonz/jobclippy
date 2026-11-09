# Proposal: Eliminate Ghost Jobs and Implement Database Card Positioning

## Why

When JobClippy is opened in multiple browsers or tabs, the job datasets diverge and deleted jobs resurrect as "ghost items." This occurs because `src/lib/job-store.tsx` caches jobs in browser `localStorage` and executes a reconciliation loop (`localOnly = current.filter(!dbIds.has(id))`) that treats absent database jobs as local-only items and writes them back. Furthermore, card reordering across Kanban stages is stored strictly in client memory/`localStorage` because the database schema lacks a `position` field. Eliminating client `localStorage` caching for jobs and persisting card positioning directly to PostgreSQL ensures all browsers and sessions reflect the identical, authoritative database state.

## What Changes

- **Purge Client-Side Job LocalStorage**: Completely remove `STORAGE_KEY = "jobclippy_jobs_v1"`, `getStoredJobs()`, `saveStoredJobs()`, and the `localOnly` resurrection logic from `src/lib/job-store.tsx`. Jobs will reside solely in an in-memory React state hydrated directly from `GET /api/jobs`.
- **Preserve Non-Job UI Preferences**: Retain `localStorage` exclusively for lightweight UI preferences (such as `jobclippy_sidebar_collapsed_v1` and `next-themes` dark/light preference).
- **Prisma Schema `position` Field**: Add a `position Float @default(0)` field to the `Job` model with an index on `[stage, position]`.
- **Database-Backed Card Ordering**: Update `GET /api/jobs` to sort by `stage asc, position asc` (or `position asc, createdAt desc`), and update `POST /api/jobs` and `PATCH /api/jobs/[id]` to accept and persist `position`.
- **Kanban Drag-and-Drop Position Persistence**: Update `reorderJob` in `job-store.tsx` to compute updated positions (fractional midpoint index) and persist stage/position updates to `/api/jobs/[id]`.
- **Extension Bridge In-Memory Sync**: Update `extension/content/bridge.js` to dispatch in-memory custom events (`CustomEvent("jobclippy:synced")`) to trigger dashboard refetches without reading from or writing to `localStorage`.

## Capabilities

### Modified Capabilities
- `database-persistence`: Update requirements to enforce `position` column persistence and eliminate local client cache resurrection, establishing PostgreSQL as the single source of truth.
- `job-board`: Update requirements to enforce persistent drag-and-drop card ordering stored in the database and synchronized across browser sessions.

## Impact

- **Database**: Prisma schema migration/db push adding `position Float @default(0)` to the `jobs` table.
- **Backend APIs**: `/api/jobs`, `/api/jobs/[id]`, and seed data updated to handle `position`.
- **Frontend Store**: `src/lib/job-store.tsx` simplified to purely in-memory state with optimistic REST mutations.
- **Extension**: `extension/content/bridge.js` decoupled from `localStorage`.
- **Tests**: Playwright tests verifying cross-browser state consistency and database persistence.

