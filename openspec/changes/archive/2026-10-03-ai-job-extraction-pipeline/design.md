# Design: AI-Powered Job Extraction Pipeline (3-Tier Hybrid Architecture)

## Context

JobClippy currently extracts job information purely in the Chrome Extension content script using regex matching and DOM queries. While fast and offline, DOM scrapers break on atypical layouts and miss semantic signals (e.g. true seniority level, nuanced remote work policies, and experience requirements). 

This design establishes a 3-layer hybrid extraction architecture executed in the requested sequence:
1. **Cache Database & Canonicalization Layer** (Zero-cost, fast lookup)
2. **Server-Side LLM API Route** (Strict JSON schema extraction)
3. **Client-Side UX & Progressive Extension Integration** (Optimistic zero-lag UI)

## Goals / Non-Goals

**Goals:**
- Eliminate scraping fragility across job boards via unified AI semantic extraction.
- Achieve `<15ms` response time and $0.00 token cost for repeatedly clipped job postings via canonical URL SHA-256 hashing.
- Enforce strict JSON output with no markdown code fences or parsing ambiguity.
- Maintain an optimistic UI in the extension popup: show instant regex cues immediately while AI refines in the background.
- Support zero-configuration local development (In-Memory/File cache) and simple production scale (PostgreSQL/Supabase adapter).

**Non-Goals:**
- Bypassing login paywalls or running headless browser clusters server-side (the browser extension already runs inside the user's authenticated tab).
- Storing full raw HTML dumps in the database (only sanitized text and extracted metadata are stored).

## Decisions

### 1. Build Order Sequencing
- **Decision**: Build the Cache Database & Canonicalization engine first, followed by the LLM API route, and finally the client extension UX flow.
- **Rationale**: Isolates the data contract and cache layer so it can be verified with automated tests before adding external LLM network calls or UI states.

### 2. URL Canonicalization & SHA-256 Hashing
- **Decision**: Implement domain-specific parameter stripping in `src/lib/canonicalize.ts`:
  - **Indeed**: Strip all parameters except `jk` or `vjk` → `https://www.indeed.com/viewjob?jk={id}`.
  - **LinkedIn**: Extract canonical job ID → `https://www.linkedin.com/jobs/view/{id}`.
  - **Generic**: Lowercase protocol and domain, remove trailing slash, strip `utm_*`, `ref`, `refId`, `trackingId`, `vjs`, `from`, `fbclid`, `gclid`.
  - Hash canonical string using Node `crypto.createHash('sha256')`.
- **Alternatives Considered**: Hashing raw URLs directly (rejected: misses 90%+ of cache hits due to random session/tracking query strings).

### 3. Pluggable Cache Store (Adapter Pattern)
- **Decision**: Define `ExtractionCacheStore` interface in `src/lib/cache/types.ts`:
  - `get(hash: string): Promise<CachedJobExtraction | null>`
  - `set(hash: string, data: CachedJobExtraction, ttlDays?: number): Promise<void>`
  - Default: In-Memory / Local disk file store (`.jobclippy/cache.json`) for zero-dependency local dev and testing.
  - Production adapter: Supabase / PostgreSQL table `job_extraction_cache`.
- **Alternatives Considered**: Embedded SQLite (`better-sqlite3`) (rejected: native binary compilation can create issues on serverless/Vercel environments).

### 4. LLM API Endpoint with Strict JSON Schema
- **Decision**: Next.js App Router endpoint `POST /api/extract` with OpenAI `gpt-4o-mini` (or Google Gemini 1.5 Flash):
  - Request body: `{ url: string, rawText: string, partialFields?: Partial<JobData> }`.
  - Uses OpenAI `response_format: { type: "json_schema" }` with strict schema validation.
  - Merges AI output with verified high-confidence regex fields (e.g. precise currency strings).
- **Fallback**: If `OPENAI_API_KEY` is unset or API call errors, gracefully return the client's `partialFields` with `isAiVerified: false`.

### 5. Progressive Extension UX
- **Decision**: When the extension popup opens:
  1. Instantly populate inputs with Layer 1 client regex cues (0ms delay).
  2. Display a subtle `"✨ AI Refining..."` shimmer status indicator.
  3. POST to `/api/extract` in the background.
  4. On response, smoothly update inputs and change status to `"✨ AI Verified"`.

## Architecture & Data Flow

```
[ Chrome Extension ]
  | 1. Trigger clip -> extract container innerText (max 1,200 tokens)
  | 2. Optimistic instant preview with regex fields
  | 3. POST /api/extract { url, rawText, partialFields }
  v
[ Next.js API Route /api/extract ]
  |
  +--> [ Canonicalizer ] -> Strip tracking params & SHA-256 hash
  |
  +--> [ Cache Store ] 
  |      |
  |      +-- Cache HIT? -> Return stored record (skips LLM)
  |
  +-- (Cache MISS)
  |
  +--> [ LLM Client (gpt-4o-mini) ] -> Strict JSON Schema
  |
  +--> [ Cache Store.set() ] -> Persist for future hits (TTL 30 days)
  |
  v
Return { ok: true, data, isAiVerified: true, fromCache: boolean }
```

## Risks / Trade-offs

- **[Risk] LLM Cost Overruns** → **Mitigation**: Canonical URL hashing collapses repeated clips to $0; input text is truncated to ~1,200 tokens (<$0.0002 per miss on `gpt-4o-mini`).
- **[Risk] LLM Latency (~600–1000ms)** → **Mitigation**: Layer 1 regex fields render instantaneously in the popup so the user is never blocked while AI refines.
- **[Risk] Missing API Key in Dev** → **Mitigation**: Server endpoint returns fallback regex fields without failing, logging an informational hint.
