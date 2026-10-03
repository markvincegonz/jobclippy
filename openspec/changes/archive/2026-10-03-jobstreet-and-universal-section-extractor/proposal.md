# Proposal: JobStreet Support & Universal AI Section Extractor

## Why

Candidates frequently search for jobs on JobStreet (and the broader Seek Asia platform), where listings appear in both 2-pane search views (e.g. `ph.jobstreet.com/web-jobs?jobId=95014441&type=standard`) and standalone detail pages (e.g. `ph.jobstreet.com/job/95014441`). Currently, the browser extension lacks JobStreet recognition and relies on site-specific DOM selectors that break whenever platforms update their class names. Furthermore, on 2-pane layouts, scrapers easily mistake sidebar search cards for the active job.

This change introduces first-class JobStreet/Seek platform extraction, implements a universal semantic reading-pane scorer in the content script, and enhances server-side AI extraction with URL-targeted disambiguation to dynamically lock onto the active job across any job board.

## What Changes

- **JobStreet & Seek Platform Integration**:
  - Add native extractor support for `jobstreet.com.*`, `ph.jobstreet.com`, and `seek.com.*`.
  - Extract structured attributes from JobStreet/Seek `data-automation` markers (`job-detail-title`, `advertiser-name`, `job-detail-location`, `job-detail-salary`, `jobAdDetails`, `jobDetails`).
  - Automatically normalize 2-pane URLs (`/web-jobs?jobId=...`) into canonical direct job links (`/job/{jobId}`).
- **Universal Semantic Section Scorer**:
  - Implement a dynamic DOM container scorer in `extractor.js` that evaluates candidate reading panes by layout position, heading structure (`<h1>`), text density, and presence of URL target IDs (`jobId`, `vjk`, `jk`, `id`).
  - Eliminates reliance on brittle, minified CSS classes by identifying the primary job reading view across any arbitrary job portal.
- **AI-Powered URL & Target Disambiguation**:
  - Pass the active page URL and detected job ID to `buildExtractionPrompt()` and `/api/extract`.
  - Instruct the LLM to explicitly match and isolate the job corresponding to the URL identifier or expanded reading pane, actively discarding surrounding sidebar search results.
- **Canonical URL Normalization Updates**:
  - Update `canonicalizeUrl()` in `src/lib/canonicalize.ts` to recognize JobStreet and Seek URLs, stripping tracking noise (`ref=search-standalone`, `origin=jobTitle`, `#sol=...`) while preserving clean `/job/{jobId}` paths.

## Capabilities

### New Capabilities
- `browser-extension`: Universal reading pane detection, JobStreet/Seek platform parsing, and AI URL disambiguation.

### Modified Capabilities
*(None. Main specs do not currently contain browser-extension root capability).*

## Impact

- `extension/content/extractor.js`: JobStreet extractor and universal semantic reading pane finder.
- `src/lib/canonicalize.ts`: JobStreet URL normalization.
- `src/lib/ai/extractor-schema.ts` & `src/app/api/extract/route.ts`: URL and target disambiguation in AI extraction prompt.
- `tests/browser-extension.spec.ts` & `tests/cache-canonicalize.spec.ts`: E2E tests for JobStreet 2-pane and standalone views.
