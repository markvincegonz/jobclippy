# Proposal: Browser Extension (MV3 Universal Clipper)

## Why

Job seekers browse opportunities across fragmented websites—LinkedIn, Indeed, Greenhouse, Lever, and individual company career portals. Manually copying and pasting job titles, company names, salary ranges, and descriptions into a tracker is slow and introduces friction, leading to lost applications. 

Building a lightweight Manifest V3 Chrome Extension allows users to clip job postings directly from any web page in one click, automatically parsing key attributes and seamlessly pushing them into their JobClippy pipeline.

## What Changes

- Add a production-ready Manifest V3 extension package in `extension/` containing:
  - `manifest.json`: Configured with minimal required permissions (`storage`, `contextMenus`, `activeTab`, `tabs`).
  - `background/service-worker.js`: Handles context menus ("Save Highlighted Job to JobClippy"), message routing, badge notifications, and storage queues.
  - `content/extractor.js`: Extracts job data via Schema.org `JobPosting` JSON-LD, site-specific DOM selectors (LinkedIn, Indeed), and highlighted text fallback.
  - `content/bridge.js`: Injected content script on JobClippy web app domains (`localhost:3000` / production) that synchronizes pending clipped jobs directly to `localStorage['jobclippy_jobs_v1']` and fires store change notifications.
  - `popup/`: Linear dark-themed UI (HTML, CSS, JS) featuring the animated JobClippy paperclip mascot, editable job fields (Title, Company, Location, Salary, Skills), target stage dropdown, quick personal note input, and one-click `[ Clip to JobClippy ]` action.
  - `icons/`: Valid 16×16, 48×48, and 128×128 pixel extension icons.
- Add an extension bridge listener / sync handler in the Next.js web application to seamlessly receive clips from the extension without requiring a page reload.

## Capabilities

### New Capabilities
- `browser-extension`: Captures job posting attributes directly from browser tabs (LinkedIn, Indeed, JSON-LD Schema.org ATS portals, and highlighted text), presents an editable preview popup adhering to the Linear design system, and syncs clipped jobs into JobClippy.

### Modified Capabilities
*(None. Existing capabilities remain backward-compatible.)*

## Impact

- **New Files**: Complete `extension/` directory with manifest, service worker, content scripts, popup, and icon assets.
- **Web App**: Minor extension sync listener hook in `src/lib/job-store.tsx` or bridge support for instant real-time synchronization when the JobClippy tab is active.
- **Dependencies**: No external npm dependencies required for the extension (zero-overhead modern vanilla JS/CSS).
