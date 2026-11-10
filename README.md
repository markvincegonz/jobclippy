<div align="center">

<img src="public/brand-icon.png" alt="JobClippy Logo" width="80" height="80" />

# JobClippy

**Intelligent Job Search Command Center & MV3 Universal Web Clipper**

*Save opportunities from anywhere on the web, parse important attributes with AI, and visually command your entire application pipeline.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_80+-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-MV3-4285f4?style=flat-square&logo=google-chrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)

</div>

---

> [!IMPORTANT]
> **Local-Only Architecture:** JobClippy is built as a self-hosted, local-first developer command center. It is designed to run 100% locally on your machine backed by a containerized PostgreSQL database and is **not hosted on the cloud**. Follow the setup guide below to get up and running in minutes.

---

## Table of Contents

1. [Visual Tour & Screenshots](#visual-tour--screenshots)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Local Setup](#step-by-step-local-setup)
5. [Environment Variables & API Keys](#environment-variables--api-keys)
6. [Chrome Extension (MV3 Universal Clipper)](#chrome-extension-mv3-universal-clipper)
7. [Keyboard Shortcuts & Accelerators](#keyboard-shortcuts--accelerators)
8. [Automated Test Suite](#automated-test-suite)
9. [Troubleshooting](#troubleshooting)

---

## Visual Tour & Screenshots

### 1. Kanban Pipeline Board (`/board`)
A 5-stage visual workflow (*Wishlist* &rarr; *Applied* &rarr; *Interviewing* &rarr; *Offer* &rarr; *Archived*) with full HTML5 drag-and-drop, card reordering, stage advancement pills, and celebratory milestone confetti.

![JobClippy Kanban Board](docs/screenshots/pipeline-board.png)

---

### 2. Job Detail Drawer & Audit Timeline
A 1.5× widened slide-over sheet (`max-w-3xl`) featuring complete job descriptions, parsed skill chips, personal rich notes, source brand favicons, and an interview countdown reminder.

![Job Detail Drawer](docs/screenshots/job-detail-sheet.png)

---

### 3. High-Density Applications Table (`/applications`)
Linear-grade tabular data view with multi-column sorting, in-row stage dropdowns, multi-row batch actions, and Vim-style <kbd>J</kbd>/<kbd>K</kbd> keyboard spatial navigation.

![Applications Table](docs/screenshots/applications-table.png)

---

### 4. Pipeline Velocity & Funnel Analytics (`/analytics`)
Interactive stepped conversion funnel graph with through-rates, drop-off diagnostics, channel source attribution (LinkedIn, Indeed, JobStreet, Seek), and pipeline health checklists.

![Funnel Analytics](docs/screenshots/funnel-analytics.png)

---

### 5. Spotlight Command Palette (<kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>)
Instant global search across navigation routes, high-priority actions, and opportunities with keyboard looping selection.

![Command Palette](docs/screenshots/command-palette.png)

---

## System Architecture

JobClippy treats PostgreSQL as its single source of truth, eliminating client `localStorage` caching of jobs to ensure multiple browser sessions and devices never diverge or resurrect ghost items.

```
+-------------------------------------------------------------------------------+
|                             JOBCLIPPY ARCHITECTURE                            |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [Target Web Page]                [Chrome Extension (MV3)]                   |
|   LinkedIn / Indeed / Seek =====>  Content Extractor & Token Budgeter         |
|                                            |                                  |
|                                    Direct POST /api/jobs                      |
|                                            |                                  |
|                                            v                                  |
|   +-----------------------------------------------------------------------+   |
|   |                  Next.js 16 App Router (Local Port 3000)              |   |
|   |                                                                       |   |
|   |  GET  /api/jobs          -> Returns all opportunities ordered by pos  |   |
|   |  POST /api/jobs          -> Creates opportunities & assigns position  |   |
|   |  PATCH /api/jobs/[id]    -> Updates stage, notes, and positions       |   |
|   |  POST /api/extract       -> DeepSeek AI / Heuristic Extraction        |   |
|   |  POST /api/jobs/reset    -> Restores default seed opportunities       |   |
|   +-----------------------------------------------------------------------+   |
|                                    ^                       |                  |
|                                    | (Prisma ORM)          v (In-Memory Sync) |
|                                    v                       v                  |
|   +----------------------------------+   +--------------------------------+   |
|   |  Docker PostgreSQL 16 Alpine     |   |   Web App Client UI (React 19) |   |
|   |  - Port: 5433 (maps to 5432)     |   |   - In-Memory React Job Store  |   |
|   |  - Volume: jobclippy_pgdata      |   |   - Zero localStorage ghost job|   |
|   +----------------------------------+   +--------------------------------+   |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## Prerequisites

Before running JobClippy locally, ensure you have the following installed:

1. **[Node.js](https://nodejs.org/)**: Version `20.x` or higher (`node -v`).
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required to run the local PostgreSQL 16 database container.
3. **[Google Chrome](https://www.google.com/chrome/)** (or any Chromium-based browser): Required if you wish to use the browser extension.

---

## Step-by-Step Local Setup

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/markvincegonz/jobclippy.git
cd jobclippy
npm install
```

### 2. Configure Environment Variables

Create your local `.env` and `.env.local` files in the repository root (see [Environment Variables & API Keys](#environment-variables--api-keys) for details):

```bash
# Copy template or create .env.local
cp .env .env.local
```

Ensure your `.env.local` contains:

```env
# Database connection string to local Docker container (Port 5433)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/jobclippy?schema=public"

# Required for AI Job Parsing: DeepSeek API Key
DEEPSEEK_API_KEY="your-deepseek-api-key-here"

# Web App URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Start the Local PostgreSQL Database

Launch the isolated PostgreSQL 16 container via Docker Compose:

```bash
docker compose up -d
```

> **Why port 5433?** The Docker container maps host port `5433` to container port `5432`. This prevents conflicts if you already have a local PostgreSQL daemon running on the default `5432` port.

Verify the container is healthy:

```bash
docker ps --filter "name=jobclippy-postgres"
```

### 4. Push Schema & Seed Initial Opportunities

Synchronize the Prisma schema with the PostgreSQL container and populate curated demo opportunities:

```bash
# Push database schema tables (jobs, notes, extraction_cache)
npx prisma db push

# Seed realistic initial opportunities
npm run db:seed
```

### 5. Launch the Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the interactive Pipeline Board (`/board`).

---

## Environment Variables & API Keys

JobClippy requires two primary environment variables:

| Variable | Required? | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:postgres@localhost:5433/jobclippy?schema=public` | PostgreSQL connection string for Prisma ORM. |
| `DEEPSEEK_API_KEY` | **Yes** *(for AI)* | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Powers server-side DeepSeek LLM extraction (`deepseek-chat`) on `/api/extract`. |
| `NEXT_PUBLIC_API_URL` | Optional | `http://localhost:3000` | Base API URL used by the extension bridge and client requests. |

### How to Get a DeepSeek API Key:
1. Visit the [DeepSeek Open Platform](https://platform.deepseek.com/).
2. Create an account and navigate to **API Keys**.
3. Generate a new key and paste it as `DEEPSEEK_API_KEY="sk-..."` in your `.env.local` file.
4. *Fallback behavior:* If no key is configured, JobClippy falls back to client-side heuristic regex parsing, ensuring the application remains operational even without an active AI key.

---

## Chrome Extension (MV3 Universal Clipper)

The JobClippy Chrome Extension (`extension/`) is a Manifest V3 browser companion that transforms your browser into an ambient job capture tool. It allows you to clip job postings from any website directly into your local PostgreSQL database with a single click.

```
+--------------------------------------------------------------------------------+
|                        CHROME EXTENSION PIPELINE                               |
+--------------------------------------------------------------------------------+
|                                                                                |
|  1. ACTIVE TAB EXTRACTION                                                      |
|     - Schema.org JSON-LD structural parser                                     |
|     - Platform-tailored rules (LinkedIn, Indeed, JobStreet, Seek, ATSs)        |
|     - Universal Reading Pane Scorer (isolates active right pane on split views)|
|                                                                                |
|  2. POPUP INTERFACE & STAGE SELECTION                                          |
|     - Minimalist Linear Dark UI with auto-detection pill                       |
|     - Initial stage selection (Wishlist, Applied, Interviewing, Offer)         |
|     - Personal note capture                                                    |
|                                                                                |
|  3. DIRECT DUAL-BROADCAST SYNC                                                 |
|     - Direct HTTP POST to http://localhost:3000/api/jobs (PostgreSQL)          |
|     - Real-time window.postMessage bridge to open dashboard tabs               |
|     - chrome.storage.local offline queue if dashboard/server is closed        |
+--------------------------------------------------------------------------------+
```

### Key Capabilities

1. **Smart Heuristic & Schema.org Extraction:**
   - Automatically extracts **Job Title**, **Company Name**, **Location**, **Salary Range**, and **Skill Chips**.
   - Inspects `application/ld+json` Schema.org `JobPosting` structured data before falling back to DOM parsing.
2. **Two-Pane Split Layout Isolation:**
   - Dedicated extractors for split search results (e.g. Indeed and JobStreet), tracking active card parameters (`vjk`, canonical job ID) so it never captures generic page titles like *"Job Search | Indeed"*.
   - Universal Reading Pane Scorer evaluates candidate DOM containers using text density, heading weights, and semantic layout analysis on arbitrary company portals.
3. **Right-Click Highlight-to-Clip:**
   - Highlight any text block on a webpage, right-click, and select **"Save Highlighted Job to JobClippy"** via the Chrome Context Menu.
4. **Zero-Reload Dashboard Bridge:**
   - When a JobClippy dashboard tab is open, clipped opportunities appear immediately via `content/bridge.js` window messaging without requiring a page refresh.
5. **Database-Direct Persistence:**
   - Saves directly to your containerized PostgreSQL database (`/api/jobs`), preventing data divergence or ghost cards across multiple browser windows.

---

### Step-by-Step Installation

The extension is included in the `extension/` folder and runs as an unpacked Manifest V3 extension in Google Chrome, Brave, Arc, or Microsoft Edge.

1. **Open the Extensions Page:**
   - Chrome / Brave: Navigate to `chrome://extensions`
   - Edge: Navigate to `edge://extensions`
2. **Enable Developer Mode:**
   - Turn on the **Developer mode** toggle switch in the top-right corner.
3. **Load Unpacked Extension:**
   - Click the **Load unpacked** button in the top-left toolbar.
   - In the file picker, select the `extension/` folder in the root of this repository (`jobclippy/extension`).
4. **Pin for Quick Access:**
   - Click the puzzle icon in your browser toolbar and pin **JobClippy**.

> [!TIP]
> **Developing & Reloading:** When making changes to `extension/content.js`, `extension/popup/popup.js`, or `extension/manifest.json`, click the reload circular arrow icon on the JobClippy card in `chrome://extensions` to apply updates instantly.

---

### How to Use the Extension

1. **Browse to Any Job Posting:**
   - Open any job listing on LinkedIn, Indeed, JobStreet, Seek, Greenhouse, Lever, Ashby, or a company career page.
2. **Open the Extension Popup:**
   - Click the JobClippy monogram logo in your toolbar.
   - The status pill will display `Detecting...` and transition to `Ready to Clip`.
3. **Select Pipeline Stage & Add Notes:**
   - Choose the pipeline column where this job should land (*Wishlist*, *Applied*, *Interviewing*, *Offer*, *Archived*).
   - Optionally add a quick note (e.g., *"Referred by Alex"*, *"Follow up next Tuesday"*).
4. **Click "Clip to JobClippy":**
   - The button shows a loading spinner and transitions to `Saved!`.
   - Your job is stored in PostgreSQL and immediately rendered on your dashboard.

---

## Keyboard Shortcuts & Accelerators

JobClippy includes a comprehensive set of keyboard accelerators designed for power users:

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| <kbd>?</kbd> | Global | Open Keyboard Shortcuts Cheatsheet modal |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Global | Open Spotlight Command Palette |
| <kbd>[</kbd> | Global | Toggle left navigation sidebar collapse |
| <kbd>/</kbd> | Global | Focus global search bar |
| <kbd>C</kbd> | Global | Open Quick Add Opportunity modal |
| <kbd>]</kbd> | Kanban Card | Advance active card to the next pipeline stage |
| <kbd>[</kbd> | Kanban Card | Move active card back to the previous pipeline stage |
| <kbd>J</kbd> / <kbd>↓</kbd> | Table View | Select and focus the next table row |
| <kbd>K</kbd> / <kbd>↑</kbd> | Table View | Select and focus the previous table row |
| <kbd>X</kbd> / <kbd>Space</kbd> | Table View | Toggle multi-row checkbox selection |
| <kbd>Enter</kbd> | Table View | Open the 1.5× wide Job Detail Sheet for the focused row |
| <kbd>Esc</kbd> | Modals/Drawers | Dismiss any open modal, detail sheet, or command palette |

---

## Automated Test Suite

JobClippy maintains rigorous automated test coverage with over 80+ Playwright end-to-end (E2E) integration tests:

```bash
# Run the complete Playwright E2E suite
npm run test:e2e

# Run tests in interactive UI mode
npm run test:e2e:ui

# Run a specific test suite
npx playwright test tests/extension-db-direct.spec.ts
npx playwright test tests/drag-and-drop.spec.ts
npx playwright test tests/applications-table.spec.ts
```

---

## Troubleshooting

### 1. Docker Container Port 5433 Conflict
If Docker fails to bind port 5433, another process may be using it.
- Check active port bindings:
  ```powershell
  # Windows PowerShell
  Get-NetTCPConnection -LocalPort 5433
  ```
- Or update the port mapping in `docker-compose.yml` (e.g., `5434:5432`) and update `DATABASE_URL` in `.env.local` accordingly.

### 2. Next.js Windows DLL Lock during `npx prisma db push`
On Windows, if `npx prisma db push` or `npx prisma generate` reports `EPERM: operation not permitted` on `query_engine-windows.dll.node`:
- Temporarily stop the running `npm run dev` server (<kbd>Ctrl+C</kbd>).
- Run `npx prisma generate`.
- Restart `npm run dev`.

### 3. Missing Seed Data or Re-seeding Database
To reset the local database back to default demonstration records at any time:
- Run `npm run db:seed` in your terminal.
- Or click **Reset to Demo Data** inside the web application settings modal.

---

<div align="center">
Crafted with precision for candidates who command their job search.
</div>
