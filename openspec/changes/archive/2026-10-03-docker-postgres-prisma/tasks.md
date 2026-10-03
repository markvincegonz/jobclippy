# Tasks

## 1. Infrastructure & Environment Setup

- [x] 1.1 Create `docker-compose.yml` with `postgres:16-alpine`, port 5432, persistent volume, and health check. Verify syntax and configuration.
- [x] 1.2 Update `.env.example` and create `.env.local` template with `DATABASE_URL` and `DEEPSEEK_API_KEY`.
- [x] 1.3 Install `prisma` (dev) and `@prisma/client` dependencies and verify `npx prisma --version`.

## 2. Prisma Schema, Database Client & Seed Script

- [x] 2.1 Define Prisma schema in `prisma/schema.prisma` with `Job`, `JobNote`, and `ExtractionCache` models and verify with `npx prisma validate`.
- [x] 2.2 Create Prisma client singleton in `src/lib/prisma.ts` with Next.js hot-reload protection and verify import stability.
- [x] 2.3 Create database seed script `prisma/seed.ts` containing the initial curated opportunities and configure seed command in `package.json`.

## 3. Server-Side DeepSeek & Extension Key Cleanup

- [x] 3.1 Refactor `src/app/api/extract/route.ts` to execute DeepSeek using `response_format: { type: "json_object" }` when `DEEPSEEK_API_KEY` is present.
- [x] 3.2 Remove client-side API key transmission requirement from `/api/extract` and rely strictly on server environment variables.
- [x] 3.3 Remove key configuration drawer and `chrome.storage.local` key storage from `extension/popup/popup.html`, `popup.css`, and `popup.js`.
- [x] 3.4 Add automated test verifying DeepSeek JSON parsing and server-only key extraction in `tests/deepseek-extract.spec.ts`.

## 4. Jobs REST API & Frontend Sync

- [x] 4.1 Implement `GET` and `POST` handlers in `src/app/api/jobs/route.ts` using Prisma client and verify with tests.
- [x] 4.2 Implement `GET`, `PATCH`, and `DELETE` handlers in `src/app/api/jobs/[id]/route.ts` with note relation cascade.
- [x] 4.3 Update `src/lib/job-store.tsx` to synchronize with `/api/jobs` while preserving local state reactivity and migration fallback.
- [x] 4.4 Add automated Playwright integration test suite covering full database CRUD and UI board reflection in `tests/jobs-database.spec.ts`.

## 5. Roadmap Update & End-to-End Verification

- [x] 5.1 Update `ROADMAP.md` inserting Dockerized PostgreSQL & Prisma as Phase 6 and reordering subsequent phases.
- [x] 5.2 Execute full Playwright test suite (`npx playwright test`) and verify all tests pass.
