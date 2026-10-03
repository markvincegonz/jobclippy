# Tasks

## 1. Centralized Configuration & Environment URLs

- [x] 1.1 Create `extension/config.js` declaring `CONFIG.API_BASE_URL` resolved from environment variables (`NEXT_PUBLIC_API_URL`) with fallback.
- [x] 1.2 Include `extension/config.js` in `extension/manifest.json` and `extension/popup/popup.html` and replace hardcoded `http://localhost:3000` references.
- [x] 1.3 Ensure `.env`, `.env.local`, and `.env.example` include `NEXT_PUBLIC_API_URL=http://localhost:3000`.

## 2. Direct Chrome Extension Database Clipping

- [x] 2.1 Update `extension/popup/popup.js` to dispatch `POST ${CONFIG.API_BASE_URL}/api/jobs` directly on click. Verify created job is returned with ID.
- [x] 2.2 Add offline handling and retry banner in popup if backend server is unreachable.
- [x] 2.3 Notify open dashboard tabs via custom event/message to revalidate jobs without directly modifying browser `localStorage`.

## 3. Database-First Web App Store

- [x] 3.1 Refactor `src/lib/job-store.tsx` to load initial opportunities directly from `GET /api/jobs` and eliminate `localStorage` as the primary persistent data store.
- [x] 3.2 Wire `addJob`, `updateJob`, `moveStage`, `addNote`, and `deleteJob` to execute real mutations directly against `/api/jobs` and `/api/jobs/[id]`.
- [x] 3.3 Update `resetToSeeds` in `src/lib/job-store.tsx` to trigger database re-seed via API or re-query.

## 4. PostgreSQL Database-Backed Extraction Cache

- [x] 4.1 Create `src/lib/cache/prisma-store.ts` implementing `ExtractionCacheStore` using `prisma.extractionCache`.
- [x] 4.2 Replace `file-store.ts` in `src/app/api/extract/route.ts` with `PrismaExtractionCacheStore` and verify cached queries hit PostgreSQL.
- [x] 4.3 Remove deprecated `.jobclippy/extraction-cache.json` file.

## 5. Verification & Full Test Suite

- [x] 5.1 Add automated test verifying direct extension-to-database persistence in `tests/extension-db-direct.spec.ts`.
- [x] 5.2 Execute full Playwright test suite (`npx playwright test`) and verify all tests pass.
- [x] 5.3 Update `ROADMAP.md` tracking the direct database persistence implementation.
