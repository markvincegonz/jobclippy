# Proposal: AI-Powered Job Extraction Pipeline (3-Tier Hybrid Architecture)

## Why

Client-side regex DOM scrapers are inherently fragile across rapid job board layout revisions (Indeed, LinkedIn, Greenhouse, Lever, etc.). When DOM structures change or contain unconventional layouts, users experience corrupted extraction or missing details. Furthermore, parsing every listing on the client with heuristics misses high-value semantic nuances like true seniority level, remote vs. hybrid policies, experience requirements, and structured skill graphs.

Transitioning to a **3-tier hybrid pipeline** (Client Pre-clean → Server URL-Hash Cache → Strict Schema LLM Extraction) delivers bulletproof accuracy across any job board, eliminates repetitive LLM token costs through canonical URL caching, and preserves instant client responsiveness.

## What Changes

- **Layer 1: Client Pre-Processing & Sanitization**:
  - The Chrome Extension clones the job container DOM, strips noise tags (`<script>`, `<style>`, `<nav>`, `<footer>`, SVG icons, tracking widgets), and converts the container to normalized text.
  - Extracts instantaneous partial regex cues (instant optimistic title, company, salary estimate) for zero-latency popup rendering.
  - Truncates text to a ~1,200 token budget before sending payload to the backend.

- **Layer 2: Canonical URL Hash Cache Engine**:
  - Adds server-side URL canonicalizer stripping tracking queries (`utm_*`, `ref`, `refId`, `trk`, `trackingId`, `vjs`, `from`, etc.) and resolving domain-specific canonical job IDs.
  - Computes SHA-256 hash of the canonical URL.
  - Checks persistent extraction cache store (pluggable adapter supporting In-Memory/File for dev and PostgreSQL/Supabase for production).
  - Cache hits return stored extractions in `<15ms` with zero AI cost.

- **Layer 3: Strict Schema AI Extraction API**:
  - Implements Next.js API route (`POST /api/extract`).
  - Sends sanitized job text to an efficient LLM (`gpt-4o-mini` / `gemini-1.5-flash`) enforcing strict JSON schema output (`title`, `company`, `location`, `workplaceType`, `salary`, `seniority`, `skills`, `experienceYears`, `summary`).
  - Reconciles AI output with high-confidence regex fields.
  - Stores result in cache and returns verified payload to the extension / web app.

- **Progressive UX Integration**:
  - Extension popup opens immediately with optimistic regex preview and smoothly cross-fades into verified AI fields when the background API call resolves.

## Capabilities

### New Capabilities
None (extends existing extraction capabilities).

### Modified Capabilities
- `smart-extractor`: Modifies and extends requirements to specify URL canonicalization, SHA-256 hash caching, server-side LLM extraction with strict schema validation, and progressive client reconciliation.

## Impact

- **New Backend Services**: `src/lib/cache/` (cache store interface and adapters), `src/lib/canonicalize.ts` (URL normalization and SHA-256 hashing), and `src/app/api/extract/route.ts` (Next.js server-side extraction endpoint).
- **Chrome Extension**: Updates `extension/content/extractor.js` and `extension/popup/popup.js` to dispatch pre-cleaned payloads to `/api/extract` and progressively render AI-verified fields.
- **Dependencies & Environment**: Optional server-side API keys (`OPENAI_API_KEY` or `GEMINI_API_KEY`) in `.env.local`. Zero new client-side npm dependencies in `extension/`.
