# Proposal

## Why

Currently, when candidates clip job opportunities using the Chrome Extension, entries are sent through an internal background bridge that writes strictly to browser `localStorage` and never issues a network request to `POST /api/jobs`. Consequently, opportunities clipped from the extension do not appear in the PostgreSQL database or Prisma Studio. Furthermore, the extension and test files hardcode `http://localhost:3000`, and the web app still maintains temporary `localStorage` and file-based caching despite having a dedicated database seeder (`prisma/seed.ts`).

Migrating the extension and web app to treat PostgreSQL as the direct single source of truth, removing temporary `localStorage` and file cache reliance, and driving API endpoints via environment variables ensures reliable, production-ready data persistence.

## What Changes

- **Direct Extension-to-Database Clipping**: Update `extension/popup/popup.js` to dispatch `POST /api/jobs` directly to the Next.js backend upon clipping, inserting the new job and notes straight into PostgreSQL.
- **Environment-Driven Extension Config**: Add `extension/config.js` to centralize `API_BASE_URL` using environment configuration (`process.env.NEXT_PUBLIC_API_URL` or dynamic options) instead of hardcoding `http://localhost:3000`.
- **Eliminate Temporary Local Storage**:
  - Refactor `src/lib/job-store.tsx` to load initial data directly from PostgreSQL (`/api/jobs`) and mutate the database directly, removing `localStorage` (`jobclippy_jobs_v1`) and in-memory static arrays as the primary store.
  - Rely on `prisma/seed.ts` for demo data seeding (`npm run db:seed`).
- **PostgreSQL Database AI Cache**:
  - Replace disk-based `.jobclippy/extraction-cache.json` with Prisma's `ExtractionCache` model in PostgreSQL so cached extractions persist in the database.
- **Relative Path & Host Independence in Web App**:
  - Ensure all web application queries use relative `/api/...` endpoints without hardcoded localhost URLs.

## Capabilities

### Modified Capabilities
- `job-board`: Eliminates client-side temporary `localStorage` and loads/mutates opportunities directly against the PostgreSQL backend.
- `browser-extension`: Saves clipped jobs directly to `/api/jobs` via environment-configured API base URL without relying on a `localStorage` content bridge.
- `smart-extractor`: Moves AI URL-hash extraction caching from local file storage to the PostgreSQL `ExtractionCache` table.

## Impact

- **Extension**: `extension/popup/popup.js`, `extension/popup/popup.html`, `extension/manifest.json`, and new `extension/config.js`.
- **Web App Store**: `src/lib/job-store.tsx` updated to be database-first.
- **Cache Store**: `src/lib/cache/file-store.ts` refactored to query `prisma.extractionCache`.
- **Environment**: `.env`, `.env.local`, and `.env.example` verified with `NEXT_PUBLIC_API_URL`.
