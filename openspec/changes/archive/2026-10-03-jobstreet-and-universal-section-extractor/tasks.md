# Tasks: JobStreet Support & Universal AI Section Extractor

## 1. JobStreet & Seek Platform Integration

- [x] 1.1 Implement `extractFromJobStreet()` in `extension/content/extractor.js` targeting Seek/JobStreet `data-automation` attributes (`job-detail-title`, `advertiser-name`, `job-detail-location`, `job-detail-salary`, `jobAdDetails`) and canonical `/job/{jobId}` link resolution.
- [x] 1.2 Implement same-origin `/job/{jobId}` HTML fetch fallback in `extractor.js` when 2-pane preview elements are unmounted or delayed on `web-jobs` search pages.
- [x] 1.3 Update `src/lib/canonicalize.ts` to normalize JobStreet and Seek URLs into clean `/job/{jobId}` paths while stripping tracking query parameters (`ref`, `origin`, `type`, `sol`).
- [x] 1.4 Validate JobStreet extraction and URL canonicalization with automated tests in `tests/browser-extension.spec.ts` and `tests/cache-canonicalize.spec.ts`.

## 2. Universal Semantic Reading Pane Scorer

- [x] 2.1 Implement `findActiveJobContainer()` in `extension/content/extractor.js` scoring candidate DOM containers by layout position, heading structure, text density, and URL ID matching.
- [x] 2.2 Wire the semantic reading pane scorer into generic document fallback in `extractor.js` to isolate the active reading view and discard sidebar search lists across arbitrary job boards.
- [x] 2.3 Verify universal reading pane isolation on a simulated arbitrary multi-column job board in `tests/browser-extension.spec.ts`.

## 3. AI URL & Section Disambiguation

- [x] 3.1 Update `buildExtractionPrompt()` in `src/lib/ai/extractor-schema.ts` to accept `rawUrl` and instruct the model to isolate the job matching the active URL or expanded description pane.
- [x] 3.2 Update `/api/extract` in `src/app/api/extract/route.ts` to pass `rawUrl` into `buildExtractionPrompt()`.
- [x] 3.3 Execute full automated Playwright test suite to verify 100% test pass health across all platforms.
