# Tasks: Minimalist Extension & Indeed Extraction Fix

## 1. Environment & DeepSeek Backend Activation

- [x] 1.1 Synchronize `DEEPSEEK_API_KEY` from `.env` into `.env.local` and verify via node fetch that `/api/extract` resolves the active provider without falling back to `missing API key`.
- [x] 1.2 Validate that the local Next.js dev server returns `isAiVerified: true` when provided valid job text to `/api/extract`.

## 2. Scoped Indeed Extractor & Page Title Fallback Fix

- [x] 2.1 Update `extractFromIndeed()` in `extension/content/extractor.js` to parse `vjk` and `jk` parameters from the page URL and prioritize the clicked job card or preview iframe.
- [x] 2.2 Implement same-origin `/viewjob?jk=${vjk}` fetch fallback in `extractor.js` when preview pane DOM elements are unmounted or obfuscated, ensuring clean job text without homepage navigation noise.
- [x] 2.3 Strip generic title fallbacks matching `/^(?:Job Search|Jobs, Employment|Find Jobs)/i` in `extractor.js` so "Job Search" is never extracted as a job title.
- [x] 2.4 Verify Indeed feed extraction with simulated two-pane and recommendation feed tests in `tests/browser-extension.spec.ts`.

## 3. Ultra-Minimalist UI & Corny Emoji Purge

- [x] 3.1 Refactor `extension/popup/popup.html` to remove pregathered form inputs (Title, Company, Location, Salary, Skills) and purge all casual emojis (`⚡`, `✨`, `🏢`, `📍`, `💰`).
- [x] 3.2 Refactor `extension/popup/popup.css` to present an ultra-minimalist Linear-grade dialog with clean typography, compact status dot, and sleek action button.
- [x] 3.3 Refactor `extension/popup/popup.js` to manage extracted attributes in an in-memory object and remove casual emojis from all status and button text strings.

## 4. On-Demand AI Extraction on Save

- [x] 4.1 Remove eager AI extraction on popup open in `extension/popup/popup.js`, deferring the AI pipeline exclusively to the clip button click event.
- [x] 4.2 Implement responsive `Saving...` button state with disabled interaction during AI extraction and direct database persistence via `POST /api/jobs`.
- [x] 4.3 Update and execute automated Playwright tests in `tests/browser-extension.spec.ts` and `tests/extension-db-direct.spec.ts` to verify 100% test pass health.
