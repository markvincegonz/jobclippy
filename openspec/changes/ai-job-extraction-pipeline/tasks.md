# Tasks: AI-Powered Job Extraction Pipeline (3-Tier Hybrid Architecture)

## 1. Cache Database & Canonicalization Layer (Layer 2)

- [x] 1.1 Implement `src/lib/canonicalize.ts` with domain-specific tracking query stripping (Indeed, LinkedIn, Greenhouse, Lever) and deterministic SHA-256 hashing. Verify with unit tests covering URL permutations.
- [x] 1.2 Define `src/lib/cache/types.ts` with `ExtractionCacheStore`, `CachedJobExtraction`, and schema interfaces.
- [x] 1.3 Implement `src/lib/cache/file-store.ts` providing a zero-dependency In-Memory/Disk cache adapter with configurable TTL.
- [x] 1.4 Create `tests/cache-canonicalize.spec.ts` and verify canonicalization, SHA-256 hashing, cache hit/miss behavior, and expiration pass.

## 2. Server-Side LLM API Route (Layer 3)

- [x] 2.1 Define strict extraction JSON schema in `src/lib/ai/extractor-schema.ts` for title, company, location, workplaceType, salary, seniority, skills, experienceYears, and summary.
- [x] 2.2 Create Next.js API route `src/app/api/extract/route.ts` that checks cache via canonical hash, calls the LLM with strict JSON schema on cache miss, and persists to cache.
- [x] 2.3 Implement high-confidence regex fallback reconciliation in `src/app/api/extract/route.ts` so calls without `OPENAI_API_KEY` or during network timeouts return validated partial fields gracefully.
- [x] 2.4 Create `tests/api-extract.spec.ts` testing cache hits, cache misses, LLM mock responses, and fallback degradation.

## 3. Client Extension UX Flow & Progressive Enhancement (Layer 1)

- [x] 3.1 Update `extension/content/extractor.js` to clone container DOM, strip junk tags, extract token-budgeted clean text (~1,200 tokens), and package with optimistic regex cues.
- [x] 3.2 Add AI status indicators (`"✨ AI Refining..."` and `"✨ AI Verified"`) in `extension/popup/popup.html` and `extension/popup/popup.css`.
- [x] 3.3 Update `extension/popup/popup.js` to render optimistic fields immediately, POST payload to `/api/extract` asynchronously, and smoothly cross-fade into AI-verified attributes.
- [x] 3.4 Create comprehensive Playwright E2E test in `tests/ai-pipeline.spec.ts` verifying the entire 3-tier pipeline from extension clip to server cache hit and board sync.
