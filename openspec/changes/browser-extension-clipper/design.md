# Design: Browser Extension (MV3 Universal Clipper)

## Context

JobClippy is currently a client-side Next.js web application persisting jobs in `localStorage["jobclippy_jobs_v1"]`. In this phase, we introduce a companion Chrome Extension (`extension/`) adhering strictly to Chrome Manifest V3 standards. Because cloud backend authentication arrives in Phase 9, the extension needs a dependable client-side bridge to transfer captured opportunities into the web application while maintaining offline resilience.

## Goals / Non-Goals

**Goals:**
- Provide a zero-build-step Manifest V3 extension in `extension/` ready to load unpacked into Chrome.
- Multi-tier extraction strategy: Schema.org `JobPosting` JSON-LD -> LinkedIn/Indeed DOM selectors -> Highlighted text heuristic regex fallback.
- Design a high-fidelity popup styled in Linear dark aesthetics with interactive field editing, stage selector, personal notes, and animated mascot feedback.
- Two-way sync bridge: Instant sync when a JobClippy tab is open; persistent queue in `chrome.storage.local` with badge count when JobClippy is not open.
- Context menu integration: Right-click "Save Highlighted Job to JobClippy" with instant toast/badge confirmation.

**Non-Goals:**
- Cloud authentication / OAuth session syncing (reserved for Phase 9).
- Automated form autofilling on job applications (reserved for Phase 8).
- Bundling large npm dependencies inside the extension (keeping the extension lightweight vanilla JS/CSS).

## Decisions

### 1. Zero-Build Modern Vanilla Architecture for `extension/`
- *Decision:* Build the extension using standard ES modules, vanilla CSS (Linear tokens), and native DOM manipulation without a Node bundler step.
- *Rationale:* Eliminates build steps, allows instant live reloading in `chrome://extensions`, ensures small footprint (<100KB), and avoids version drift.
- *Alternative Considered:* Vite / tsup extension build. While it enables shared TypeScript types, it adds build complexity and dev server overhead for what is essentially a focused DOM scraper and modal popup.

### 2. Multi-Tier Job Extractor (`content/extractor.js`)
- *Decision:* The content script checks for job metadata in priority order:
  1. `<script type="application/ld+json">` with `@type: "JobPosting"` (covers Greenhouse, Lever, Ashby, and modern careers pages).
  2. Targeted DOM selectors for `linkedin.com/jobs/*` and `indeed.com/viewjob*`.
  3. `window.getSelection().toString()` parsed using salary regex and the 50+ technology keyword dictionary mirrored from `src/lib/extractor.ts`.
- *Rationale:* Eliminates fragility. When major job boards change class names, JSON-LD or text highlight extractors continue functioning reliably.

### 3. Local Web App Sync Bridge (`content/bridge.js`)
- *Decision:* Inject a lightweight bridge content script on JobClippy app URLs (`http://localhost:*/*` and deployment domains).
  - When the user clicks "[ Clip to JobClippy ]", the extension sends the job to the service worker.
  - The service worker checks for any open JobClippy tabs. If found, it dispatches a message to `bridge.js`, which updates `localStorage["jobclippy_jobs_v1"]` and emits a synthetic storage event to notify `useSyncExternalStore`.
  - If no JobClippy tab is open, the job is saved to `chrome.storage.local` under `pending_clips`. When any JobClippy tab opens, `bridge.js` checks the pending queue, flushes the jobs into `localStorage`, and clears the extension badge.
- *Rationale:* Zero data loss, zero backend requirement, instant real-time UI updates on active tabs.

### 4. Ephemeral Service Worker Compliance
- *Decision:* As per MV3 best practices, `service-worker.js` stores no in-memory state. Context menu handlers, badge counters, and pending queues strictly interact with `chrome.storage.local`.
- *Rationale:* MV3 service workers terminate after ~30 seconds of inactivity. In-memory variables cause dropped data.

## Risks / Trade-offs

- **[Risk: Site DOM Changes]** Job boards alter CSS classes or obfuscate HTML.  
  *Mitigation:* Schema.org JSON-LD extraction is tried first, followed by robust semantic/ARIA selectors, with user-highlighted regex parsing as the ultimate resilient fallback.

- **[Risk: Tab Communication Timing]** JobClippy tab is closing or refreshing during clip.  
  *Mitigation:* Double-write pattern: Every clip is saved to `chrome.storage.local` first, acknowledged, and only pruned once `bridge.js` explicitly confirms localStorage insertion.

- **[Risk: Chrome Extension Icon Requirements]** MV3 requires distinct icon resolutions (16x16, 48x48, 128x128).  
  *Mitigation:* Generate valid standalone PNG assets in `extension/icons/` to prevent manifest loading errors.
