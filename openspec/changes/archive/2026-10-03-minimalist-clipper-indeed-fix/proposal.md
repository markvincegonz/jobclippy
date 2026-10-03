# Proposal: Minimalist Extension & Indeed Extraction Fix

## Why

When candidates browse Indeed recommendations or search listings (e.g. `indeed.com/?from=gnav-compui&vjk=a9fb756783b8d1a4`), clicking the extension currently falls back to the generic page title ("Job Search | Indeed") instead of extracting the actively selected job. Additionally, the popup interface is cluttered with pregathered editable textboxes and casual emojis that distract from a fast, Linear-grade workflow. The AI extraction pipeline is also eagerly queried on every popup open—wasting tokens—and is blocked from executing because an empty `DEEPSEEK_API_KEY=` in `.env.local` overrides the valid key in `.env`.

This change streamlines the browser extension into an ultra-minimalist, emoji-free clip dialog, shifts AI extraction to run only upon user confirmation ("Clip to JobClippy"), repairs Indeed preview and feed scraping via URL `vjk` targeting, and enables DeepSeek extraction on the backend.

## What Changes

- **Ultra-Minimalist Popup UI**: Remove all pregathered input textboxes (Job Title, Company, Location, Salary) and interactive Skill tags from the popup interface. Retain only:
  - Header brand with minimal status dot (`Indeed`, `LinkedIn`, `Job Detected`)
  - Pipeline Stage selector dropdown (Wishlist, Applied, Interviewing, Offer, Archived)
  - Quick Personal Note textarea
  - Primary action button (`Clip to JobClippy`)
- **Corny Emoji Removal**: Purge all playful emojis (`⚡`, `✨`, `🏢`, `📍`, `💰`, `⚠️`, `⚙️`) from the extension popup HTML, CSS, and JS in favor of clean typographic labels and crisp Linear-grade SVG icons.
- **On-Click AI Extraction Execution**: Eliminate background AI requests on popup open. Trigger AI extraction only when the candidate clicks the primary clip button, displaying a sleek `Saving...` state before persisting directly to the database.
- **Indeed Feed & Preview Scraping Fix**:
  - Detect `vjk` and `jk` parameters in Indeed URLs (covering homepage feeds like `/?from=gnav-compui&vjk=...` and search SERP listings).
  - Inspect same-origin preview iframes (`#vjs-container-iframe`) and scoped job cards (`[data-jk="${jk}"]`).
  - Fallback to same-origin `/viewjob?jk=${vjk}` HTML retrieval if preview pane DOM elements are unmounted or obfuscated, guaranteeing pristine job text without generic "Job Search" page-title leakage.
- **Backend AI Key Configuration**: Synchronize `DEEPSEEK_API_KEY` into `.env.local` to resolve the empty environment override in Next.js.

## Capabilities

### New Capabilities
- `browser-extension`: Minimalist clipper UI, scoped Indeed preview extractor, on-click AI extraction pipeline, and direct database persistence.

### Modified Capabilities
*(None. Main specs do not currently contain browser-extension root capability).*

## Impact

- **Extension UI & Scripts**: `extension/popup/popup.html`, `extension/popup/popup.css`, `extension/popup/popup.js`.
- **Content Extractor**: `extension/content/extractor.js`.
- **Environment**: `.env.local`.
- **E2E Tests**: `tests/browser-extension.spec.ts` and `tests/extension-db-direct.spec.ts`.
