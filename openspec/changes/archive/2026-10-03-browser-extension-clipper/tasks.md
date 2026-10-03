# Tasks: Browser Extension (MV3 Universal Clipper)

## 1. Extension Scaffolding & Manifest Configuration

- [x] 1.1 Create `extension/` package directory structure with valid 16×16, 48×48, and 128×128 pixel PNG icons in `extension/icons/`. Verify all icon files exist and load correctly.
- [x] 1.2 Implement `extension/manifest.json` with Manifest V3 specification declaring permissions (`storage`, `contextMenus`, `activeTab`, `tabs`), host permissions, background service worker, action popup, and content script matches. Verify manifest syntax and permissions.

## 2. Content Extraction Engine

- [x] 2.1 Implement `extension/content/extractor.js` featuring Schema.org `JobPosting` JSON-LD parsing, site-specific DOM selectors for LinkedIn and Indeed, and heuristic regex parsing for salary and technical skills.
- [x] 2.2 Verify extraction logic against sample job posting HTML structures and ensure fallback to user text selection when structured data is absent.

## 3. Linear Dark-Themed Popup Interface

- [x] 3.1 Create `extension/popup/popup.html` and `extension/popup/popup.css` implementing Linear dark tokens (`#08090a`, `#121316`, hairline borders), animated Clippy SVG mascot, job detection badge, and responsive card layout.
- [x] 3.2 Create `extension/popup/popup.js` to query active tab extractor, populate detected attributes (Title, Company, Location, Salary, Skill chips), enable inline editing, stage selector dropdown, and quick personal note.
- [x] 3.3 Add visual celebration / checkmark feedback on `[ Clip to JobClippy ]` button click and verify popup UI renders accurately.

## 4. Background Service Worker & Context Menu

- [x] 4.1 Implement `extension/background/service-worker.js` to register the context menu item "Save Highlighted Job to JobClippy" and manage badge counters without relying on in-memory global state.
- [x] 4.2 Implement persistent queuing in `chrome.storage.local` for pending clips when JobClippy tabs are not open. Verify message routing and storage updates.

## 5. Web Application Sync Bridge & Integration

- [x] 5.1 Implement `extension/content/bridge.js` to run on JobClippy app URLs (`http://localhost:*/*`), syncing pending or incoming clips directly into `localStorage["jobclippy_jobs_v1"]` and firing storage events.
- [x] 5.2 Add web app bridge listener in `src/lib/job-store.tsx` to handle direct extension messages and live-update the Kanban board and Applications table without full page refresh.
- [x] 5.3 Write automated E2E tests validating the extraction, storage sync, and rendering of clipped opportunities in the JobClippy dashboard.
