# Tasks: Eliminate Ghost Jobs and Implement Database Card Positioning

## 1. Database Schema & Migration

- [x] 1.1 Add `position Float @default(0)` and `@@index([stage, position])` to `prisma/schema.prisma` and execute `npx prisma db push`
- [x] 1.2 Update `prisma/seed.ts` and `src/app/api/jobs/reset/route.ts` to assign spaced positions (`index * 1000.0`) to seed opportunities and verify seeding

## 2. Backend REST APIs

- [x] 2.1 Update `GET /api/jobs` in `src/app/api/jobs/route.ts` to order records by `position: "asc", createdAt: "desc"`
- [x] 2.2 Update `POST /api/jobs` to accept or assign initial `position` and update `PATCH /api/jobs/[id]` in `src/app/api/jobs/[id]/route.ts` to accept and persist `position` updates

## 3. Frontend Store & Reordering

- [x] 3.1 Refactor `src/lib/job-store.tsx` to remove `STORAGE_KEY = "jobclippy_jobs_v1"`, `getStoredJobs()`, `saveStoredJobs()`, and `localOnly` reconciliation logic, keeping job state strictly in memory backed by `GET /api/jobs`
- [x] 3.2 Update `reorderJob` in `src/lib/job-store.tsx` to calculate fractional positions (`(prevPos + nextPos) / 2`) and dispatch `PATCH /api/jobs/[id]` with `{ stage, position }`
- [x] 3.3 Update `extension/content/bridge.js` to remove `localStorage` read/write operations and rely purely on in-memory event dispatching

## 4. Verification & Testing

- [x] 4.1 Run database seeding and execute Playwright tests (`tests/drag-and-drop.spec.ts`, `tests/extension-db-direct.spec.ts`) to verify drag-and-drop ordering and complete elimination of ghost jobs
- [x] 4.2 Update `ROADMAP.md` to reflect the database-backed positioning and pure database single source of truth
