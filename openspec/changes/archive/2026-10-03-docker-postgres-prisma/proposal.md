# Proposal

## Why

JobClippy currently stores all opportunities and notes purely in the browser's `localStorage`, and stores extraction cache entries in a transient local JSON file. This lacks multi-device persistence, data integrity, relational queries, and scale. Furthermore, the browser extension currently prompts the user for AI keys in a popup drawer; candidates should never configure API keys inside the extension—the Next.js backend should securely execute AI extraction using server environment variables (specifically DeepSeek).

Establishing a dockerized PostgreSQL database managed by Prisma ORM and shifting backend AI execution exclusively to server `.env.local` moves JobClippy from a local client mockup to a scalable, production-ready web platform.

## What Changes

- **Dockerized PostgreSQL Engine**: Add `docker-compose.yml` defining an isolated, resilient `postgres:16-alpine` service with persistent volume storage (`jobclippy_pgdata`) and health check scripts.
- **Prisma ORM & Data Models**: Initialize Prisma with PostgreSQL dialect. Define schema models for `Job`, `JobNote`, and `ExtractionCache`. Include database migration workflow and initial seed script (`prisma/seed.ts`).
- **Jobs REST API**: Implement `/api/jobs` and `/api/jobs/[id]` endpoints for full CRUD operations with PostgreSQL.
- **Server Environment Key Enforcement & DeepSeek**:
  - Remove user-facing API key input / ⚙️ drawer from the Chrome extension popup.
  - Extension communicates directly with `/api/extract` without client key transmission.
  - Update `/api/extract` to support DeepSeek via `DEEPSEEK_API_KEY` using OpenAI-compatible protocol (`https://api.deepseek.com/chat/completions`, `deepseek-chat`) with `response_format: { type: "json_object" }`.
- **Client Auto-Migration / Hydration**: Update web application data store to synchronize with the PostgreSQL backend while gracefully falling back or syncing legacy `localStorage` entries.
- **Roadmap Realignment**: Insert Dockerized PostgreSQL + Prisma as **Phase 6** in `ROADMAP.md` and shift subsequent roadmap phases accordingly.

## Capabilities

### New Capabilities
- `database-persistence`: Robust relational persistence layer backed by Dockerized PostgreSQL, Prisma schema models, database migrations, and `/api/jobs` REST endpoints.

### Modified Capabilities
- `smart-extractor`: Remove client-side API key configuration and enforce server-side `.env` execution with DeepSeek model support and schema validation.

## Impact

- **New Dependencies**: `prisma`, `@prisma/client`.
- **Infrastructure**: New `docker-compose.yml` requiring Docker Desktop / Docker daemon to run PostgreSQL.
- **Environment**: Requirement for `DATABASE_URL` in `.env.local` and `.env.example`, alongside `DEEPSEEK_API_KEY`.
- **Extension**: Simplified UI in `extension/popup/popup.html` and `popup.js` (removal of key management controls).
- **APIs**: Addition of `/api/jobs`, `/api/jobs/[id]`, and `/api/jobs/[id]/notes`.
