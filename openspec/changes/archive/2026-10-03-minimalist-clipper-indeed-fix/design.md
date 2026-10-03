# Design: Minimalist Extension & Indeed Extraction Fix

## Context

See [proposal.md](proposal.md) for motivation and problem background.

Currently:
1. `popup.html` and `popup.css` render extensive form controls (title, company, salary, location, skills) and casual emojis (`⚡`, `✨`, `🏢`, `📍`, `💰`).
2. `popup.js` triggers `refineWithAiServer` immediately on `DOMContentLoaded`, consuming tokens and blocking field edits.
3. `extractor.js` parses Indeed using search-results container IDs (`#jobsearch-ViewjobPaneWrapper`) that do not exist on recommendation feeds (`/?from=gnav-compui&vjk=...`), falling back to `document.title` ("Job Search | Indeed").
4. `.env.local` contains `DEEPSEEK_API_KEY=` which overrides the valid API key in `.env`.

## Goals / Non-Goals

**Goals:**
- Provide an ultra-minimalist popup UI with only Pipeline Stage, Quick Personal Note, and the primary Clip action.
- Completely purge casual emojis across the extension in favor of clean typographic labels and subtle indicator dots.
- Accurately isolate the selected job on Indeed recommendations and 2-pane search views using URL `vjk` resolution.
- Defer AI extraction so it only runs when the user clicks the clip button.
- Ensure `DEEPSEEK_API_KEY` is loaded into `.env.local`.

**Non-Goals:**
- Altering the PostgreSQL database schema or Prisma models.
- Modifying the web application Kanban board or detail sheet layouts.
- Bulk scraping multiple jobs at once.

## Decisions

### Decision 1: In-Memory Payload & On-Demand Extraction Flow
Instead of binding extracted fields to visible input elements:
- When the popup opens, `extractFromTab(tab)` runs Layer 1 extraction (client DOM) and stores the result in a local variable `stagedJobData`.
- The UI renders only:
  - Header with minimal status dot: `Indeed`, `LinkedIn`, `Job Detected`, or `Manual Entry`.
  - Stage dropdown (`#job-stage`).
  - Note textarea (`#job-note`).
  - Save button (`#clip-btn`) labeled `Clip to JobClippy`.
- When the user clicks `Clip to JobClippy`:
  1. The button enters a disabled `Saving...` state.
  2. If `stagedJobData.rawText` exists, send request to `/api/extract` to run DeepSeek structured extraction.
  3. Merge the AI results (or heuristic fallback) with the selected `stage`, `notes`, and URL.
  4. Submit payload directly to `POST /api/jobs`.
  5. Transition button to `Saved` and show confirmation.

*Alternatives considered:*
- Pre-extracting on hover/load: Rejected by user requirement to eliminate AI token usage and latency on page reloads/popup opens.

### Decision 2: Indeed `vjk` Parameter & Same-Origin Detail Retrieval
On Indeed pages (`indeed.com`):
1. Parse `vjk` or `jk` from `window.location.search` (e.g. `?from=gnav-compui&vjk=a9fb756783b8d1a4`).
2. Search for the specific card `[data-jk="${jk}"]` or inspect active preview iframes (`#vjs-container-iframe`, `iframe[title='Job details']`).
3. If the preview pane title is missing, unmounted, or matches generic page headings (`/^(?:Job Search|Jobs|Find Jobs)/i`), perform a same-origin `fetch('/viewjob?jk=' + jk)` directly in the content script.
4. Parse the returned HTML via `DOMParser` to extract the exact `#jobDescriptionText` and `h1.jobsearch-JobInfoHeader-title`.
5. Strip all generic title fallbacks that leak "Job Search | Indeed" into job titles.

*Alternatives considered:*
- Regex-filtering `document.body.innerText`: Fragile because recommendation homepages contain dozens of unrelated job snippets, search filters, and footer links. Same-origin `/viewjob` fetch is clean, authoritative, and uses 0 external network requests.

### Decision 3: Corny Emoji Removal & Linear Design Tokens
- Replace `<span id="btn-icon">⚡</span>` with a clean inline SVG icon or simple text `Clip to JobClippy`.
- Replace `🏢`, `📍`, `💰` (removed with the form inputs).
- Replace `✨ AI Refining...` with a minimal typographic status `Saving...`.
- Replace `✓ Saved to your JobClippy pipeline!` with `Saved to JobClippy`.

## Risks / Trade-offs

- **[Risk] Latency on Click**: Running AI extraction during the save action introduces an ~800–1200ms latency before the job is persisted.
  - *Mitigation*: Provide an immediate responsive `Saving...` button state with a disabled click handler. If `/api/extract` fails or exceeds 6 seconds, fall back gracefully to the Layer 1 client attributes and save immediately.
- **[Risk] Cross-Origin / Iframe Constraints on Indeed**:
  - *Mitigation*: The `fetch('/viewjob?jk=' + jk)` is executed inside the content script already hosted on the `indeed.com` origin, ensuring same-origin cookie and credential compliance without CORS friction.
