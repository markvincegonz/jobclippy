# Design: Direct PostgreSQL Persistence & Environment-Driven Extension Pipeline

## Context

See `proposal.md` for motivation. With Dockerized PostgreSQL and Prisma ORM established, the system has a production database and initial seed pipeline (`prisma/seed.ts`). However, the Chrome Extension still saves to a `localStorage` bridge rather than calling `POST /api/jobs`, string URLs like `http://localhost:3000` are hardcoded, and the web app still maintains temporary `localStorage` arrays. This design unifies all ingestion paths directly into PostgreSQL.

## Goals / Non-Goals

**Goals:**
- Provide a direct HTTP `POST` save path from the Chrome Extension popup to `/api/jobs`.
- Centralize API URL resolution in `extension/config.js` reading from environment configuration rather than hardcoded `http://localhost:3000`.
- Retire temporary `localStorage` (`jobclippy_jobs_v1`) as the primary data store in `src/lib/job-store.tsx`; load directly from `/api/jobs` and mutate PostgreSQL.
- Replace disk file cache (`.jobclippy/extraction-cache.json`) with Prisma's `ExtractionCache` model in PostgreSQL.
- Guarantee that whenever a job is clipped or created, it appears immediately in PostgreSQL and Prisma Studio.

**Non-Goals:**
- Multi-user authentication / JWT session tokens (deferred to Phase 10).

## Decisions

### 1. Direct Extension API Persistence
- **Rationale**: Relying on a content script bridge to inject into a dashboard tab's `localStorage` is fragile—if the dashboard tab isn't open, the job is stuck in extension storage. Calling `POST /api/jobs` directly persists the record in PostgreSQL immediately, accessible by any client tab.
- **Implementation**: In `extension/popup/popup.js`, the save button triggers `fetch(`${CONFIG.API_BASE_URL}/api/jobs`, ...)`. If the web dashboard tab is currently open, it fires a lightweight refresh signal to update the board without mutating `localStorage`.

### 2. Centralized Extension Configuration
- **Rationale**: Hardcoded `http://localhost:3000` strings break when testing on different ports or deploying to staging/production.
- **Implementation**: Create `extension/config.js` declaring `CONFIG.API_BASE_URL`, overridable by `chrome.storage.local` settings or build variables.

### 3. Database as Primary Web App Store
- **Rationale**: With `prisma/seed.ts` seeding PostgreSQL, holding a parallel copy in `localStorage` creates synchronization drift and race conditions.
- **Implementation**: In `src/lib/job-store.tsx`, initialize store state from `GET /api/jobs`. When jobs are added, edited, moved, or deleted, mutations hit `/api/jobs` directly.

### 4. Prisma-Backed Extraction Cache
- **Rationale**: An `ExtractionCache` table is already defined in `prisma/schema.prisma`. Storing cached extractions in PostgreSQL ensures persistence across container restarts and eliminates ephemeral `.jobclippy/*.json` disk files.
- **Implementation**: Create `src/lib/cache/prisma-store.ts` implementing `ExtractionCacheStore` using `prisma.extractionCache`.

## Risks / Trade-offs

- **[Backend Dev Server Offline when Clipping]** → If Next.js is not running, the extension cannot reach `/api/jobs`.
  *Mitigation*: The extension catches network errors, notifies the candidate in the popup ("⚠️ Server unreachable at [URL]"), and saves to `chrome.storage.local` pending queue for retry when the server comes back online.

## Migration Plan

1. Create `extension/config.js` and update `popup.html`, `popup.js`, and `service-worker.js`.
2. Update `extension/popup/popup.js` to dispatch `POST ${CONFIG.API_BASE_URL}/api/jobs`.
3. Refactor `src/lib/job-store.tsx` to load from and mutate `/api/jobs` directly.
4. Implement `src/lib/cache/prisma-store.ts` and wire into `/api/extract`.
5. Run automated Playwright tests and verify Prisma Studio reflection.
