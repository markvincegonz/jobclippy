# Design: Dockerized PostgreSQL + Prisma Persistence & Server-Side DeepSeek

## Context

See `proposal.md` for motivation. Currently, `src/lib/job-store.tsx` uses browser `localStorage` (`jobclippy_jobs_v1`) with seed fallback. The extension popup features an API key drawer that saves keys to `chrome.storage.local` and sends them via `x-api-key`. To build a robust web platform, data persistence must shift to a containerized PostgreSQL database orchestrated via Docker and managed through Prisma ORM, and the AI extraction must rely strictly on server environment variables (`.env.local`).

## Goals / Non-Goals

**Goals:**
- Provide a zero-fuss `docker-compose.yml` for local PostgreSQL 16 Alpine development.
- Configure Prisma with models for `Job`, `JobNote`, and `ExtractionCache`.
- Expose REST API routes `/api/jobs` and `/api/jobs/[id]` for database operations.
- Update web application client to interact seamlessly with `/api/jobs` while maintaining snappy optimistic UI updates.
- Strip API key configuration from the browser extension popup, making extraction completely seamless for candidates.
- Support DeepSeek (`deepseek-chat`) via `DEEPSEEK_API_KEY` in `.env.local` using `response_format: { type: "json_object" }`.

**Non-Goals:**
- Multi-tenant user authentication (Auth.js / NextAuth / Supabase Auth) — this will be handled in a dedicated Auth phase (Phase 10).
- Remote cloud PostgreSQL deployment (Supabase, Neon, AWS RDS) — this design focuses on local reproducible Docker setup.

## Decisions

### 1. Database Engine: Dockerized PostgreSQL 16 Alpine
- **Rationale**: PostgreSQL is the industry standard for relational data, JSON storage, and full-text search. Running it via Docker ensures zero local system pollution and identical developer environments across Windows, macOS, and Linux.
- **Port & Credentials**: Default port `5432`, database `jobclippy`, user `postgres`, password `postgres`.
- **Alternatives Considered**: SQLite (simpler, but lacks concurrency and production parity) or external cloud DB (requires internet and external signups).

### 2. ORM: Prisma
- **Rationale**: Prisma provides automated migration generation (`prisma migrate dev`), auto-generated TypeScript types, and an intuitive client API for Next.js App Router.
- **Model Design**:
  - `Job`: `id`, `title`, `company`, `location`, `salary`, `stage` (enum), `skills` (string[]), `description` (Text), `url`, timestamps.
  - `JobNote`: `id`, `jobId` (relation with cascade delete), `text` (Text), `createdAt`.
  - `ExtractionCache`: `urlHash` (PK), `canonicalUrl`, `domain`, `extractedData` (Json), `modelUsed`, `hitCount`, `expiresAt`.

### 3. DeepSeek JSON Mode Architecture
- **Rationale**: DeepSeek's `deepseek-chat` model follows OpenAI format for chat completions, but does NOT accept `response_format: { type: "json_schema" }`. It strictly requires `response_format: { type: "json_object" }` with the word `"json"` in the prompt.
- **Implementation**: In `src/app/api/extract/route.ts`, branch between `json_schema` for OpenAI and `json_object` for DeepSeek.

### 4. Client Migration Strategy: Two-Way Local Hydration
- **Rationale**: When users transition from the client-only version to the database version, any jobs they previously created in `localStorage` should not disappear.
- **Implementation**: If PostgreSQL is empty on first boot, the client seeds from `localStorage` or default seeds into the database.

## Risks / Trade-offs

- **[Docker Daemon Not Running]** → If Docker is stopped, Prisma queries will fail with connection errors.
  *Mitigation*: Implement graceful connection error handling in `/api/jobs` with clear developer-friendly error messages and fallback.
- **[DeepSeek JSON Format Variability]** → `json_object` mode guarantees valid JSON syntax, but not strict field adherence.
  *Mitigation*: Validate DeepSeek's parsed output against `AiExtractedJob` fields and reconcile with regex heuristics.

## Migration Plan

1. Install `prisma` (dev) and `@prisma/client`.
2. Generate `docker-compose.yml` and `.env.example`.
3. Run `docker compose up -d` and `npx prisma db push` (or `migrate dev`).
4. Implement `/api/jobs` and wire to frontend.
5. Update `extension/popup` to remove key management and test extraction flow.
